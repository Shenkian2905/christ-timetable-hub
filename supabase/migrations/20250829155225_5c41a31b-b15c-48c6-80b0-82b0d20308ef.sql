-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'coordinator')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL CHECK (level IN ('HL', 'SL')),
  year_group INTEGER NOT NULL CHECK (year_group IN (1, 2)),
  subject_group TEXT NOT NULL, -- Physics/Psychology, BM/Bio, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  subjects TEXT[] NOT NULL, -- Array of subject codes they can teach
  teaches_both_years BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL,
  has_notice_board BOOLEAN NOT NULL DEFAULT false,
  room_type TEXT NOT NULL CHECK (room_type IN ('classroom', 'lab', 'computer_lab')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create class groups table (subject combinations)
CREATE TABLE public.class_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year_group INTEGER NOT NULL CHECK (year_group IN (1, 2)),
  group_name TEXT NOT NULL,
  subject_codes TEXT[] NOT NULL,
  student_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create timetable entries table
CREATE TABLE public.timetable_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year TEXT NOT NULL,
  week_type TEXT NOT NULL CHECK (week_type IN ('odd', 'even')),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 6), -- 1=Monday, 6=Saturday
  time_slot TEXT NOT NULL,
  subject_code TEXT NOT NULL REFERENCES subjects(code),
  teacher_id UUID REFERENCES teachers(id),
  room_id UUID REFERENCES rooms(id),
  class_group_id UUID NOT NULL REFERENCES class_groups(id),
  is_block_hour BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure no conflicts
  UNIQUE(day_of_week, time_slot, teacher_id, week_type, academic_year),
  UNIQUE(day_of_week, time_slot, room_id, week_type, academic_year)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can view all data" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admin users can manage subjects" ON public.subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can view teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Admin users can manage teachers" ON public.teachers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Admin users can manage rooms" ON public.rooms FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can view class_groups" ON public.class_groups FOR SELECT USING (true);
CREATE POLICY "Admin users can manage class_groups" ON public.class_groups FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can view timetable" ON public.timetable_entries FOR SELECT USING (true);
CREATE POLICY "Admin users can manage timetable" ON public.timetable_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample data
INSERT INTO public.subjects (name, code, level, year_group, subject_group) VALUES
-- Year 1 subjects
('Physics HL', 'PHY_HL_Y1', 'HL', 1, 'Physics/Psychology'),
('Physics SL', 'PHY_SL_Y1', 'SL', 1, 'Physics/Psychology'),
('Psychology HL', 'PSY_HL_Y1', 'HL', 1, 'Physics/Psychology'),
('Psychology SL', 'PSY_SL_Y1', 'SL', 1, 'Physics/Psychology'),
('Business Management HL', 'BM_HL_Y1', 'HL', 1, 'BM/Bio'),
('Business Management SL', 'BM_SL_Y1', 'SL', 1, 'BM/Bio'),
('Biology HL', 'BIO_HL_Y1', 'HL', 1, 'BM/Bio'),
('Biology SL', 'BIO_SL_Y1', 'SL', 1, 'BM/Bio'),
('Computer Science HL', 'CS_HL_Y1', 'HL', 1, 'CS/ESS/History'),
('Computer Science SL', 'CS_SL_Y1', 'SL', 1, 'CS/ESS/History'),
('Environmental Systems HL', 'ESS_HL_Y1', 'HL', 1, 'CS/ESS/History'),
('Environmental Systems SL', 'ESS_SL_Y1', 'SL', 1, 'CS/ESS/History'),
('History HL', 'HIS_HL_Y1', 'HL', 1, 'CS/ESS/History'),
('History SL', 'HIS_SL_Y1', 'SL', 1, 'CS/ESS/History'),
('Economics HL', 'ECO_HL_Y1', 'HL', 1, 'Eco/Chem'),
('Economics SL', 'ECO_SL_Y1', 'SL', 1, 'Eco/Chem'),
('Chemistry HL', 'CHEM_HL_Y1', 'HL', 1, 'Eco/Chem'),
('Chemistry SL', 'CHEM_SL_Y1', 'SL', 1, 'Eco/Chem'),

-- Year 2 subjects
('Physics HL', 'PHY_HL_Y2', 'HL', 2, 'Phy/Psy/His'),
('Physics SL', 'PHY_SL_Y2', 'SL', 2, 'Phy/Psy/His'),
('Psychology HL', 'PSY_HL_Y2', 'HL', 2, 'Phy/Psy/His'),
('Psychology SL', 'PSY_SL_Y2', 'SL', 2, 'Phy/Psy/His'),
('History HL', 'HIS_HL_Y2', 'HL', 2, 'Phy/Psy/His'),
('History SL', 'HIS_SL_Y2', 'SL', 2, 'Phy/Psy/His'),
('Business Management HL', 'BM_HL_Y2', 'HL', 2, 'BM/Bio'),
('Business Management SL', 'BM_SL_Y2', 'SL', 2, 'BM/Bio'),
('Biology HL', 'BIO_HL_Y2', 'HL', 2, 'BM/Bio'),
('Biology SL', 'BIO_SL_Y2', 'SL', 2, 'BM/Bio'),
('Economics HL', 'ECO_HL_Y2', 'HL', 2, 'Eco/Chem'),
('Economics SL', 'ECO_SL_Y2', 'SL', 2, 'Eco/Chem'),
('Chemistry HL', 'CHEM_HL_Y2', 'HL', 2, 'Eco/Chem'),
('Chemistry SL', 'CHEM_SL_Y2', 'SL', 2, 'Eco/Chem'),
('Computer Science HL', 'CS_HL_Y2', 'HL', 2, 'CS/ESS'),
('Computer Science SL', 'CS_SL_Y2', 'SL', 2, 'CS/ESS'),
('Environmental Systems HL', 'ESS_HL_Y2', 'HL', 2, 'CS/ESS'),
('Environmental Systems SL', 'ESS_SL_Y2', 'SL', 2, 'CS/ESS');

