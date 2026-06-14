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
import { T } from "@/components/TranslatedText";

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
        headers: { "Content-Type": undefined } as any,
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    try {
      const res = await authFetch(`/api/admin/library/books/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(<T>admin.library.bookDeleted</T>);
        fetchBooks();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed");
      }
    } catch {
      toast.error(<T>admin.library.deleteError</T>);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <T>library.loading</T>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-secondary-foreground">
        <T>admin.library.title</T>
      </h1>

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
            <Button type="submit" disabled={uploading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {uploading ? <T>admin.library.uploading</T> : <T>admin.library.addBookButton</T>}
            </Button>
          </form>
        </CardContent>
      </Card>

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
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(book.id)}>
                        <T>admin.library.delete</T>
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