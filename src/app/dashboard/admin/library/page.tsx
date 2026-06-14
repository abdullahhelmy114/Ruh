"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { authFetch } from "@/lib/authFetch";
import { T } from "@/components/TranslatedText";
import { Loader2, Pencil, Trash2 } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
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

  // حالة الرفع المجمع
  const [bulkFiles, setBulkFiles] = useState<FileList | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);

  // حالة التعديل
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);

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
      toast.error(<T>admin.library.titleRequired</T>);
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
      });

      if (res.ok) {
        toast.success(<T>admin.library.bookAdded</T>);
        setTitle("");
        setAuthor("");
        setDescription("");
        setCoverFile(null);
        setPdfFile(null);
        fetchBooks();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed");
      }
    } catch {
      toast.error(<T>admin.library.uploadError</T>);
    } finally {
      setUploading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFiles || bulkFiles.length === 0) {
      toast.error("يرجى اختيار ملفات PDF");
      return;
    }

    setBulkUploading(true);
    const formData = new FormData();
    for (let i = 0; i < bulkFiles.length; i++) {
      formData.append("files", bulkFiles[i]);
    }

    try {
      const res = await authFetch("/api/admin/library/books/bulk", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`تم إضافة ${data.books.length} كتب`);
        setBulkFiles(null);
        setBulkDialogOpen(false);
        fetchBooks();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل الرفع المجمع");
      }
    } catch {
      toast.error("خطأ في الشبكة");
    } finally {
      setBulkUploading(false);
    }
  };

  const handleEditClick = (book: Book) => {
    setEditBook(book);
    setEditTitle(book.title);
    setEditAuthor(book.author || "");
    setEditDescription(book.description || "");
    setEditCoverFile(null);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editBook) return;
    setEditSaving(true);
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("author", editAuthor);
    formData.append("description", editDescription);
    if (editCoverFile) formData.append("cover", editCoverFile);

    try {
      const res = await authFetch(`/api/admin/library/books/${editBook.id}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        toast.success("تم تحديث الكتاب");
        setEditDialogOpen(false);
        fetchBooks();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل التحديث");
      }
    } catch {
      toast.error("خطأ في الشبكة");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا الكتاب؟")) return;
    try {
      const res = await authFetch(`/api/admin/library/books/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(<T>admin.library.bookDeleted</T>);
        fetchBooks();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل الحذف");
      }
    } catch {
      toast.error(<T>admin.library.deleteError</T>);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Loader2 className="mx-auto animate-spin h-8 w-8" />
        <T>library.loading</T>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8" dir="rtl">
      <h1 className="text-3xl font-bold text-secondary-foreground">
        <T>admin.library.title</T>
      </h1>

      {/* إضافة فردية */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl"><T>admin.library.addBook</T></CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddBook} className="space-y-4">
            <div>
              <Label><T>admin.library.bookTitle</T></Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label><T>admin.library.author</T></Label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div>
              <Label><T>admin.library.description</T></Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label><T>admin.library.coverImage</T></Label>
                <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </div>
              <div>
                <Label><T>admin.library.pdfFile</T></Label>
                <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={uploading} className="bg-primary text-primary-foreground">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <T>admin.library.addBookButton</T>}
              </Button>
              <Button type="button" variant="outline" onClick={() => setBulkDialogOpen(true)}>
                <T>admin.library.bulkUpload</T>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* جدول الكتب */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl"><T>admin.library.existingBooks</T> ({books.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? (
            <p className="text-muted-foreground text-center"><T>admin.library.noBooks</T></p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><T>admin.library.cover</T></TableHead>
                  <TableHead><T>admin.library.bookTitle</T></TableHead>
                  <TableHead><T>admin.library.author</T></TableHead>
                  <TableHead><T>admin.library.date</T></TableHead>
                  <TableHead className="text-right"><T>admin.library.actions</T></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-10 h-14 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-14 bg-muted rounded" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author || "—"}</TableCell>
                    <TableCell>{new Date(book.created_at).toLocaleDateString("ar-EG")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(book)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(book.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* حوار الرفع المجمع */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl"><T>admin.library.bulkUploadTitle</T></DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label><T>admin.library.selectPdfFiles</T></Label>
            <Input
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => setBulkFiles(e.target.files)}
            />
            {bulkFiles && <p className="text-sm text-muted-foreground">تم اختيار {bulkFiles.length} ملف</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkDialogOpen(false)}>
              <T>library.cancel</T>
            </Button>
            <Button onClick={handleBulkUpload} disabled={bulkUploading} className="bg-primary text-primary-foreground">
              {bulkUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <T>admin.library.uploadBulk</T>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار تعديل كتاب */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl"><T>admin.library.editBook</T></DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label><T>admin.library.bookTitle</T></Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <Label><T>admin.library.author</T></Label>
              <Input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
            </div>
            <div>
              <Label><T>admin.library.description</T></Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
            </div>
            <div>
              <Label><T>admin.library.coverImage</T></Label>
              <Input type="file" accept="image/*" onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
              <T>library.cancel</T>
            </Button>
            <Button onClick={handleEditSave} disabled={editSaving} className="bg-primary text-primary-foreground">
              {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <T>admin.library.saveChanges</T>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}