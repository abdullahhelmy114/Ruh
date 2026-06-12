"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { authFetch } from "@/lib/authFetch";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  created_at: string;
}

export default function AdminLibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchBooks = async () => {
    try {
      const res = await authFetch("/api/library/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("عنوان الكتاب مطلوب");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    if (coverFile) formData.append("cover", coverFile);
    if (pdfFile) formData.append("pdf", pdfFile);

    try {
      const res = await authFetch("/api/admin/library/books", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": undefined } as any, // لإرسال multipart
      });

      if (res.ok) {
        toast.success("تمت إضافة الكتاب بنجاح");
        setTitle("");
        setAuthor("");
        setDescription("");
        setCoverFile(null);
        setPdfFile(null);
        fetchBooks();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل في إضافة الكتاب");
      }
    } catch {
      toast.error("حدث خطأ أثناء الرفع");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا الكتاب؟")) return;
    try {
      const res = await authFetch(`/api/admin/library/books/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("تم حذف الكتاب");
        fetchBooks();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل الحذف");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">جاري تحميل المكتبة...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-secondary-foreground">إدارة المكتبة</h1>

      {/* نموذج إضافة كتاب */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">إضافة كتاب جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddBook} className="space-y-4">
            <div>
              <Label>عنوان الكتاب</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="اسم الكتاب"
                required
              />
            </div>
            <div>
              <Label>المؤلف</Label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="المؤلف"
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>صورة الغلاف</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label>ملف PDF (اختياري)</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={uploading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {uploading ? "جاري الرفع..." : "إضافة الكتاب"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* قائمة الكتب */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">الكتب الموجودة ({books.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? (
            <p className="text-muted-foreground text-center">لا توجد كتب حالياً.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الغلاف</TableHead>
                  <TableHead>العنوان</TableHead>
                  <TableHead>المؤلف</TableHead>
                  <TableHead>تاريخ الإضافة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-muted rounded" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author || "—"}</TableCell>
                    <TableCell>
                      {new Date(book.created_at).toLocaleDateString("ar-EG")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(book.id)}
                      >
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}