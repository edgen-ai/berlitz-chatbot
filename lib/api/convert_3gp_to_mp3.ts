// utils/audioUtils.ts

import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

/**
 * Converts a 3gp or caf audio file to mp3 format.
 * @param inputFilePath - The path to the input audio file.
 * @returns A promise that resolves with the path to the converted mp3 file.
 */
async function convert3gpToMp3(inputFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log("Converting 3gp to mp3:", inputFilePath);

    try {
      const ext = path.extname(inputFilePath).toLowerCase();
      let outputFilePath = "";

      if (ext === ".caf") {
        console.log("Converting CAF to MP3:", inputFilePath);
        outputFilePath = inputFilePath.replace(/\.caf$/i, ".mp3");
      } else if (ext === ".3gp") {
        console.log("Converting 3GP to MP3:", inputFilePath);
        outputFilePath = inputFilePath.replace(/\.3gp$/i, ".mp3");
      } else {
        throw new Error(`Unsupported file extension: ${ext}`);
      }

      ffmpeg(inputFilePath)
        .toFormat("mp3")
        .on("error", (err) => {
          console.error("An error occurred during conversion:", err.message);
          reject(err);
        })
        .on("end", () => {
          console.log(`Conversion successful! File saved as: ${outputFilePath}`);
          resolve(outputFilePath);
        })
        .save(outputFilePath);
    } catch (error) {
      console.error("An error occurred during conversion:", error);
      reject(error);
    }
  });
}

export { convert3gpToMp3 }; 
