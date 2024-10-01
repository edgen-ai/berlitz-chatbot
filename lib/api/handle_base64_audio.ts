import { NextRequest } from 'next/server'
import fs from 'fs';
import path from 'path';

  /**
   * Handles base64 encoded audio data
   */
  async function handleBase64Audio(userMessage: string): Promise<string> {
    const audioData = userMessage.split(",")[1];
    const audioBuffer = Buffer.from(audioData, "base64");
  
    // Save the audio file
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    const filePath = path.join(uploadsDir, "audiofile.wav");
    fs.writeFileSync(filePath, audioBuffer);
  
    return filePath;
  }
  
  export { handleBase64Audio };