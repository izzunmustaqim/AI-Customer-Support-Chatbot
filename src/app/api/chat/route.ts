// import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { checkRateLimit } from '@/lib/rate-limit';

export const maxDuration = 30;

// Rate limit: 20 requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

// Retry with exponential backoff for rate limit errors (429)
async function withRetry<T>(
  fn: () => T,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return fn();
    } catch (error: unknown) {
      const err = error as { status?: number; statusCode?: number };
      const isRateLimit = err?.status === 429 || err?.statusCode === 429;
      const isLastAttempt = attempt === maxRetries;

      if (!isRateLimit || isLastAttempt) throw error;

      // Exponential backoff: 1s → 2s → 4s
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`Rate limited (429). Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Try to get Supabase — returns null if not configured
function tryGetSupabase() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || url.startsWith('your_')) return null;

    const { getSupabaseAdmin } = require('@/lib/supabase/server');
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // --- Rate Limiting ---
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const { allowed, remaining, resetAt } = checkRateLimit(
    ip,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS
  );

  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please wait a moment before trying again.',
        code: 429,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const { messages, sessionId } = await req.json();

    const supabase = tryGetSupabase();
    let conversationId: string | null = null;

    // Optional: Log to database if Supabase is configured
    if (supabase) {
      // Step 1: Create or retrieve conversation for this session
      try {
        if (sessionId) {
          // Check if conversation already exists for this session
          const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .eq('session_id', sessionId)
            .single();

          if (existing) {
            conversationId = existing.id;
          } else {
            // Create new conversation
            const { data: newConv } = await supabase
              .from('conversations')
              .insert({
                session_id: sessionId,
                page_url: '/assessment',
                status: 'active',
              })
              .select('id')
              .single();
            conversationId = newConv?.id || null;
          }
        }
      } catch (e) {
        console.warn('Conversation creation skipped:', e);
      }

      // Step 2: Save user message with conversation link
      const lastUserMessage = messages
        .filter((m: { role: string }) => m.role === 'user')
        .pop();

      const userTextContent = lastUserMessage?.parts
        ?.filter((p: { type: string }) => p.type === 'text')
        .map((p: { text: string }) => p.text)
        .join('') || '';

      if (userTextContent) {
        try {
          await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              role: 'user',
              content: userTextContent,
            });
        } catch (e) {
          console.warn('DB logging skipped:', e);
        }

        // Detect detailed report opt-in/opt-out and update assessment_results
        if (conversationId) {
          try {
            const wantsReport = /yes.*detailed.*report.*email/i.test(userTextContent);
            const declinesReport = /no.*do not want.*detailed/i.test(userTextContent);

            if (wantsReport || declinesReport) {
              await supabase
                .from('assessment_results')
                .update({ wants_detailed_report: wantsReport })
                .eq('conversation_id', conversationId);
            }
          } catch (e) {
            console.warn('Report preference update skipped:', e);
          }
        }
      }
    }

    // Convert UIMessage parts format to plain messages for the model
    const allModelMessages = messages.map(
      (msg: { role: string; parts: Array<{ type: string; text?: string }> }) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content:
          msg.parts
            ?.filter((p) => p.type === 'text')
            .map((p) => p.text)
            .join('') || '',
      })
    );

    // Trim message history to avoid exceeding context window limits
    const MAX_MESSAGES = 40;
    const modelMessages = allModelMessages.length > MAX_MESSAGES
      ? allModelMessages.slice(-MAX_MESSAGES)
      : allModelMessages;

    // Stream the AI response with retry logic
    const result = await withRetry(() =>
      streamText({
        model: openai('gpt-5.4-mini'),
        // model: openai('gpt-4o-mini'),
        // model: groq('llama-3.3-70b-versatile'),
        system: SYSTEM_PROMPT,
        messages: modelMessages,
        onFinish: async ({ text }) => {
          if (supabase) {
            // Save assistant message
            try {
              await supabase.from('messages').insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: text,
              });
            } catch (e) {
              console.warn('DB logging skipped:', e);
            }

            // Auto-extract assessment score when the report is shown
            try {
              const scoreMatch = text.match(/(\d{1,3})\s*[/\/]\s*100/);
              const isReport = scoreMatch && 
                (text.includes('Readiness') || text.includes('Score') || text.includes('readiness')) && 
                text.length > 200;

              if (isReport && conversationId) {
                const totalScore = parseInt(scoreMatch[1], 10);
                let readinessBand: string;
                if (totalScore >= 80) readinessBand = 'High';
                else if (totalScore >= 60) readinessBand = 'Moderate';
                else if (totalScore >= 40) readinessBand = 'Low';
                else readinessBand = 'Critical';

                // Extract per-question scores from the breakdown table
                // Strategy: find lines containing Q1-Q10 and grab the LAST number on that line
                // This avoids matching "10" from "Q1/Q10" labels
                const qScores: number[] = [];
                for (let i = 1; i <= 10; i++) {
                  // Match lines like "| Q1 | Industrial plant | 10 |" or "Q1. Facility Type — 10"
                  const linePattern = new RegExp(`Q${i}[^\\n]*?(\\d{1,2})\\s*(?:\\||$|\\n)`, 'im');
                  const lineMatch = text.match(linePattern);
                  
                  if (lineMatch) {
                    // Find all numbers in the matched line segment and take the last one (the score)
                    const allNumbers = lineMatch[0].match(/\d+/g);
                    const score = allNumbers ? parseInt(allNumbers[allNumbers.length - 1], 10) : 0;
                    qScores.push(score <= 10 ? score : 0);
                  } else {
                    qScores.push(0);
                  }
                }

                console.log(`[Assessment] Extracted scores for conversation ${conversationId}:`, {
                  totalScore,
                  readinessBand,
                  qScores,
                });

                const { error: insertError } = await supabase.from('assessment_results').insert({
                  conversation_id: conversationId,
                  total_score: totalScore,
                  readiness_band: readinessBand,
                  q1_score: qScores[0],
                  q2_score: qScores[1],
                  q3_score: qScores[2],
                  q4_score: qScores[3],
                  q5_score: qScores[4],
                  q6_score: qScores[5],
                  q7_score: qScores[6],
                  q8_score: qScores[7],
                  q9_score: qScores[8],
                  q10_score: qScores[9],
                });

                if (insertError) {
                  console.error('[Assessment] Failed to insert results:', insertError);
                } else {
                  console.log('[Assessment] Results saved successfully');
                }
              }
            } catch (e) {
              console.error('[Assessment] Score extraction error:', e);
            }

            // Auto-extract contact info when Section C is completed
            try {
              const thankYouPattern = /thank you for the information|we will send|within 2 working days/i;
              if (thankYouPattern.test(text) && conversationId) {
                const lastUserMsg = messages
                  .filter((m: { role: string }) => m.role === 'user')
                  .pop();
                const userInfo = lastUserMsg?.parts
                  ?.filter((p: { type: string }) => p.type === 'text')
                  .map((p: { text: string }) => p.text)
                  .join('') || '';

                if (userInfo) {
                  const emailMatch = userInfo.match(/[\w.-]+@[\w.-]+\.\w+/);
                  // Strict phone regex: must start with digit or +digit (not a space)
                  const phoneMatch = userInfo.match(/\+?\d[\d\s-]{7,}/);
                  const lines = userInfo.split(/[\n,]+/).map((l: string) => l.trim()).filter(Boolean);
                  // Reusable strict phone-line detector (same pattern as phoneMatch)
                  const isPhoneLine = (l: string) => /\+?\d[\d\s-]{7,}/.test(l) && !/[a-zA-Z]{3,}/.test(l);

                  // Extract name: first non-email, non-phone line
                  const name = lines.find((l: string) =>
                    !l.match(/[\w.-]+@[\w.-]+\.\w+/) &&
                    !isPhoneLine(l) &&
                    !l.toLowerCase().includes('designation') &&
                    l.length > 1
                  ) || null;

                  // Extract designation:
                  // 1st priority — line with "designation" label (e.g. "Designation: Manager")
                  // 2nd priority — positional fallback: second non-email/non-phone line after name
                  const designationLine = lines.find((l: string) =>
                    l.toLowerCase().includes('designation')
                  );
                  let designation: string | null = null;
                  if (designationLine) {
                    designation = designationLine.replace(/designation\s*[:：\-]?\s*/i, '').trim() || null;
                  } else {
                    // Positional fallback: find the second non-email, non-phone, non-name line
                    const nonDataLines = lines.filter((l: string) =>
                      !l.match(/[\w.-]+@[\w.-]+\.\w+/) &&
                      !isPhoneLine(l) &&
                      !l.toLowerCase().includes('designation') &&
                      l.length > 1
                    );
                    // nonDataLines[0] = name, nonDataLines[1] = designation
                    designation = nonDataLines[1] || null;
                  }

                  if (emailMatch) {
                    // Update assessment_results with user info for report generation
                    await supabase
                      .from('assessment_results')
                      .update({
                        user_name: name,
                        user_designation: designation,
                        report_email: emailMatch[0],
                        phone: phoneMatch ? phoneMatch[0].trim() : null,
                      })
                      .eq('conversation_id', conversationId);
                  }
                }
              }
            } catch (e) {
              console.warn('Contact extraction skipped:', e);
            }
          }
        },
      })
    );

    return result.toUIMessageStreamResponse({
      headers: {
        'X-RateLimit-Remaining': String(remaining),
      },
    });
  } catch (error: unknown) {
    const err = error as { status?: number; statusCode?: number; message?: string };
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || 'An unexpected error occurred';

    console.error('Chat API error:', { status, message });

    return new Response(
      JSON.stringify({
        error: status === 429
          ? 'Service is temporarily busy. Please try again in a moment.'
          : status === 401
            ? 'API key is invalid or expired.'
            : 'Something went wrong. Please try again.',
        code: status,
      }),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
