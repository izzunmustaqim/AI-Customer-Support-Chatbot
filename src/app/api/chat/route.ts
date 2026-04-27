import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';

export const maxDuration = 30;

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

  // Stream the AI response
  const result = streamText({
    model: openai('gpt-4o-mini'),
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
  });

  return result.toUIMessageStreamResponse();
}
