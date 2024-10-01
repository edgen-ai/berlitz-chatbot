import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import AWS from "aws-sdk";
import {handleBase64Audio} from "@/lib/api/handle_base64_audio";
import {handleAudioFileUpload} from "@/lib/api/handle_audio_file_upload";
import {transcribeAudio} from "@/lib/api/transcribe_audio";
import {callAudioEvaluation} from "@/lib/api/call_audio_evaluation";
import {sendToQueue} from "@/lib/api/send_to_queue";
import {getUserData} from "@/lib/api/get_user_data";
import {checkProfession} from "@/lib/api/check_profession";
import {prepareChatMessages} from "@/lib/api/prepare_chat_messages";
import {processStreamingResponse} from "@/lib/api/process_streaming_response";
import {MongoDBChatMessageHistory} from "@langchain/mongodb";
import {MongoClient} from "mongodb";
import {cleanOutputText} from "@/lib/api/clean_output_text";
import {get_system_prompt} from "@/lib/api/get_system_prompt";
import { initializeGroqClient } from "@/lib/api/groq_client";
import { IncomingMessage } from "http";
import { tmpdir } from "os";
import { join } from "path";
import { lookup } from "mime-types";
import { writeFile } from "fs/promises";
import { getLessonData } from "@/lib/api/get_lesson_data";
import { putExerciseInLesson } from "@/lib/api/put_exercise_lesson";



const connection_string = process.env.MONGODB_CONNECTION_STRING || "";
const client = new MongoClient(connection_string);

const groq_client = initializeGroqClient();
// Disable Next.js's default body parsing to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to save the buffer to a temporary file
async function saveBufferToTempFile(buffer: any, filename: any ) {
    const tempFilePath = join(tmpdir(), filename);
    await writeFile(tempFilePath, buffer);
    return tempFilePath;
  }
// Helper function to parse multipart form data
async function parseMultipartFormData(req: NextRequest) {
  const boundary = getBoundary(req.headers.get("content-type"));
  const body = Buffer.from(await req.arrayBuffer());
  const parts = splitBodyByBoundary(body, boundary);

  const fields: any = {};
  let file = null;

  parts.forEach((part) => {
    if (part.includes('filename')) {
      const { fileContent, filename } = extractFileFromPart(part);
      file = { filename, fileContent };
    } else {
      const { name, value } = extractFieldFromPart(part);
      fields[name] = value;
    }
  });

  return { fields, file };
}

// Helper function to extract boundary from content-type header
function getBoundary(contentType: any) {
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) {
    throw new Error('No boundary found in content-type header');
  }
  return boundary;
}

// Helper function to split body by boundary
function splitBodyByBoundary(body: any, boundary: any) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const parts = [];
  let lastIndex = 0;
  let index;

  while ((index = body.indexOf(boundaryBuffer, lastIndex)) !== -1) {
    if (lastIndex !== index) {
      parts.push(body.slice(lastIndex, index));
    }
    lastIndex = index + boundaryBuffer.length + 2; // Skip the boundary and CRLF
  }

  return parts;
}

// Helper function to extract a file from a part
function extractFileFromPart(part: any) {
  const headersEndIndex = part.indexOf('\r\n\r\n');
  const headers = part.slice(0, headersEndIndex).toString();
  const fileContent = part.slice(headersEndIndex + 4, part.length - 2); // remove CRLF

  const filenameMatch = headers.match(/filename="(.+?)"/);
  const filename = filenameMatch ? filenameMatch[1] : null;

  return { filename, fileContent };
}

