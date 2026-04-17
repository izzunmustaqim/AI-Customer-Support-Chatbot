import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
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

    // Top intents
    const { data: intentsData } = await supabaseAdmin
      .from('detected_intents')
      .select('intent');

    const intentCounts: Record<string, number> = {};
    intentsData?.forEach((item) => {
      intentCounts[item.intent] = (intentCounts[item.intent] || 0) + 1;
    });

    const topIntents = Object.entries(intentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([intent, count]) => ({ intent, count }));

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

    return NextResponse.json({
      totalConversations: totalConversations || 0,
      totalMessages: totalMessages || 0,
      avgRating: Math.round(avgRating * 10) / 10,
      totalContacts: totalContacts || 0,
      topIntents,
      recentContacts: recentContacts || [],
      dailyCounts,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
