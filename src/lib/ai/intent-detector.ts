import { groq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const IntentSchema = z.object({
  intent: z.enum([
    'pricing_inquiry',
    'support_request',
    'demo_request',
    'general_question',
    'complaint',
    'feature_request',
    'partnership_inquiry',
    'hiring_inquiry',
  ]),
  confidence: z.number().min(0).max(1),
});

export async function detectAndLogIntent(
  userMessage: string,
  conversationId: string,
  messageId: string
) {
  try {
    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      schema: IntentSchema,
      prompt: `Classify the following customer message into one of these intent categories:
- pricing_inquiry: Questions about cost, pricing, plans
- support_request: Technical issues, bugs, help needed
- demo_request: Wanting a demo or trial
- general_question: General inquiries
- complaint: Expressing dissatisfaction
- feature_request: Suggesting new features
- partnership_inquiry: Business partnership questions
- hiring_inquiry: Job-related questions

Customer message: "${userMessage}"

Return the most likely intent and your confidence (0-1).`,
    });

    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from('detected_intents').insert({
      conversation_id: conversationId,
      message_id: messageId,
      intent: object.intent,
      confidence: object.confidence,
    });

    return object;
  } catch (error) {
    console.error('Intent detection failed:', error);
    return null;
  }
}
