import supabase from '@/lib/supabase/supabase';
import { NextRequest } from 'next/server';

// Export POST function
export async function POST(request: NextRequest) {
  try {
    const { userId, newTeacherId } = await request.json();

    // Log the incoming data for validation
    console.log('Received userId:', userId, 'newTeacherId:', newTeacherId);

    // Validate input
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId:', userId);
      return new Response(JSON.stringify({ error: 'Invalid userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!newTeacherId || typeof newTeacherId !== 'string') {
      console.error('Invalid newTeacherId:', newTeacherId);
      return new Response(JSON.stringify({ error: 'Invalid newTeacherId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the user's teacher in the 'users' table
    const { data, error } = await supabase
      .from('users')
      .update({ teacher: newTeacherId })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user teacher in Supabase:', error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('User teacher updated successfully:', data);

    return new Response(JSON.stringify({ success: true, message: 'Teacher updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error occurred:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Export GET function
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId:', userId);
      return new Response(JSON.stringify({ error: 'Invalid userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching user and teacher data for userId:', userId);

    // Fetch the user's current teacher from the 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('teacher')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data from Supabase:', userError.message);
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const currentTeacherId = userData.teacher;

    // Fetch all teachers from the 'teachers' table
    const { data: teachersData, error: teachersError } = await supabase
      .from('teachers')
      .select('id, name, image, accent, premium');

    if (teachersError) {
      console.error('Error fetching teachers data from Supabase:', teachersError.message);
      return new Response(JSON.stringify({ error: teachersError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Format the teachers data and mark the current teacher
    const formattedTeachers = teachersData.map((teacher: any) => ({
      id: teacher.id,
      name: teacher.name,
      image: teacher.image, // Ensure you're using the correct field for avatar URL
      accent: teacher.accent,
      isCurrent: teacher.id === currentTeacherId,
      premium: teacher.premium,
    }));

    console.log('Formatted teacher data:', formattedTeachers);

    return new Response(JSON.stringify({ data: formattedTeachers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error occurred:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
