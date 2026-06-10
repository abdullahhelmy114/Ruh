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

-- أضف هذه الجداول إلى ملف schema.sql أو قم بتشغيلها مباشرة

CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  course_ids JSONB NOT NULL, -- مصفوفة من معرفات الكورسات
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID NOT NULL, -- يمكن إنشاء جدول plans لاحقاً
  expires_at TIMESTAMP NOT NULL,
  courses_used INTEGER DEFAULT 0,
  max_courses INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('course', 'bundle', 'subscription')),
  course_id UUID REFERENCES courses(id),
  bundle_id UUID REFERENCES bundles(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount NUMERIC(10,2) NOT NULL,
  paypal_order_id TEXT NOT NULL,
  paypal_payer_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  teacher_id UUID REFERENCES users(id), -- معلم الكورس
  amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  commission_status TEXT DEFAULT 'pending' CHECK (commission_status IN ('pending', 'paid'))
);

CREATE TABLE IF NOT EXISTS teacher_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id),
  purchase_course_id UUID REFERENCES purchase_courses(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid'))
);

-- المجتمع (Community Posts – حائط الإنجازات)
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('achievement', 'manual')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- تعليقات الحائط
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- إعجابات الحائط (حتى لا تتكرر)
CREATE TABLE community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- منتدى الأسئلة والأجوبة
CREATE TABLE forum_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INT NOT NULL DEFAULT 0,
  downvotes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE forum_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES forum_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INT NOT NULL DEFAULT 0,
  downvotes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول التصويتات على الأسئلة والأجوبة (لتجنب التصويت المزدوج)
CREATE TABLE forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES forum_questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES forum_answers(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT target_check CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NOT NULL)
  ),
  UNIQUE(user_id, question_id, answer_id)
);

-- التحديات
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);