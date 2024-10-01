import Groq from "groq-sdk";

/**
 * Initializes and returns a Groq client instance.
 * Ensure that you have set the necessary environment variables for authentication.
 */
function initializeGroqClient(): Groq {
  const groq_client = new Groq({
    apiKey: process.env.GROQ_API_KEY || "", // Replace with your actual API key
    // Add other configuration options if necessary
  });

  return groq_client;
}

export { initializeGroqClient };