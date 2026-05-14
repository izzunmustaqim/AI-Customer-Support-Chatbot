import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { isDashboardAuthenticated } from '@/lib/dashboard-auth';

const VALID_STATUSES = ['pending', 'generating', 'sent', 'failed'] as const;
type ReportStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(req: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { assessmentId, reportStatus } = await req.json();

    if (!assessmentId || !reportStatus) {
      return NextResponse.json(
        { error: 'Missing assessmentId or reportStatus' },
        { status: 400 },
      );
    }

    if (!VALID_STATUSES.includes(reportStatus as ReportStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    const updateData: Record<string, string> = { report_status: reportStatus };

    // Auto-set report_sent_at when marking as sent
    if (reportStatus === 'sent') {
      updateData.report_sent_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('assessment_results')
      .update(updateData)
      .eq('id', assessmentId);

    if (error) {
      console.error('[Status Update] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, reportStatus });
  } catch (error) {
    const err = error as Error;
    console.error('[Status Update] Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
