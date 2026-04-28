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
    const { messages } = await req.json();

    const supabase = tryGetSupabase();

    // Optional: Log to database if Supabase is configured
    if (supabase) {
      const lastUserMessage = messages
        .filter((m: { role: string }) => m.role === 'user')
        .pop();

      const userTextContent = lastUserMessage?.parts
        ?.filter((p: { type: string }) => p.type === 'text')
        .map((p: { text: string }) => p.text)
        .join('') || '';

      if (userTextContent) {
        try {
          await supabase.from('messages').insert({
            role: 'user',
            content: userTextContent,
          });
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
                role: 'assistant',
                content: text,
              });
            } catch (e) {
              console.warn('DB logging skipped:', e);
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
