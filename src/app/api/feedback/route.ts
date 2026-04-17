import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { conversationId, rating, comment } = await req.json();

    if (!conversationId || !rating) {
      return NextResponse.json(
        { error: 'conversationId and rating are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('feedback').insert({
      conversation_id: conversationId,
      rating,
      comment: comment || null,
    });

    if (error) {
      console.error('Failed to save feedback:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
