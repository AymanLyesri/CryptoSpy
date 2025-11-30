// Pollinations.AI API Types

export type ImageModel = "flux" | "turbo" | "kontext";
export type TextModel =
  | "openai"
  | "mistral"
  | "searchgpt"
  | "gemini-search"
  | "openai-audio"
  | "openai-large"
  | "openai-fast"
  | "openai-reasoning"
  | "claude-hybridspace";
export type AudioVoice =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";
export type ReasoningEffort = "minimal" | "low" | "medium" | "high";

export interface ImageGenerationOptions {
  model?: ImageModel;
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;
  enhance?: boolean;
  private?: boolean;
  safe?: boolean;
  image?: string; // For image-to-image with kontext model
}

export interface TextGenerationOptions {
  model?: TextModel;
  seed?: number;
  temperature?: number;
  system?: string;
  json?: boolean;
  stream?: boolean;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | MessageContent[];
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface MessageContent {
  type: "text" | "image_url" | "input_audio";
  text?: string;
  image_url?: {
    url: string;
  };
  input_audio?: {
    data: string;
    format: string;
  };
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface FunctionDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export interface ChatCompletionOptions {
  model?: TextModel;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: FunctionDefinition[];
  tool_choice?:
    | "auto"
    | "none"
    | { type: "function"; function: { name: string } };
  reasoning_effort?: ReasoningEffort;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AudioGenerationOptions {
  voice?: AudioVoice;
  model?: "openai-audio";
}

export interface PollinationsConfig {
  referrer?: string;
  bearerToken?: string;
  baseImageUrl?: string;
  baseTextUrl?: string;
}