-- Insert sample teachers
INSERT INTO public.teachers (name, email, subjects, teaches_both_years) VALUES
('Dr. Smith', 'smith@school.edu', ARRAY['PHY_HL_Y1', 'PHY_SL_Y1', 'PHY_HL_Y2', 'PHY_SL_Y2'], true),
('Ms. Johnson', 'johnson@school.edu', ARRAY['PSY_HL_Y1', 'PSY_SL_Y1', 'PSY_HL_Y2', 'PSY_SL_Y2'], true),
('Mr. Brown', 'brown@school.edu', ARRAY['BM_HL_Y1', 'BM_SL_Y1', 'BM_HL_Y2', 'BM_SL_Y2'], true),
('Dr. Wilson', 'wilson@school.edu', ARRAY['BIO_HL_Y1', 'BIO_SL_Y1', 'BIO_HL_Y2', 'BIO_SL_Y2'], true),
('Ms. Davis', 'davis@school.edu', ARRAY['CS_HL_Y1', 'CS_SL_Y1', 'CS_HL_Y2', 'CS_SL_Y2'], true),
('Mr. Miller', 'miller@school.edu', ARRAY['ESS_HL_Y1', 'ESS_SL_Y1', 'ESS_HL_Y2', 'ESS_SL_Y2'], true),
('Dr. Garcia', 'garcia@school.edu', ARRAY['HIS_HL_Y1', 'HIS_SL_Y1', 'HIS_HL_Y2', 'HIS_SL_Y2'], true),
('Ms. Martinez', 'martinez@school.edu', ARRAY['ECO_HL_Y1', 'ECO_SL_Y1', 'ECO_HL_Y2', 'ECO_SL_Y2'], true),
('Dr. Anderson', 'anderson@school.edu', ARRAY['CHEM_HL_Y1', 'CHEM_SL_Y1', 'CHEM_HL_Y2', 'CHEM_SL_Y2'], true);

-- Insert sample rooms
INSERT INTO public.rooms (room_number, capacity, has_notice_board, room_type) VALUES
('101', 30, true, 'classroom'),
('102', 25, true, 'classroom'),
('103', 35, false, 'classroom'),
('L201', 20, true, 'lab'),
('L202', 20, true, 'lab'),
('CL301', 25, true, 'computer_lab'),
('201', 40, true, 'classroom'),
('202', 30, false, 'classroom'),
('203', 32, true, 'classroom'),
('L301', 18, true, 'lab');

-- Insert sample class groups
INSERT INTO public.class_groups (year_group, group_name, subject_codes, student_count) VALUES
(1, 'Year 1 - Physics/Psychology Group A', ARRAY['PHY_HL_Y1', 'PSY_SL_Y1'], 15),
(1, 'Year 1 - Physics/Psychology Group B', ARRAY['PHY_SL_Y1', 'PSY_HL_Y1'], 12),
(1, 'Year 1 - BM/Bio Group A', ARRAY['BM_HL_Y1', 'BIO_SL_Y1'], 18),
(1, 'Year 1 - BM/Bio Group B', ARRAY['BM_SL_Y1', 'BIO_HL_Y1'], 14),
(1, 'Year 1 - CS/ESS/History Group A', ARRAY['CS_HL_Y1', 'ESS_SL_Y1', 'HIS_SL_Y1'], 10),
(1, 'Year 1 - CS/ESS/History Group B', ARRAY['CS_SL_Y1', 'ESS_HL_Y1', 'HIS_HL_Y1'], 13),
(1, 'Year 1 - Eco/Chem Group A', ARRAY['ECO_HL_Y1', 'CHEM_SL_Y1'], 16),
(1, 'Year 1 - Eco/Chem Group B', ARRAY['ECO_SL_Y1', 'CHEM_HL_Y1'], 20),

(2, 'Year 2 - Phy/Psy/His Group A', ARRAY['PHY_HL_Y2', 'PSY_SL_Y2', 'HIS_SL_Y2'], 12),
(2, 'Year 2 - Phy/Psy/His Group B', ARRAY['PHY_SL_Y2', 'PSY_HL_Y2', 'HIS_HL_Y2'], 14),
(2, 'Year 2 - BM/Bio Group A', ARRAY['BM_HL_Y2', 'BIO_SL_Y2'], 15),
(2, 'Year 2 - BM/Bio Group B', ARRAY['BM_SL_Y2', 'BIO_HL_Y2'], 13),
(2, 'Year 2 - Eco/Chem Group A', ARRAY['ECO_HL_Y2', 'CHEM_SL_Y2'], 17),
(2, 'Year 2 - Eco/Chem Group B', ARRAY['ECO_SL_Y2', 'CHEM_HL_Y2'], 19),
(2, 'Year 2 - CS/ESS Group A', ARRAY['CS_HL_Y2', 'ESS_SL_Y2'], 8),
(2, 'Year 2 - CS/ESS Group B', ARRAY['CS_SL_Y2', 'ESS_HL_Y2'], 11);