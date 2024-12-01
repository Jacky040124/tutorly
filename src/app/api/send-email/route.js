import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';


// POST is an HTTP method name -> any function name POST Nextjs automatically routes HTTP POST request to this funciton
export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SendGrid API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 