-- Create storage buckets for avatars and course materials
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', false);

-- RLS policies for avatars bucket (public read, auth users can upload their own)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for course-materials bucket (auth users can read enrolled courses' materials, educators can upload)
CREATE POLICY "Users can view course materials they're enrolled in"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'course-materials' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Educators can upload course materials"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'educator'));

CREATE POLICY "Educators can update course materials"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'educator'));

CREATE POLICY "Educators can delete course materials"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'educator'));