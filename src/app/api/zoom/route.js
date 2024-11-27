import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const credentials = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Zoom token');
    }

    const { access_token } = await tokenResponse.json();
    const bookingDetails = await request.json();

    const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: `Tutoring Session`,
        type: 2,
        start_time: bookingDetails.start_time,
        duration: 60,
        settings: {
          join_before_host: true,
          waiting_room: true,
          meeting_authentication: false
        }
      })
    });

    if (!meetingResponse.ok) {
      throw new Error('Failed to create meeting');
    }

    const meeting = await meetingResponse.json();
    return NextResponse.json({
      link: meeting.join_url,
      meetingId: meeting.id,
      password: meeting.password
    });
  } catch (error) {
    console.error('Zoom API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 