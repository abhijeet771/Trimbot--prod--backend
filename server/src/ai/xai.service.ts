import axios from 'axios';
import { IAIService, IMessageParam, IChatOptions, IChatResponse, IToolCall } from './ai.interface';
import logger from '../utils/logger';

export class XaiService implements IAIService {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'grok-2') {
    this.apiKey = apiKey;
    this.modelName = modelName;
    if (!this.apiKey) {
      logger.warn('x.AI (Grok) API Key is missing. Grok operations will fail.');
    }
  }

  async generateResponse(
    messages: IMessageParam[],
    options?: IChatOptions
  ): Promise<IChatResponse> {
    try {
      const url = 'https://api.x.ai/v1/chat/completions';
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      };

      // Format tools for x.AI (OpenAI compatible)
      const xaiTools = options?.tools?.map((tool) => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }));

      const body: any = {
        model: this.modelName,
        messages: messages.map((m) => {
          const mapped: any = {
            role: m.role,
            content: m.content || null,
          };
          if (m.name) mapped.name = m.name;
          if (m.tool_call_id) mapped.tool_call_id = m.tool_call_id;
          if (m.tool_calls && m.tool_calls.length > 0) {
            mapped.tool_calls = m.tool_calls.map((tc) => ({
              id: tc.id,
              type: 'function',
              function: {
                name: tc.name,
                arguments: tc.arguments,
              },
            }));
          }
          return mapped;
        }),
        temperature: options?.temperature ?? 0.2,
      };

      if (xaiTools && xaiTools.length > 0) {
        body.tools = xaiTools;
        body.tool_choice = options?.toolChoice ?? 'auto';
      }

      logger.info(`Sending chat request to x.AI (Grok) using model ${this.modelName}...`);
      const response = await axios.post(url, body, { headers, timeout: 30000 });
      
      const choice = response.data.choices[0];
      const resMessage = choice.message;

      const toolCalls: IToolCall[] = [];
      if (resMessage.tool_calls) {
        for (const tc of resMessage.tool_calls) {
          if (tc.type === 'function') {
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: tc.function.arguments,
            });
          }
        }
      }

      return {
        message: resMessage.content || '',
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        raw: response.data,
      };
    } catch (error: any) {
      const errorData = error.response?.data;
      logger.error(`x.AI Error Data: ${JSON.stringify(errorData)}`);
      const errMsg = errorData?.error?.message || errorData?.message || error.message;
      logger.error(`x.AI (Grok) Service Error: ${errMsg}`);
      throw new Error(`x.AI API failed: ${errMsg}`);
    }
  }
}

export default XaiService;
