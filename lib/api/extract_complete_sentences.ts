
  /**
   * Extracts complete sentences from the generated text
   */
  function extractCompleteSentences(
    text: string
  ): { sentences: string[]; remainingText: string } {
    const sentenceEndRegex = /(?<!\d)[.!?](?!\d)\s+/;
    const sentences = text.split(sentenceEndRegex);
    const lastSentenceIncomplete = !/[.!?]$/.test(text.trim());
    const remainingText = lastSentenceIncomplete
      ? sentences.pop() || ""
      : "";
    return { sentences, remainingText };
  }

  export { extractCompleteSentences };