// Helper function to extract a field from a part
function extractFieldFromPart(part: any) {
  const headersEndIndex = part.indexOf('\r\n\r\n');
  const headers = part.slice(0, headersEndIndex).toString();
  const value = part.slice(headersEndIndex + 4, part.length - 2).toString(); // remove CRLF

  const nameMatch = headers.match(/name="(.+?)"/);
  const name = nameMatch ? nameMatch[1] : null;

  return { name, value };
}
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let userMessage = "";
    let topic = "";
    let connectionId = "";
    let uid = "";
    let audioEval = false;
    let audioEvalWords = "";

    if (contentType.startsWith("multipart/form-data")) {
        const { fields, file } = await parseMultipartFormData(req);
        
        const tempFilePath = await saveBufferToTempFile(file.fileContent, file.filename);

        // Create a file-like object mimicking formidable's file structure
        const formidableFile = {
          filepath: tempFilePath,
          originalFilename: file.filename,
          mimetype: lookup(file.filename) || "application/octet-stream",
          size: file.fileContent.length
        };
      // Log fields and file
      console.log("Fields:", fields);
      console.log("File:", file);
      const audioFile  = file! as any;
        
      const filePath = await handleAudioFileUpload(formidableFile);

      // Transcribe the audio file
      const transcription = await transcribeAudio(filePath);
      userMessage = transcription;
      uid = fields.uid;
      if (fields.audioEval) {
        audioEval = true;
        audioEvalWords = fields.audioEval[0];
      }

      if (audioEval) {
        // Handle audio evaluation
        const audioResponse = await callAudioEvaluation(
          audioEvalWords,
          filePath,
          userMessage
        );
        await sendToQueue(`${connectionId}:${uid}`, audioResponse, "audioEval");
      }
    } else if (contentType.startsWith("application/json")) {
      // Handle application/json
      const body = await req.json();
      userMessage = body.message;
      topic = body.topic;
      connectionId = body.connectionId;
      uid = body.uid;

      if (
        typeof userMessage === "string" &&
        userMessage.startsWith("data:audio/")
      ) {
        // Handle base64 encoded audio data
        const filePath = await handleBase64Audio(userMessage);
        const transcription = await transcribeAudio(filePath);
        userMessage = transcription;
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported Media Type" },
        { status: 415 }
      );
    }
    console.log("User message:", userMessage);

    const userData = await getUserData(uid);
    console.log("User data:", userData);    

    if ("error" in userData) {
      console.error(userData.error);
      // Handle error here, for example, by returning or showing a message to the user
      return;
    }
    
    const {
      name: studentName,
      current_lesson: selectedClass,
      level: classId,
      topic: lessonTopic,
      progress_id: progressId,
    } = userData

    const lessonData = await getLessonData(selectedClass, userData.id) 
    let systemPrompt = get_system_prompt(
        "Pronunciation",                 // lesson_type
        lessonData.learning_experiences,  // learning_experiences
        lessonData.learning_results,      // learning_results
        lessonData.session_sequence,      // session_sequence
        lessonData.topic,                 // topic
        null,                             // topics (since it's not a free class)
        "100",                            // duration (make sure it's a string if expected)
        lessonData.progress,              // time_component
        lessonData.type,                  // type
        studentName                       // user_name
      );
      

    // // Check for profession
    // const profession = await checkProfession(uid);
    // if (profession) {
    //   systemPrompt += ` Make sure to orient the class based on the student's profession: ${profession}`;
    // }

    // Fetch chat history
    const mongodb_history = new MongoDBChatMessageHistory({
      collection: client.db().collection("chat_messages"),
      sessionId: selectedClass,
    });
    const messages = await mongodb_history.getMessages();

    // Prepare messages for the chat model
    const newMessages = prepareChatMessages(messages);

    // Create the prompt
    const prompt = `<s> ${systemPrompt}`;

    console.log("Prompt:", prompt);

    console.log("New messages:", newMessages);

    // Create the chat completion request
    const stream = await groq_client.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: prompt },
        ...newMessages,
        { role: "user", content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      stop: "</s>",
      stream: true,
    });

    // // Process the streaming response
    const { completeText, globalExercises } = await processStreamingResponse(
      stream,
      "Pronunciation",
      connectionId,
      uid
    );

    console.log("Complete text:", completeText);
    console.log("Global exercises:", globalExercises);
    // // Update chat history
    await mongodb_history.addUserMessage(userMessage);
    await mongodb_history.addAIMessage(completeText.replace("/", ""));

    // // Update exercises in subabase for the student
    if (globalExercises.length > 0) {
        globalExercises.forEach(async (exercise) => {
            const lesson_res =  putExerciseInLesson(selectedClass, exercise, progressId);
            if ("error" in lesson_res) {
                console.error(lesson_res.error);
            }
        })
    }

    // Return the final response
    return NextResponse.json({
      Output: cleanOutputText(completeText),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}