import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { buildReportPDF } from '@/lib/pdf/build-report';

export async function POST(req: Request) {
  try {
    const { assessmentId } = await req.json();

    if (!assessmentId) {
      return NextResponse.json({ error: 'Missing assessmentId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch the assessment result
    const { data: result, error: fetchError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (fetchError || !result) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // 2. Fetch conversation messages for AI analysis
    let aiAnalysis = '';
    if (result.conversation_id) {
      const { data: messages } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', result.conversation_id)
        .order('created_at', { ascending: true });

      if (messages && messages.length > 0) {
        const conversationSummary = messages
          .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
          .join('\n');

        try {
          const { generateText } = await import('ai');
          const { openai } = await import('@ai-sdk/openai');

          const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            system: `You are an EECA (Energy Efficiency and Conservation Act) compliance expert at Sandhurst Advisory.
Based on the user's assessment results and conversation history, provide a detailed analysis report.

Format your response with these sections:
## Gap Analysis
Identify 3-5 key compliance gaps based on low-scoring areas.

## Recommended Actions
Provide specific, actionable recommendations for each gap.

## Compliance Timeline
Suggest a realistic timeline for achieving compliance.

## Risk Assessment
Outline potential risks of non-compliance.

Keep the tone professional and advisory. Use bullet points for clarity.`,
            prompt: `The user "${result.user_name || 'Unknown'}" scored ${result.total_score}/100 (${result.readiness_band} readiness).

Individual scores:
Q1 (Facility Type): ${result.q1_score}/10
Q2 (EECA Awareness): ${result.q2_score}/10
Q3 (Energy Manager): ${result.q3_score}/10
Q4 (Energy Audit): ${result.q4_score}/10
Q5 (Efficiency Plan): ${result.q5_score}/10
Q6 (Monitoring): ${result.q6_score}/10
Q7 (Staff Training): ${result.q7_score}/10
Q8 (Equipment): ${result.q8_score}/10
Q9 (Renewable Energy): ${result.q9_score}/10
Q10 (Management): ${result.q10_score}/10

Conversation context:
${conversationSummary.substring(0, 3000)}

Generate a detailed compliance analysis report.`,
          });

          aiAnalysis = text;
        } catch (aiError) {
          console.error('[Report] AI analysis generation failed:', aiError);
        }
      }
    }

    // 3. Build the PDF
    const pdfBuffer = buildReportPDF({
      userName: result.user_name || 'Assessment User',
      userDesignation: result.user_designation,
      userEmail: result.report_email || '',
      totalScore: result.total_score,
      readinessBand: result.readiness_band,
      qScores: [
        result.q1_score, result.q2_score, result.q3_score,
        result.q4_score, result.q5_score, result.q6_score,
        result.q7_score, result.q8_score, result.q9_score,
        result.q10_score,
      ],
      completedAt: result.completed_at,
      aiAnalysis,
    });

    // 4. Update status
    await supabase
      .from('assessment_results')
      .update({ report_status: 'sent', report_sent_at: new Date().toISOString() })
      .eq('id', assessmentId);

    const fileName = `EECA_Report_${result.user_name?.replace(/\s+/g, '_') || 'Assessment'}.pdf`;

    console.log(`[Report] Generated PDF for assessment ${assessmentId}`);

    // 5. Return PDF as downloadable file
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    const err = error as Error;
    console.error('[Report] Unexpected error:', err.message, err.stack);
    return NextResponse.json({
      error: 'Internal server error',
      details: err.message,
    }, { status: 500 });
  }
}
