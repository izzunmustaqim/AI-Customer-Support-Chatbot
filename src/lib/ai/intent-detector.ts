// import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const IntentSchema = z.object({
  intent: z.enum([
    'eeca_scope',
    'energy_data',
    'rem_appointment',
    'enms_setup',
    'energy_audit',
    'reporting',
    'building_compliance',
    'general_question',
  ]),
  confidence: z.number().min(0).max(1),
});

export async function detectAndLogIntent(
  message: string,
  conversationId: string
) {
  try {
    const { object } = await generateObject({
      model: openai('gpt-5.4-mini'),
      // model: openai('gpt-4o-mini'),
      // model: groq('llama-3.3-70b-versatile'),
      schema: IntentSchema,
      prompt: `Classify the following message into one of these EECA compliance intent categories:
- eeca_scope: Questions about whether facility falls under EECA
- energy_data: Questions about energy consumption data requirements
- rem_appointment: Questions about Registered Energy Manager
- enms_setup: Questions about Energy Management System
- energy_audit: Questions about energy audits by REA
- reporting: Questions about EE&C reports and submissions
- building_compliance: Questions about building energy performance / BEI / label
- general_question: General inquiries about EECA compliance

Message: "${message}"`,
    });

    // Log to database if available
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from('detected_intents').insert({
        conversation_id: conversationId,
        intent: object.intent,
        confidence: object.confidence,
        message_text: message,
      });
    } catch {
      // Database not configured, skip logging
    }

    return object;
  } catch (error) {
    console.error('Intent detection failed:', error);
    return { intent: 'general_question', confidence: 0.5 };
  }
}
