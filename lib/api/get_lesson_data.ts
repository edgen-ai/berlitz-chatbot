async function getLessonData(lessonId: string, userId: string) {
    try {
        console.log('Sending request with lessonId:', lessonId, 'and userId:', userId);

      // Make a POST request to your existing API endpoint
      const response = await fetch('http://192.168.68.121:3000/api/user/lesson_details/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "lessonId": lessonId,
          "userId": userId,
        }),
      });
  
      // Check if the response is OK (status 2xx)
      if (!response.ok) {
        console.error('Failed to fetch lesson data:', response.statusText);
        return { error: `Failed to fetch lesson data: ${response.statusText}`, status: response.status };
      }
  
      // Parse the response JSON
      const data = await response.json();
      
      if (data.error) {
        console.error('Error in API response:', data.error);
        return { error: data.error, status: data.status };
      }
  
      // Return the lesson-specific data
      return {
        progress: data.progress,
        topic: data.topic,
        emoji: data.emoji,
        specific_objective: data.specific_objective,
        learning_results: data.learning_results,
        learning_experiences: data.learning_experiences,
        session_sequence: data.session_sequence,
        content: data.content,
        type: data.type,
        status: 200,
      };
    } catch (error) {
      console.error('Unexpected error while fetching lesson data:', error);
      return { error: 'Internal Server Error', details: (error as Error).message, status: 500 };
    }
  }
  
  export { getLessonData };
  