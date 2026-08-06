import config from '../config/env';
import { IAIService } from './ai.interface';
import { OpenAIService } from './openai.service';
import { GeminiService } from './gemini.service';
import { ClaudeService } from './claude.service';
import { DeepSeekService } from './deepseek.service';
import { GroqService } from './groq.service';
import { XaiService } from './xai.service';
import logger from '../utils/logger';

export class AIFactory {
  private static instance: IAIService | null = null;

  public static getAIService(): IAIService {
    if (this.instance) {
      return this.instance;
    }

    const provider = config.aiProvider;
    const model = config.aiModelName;

    logger.info(`Initializing AI Provider: ${provider.toUpperCase()} (Model: ${model})`);

    switch (provider) {
      case 'openai':
        this.instance = new OpenAIService(config.openaiApiKey, model || 'gpt-4o');
        break;
      case 'gemini':
        this.instance = new GeminiService(config.geminiApiKey, model || 'gemini-1.5-flash');
        break;
      case 'claude':
        this.instance = new ClaudeService(config.claudeApiKey, model || 'claude-3-5-sonnet-20241022');
        break;
      case 'deepseek':
        this.instance = new DeepSeekService(config.deepseekApiKey, model || 'deepseek-chat');
        break;
      case 'groq':
        this.instance = new GroqService(config.groqApiKey, model || 'llama-3.3-70b-versatile');
        break;
      case 'xai':
        this.instance = new XaiService(config.xaiApiKey, model || 'grok-2');
        break;
      default:
        logger.warn(`Unsupported AI provider "${provider}". Defaulting to OpenAI.`);
        this.instance = new OpenAIService(config.openaiApiKey, 'gpt-4o');
    }

    return this.instance;
  }
}

export default AIFactory;
