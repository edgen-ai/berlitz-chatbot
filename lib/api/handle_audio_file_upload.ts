import formidable from "formidable";
import fs from "fs";
import path from "path";
import { convert3gpToMp3 } from "./convert_3gp_to_mp3";

/**
 * Handles audio file upload and conversion
 */
async function handleAudioFileUpload(audioFile: formidable.File): Promise<string> {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    const originalFilename = audioFile.originalFilename || "audiofile";
    const inputFilePath = path.join(uploadsDir, originalFilename);
  
    // Move the uploaded file to the uploads directory
    fs.copyFileSync(audioFile.filepath, inputFilePath);
  
    // Determine if conversion is needed
    const ext = path.extname(inputFilePath).toLowerCase();
    if (ext === ".3gp" || ext === ".caf") {
      const outputFilePath = await convert3gpToMp3(inputFilePath);
      return outputFilePath;
    }
  
    // If no conversion is needed, return the original file path
    return inputFilePath;
  }
  
    export { handleAudioFileUpload };