/**
 * Cleans the output text by removing unwanted prefixes
 */
function cleanOutputText(text: string): string {
    return text.replace(/Assistant:|Clara:|Clara \(as the English teacher\):/g, "");
  }

  export { cleanOutputText };   