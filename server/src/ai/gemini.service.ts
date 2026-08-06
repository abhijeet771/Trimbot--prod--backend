import axios from 'axios';
import { IAIService, IMessageParam, IChatOptions, IChatResponse, IToolCall } from './ai.interface';
import logger from '../utils/logger';

export class GeminiService implements IAIService {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.modelName = modelName;
    if (!this.apiKey) {
      logger.warn('Gemini API Key is missing. Gemini operations will fail.');
    }
  }

  async generateResponse(
    messages: IMessageParam[],
    options?: IChatOptions
  ): Promise<IChatResponse> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
      
      // Extract system instructions and convert messages to Gemini contents format
      let systemInstructionText = '';
      const contents: any[] = [];

      for (const m of messages) {
        if (m.role === 'system') {
          systemInstructionText += m.content + '\n';
        } else if (m.role === 'tool') {
          let parsedResponse = {};
          try {
            parsedResponse = JSON.parse(m.content);
          } catch (e) {
            parsedResponse = { output: m.content };
          }
          contents.push({
            role: 'user',
            parts: [{
              functionResponse: {
                name: m.name || '',
                response: parsedResponse
              }
            }]
          });
        } else if (m.role === 'assistant' && m.tool_calls && m.tool_calls.length > 0) {
          const parts: any[] = [];
          if (m.content) {
            parts.push({ text: m.content });
          }
          for (const tc of m.tool_calls) {
            let parsedArgs = {};
            try {
              parsedArgs = JSON.parse(tc.arguments);
            } catch (e) {
              parsedArgs = { raw: tc.arguments };
            }
            parts.push({
              functionCall: {
                name: tc.name,
                args: parsedArgs
              }
            });
          }
          contents.push({
            role: 'model',
            parts
          });
        } else {
          // Gemini roles: 'user' or 'model'
          const role = m.role === 'assistant' ? 'model' : 'user';
          contents.push({
            role,
            parts: [{ text: m.content }],
          });
        }
      }

      const body: any = {
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.2,
        },
      };

      if (systemInstructionText) {
        body.systemInstruction = {
          parts: [{ text: systemInstructionText.trim() }],
        };
      }

      // Format tools for Gemini
      if (options?.tools && options.tools.length > 0) {
        const functionDeclarations = options.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        }));
        
        body.tools = [
          {
            functionDeclarations,
          },
        ];
      }

      logger.info(`Sending chat request to Gemini using model ${this.modelName}...`);
      const response = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });

      const candidate = response.data?.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      const text = part?.text || '';

      const toolCalls: IToolCall[] = [];
      const functionCall = part?.functionCall;
      if (functionCall) {
        // Gemini functionCall contains 'name' and 'args' object
        // We will stringify args to match the IToolCall arguments structure
        toolCalls.push({
          id: `gemini_call_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: functionCall.name,
          arguments: JSON.stringify(functionCall.args || {}),
        });
      }

      return {
        message: text,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        raw: response.data,
      };
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      logger.error(`Gemini Service Error: ${errMsg}`);
      throw new Error(`Gemini API failed: ${errMsg}`);
    }
  }
}

export default GeminiService;
