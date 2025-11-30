import { useState, useEffect, useCallback } from "react";
import { PollinationsService } from "@/services/pollinationsApi";
import type {
  ImageGenerationOptions,
  TextGenerationOptions,
  ChatCompletionOptions,
  ChatMessage,
  AudioGenerationOptions,
} from "@/types/pollinations";

/**
 * Hook for generating images with Pollinations.AI
 *
 * @param prompt - The image description
 * @param options - Image generation options
 * @returns Object containing imageUrl, loading state, error, and regenerate function
 *
 * @example
 * ```tsx
 * const { imageUrl, loading, error, regenerate } = usePollinationsImage(
 *   'A sunset over mountains',
 *   { width: 1024, height: 1024, model: 'flux' }
 * );
 *
 * return (
 *   <div>
 *     {loading && <p>Generating...</p>}
 *     {error && <p>Error: {error}</p>}
 *     {imageUrl && <img src={imageUrl} alt="Generated" />}
 *     <button onClick={regenerate}>Regenerate</button>
 *   </div>
 * );
 * ```
 */
export function usePollinationsImage(
  prompt: string,
  options: ImageGenerationOptions = {}
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollinations = new PollinationsService();

  const generate = useCallback(async () => {
    if (!prompt) {
      setImageUrl(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await pollinations.generateImage(prompt, options);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  }, [prompt, JSON.stringify(options)]);

  useEffect(() => {
    generate();
  }, [generate]);

  return {
    imageUrl,
    loading,
    error,
    regenerate: generate,
  };
}

/**
 * Hook for generating text with Pollinations.AI
 *
 * @param prompt - The text prompt
 * @param options - Text generation options
 * @returns Object containing text, loading state, error, and regenerate function
 *
 * @example
 * ```tsx
 * const { text, loading, error } = usePollinationsText(
 *   'Write a haiku about AI',
 *   { model: 'openai', temperature: 1.0 }
 * );
 *
 * return <div>{loading ? 'Generating...' : text}</div>;
 * ```
 */
export function usePollinationsText(
  prompt: string,
  options: TextGenerationOptions = {}
) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollinations = new PollinationsService();

  const generate = useCallback(async () => {
    if (!prompt) {
      setText(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await pollinations.sendPrompt(prompt, options);
      setText(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate text");
      setText(null);
    } finally {
      setLoading(false);
    }
  }, [prompt, JSON.stringify(options)]);

  useEffect(() => {
    generate();
  }, [generate]);

  return {
    text,
    loading,
    error,
    regenerate: generate,
  };
}

/**
 * Hook for managing chat conversations with Pollinations.AI
 *
 * @param initialMessages - Initial conversation messages
 * @param options - Chat options (model, temperature, etc.)
 * @returns Object with messages, sendMessage, loading state, and error
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, loading } = usePollinationsChat(
 *   [{ role: 'system', content: 'You are a helpful assistant' }],
 *   { model: 'openai' }
 * );
 *
 * const handleSend = () => {
 *   sendMessage({ role: 'user', content: 'Hello!' });
 * };
 * ```
 */
export function usePollinationsChat(
  initialMessages: ChatMessage[] = [],
  options: Partial<ChatCompletionOptions> = {}
) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollinations = new PollinationsService();

  const sendMessage = useCallback(
    async (message: ChatMessage) => {
      setLoading(true);
      setError(null);

      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);

      try {
        const response = await pollinations.chatCompletion({
          ...options,
          messages: updatedMessages,
          model: options.model || "openai",
        });

        const assistantMessage = response.choices[0].message;
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setLoading(false);
      }
    },
    [messages, options]
  );

  const clearMessages = useCallback(() => {
    setMessages(initialMessages);
    setError(null);
  }, [initialMessages]);

  return {
    messages,
    sendMessage,
    loading,
    error,
    clearMessages,
  };
}

/**
 * Hook for generating audio with Pollinations.AI
 *
 * @param text - The text to convert to speech
 * @param options - Audio generation options
 * @returns Object containing audioUrl, loading state, error, and regenerate function
 *
 * @example
 * ```tsx
 * const { audioUrl, loading, error } = usePollinationsAudio(
 *   'Hello world!',
 *   { voice: 'nova' }
 * );
 *
 * return (
 *   <div>
 *     {loading && <p>Generating audio...</p>}
 *     {audioUrl && <audio src={audioUrl} controls />}
 *   </div>
 * );
 * ```
 */
export function usePollinationsAudio(
  text: string,
  options: AudioGenerationOptions = {}
) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollinations = new PollinationsService();

  const generate = useCallback(async () => {
    if (!text) {
      setAudioUrl(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await pollinations.generateAudio(text, options);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate audio");
      setAudioUrl(null);
    } finally {
      setLoading(false);
    }
  }, [text, JSON.stringify(options)]);

  useEffect(() => {
    generate();
  }, [generate]);

  return {
    audioUrl,
    loading,
    error,
    regenerate: generate,
  };
}

/**
 * Hook for analyzing images with vision AI
 *
 * @param imageUrl - URL of the image to analyze
 * @param prompt - Question or instruction about the image
 * @param options - Additional options
 * @returns Object containing analysis, loading state, error, and analyze function
 *
 * @example
 * ```tsx
 * const { analysis, loading, analyze } = useImageAnalysis();
 *
 * const handleAnalyze = () => {
 *   analyze('https://example.com/photo.jpg', 'What is in this image?');
 * };
 * ```
 */
export function useImageAnalysis(options: Partial<ChatCompletionOptions> = {}) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollinations = new PollinationsService();

  const analyze = useCallback(
    async (imageUrl: string, prompt: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await pollinations.analyzeImage(
          imageUrl,
          prompt,
          options
        );
        setAnalysis(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to analyze image"
        );
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    analysis,
    loading,
    error,
    analyze,
  };
}
