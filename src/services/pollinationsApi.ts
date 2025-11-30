import type {
  ImageGenerationOptions,
  TextGenerationOptions,
  ChatCompletionOptions,
  ChatCompletionResponse,
  AudioGenerationOptions,
  PollinationsConfig,
} from "@/types/pollinations";

/**
 * Pollinations.AI Service
 *
 * A comprehensive service for interacting with the Pollinations.AI API.
 * Supports text generation, image generation, audio generation, and multimodal interactions.
 *
 * @example
 * ```typescript
 * const pollinations = new PollinationsService({ referrer: 'myapp.com' });
 *
 * // Generate text
 * const text = await pollinations.sendPrompt('Explain AI in simple terms');
 *
 * // Generate image
 * const imageUrl = await pollinations.generateImage('A sunset over mountains');
 *
 * // Chat completion
 * const response = await pollinations.chatCompletion({
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * });
 * ```
 */
export class PollinationsService {
  private config: PollinationsConfig;
  private readonly DEFAULT_IMAGE_URL = "https://image.pollinations.ai";
  private readonly DEFAULT_TEXT_URL = "https://text.pollinations.ai";

  constructor(config: PollinationsConfig = {}) {
    this.config = {
      baseImageUrl: config.baseImageUrl || this.DEFAULT_IMAGE_URL,
      baseTextUrl: config.baseTextUrl || this.DEFAULT_TEXT_URL,
      referrer: config.referrer,
      bearerToken: config.bearerToken,
    };
  }

  /**
   * Get authorization headers based on configuration
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.config.bearerToken) {
      headers["Authorization"] = `Bearer ${this.config.bearerToken}`;
    }

    return headers;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(
    baseUrl: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    if (!params) return baseUrl;

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Send a simple text prompt and get a response
   *
   * @param prompt - The text prompt to send
   * @param options - Optional generation parameters
   * @returns The generated text response
   *
   * @example
   * ```typescript
   * const response = await pollinations.sendPrompt('Write a haiku about AI', {
   *   model: 'mistral',
   *   temperature: 1.5
   * });
   * ```
   */
  async sendPrompt(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<string> {
    const encodedPrompt = encodeURIComponent(prompt);
    const url = this.buildUrl(`${this.config.baseTextUrl}/${encodedPrompt}`, {
      model: options.model,
      seed: options.seed,
      temperature: options.temperature,
      system: options.system,
      json: options.json,
    });

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Pollinations API error: ${response.status} ${response.statusText}`
      );
    }

    return response.text();
  }

  /**
   * Generate an image from a text prompt
   *
   * @param prompt - Description of the image to generate
   * @param options - Image generation options (size, model, etc.)
   * @returns URL of the generated image
   *
   * @example
   * ```typescript
   * const imageUrl = await pollinations.generateImage('A cyberpunk city at night', {
   *   width: 1920,
   *   height: 1080,
   *   model: 'flux',
   *   seed: 42
   * });
   * ```
   */
  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const encodedPrompt = encodeURIComponent(prompt);
    const url = this.buildUrl(
      `${this.config.baseImageUrl}/prompt/${encodedPrompt}`,
      {
        model: options.model,
        width: options.width,
        height: options.height,
        seed: options.seed,
        nologo: options.nologo,
        enhance: options.enhance,
        private: options.private,
        safe: options.safe,
        image: options.image,
        referrer: this.config.referrer,
      }
    );

    // The URL itself is the image URL for Pollinations.AI
    return url;
  }

  /**
   * Download an image as a Blob
   *
   * @param prompt - Description of the image to generate
   * @param options - Image generation options
   * @returns Blob containing the image data
   */
  async generateImageBlob(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<Blob> {
    const imageUrl = await this.generateImage(prompt, options);
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download image: ${response.status} ${response.statusText}`
      );
    }

