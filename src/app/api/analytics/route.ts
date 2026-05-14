import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { isDashboardAuthenticated } from '@/lib/dashboard-auth';

export async function GET(req: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Total conversations
    const { count: totalConversations } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    // Total messages
    const { count: totalMessages } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true });

    // Average rating
    const { data: feedbackData } = await supabaseAdmin
      .from('feedback')
      .select('rating');

    const avgRating =
      feedbackData && feedbackData.length > 0
        ? feedbackData.reduce((sum, f) => sum + f.rating, 0) /
          feedbackData.length
        : 0;

    // Total contacts captured
    const { count: totalContacts } = await supabaseAdmin
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true });

    // Recent contacts
    const { data: recentContacts } = await supabaseAdmin
      .from('contact_submissions')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(10);

    // Assessment results — score distribution by band
    const { data: resultsData } = await supabaseAdmin
      .from('assessment_results')
      .select('total_score, readiness_band, completed_at');

    const bandCounts: Record<string, number> = {
      High: 0,
      Moderate: 0,
      Low: 0,
      Critical: 0,
    };
    let totalAssessments = 0;
    let avgScore = 0;

    if (resultsData && resultsData.length > 0) {
      totalAssessments = resultsData.length;
      avgScore =
        Math.round(
          (resultsData.reduce((sum, r) => sum + r.total_score, 0) /
            totalAssessments) *
            10
        ) / 10;
      resultsData.forEach((r) => {
        if (r.readiness_band in bandCounts) {
          bandCounts[r.readiness_band]++;
        }
      });
    }

    // Conversations over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentConversations } = await supabaseAdmin
      .from('conversations')
      .select('started_at')
      .gte('started_at', sevenDaysAgo.toISOString())
      .order('started_at', { ascending: true });

    // Group by day
    const dailyCounts: Record<string, number> = {};
    recentConversations?.forEach((conv) => {
      const day = new Date(conv.started_at).toLocaleDateString('en-US', {
        weekday: 'short',
      });
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    // Individual assessment results for detailed table
    const { data: assessmentResults } = await supabaseAdmin
      .from('assessment_results')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      totalConversations: totalConversations || 0,
      totalMessages: totalMessages || 0,
      avgRating: Math.round(avgRating * 10) / 10,
      totalContacts: totalContacts || 0,
      totalAssessments,
      avgScore,
      bandCounts,
      recentContacts: recentContacts || [],
      dailyCounts,
      assessmentResults: assessmentResults || [],
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
