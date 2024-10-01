import { process_script } from "./process_script";
import { extractCompleteSentences } from "./extract_complete_sentences";
import { sendToQueue } from "./send_to_queue";
import exp from "constants";

  
  /**
   * Processes the streaming response from the model
   */
  async function processStreamingResponse(
    stream: AsyncIterable<any>,
    lessonType: string,
    connectionId: string,
    uid: string
  ): Promise<{ completeText: string; globalExercises: any[] }> {
    let generatedText = "";
    let completeText = "";
    let newTextCounter = 0;
    let globalExercises: any[] = [];
    let lastCleanScript = "";
  
    for await (const newText of stream) {
      if (newText.choices[0].delta.content == null) continue;
      generatedText += newText.choices[0].delta.content;
      generatedText = generatedText.replace(/\n/g, " ").replace("</s>", ".");
  
      const { sentences, remainingText } = extractCompleteSentences(
        generatedText
      );
      generatedText = remainingText;
      console.log("Sentences", sentences, "Remaining text", remainingText);
      for (let sentence of sentences) {
        sentence = sentence.trim();
        if (sentence.length > 0) {
          const { cleanText:clean_script, exercises } = process_script(sentence);
          if (clean_script && clean_script !== lastCleanScript) {
            completeText += clean_script + " // ";
            lastCleanScript = clean_script;
            newTextCounter++;
  
            if (lessonType !== "audio") {
              await sendToQueue(
                `${connectionId}:${uid}`,
                clean_script,
                "talk"
              );
            }
  
            if (exercises) {
              for (const exercise of exercises) {
                exercise.index = newTextCounter;
                if (
                  !globalExercises.some(
                    (e) => JSON.stringify(e) === JSON.stringify(exercise)
                  )
                ) {
                  globalExercises.push(exercise);
                }
              }
            }
          }
        }
      }
    }
  
    return { completeText, globalExercises };
  }
  
  export { processStreamingResponse };