    return response.blob();
  }

  /**
   * Transform an existing image using image-to-image generation
   *
   * @param prompt - Description of how to transform the image
   * @param imageUrl - URL of the input image
   * @param options - Additional generation options
   * @returns URL of the transformed image
   *
   * @example
   * ```typescript
   * const transformedUrl = await pollinations.transformImage(
   *   'turn this into a watercolor painting',
   *   'https://example.com/photo.jpg',
   *   { width: 1024, height: 1024 }
   * );
   * ```
   */
  async transformImage(
    prompt: string,
    imageUrl: string,
    options: Omit<ImageGenerationOptions, "image"> = {}
  ): Promise<string> {
    return this.generateImage(prompt, {
      ...options,
      model: "kontext",
      image: imageUrl,
    });
  }

  /**
   * Generate audio from text using text-to-speech
   *
   * @param text - The text to convert to speech
   * @param options - Audio generation options (voice, etc.)
   * @returns URL of the generated audio
   *
   * @example
   * ```typescript
   * const audioUrl = await pollinations.generateAudio('Hello world!', {
   *   voice: 'nova'
   * });
   * ```
   */
  async generateAudio(
    text: string,
    options: AudioGenerationOptions = {}
  ): Promise<string> {
    const encodedText = encodeURIComponent(text);
    const url = this.buildUrl(`${this.config.baseTextUrl}/${encodedText}`, {
      model: "openai-audio",
      voice: options.voice,
    });

    return url;
  }

  /**
   * Download audio as a Blob
   *
   * @param text - The text to convert to speech
   * @param options - Audio generation options
   * @returns Blob containing the audio data
   */
  async generateAudioBlob(
    text: string,
    options: AudioGenerationOptions = {}
  ): Promise<Blob> {
    const audioUrl = await this.generateAudio(text, options);
    const response = await fetch(audioUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download audio: ${response.status} ${response.statusText}`
      );
    }

    return response.blob();
  }

  /**
   * Advanced chat completion with support for multimodal inputs and function calling
   *
   * @param options - Chat completion options
   * @returns Chat completion response
   *
   * @example
   * ```typescript
   * const response = await pollinations.chatCompletion({
   *   model: 'openai',
   *   messages: [
   *     { role: 'system', content: 'You are a helpful assistant' },
   *     { role: 'user', content: 'Explain quantum computing' }
   *   ],
   *   temperature: 0.7,
   *   max_tokens: 500
   * });
   * console.log(response.choices[0].message.content);
   * ```
   */
  async chatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const url = `${this.config.baseTextUrl}/openai`;

    const payload = {
      model: options.model || "openai",
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      stream: options.stream || false,
      tools: options.tools,
      tool_choice: options.tool_choice,
      reasoning_effort: options.reasoning_effort,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pollinations API error response:", errorText);
      throw new Error(
        `Pollinations API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Analyze an image using vision capabilities
   *
   * @param imageUrl - URL of the image to analyze
   * @param prompt - Question or instruction about the image
   * @param options - Additional chat options
   * @returns The AI's analysis of the image
   *
   * @example
   * ```typescript
   * const analysis = await pollinations.analyzeImage(
   *   'https://example.com/photo.jpg',
   *   'What objects are in this image?',
   *   { model: 'openai' }
   * );
   * ```
   */
  async analyzeImage(
    imageUrl: string,
    prompt: string,
    options: Partial<ChatCompletionOptions> = {}
  ): Promise<string> {
    const response = await this.chatCompletion({
      model: options.model || "openai",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      ...options,
    });

    return response.choices[0].message.content as string;
  }

  /**
   * Transcribe audio to text
   *
   * @param audioData - Base64-encoded audio data
   * @param format - Audio format (e.g., 'wav', 'mp3')
   * @param options - Additional options
   * @returns Transcribed text
   */
  async transcribeAudio(
    audioData: string,
    format: string = "wav",
    options: Partial<ChatCompletionOptions> = {}
  ): Promise<string> {
    const response = await this.chatCompletion({
      model: "openai-audio",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this audio:" },
            {
              type: "input_audio",
              input_audio: { data: audioData, format },
            },
          ],
        },
      ],
      ...options,
    });

    return response.choices[0].message.content as string;
  }

  /**
   * Get available image models
   *
   * @returns List of available image models
   */
  async getImageModels(): Promise<string[]> {
    const response = await fetch(`${this.config.baseImageUrl}/models`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Get available text models
   *
   * @returns List of available text models
   */
  async getTextModels(): Promise<string[]> {
    const response = await fetch(`${this.config.baseTextUrl}/models`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    return response.json();
  }
}

// Export a singleton instance for convenience
export const pollinationsService = new PollinationsService();
