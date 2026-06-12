import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getServerSession } from "@/lib/auth";
import { uploadFileToFirebaseStorage } from "@/lib/firebase/admin-storage";

export async function POST(req: Request) {
  // 1. تحقق من الجلسة وصلاحية الأدمن
  const session = await getServerSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // 2. استقبال البيانات من FormData
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const author = (formData.get("author") as string) || "";
    const description = (formData.get("description") as string) || "";
    const coverFile = formData.get("cover") as File | null;
    const pdfFile = formData.get("pdf") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Book title is required" }, { status: 400 });
    }

    let coverUrl = "";
    let pdfUrl = "";

    // 3. رفع صورة الغلاف إلى Firebase Storage
    if (coverFile) {
      const buffer = Buffer.from(await coverFile.arrayBuffer());
      coverUrl = await uploadFileToFirebaseStorage(buffer, coverFile.name, "library/covers");
    }

    // 4. رفع ملف PDF إلى Firebase Storage (اختياري حالياً)
    if (pdfFile) {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      pdfUrl = await uploadFileToFirebaseStorage(buffer, pdfFile.name, "library/pdfs");
    }

    // 5. إدراج الكتاب في قاعدة البيانات
    const [book] = await sql`
      INSERT INTO library_books (title, author, description, cover_url, pdf_url)
      VALUES (${title}, ${author}, ${description}, ${coverUrl}, ${pdfUrl})
      RETURNING id
    `;

    return NextResponse.json({ success: true, bookId: book.id });
  } catch (error) {
    console.error("Add book error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}