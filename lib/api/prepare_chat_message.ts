import { HumanMessage } from "@langchain/core/messages";
  
  /**
   * Prepares chat messages for the model
   */
  function prepareChatMessages(
    messages: Array<HumanMessage | any>
  ): Array<{ role: string; content: string }> {
    let newMessages: Array<{ role: string; content: string }> = [];
    let history = "";
    for (const message of messages) {
      const num_tokens = history.length / 5;
      if (num_tokens > 200) {
        break;
      }
      if (message instanceof HumanMessage) {
        newMessages.push({ role: "user", content: message.content.toString() });
      } else {
        newMessages.push({ role: "assistant", content: message.content });
      }
      history += message.content;
    }
    return newMessages;
  }