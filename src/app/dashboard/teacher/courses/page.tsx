"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type LiveCourse = {
  id: string;
  title: string;
  category: string;
  level: string;
  base_price: number;
  lessons_count: number;
  created_at: string;
};

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<LiveCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/live-courses")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">تحميل...</div>;

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">كورساتي النشطة</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <Card key={course.id} className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{course.title}</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                عدد الحصص: <span className="font-medium text-foreground">{course.lessons_count}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                السعر: <span className="font-medium">${course.base_price}</span>
              </p>
              <Link href={`/dashboard/teacher/courses/${course.id}`}>
                <Button className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  إدارة الحصص
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">لا توجد كورسات نشطة</p>
        )}
      </div>
    </div>
  );
}