import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// POST is an HTTP method name -> any function name POST Nextjs automatically routes HTTP POST request to this funciton
export async function POST(request) {
  try {
    const { to, subject, content } = await request.json();
    
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html: content,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resend API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
} 