export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'never-enrolled';
  const level = searchParams.get('level') || 'B1';
  const exportEmails = searchParams.get('export') === 'true';

  try {
    let query;

    switch (filter) {
      case 'never-enrolled':
        query = sql`SELECT full_name, email, nationality, residence, native_language FROM profiles WHERE role='student' AND firebase_uid NOT IN (SELECT user_uid FROM enrollments)`;
        break;
      case 'one-course':
        query = sql`
          SELECT p.full_name, p.email, p.nationality, p.residence, p.native_language
          FROM profiles p
          JOIN (SELECT user_uid FROM enrollments GROUP BY 1 HAVING COUNT(course_id)=1) sub ON p.firebase_uid=sub.user_uid
        `;
        break;
      case 'certificate-level':
        query = sql`
          SELECT p.full_name, p.email, p.nationality, p.residence, p.native_language
          FROM profiles p
          JOIN certificates c ON p.firebase_uid=c.user_uid
          WHERE c.level=${level}
        `;
        break;
      default:
        query = sql`SELECT full_name, email, nationality, residence, native_language FROM profiles WHERE role='student'`;
    }

    const students = await query;

    if (exportEmails) {
      const emails = students.map((s: any) => s.email).join(', ');
      return new NextResponse(emails, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="admin-student-emails.txt"',
        },
      });
    }

    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}