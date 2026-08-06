import axios from 'axios';
import { IAIService, IMessageParam, IChatOptions, IChatResponse, IToolCall } from './ai.interface';
import logger from '../utils/logger';

export class ClaudeService implements IAIService {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.modelName = modelName;
    if (!this.apiKey) {
      logger.warn('Claude API Key is missing. Claude operations will fail.');
    }
  }

  async generateResponse(
    messages: IMessageParam[],
    options?: IChatOptions
  ): Promise<IChatResponse> {
    try {
      const url = 'https://api.anthropic.com/v1/messages';
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      };

      let systemPrompt = '';
      const claudeMessages: any[] = [];

      for (const m of messages) {
        if (m.role === 'system') {
          systemPrompt += m.content + '\n';
        } else {
          claudeMessages.push({
            role: m.role,
            content: m.content,
          });
        }
      }

      // Convert tool parameters to Claude input_schema format
      const claudeTools = options?.tools?.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.parameters,
      }));

      const body: any = {
        model: this.modelName,
        messages: claudeMessages,
        max_tokens: 2000,
        temperature: options?.temperature ?? 0.2,
      };

      if (systemPrompt) {
        body.system = systemPrompt.trim();
      }

      if (claudeTools && claudeTools.length > 0) {
        body.tools = claudeTools;
      }

      logger.info(`Sending chat request to Claude using model ${this.modelName}...`);
      const response = await axios.post(url, body, { headers, timeout: 30000 });

      const resContent = response.data.content || [];
      let text = '';
      const toolCalls: IToolCall[] = [];

      for (const block of resContent) {
        if (block.type === 'text') {
          text += block.text;
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            name: block.name,
            arguments: JSON.stringify(block.input || {}),
          });
        }
      }

      return {
        message: text,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        raw: response.data,
      };
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      logger.error(`Claude Service Error: ${errMsg}`);
      throw new Error(`Claude API failed: ${errMsg}`);
    }
  }
}

export default ClaudeService;
