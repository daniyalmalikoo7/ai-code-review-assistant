import { ChatAnthropic } from "@langchain/anthropic";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createLogger } from "../utils/logger";

interface PromptOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

// Create a logger instance
const logger = createLogger("LLMService");

// Create and configure LLM model
const createLLMModel = (options: PromptOptions = {}) => {
  const {
    temperature = 0.7,
    maxTokens = 1000,
    model = "claude-3-5-sonnet-20241022",
  } = options;

  return new ChatAnthropic({
    temperature,
    maxTokens,
    modelName: model,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });
};

// Default model instance
const defaultModel = createLLMModel();

/**
 * Sends a single prompt to the LLM
 */
export const sendPrompt = async (
  prompt: string,
  systemPrompt?: string,
  options?: PromptOptions
): Promise<string> => {
  try {
    const model = options ? createLLMModel(options) : defaultModel;
    const messages: BaseMessage[] = [];

    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }

    messages.push(new HumanMessage(prompt));

    logger.info("Sending prompt to LLM");
    const response = await model.invoke(messages);

    return response.content.toString();
  } catch (error: unknown) {
    logger.error("Error in sendPrompt", { error });
    throw new Error(
      `Failed to process prompt: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Executes a chain of prompts, feeding the output of each into the next
 */
export const executePromptChain = async (
  prompts: string[],
  options?: PromptOptions
): Promise<string> => {
  try {
    let result = "";

    for (const [index, prompt] of prompts.entries()) {
      logger.info(`Executing prompt ${index + 1} of ${prompts.length}`);

      // If not the first prompt, include previous result
      const enhancedPrompt =
        index > 0 ? `${prompt}\nPrevious output: ${result}` : prompt;

      result = await sendPrompt(enhancedPrompt, undefined, options);
    }

    return result;
  } catch (error: unknown) {
    logger.error("Error in executePromptChain", { error });
    throw new Error(
      `Failed to execute prompt chain: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Analyzes code with a multi-step prompting approach
 */
export const analyzeCode = async (
  code: string,
  language?: string,
  options?: PromptOptions
): Promise<string> => {
  try {
    // Multi-step analysis
    const analysisChain = [
      // Step 1: Initial code review
      `Please review the following ${
        language || ""
      } code:\n\n${code}\n\nProvide an initial assessment.`,

      // Step 2: Identify potential issues and bugs
      "Based on the initial assessment, identify potential bugs, security issues, and performance concerns.",

      // Step 3: Suggest improvements
      "Suggest specific improvements to address the identified issues and enhance the code quality.",
    ];

    logger.info("Starting code analysis", { language });
    return executePromptChain(analysisChain, options);
  } catch (error: unknown) {
    logger.error("Error in analyzeCode", { error });
    throw new Error(
      `Failed to analyze code: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
