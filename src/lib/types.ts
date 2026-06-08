export type Role = "admin" | "teacher" | "student";
export type Status = "active" | "suspended" | "pending" | "approved" | "rejected" | "published";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  plan: string;
  status: Status;
  created_at: string;
  avatar_url?: string;
}

export interface PlatformStats {
  total_students: number;
  total_teachers: number;
  active_courses: number;
  total_revenue: number;
  students_delta: number;
  teachers_delta: number;
  courses_delta: number;
  revenue_delta: number;
}

export interface PendingCounts {
  teacher_applications: number;
  courses_awaiting_review: number;
  payouts_to_process: number;
  reported_content: number;
}

export interface RevenuePoint {
  month: string;
  amount: number;
}

export interface TeacherApplication {
  id: string;
  profile_id: string;
  specialization: string;
  years_experience: number;
  country: string;
  cv_url: string;
  status: Status;
  created_at: string;
  profile?: { full_name: string; email: string };
}

export interface Course {
  id: string;
  title: string;
  teacher_id: string;
  level: string;
  price: number;
  lesson_count: number;
  status: Status;
  created_at: string;
  teacher?: { full_name: string };
}

export interface Transaction {
  id: string;
  user_id: string;
  item_name: string;
  amount: number;
  type: string;
  created_at: string;
  profile?: { full_name: string };
}

export interface TeacherPayout {
  id: string;
  teacher_id: string;
  student_count: number;
  commission_rate: number;
  amount: number;
  processed: boolean;
  profile?: { full_name: string };
}

export interface FinancialSummary {
  gross_revenue: number;
  pending_payouts: number;
  platform_net: number;
  pending_teacher_count: number;
}