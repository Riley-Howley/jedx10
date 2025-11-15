import { supabaseAdmin } from "../../../lib/superbase";

// Types matching your component structure
export interface ExerciseVideo {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
  videoUrl?: string;
  duration: string;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  disclaimer: string;
  notes: string;
  options: string[];
  videos: ExerciseVideo[];
}

export interface Program {
  id?: string;
  title: string;
  description?: string;
  duration: string;
  difficulty: string;
  focus: string;
  cost: string;
  courses?: Course[];
  image_url?: string;
  is_active?: boolean;
}

// Database types
export interface DBProgram {
  id: string;
  title: string;
  description?: string;
  duration: string;
  difficulty: string;
  focus: string;
  cost: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBCourse {
  id: string;
  program_id: string;
  title: string;
  description?: string;
  disclaimer?: string;
  notes?: string;
  options: string[];
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBVideo {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to convert duration string to seconds
function durationToSeconds(duration: string): number | null {
  if (!duration) return null;

  const parts = duration.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return (minutes * 60) + seconds;
  }

  // If it's just seconds
  const totalSeconds = parseInt(duration, 10);
  return isNaN(totalSeconds) ? null : totalSeconds;
}

// Helper function to convert seconds to duration string
function secondsToDuration(seconds: number | undefined): string {
  if (!seconds) return '';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Up video file to Supabase Storage
export async function uploadVideo(file: File, videoId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${videoId}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('exercise-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading video:', uploadError);
      return null;
    }

    // Get public URL
    const { data } = supabaseAdmin.storage
      .from('exercise-videos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadVideo:', error);
    return null;
  }
}

// Save entire program to database
export async function saveProgram(program: Program): Promise<{ success: boolean; programId?: string; error?: string }> {
  try {
    // Start a transaction-like approach by saving program first
    const { data: programData, error: programError } = await supabaseAdmin
      .from('programs')
      .upsert({
        id: program.id,
        title: program.title,
        description: program.description,
        duration: program.duration,
        difficulty: program.difficulty,
        focus: program.focus,
        cost: program.cost,
        image_url: program.image_url,
        is_active: true
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (programError) {
      console.error('Error saving program:', programError);
      return { success: false, error: programError.message };
    }

    const programId = programData.id;

    // Save courses
    for (let courseIndex = 0; courseIndex < program.courses!.length; courseIndex++) {
      const course = program.courses![courseIndex];

      const { data: courseData, error: courseError } = await supabaseAdmin
        .from('courses')
        .upsert({
          id: course.id,
          program_id: programId,
          title: course.title,
          description: course.description,
          disclaimer: course.disclaimer,
          notes: course.notes,
          options: course.options,
          order_index: courseIndex,
          is_active: true
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (courseError) {
        console.error('Error saving course:', courseError);
        return { success: false, error: courseError.message };
      }

      // Save videos for this course
      for (let videoIndex = 0; videoIndex < course.videos.length; videoIndex++) {
        const video = course.videos[videoIndex];

        let videoUrl = video.videoUrl;

        if (!videoUrl) {
          console.warn(`No video URL for video: ${video.title}`);
          continue;
        }

        const { error: videoError } = await supabaseAdmin
          .from('videos')
          .upsert({
            id: video.id,
            course_id: courseData.id,
            title: video.title,
            description: video.description,
            video_url: videoUrl,
            duration_seconds: durationToSeconds(video.duration),
            order_index: videoIndex,
            is_active: true
          }, {
            onConflict: 'id'
          });

        if (videoError) {
          console.error('Error saving video:', videoError);
          return { success: false, error: videoError.message };
        }
      }
    }

    return { success: true, programId };
  } catch (error) {
    console.error('Error in saveProgram:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Load program from database
export async function loadProgram(programId: string): Promise<Program | null> {
  try {
    // Get program
    const { data: programData, error: programError } = await supabaseAdmin
      .from('programs')
      .select('*')
      .eq('id', programId)
      .eq('is_active', true)
      .single();

    if (programError || !programData) {
      console.error('Error loading program:', programError);
      return null;
    }

    // Get courses
    const { data: coursesData, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('program_id', programId)
      .eq('is_active', true)
      .order('order_index');

    if (coursesError) {
      console.error('Error loading courses:', coursesError);
      return null;
    }

    // Get videos for all courses
    const courseIds = coursesData.map(course => course.id);
    const { data: videosData, error: videosError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .in('course_id', courseIds)
      .eq('is_active', true)
      .order('order_index');

    if (videosError) {
      console.error('Error loading videos:', videosError);
      return null;
    }

    // Group videos by course
    const videosByCourse: { [courseId: string]: DBVideo[] } = {};
    videosData.forEach(video => {
      if (!videosByCourse[video.course_id]) {
        videosByCourse[video.course_id] = [];
      }
      videosByCourse[video.course_id].push(video);
    });

    // Build program structure
    const courses: Course[] = coursesData.map(courseData => ({
      id: courseData.id,
      title: courseData.title,
      description: courseData.description || '',
      disclaimer: courseData.disclaimer || '',
      notes: courseData.notes || '',
      options: courseData.options || [],
      videos: (videosByCourse[courseData.id] || []).map(videoData => ({
        id: videoData.id,
        title: videoData.title,
        description: videoData.description || '',
        videoUrl: videoData.video_url,
        duration: secondsToDuration(videoData.duration_seconds),
        order: videoData.order_index
      }))
    }));

    return {
      id: programData.id,
      title: programData.title,
      description: programData.description,
      duration: programData.duration,
      difficulty: programData.difficulty,
      focus: programData.focus,
      cost: programData.cost,
      image_url: programData.image_url,
      courses
    };
  } catch (error) {
    console.error('Error in loadProgram:', error);
    return null;
  }
}

// Get all programs
export async function getAllPrograms(): Promise<DBProgram[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading programs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllPrograms:', error);
    return [];
  }
}

// Delete program (soft delete by setting is_active to false)
export async function deleteProgram(programId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('programs')
      .update({ is_active: false })
      .eq('id', programId);

    if (error) {
      console.error('Error deleting program:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProgram:', error);
    return false;
  }
}

export async function deleteVideo(videoId: string): Promise<boolean> {
  try {
    const { error } = (await supabaseAdmin.from('videos').delete().eq('id', videoId));

    if (error) {
      console.error("Error delete video", error)
      return false
    }
    return true;
  } catch (error) {
    console.error("Error in deleteVideo:", error);
    return false;
  }
}

// Enroll user in program
export async function enrollUserInProgram(
  userId: string,
  programId: string,
  cost?: number,
  paymentStatus: string = 'free'
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc('enroll_user_in_program_fn', {
      p_user_id: userId,
      p_program_id: programId,
      p_cost: cost ?? 0,
      p_payment_status: paymentStatus
    });

    if (error) {
      console.error('Error enrolling user:', error);
      return null;
    }

    console.log('Enrollment complete ✅', { enrollmentId: data });
    return data; // enrollment_id
  } catch (error) {
    console.error('Unexpected error in enrollUserInProgram:', error);
    return null;
  }
}



// Get user's enrolled programs
export async function getUserEnrolledPrograms(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('program_enrollments')
      .select(`
        *,
        programs:program_id (
          id,
          title,
          description,
          image_url
        )
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error loading user programs:', error);
      return [];
    }

    console.log("data", data)

    return data || [];
  } catch (error) {
    console.error('Error in getUserEnrolledPrograms:', error);
    return [];
  }
}

// Update user progress
export async function updateVideoProgress(
  userId: string,
  videoId: string,
  watchTimeSeconds: number,
  isCompleted: boolean = false
): Promise<boolean> {
  try {
    // First, get or create course progress
    const { data: videoData } = await supabaseAdmin
      .from('videos')
      .select('course_id')
      .eq('id', videoId)
      .single();

    if (!videoData) return false;

    const { data: courseProgressData } = await supabaseAdmin
      .from('user_course_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', videoData.course_id)
      .single();

    let courseProgressId = courseProgressData?.id;

    if (!courseProgressId) {
      // Create course progress entry
      const { data: newCourseProgress, error: createError } = await supabaseAdmin
        .from('user_course_progress')
        .insert({
          user_id: userId,
          course_id: videoData.course_id,
          program_enrollment_id: userId // You'll need to get the actual enrollment ID
        })
        .select('id')
        .single();

      if (createError || !newCourseProgress) return false;
      courseProgressId = newCourseProgress.id;
    }

    // Update video progress
    const { error } = await supabaseAdmin
      .from('user_video_progress')
      .upsert({
        user_id: userId,
        video_id: videoId,
        course_progress_id: courseProgressId,
        watch_time_seconds: watchTimeSeconds,
        is_completed: isCompleted,
        completion_date: isCompleted ? new Date().toISOString() : null
      });

    if (error) {
      console.error('Error updating video progress:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateVideoProgress:', error);
    return false;
  }
}

export async function getAvailablePrograms(userId: string): Promise<any[]> {
  try {
    // First, get the program IDs the user is enrolled in
    const { data: enrolledPrograms, error: enrolledError } = await supabaseAdmin
      .from('program_enrollments')
      .select('program_id')
      .eq('user_id', userId);

    if (enrolledError) {
      console.error('Error loading enrolled programs:', enrolledError);
      return [];
    }

    const enrolledProgramIds = enrolledPrograms?.map(e => e.program_id) || [];

    // Then get all programs NOT in that list
    const { data, error } = await supabaseAdmin
      .from('programs')
      .select('*')
      .not('id', 'in', `(${enrolledProgramIds.join(',')})`)

    if (error) {
      console.error('Error loading available programs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAvailablePrograms:', error);
    return [];
  }
}

export async function loadProgramCoursesWithLockState(
  userId: string,
  programEnrollmentId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_course_progress')
      .select(`
        id,
        pos,
        progress_percentage,
        course:course_id (
          id,
          title,
          description,
          order_index,
          is_active
        )
      `)
      .eq('user_id', userId)
      .eq('program_enrollment_id', programEnrollmentId)
      .order('pos');

    if (error) {
      console.error('Error loading program courses:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Apply locking logic
    const coursesWithLock = data.map((course, index, arr) => {
      if (index === 0) {
        // first course is always unlocked
        return { ...course, locked: false };
      }

      const prevCourse = arr[index - 1];
      const prevCompleted = (prevCourse.progress_percentage ?? 0) === 100;

      return { ...course, locked: !prevCompleted };
    });

    return coursesWithLock;
  } catch (err) {
    console.error('Unexpected error in loadProgramCoursesWithLockState:', err);
    return [];
  }
}

export async function loadCourseWithVideos(
  courseId: string
): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select(`
      *,
      videos(*)
    `)
    .eq("id", courseId);

  if (error) throw error;
  return data;
}

export async function updateCourseProgress(courseId: string, userId: string): Promise<any>{
  const { error, data } = await supabaseAdmin
      .from('user_course_progress')
      .update({ 
        is_completed: true,
        progress_percentage: 100,
        completion_date: new Date().toISOString()
      })
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .select("program_enrollment_id")

  if (error) return false
  return data;
}


// user_course_progress unlock next, set complete
// program_enrollments  progress all courses / completed

