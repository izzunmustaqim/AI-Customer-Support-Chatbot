// import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';

export const maxDuration = 30;

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
          const { data: savedMsg } = await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              role: 'user',
              content: userTextContent,
            })
            .select('id')
            .single();

          // Step 3: Detect and log intent (disabled for now — re-enable when needed)
          // if (conversationId && savedMsg?.id) {
          //   import('@/lib/ai/intent-detector').then(({ detectAndLogIntent }) => {
          //     detectAndLogIntent(userTextContent, conversationId!).catch(() => {});
          //   }).catch(() => {});
          // }
        } catch (e) {
          console.warn('DB logging skipped:', e);
        }
      }
    }

    // Convert UIMessage parts format to plain messages for the model
    const modelMessages = messages.map(
      (msg: { role: string; parts: Array<{ type: string; text?: string }> }) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content:
          msg.parts
            ?.filter((p) => p.type === 'text')
            .map((p) => p.text)
            .join('') || '',
      })
    );

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
            try {
              await supabase.from('messages').insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: text,
              });
            } catch (e) {
              console.warn('DB logging skipped:', e);
            }

            // Auto-extract contact info when Section C is completed
            try {
              const thankYouPattern = /thank you for the information|we will send|within 2 working days/i;
              if (thankYouPattern.test(text) && conversationId) {
                // Get the last user message (contains their contact info)
                const lastUserMsg = messages
                  .filter((m: { role: string }) => m.role === 'user')
                  .pop();
                const userInfo = lastUserMsg?.parts
                  ?.filter((p: { type: string }) => p.type === 'text')
                  .map((p: { text: string }) => p.text)
                  .join('') || '';

                if (userInfo) {
                  // Extract fields using patterns
                  const emailMatch = userInfo.match(/[\w.-]+@[\w.-]+\.\w+/);
                  const phoneMatch = userInfo.match(/\+?[\d\s-]{8,}/);
                  const lines = userInfo.split(/[\n,]+/).map((l: string) => l.trim()).filter(Boolean);

                  // First non-email, non-phone line is likely the name
                  const name = lines.find((l: string) =>
                    !l.match(/[\w.-]+@[\w.-]+\.\w+/) &&
                    !l.match(/\+?[\d\s-]{8,}/) &&
                    !l.toLowerCase().includes('designation') &&
                    l.length > 1
                  ) || null;

                  if (emailMatch) {
                    await supabase.from('contact_submissions').insert({
                      conversation_id: conversationId,
                      name: name,
                      email: emailMatch[0],
                      phone: phoneMatch ? phoneMatch[0].trim() : null,
                    });
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

    return result.toUIMessageStreamResponse();
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
