import { supabaseAdmin } from "../../../lib/superbase";

// Types matching your component structure
export interface ExerciseVideo {
  id: string;
  title: string;
  description: string;
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
  courses: Course[];
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

// Database types
export interface DBProgram {
  id: string;
  title: string;
  description?: string;
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
function secondsToDuration(seconds: number | null): string {
  if (!seconds) return '';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Upload video file to Supabase Storage
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
    for (let courseIndex = 0; courseIndex < program.courses.length; courseIndex++) {
      const course = program.courses[courseIndex];
      
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

// Enroll user in program
export async function enrollUserInProgram(
  userId: string, 
  programId: string, 
  cost?: number, 
  paymentStatus: string = 'free'
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('program_enrollments')
      .insert({
        user_id: userId,
        program_id: programId,
        cost,
        payment_status: paymentStatus,
        is_active: true
      });

    if (error) {
      console.error('Error enrolling user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in enrollUserInProgram:', error);
    return false;
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
      .eq('is_active', true);

    if (error) {
      console.error('Error loading user programs:', error);
      return [];
    }

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

    const { data: courseProgressData, error: courseProgressError } = await supabaseAdmin
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