import fs from "fs";
import path from "path";
import { initializeGroqClient } from "./groq_client";
/**
 * Transcribes an audio file using the Groq transcription API.
 * @param audioFilePath - The path to the audio file to transcribe.
 * @returns A promise that resolves with the transcribed text.
 */
export async function transcribeAudio(audioFilePath: string): Promise<string> {
    const groq_client = initializeGroqClient();
  
    try {
      console.log("Transcribing audio file:", audioFilePath);
  
      // Make the transcription request
      // eslint-disable-next-line
      const transcriptionResponse = await groq_client.audio.transcriptions.create({
        file:  fs.createReadStream(audioFilePath),
        model: "whisper-large-v3",
        response_format: "verbose_json",

      });
  
      // Assuming the response structure contains the transcription text under `text`
      const transcriptionText = transcriptionResponse.text;
  
      console.log("Transcription successful:", transcriptionText);
      return transcriptionText;
    } catch (error) {
      console.error("An error occurred during transcription:", error);
      throw error;
    }
  }