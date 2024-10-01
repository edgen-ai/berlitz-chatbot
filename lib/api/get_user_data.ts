async function getUserData(id: string) {
    try {
      // Use a relative path to call the Next.js API hosted on the same project
      const res = await fetch(`http://192.168.68.121:3000/api/user/user?userId=${id}`);
      // Check if the response is okay (status 2xx)
      if (!res.ok) {
        console.error(`Error fetching user data: ${res.statusText}`);
        return { error: `Failed to fetch user data: ${res.statusText}` };
      }
      const progress_res = await fetch(`http://192.168.68.121:3000/api/user/progress?userId=${id}`);
        // Check if the response is okay (status 2xx)
        if (!progress_res.ok) {
          console.error(`Error fetching user data: ${progress_res.statusText}`);
          return { error: `Failed to fetch user data: ${progress_res.statusText}` };
        }
        const progress_data = await progress_res.json();

      // Parse the JSON data from the response
      const data = await res.json();
  
      // Log and return the data
     const user_data = data.data[0];
     const response = {
        name: user_data.name,
        email: user_data.email,
        id: user_data.id,
        topic: progress_data.progress.topic,
        level: progress_data.progress.level,
        current_lesson: progress_data.progress.current_lesson_id,
        progress_id: progress_data.progress.id,
     }
     
      return response;
      
    } catch (error) {
      // Handle any errors during the fetch or parsing
      console.error("Error occurred while fetching user data:", error);
      return { error: 'An error occurred while fetching user data.' };
    }
  }
  export { getUserData };