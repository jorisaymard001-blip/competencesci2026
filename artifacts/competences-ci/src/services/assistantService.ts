import type { AssistantQuestionInput, AssistantReply } from "@workspace/api-client-react";
import { askAssistant as postAssistantQuestion } from "@workspace/api-client-react";

export type AssistantContext = NonNullable<AssistantQuestionInput["context"]>;
export type { AssistantReply };

export async function askAssistant(question: string, context: AssistantContext): Promise<AssistantReply> {
  return postAssistantQuestion({ question, context });
}