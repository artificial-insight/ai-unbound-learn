-- Create study groups table
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Study groups are viewable by everyone"
ON public.study_groups
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create study groups"
ON public.study_groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Create study group members table
CREATE TABLE public.study_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Group members can view membership"
ON public.study_group_members
FOR SELECT
USING (true);

CREATE POLICY "Users can join groups"
ON public.study_group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create study group messages table
CREATE TABLE public.study_group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_group_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Group members can view messages"
ON public.study_group_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.study_group_members
    WHERE group_id = study_group_messages.group_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Group members can send messages"
ON public.study_group_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.study_group_members
    WHERE group_id = study_group_messages.group_id
    AND user_id = auth.uid()
  )
);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_group_messages;

-- Create typing indicators table
CREATE TABLE public.study_group_typing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.study_group_typing ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Group members can view typing status"
ON public.study_group_typing
FOR SELECT
USING (true);

CREATE POLICY "Users can update their typing status"
ON public.study_group_typing
FOR ALL
USING (auth.uid() = user_id);

-- Enable realtime for typing indicators
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_group_typing;

-- Create triggers
CREATE TRIGGER update_study_groups_updated_at
BEFORE UPDATE ON public.study_groups
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_typing_updated_at
BEFORE UPDATE ON public.study_group_typing
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();