import type { AssistantReply } from "@workspace/api-client-react";
import { askAssistant as postAssistantQuestion } from "@workspace/api-client-react";

export type { AssistantReply };

export async function askAssistant(question: string): Promise<AssistantReply> {
  return postAssistantQuestion({ question });
}