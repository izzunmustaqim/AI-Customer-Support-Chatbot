import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { conversationId, name, email, phone, company, message } =
      await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('contact_submissions').insert({
      conversation_id: conversationId || null,
      name: name || null,
      email,
      phone: phone || null,
      company: company || null,
      message: message || null,
    });

    if (error) {
      console.error('Failed to save contact:', error);
      return NextResponse.json(
        { error: 'Failed to save contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
