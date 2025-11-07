-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours DECIMAL(4,1) NOT NULL,
  icon TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create course modules table
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  content TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create course enrollments table
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  UNIQUE(user_id, course_id)
);

-- Create module progress table
CREATE TABLE public.module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  quiz_score INTEGER,
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, module_id)
);

-- Create learning sessions table
CREATE TABLE public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT
);

-- Create learning paths table
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create learning path courses junction table
CREATE TABLE public.learning_path_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  UNIQUE(path_id, course_id)
);

-- Create user learning paths table
CREATE TABLE public.user_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(user_id, path_id)
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_paths ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses (public readable)
CREATE POLICY "Courses are viewable by everyone"
  ON public.courses FOR SELECT
  USING (true);

CREATE POLICY "Educators can manage courses"
  ON public.courses FOR ALL
  USING (public.has_role(auth.uid(), 'educator'));

-- RLS Policies for course_modules (public readable)
CREATE POLICY "Course modules are viewable by everyone"
  ON public.course_modules FOR SELECT
  USING (true);

CREATE POLICY "Educators can manage course modules"
  ON public.course_modules FOR ALL
  USING (public.has_role(auth.uid(), 'educator'));

-- RLS Policies for course_enrollments
CREATE POLICY "Users can view their own enrollments"
  ON public.course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
  ON public.course_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Educators can view all enrollments"
  ON public.course_enrollments FOR SELECT
  USING (public.has_role(auth.uid(), 'educator'));

-- RLS Policies for module_progress
CREATE POLICY "Users can view their own progress"
  ON public.module_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.module_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.module_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Educators can view all progress"
  ON public.module_progress FOR SELECT
  USING (public.has_role(auth.uid(), 'educator'));

-- RLS Policies for learning_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.learning_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.learning_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Educators can view all sessions"
  ON public.learning_sessions FOR SELECT
  USING (public.has_role(auth.uid(), 'educator'));

-- RLS Policies for achievements
CREATE POLICY "Users can view their own achievements"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for learning_paths (public readable)
CREATE POLICY "Learning paths are viewable by everyone"
  ON public.learning_paths FOR SELECT
  USING (true);

CREATE POLICY "Educators can manage learning paths"
  ON public.learning_paths FOR ALL
  USING (public.has_role(auth.uid(), 'educator'));

-- RLS Policies for learning_path_courses (public readable)
CREATE POLICY "Learning path courses are viewable by everyone"
  ON public.learning_path_courses FOR SELECT
  USING (true);

CREATE POLICY "Educators can manage learning path courses"
  ON public.learning_path_courses FOR ALL
  USING (public.has_role(auth.uid(), 'educator'));

-- RLS Policies for user_learning_paths
CREATE POLICY "Users can view their own learning paths"
  ON public.user_learning_paths FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in learning paths"
  ON public.user_learning_paths FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own path progress"
  ON public.user_learning_paths FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Educators can view all user paths"
  ON public.user_learning_paths FOR SELECT
  USING (public.has_role(auth.uid(), 'educator'));

-- Create indexes for better query performance
CREATE INDEX idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX idx_module_progress_user_id ON public.module_progress(user_id);
CREATE INDEX idx_module_progress_module_id ON public.module_progress(module_id);
CREATE INDEX idx_learning_sessions_user_id ON public.learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_date ON public.learning_sessions(session_date);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);

-- Trigger for courses updated_at
CREATE TRIGGER on_courses_updated
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();