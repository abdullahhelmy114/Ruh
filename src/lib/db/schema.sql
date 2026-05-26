CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول الملف الشخصي (مرتبط بـ Firebase Auth عبر uid)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الدورات
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id),
  level TEXT DEFAULT 'B1',
  price NUMERIC DEFAULT 0,
  lessons_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول التقدم الدراسي
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  lesson_id INT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- جدول طلبات التوظيف (للمعلمين)
CREATE TABLE IF NOT EXISTS teacher_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  specialization TEXT,
  country TEXT,
  years_experience INT DEFAULT 0,
  cv_url TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT now()
);

-- جدول المعاملات المالية (اختياري)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  item_name TEXT,
  amount NUMERIC,
  type TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول المدفوعات للمعلمين
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES profiles(id),
  commission_rate NUMERIC DEFAULT 10,
  pending_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول البلاغات
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_by UUID REFERENCES profiles(id),
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء دالة لتعيين الأدمن تلقائياً
CREATE OR REPLACE FUNCTION set_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'abdullahhelmy114@gmail.com' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_admin_role
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_role();