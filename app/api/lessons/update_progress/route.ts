import supabase from '@/lib/supabase/supabase';
import check_missing_fields from '@/lib/api/check_missing_fields';
import create_response from '@/lib/api/create_response';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request
    const res = await request.json();
    console.log('Incoming request data:', res);

    // Check for missing fields
    const missing_fields = check_missing_fields({
      fields: ['id', 'lesson_id', 'progress'],
      reqBody: res,
    });

    if (missing_fields) {
      console.log('Missing fields:', missing_fields);
      return create_response({
        request,
        data: { missing_fields },
        status: 400,
      });
    }

    const { id, lesson_id, progress } = res;
    console.log('Parsed request data:', { id, lesson_id, progress });

    // Fetch the user_progress_id based on the user_id
    const { data: userProgress, error: userProgressError } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', id)
      .single();

    if (userProgressError) {
      console.error('Error fetching user_progress:', userProgressError);
      return create_response({
        request,
        data: { error: userProgressError.message },
        status: 500,
      });
    }

    console.log('Fetched user_progress record:', userProgress);
    const user_progress_id = userProgress.id;

    // Fetch the specific class in user_lessons
    const { data: userLesson, error: userLessonError } = await supabase
      .from('user_lessons')
      .select('id')
      .eq('user_progress_id', user_progress_id)
      .eq('lesson_id', lesson_id)
      .single();

    if (userLessonError) {
      console.error('Error fetching user_lessons:', userLessonError);
      return create_response({
        request,
        data: { error: userLessonError.message },
        status: 500,
      });
    }

    console.log('Fetched user_lessons record:', userLesson);
    const user_lesson_id = userLesson.id;

    // Update the progress field in the user_lessons table
    const { error: updateError } = await supabase
      .from('user_lessons')
      .update({ progress })
      .eq('id', user_lesson_id);

    if (updateError) {
      console.error('Error updating progress:', updateError);
      return create_response({
        request,
        data: { error: updateError.message },
        status: 500,
      });
    }

    console.log('Progress updated successfully for user_lesson_id:', user_lesson_id);

    // Return a success response
    return create_response({
      request,
      data: { message: 'Progress updated successfully.' },
      status: 200,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return create_response({
      request,
      data: { error: 'Internal Server Error', details: (err as Error).message },
      status: 500,
    });
  }
}
