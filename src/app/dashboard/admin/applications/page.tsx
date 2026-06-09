"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Application {
  id: string;
  course_title: string;
  category: string;
  level: string;
  teacher_name: string;
  teacher_email: string;
  applied_at: string;
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    const res = await fetch("/api/admin/applications");
    const data = await res.json();
    if (res.ok) setApplications(data);
    else toast.error("فشل جلب الطلبات");
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (applicationId: string) => {
    const res = await fetch("/api/admin/applications/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: applicationId }),
    });
    if (res.ok) {
      toast.success("تمت الموافقة وإنشاء الكورس الحي");
      fetchApplications(); // تحديث القائمة
    } else {
      toast.error("فشلت الموافقة");
    }
  };

  if (loading) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">طلبات التدريس المعلقة</h1>
      {applications.length === 0 ? (
        <p>لا توجد طلبات حالياً.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المعلم</TableHead>
              <TableHead>الكورس</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>المستوى</TableHead>
              <TableHead>تاريخ الطلب</TableHead>
              <TableHead>إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.teacher_name}<br /><small className="text-muted">{app.teacher_email}</small></TableCell>
                <TableCell>{app.course_title}</TableCell>
                <TableCell>{app.category}</TableCell>
                <TableCell>{app.level}</TableCell>
                <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button onClick={() => handleApprove(app.id)}>موافقة</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}