import supabase from '@/lib/supabase/supabase';

async function putExerciseInLesson(lesson_id: string, exercise: any, user_progress_id: string) {
  try {
    console.log('Adding exercise to lesson:', lesson_id, exercise, user_progress_id);
    // Fetch the existing exercises for the specific user progress and lesson
    const { data: userLessonData, error: userLessonError } = await supabase
      .from('user_lessons')
      .select('exercises')
      .eq('user_progress_id', user_progress_id)
      .eq('lesson_id', lesson_id)
      .single();

    if (userLessonError || !userLessonData) {
      console.error('Error fetching user lesson data:', userLessonError);
      return { error: 'Failed to fetch user lesson data' };
    }

    // Append the new exercise to the existing exercises
    const updatedExercises = userLessonData.exercises ? [...userLessonData.exercises, exercise] : [exercise];

    // Update the exercises field in the database
    const { data, error } = await supabase
      .from('user_lessons')
      .update({ exercises: updatedExercises })
      .eq('user_progress_id', user_progress_id)
      .eq('lesson_id', lesson_id);

    if (error) {
      console.error('Error updating exercises:', error);
      return { error: 'Failed to update exercises' };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { error: 'Internal Server Error', details: (err as Error).message };
  }
}

export { putExerciseInLesson };