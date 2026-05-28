export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { sendEmail } from '@/lib/email';

// ─── دوال Zoom ──────────────────────────────────────────────
async function getZoomAccessToken(): Promise<string> {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw new Error('Missing Zoom OAuth credentials');
  }

  const credentials = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`);
  const params = new URLSearchParams({ grant_type: 'account_credentials', account_id: ZOOM_ACCOUNT_ID });

  const res = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoom OAuth failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function createZoomMeeting(topic: string, startTime: string): Promise<{ meetingId: string; joinUrl: string }> {
  const token = await getZoomAccessToken();

  const body = {
    topic,
    type: 2, // اجتماع مجدول
    start_time: startTime,
    duration: 60,
    timezone: 'UTC',
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      auto_recording: 'cloud',
    },
  };

  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoom meeting creation failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    meetingId: String(data.id),
    joinUrl: data.join_url,
  };
}

// ─── PUT /api/lessons/[id] ─────────────────────────────────
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { status, meetingUrl, meetingId } = await request.json();
    const { id: lessonId } = await context.params;
    if (!lessonId || !status) {
      return NextResponse.json({ error: 'Missing lesson ID or status' }, { status: 400 });
    }
    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // في حالة الموافقة، أنشئ اجتماع Zoom تلقائيًا
    let finalMeetingUrl = meetingUrl || null;
    let finalMeetingId = meetingId || null;

    if (status === 'approved') {
      // جلب تفاصيل الدرس لاستخدامها في إنشاء الاجتماع
      const [lesson] = await sql`
        SELECT title, scheduled_at FROM lessons WHERE id = ${lessonId}
      `;
      if (lesson && lesson.scheduled_at) {
        try {
          const zoomMeeting = await createZoomMeeting(lesson.title, lesson.scheduled_at);
          finalMeetingUrl = zoomMeeting.joinUrl;
          finalMeetingId = zoomMeeting.meetingId;
        } catch (zoomError: any) {
          console.error('Zoom creation error:', zoomError.message);
          return NextResponse.json({ error: `Zoom meeting creation failed: ${zoomError.message}` }, { status: 500 });
        }
      }
    }

    if (status === 'approved') {
  const [teacher] = await sql`SELECT email, full_name FROM profiles WHERE firebase_uid = (SELECT teacher_uid FROM lessons WHERE id = ${lessonId})`;
  if (teacher?.email) {
    await sendEmail(
      teacher.email,
      'Your lesson has been approved!',
      `<h1>Lesson Approved!</h1>
       <p>Your lesson has been approved and is now live.</p>
       <p><a href="https://ruhulqudus.net/live/${lessonId}">View Lesson</a></p>`
    );
  }
}

    // تحديث الدرس في قاعدة البيانات
    const result = await sql`
      UPDATE lessons
      SET
        status = ${status},
        meeting_url = ${finalMeetingUrl},
        meeting_id = ${finalMeetingId},
        reviewed_at = NOW()
      WHERE id = ${lessonId}
      RETURNING id, title, status, meeting_url, meeting_id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ lesson: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}