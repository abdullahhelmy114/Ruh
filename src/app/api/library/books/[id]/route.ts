import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getServerSession } from "@/lib/auth";
import { uploadFileToFirebaseStorage } from "@/lib/firebase/admin-storage";

// حذف كتاب
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await sql`DELETE FROM library_books WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete book error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// تحديث كتاب
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // جلب الكتاب الحالي أولاً
    const [existing] = await sql`
      SELECT title, author, description, cover_url 
      FROM library_books 
      WHERE id = ${params.id}
    `;

    if (!existing) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const author = formData.get("author") as string | null;
    const description = formData.get("description") as string | null;
    const coverFile = formData.get("cover") as File | null;

    const newTitle = title !== null ? title : existing.title;
    const newAuthor = author !== null ? author : existing.author;
    const newDescription = description !== null ? description : existing.description;
    let newCoverUrl = existing.cover_url;

    if (coverFile && typeof coverFile.arrayBuffer === "function") {
      const buffer = Buffer.from(await coverFile.arrayBuffer());
      newCoverUrl = await uploadFileToFirebaseStorage(
        buffer,
        coverFile.name,
        "library/covers"
      );
    }

    // تحديث آمن باستخدام tagged template
    await sql`
      UPDATE library_books 
      SET 
        title = ${newTitle}, 
        author = ${newAuthor}, 
        description = ${newDescription}, 
        cover_url = ${newCoverUrl}
      WHERE id = ${params.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update book error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}