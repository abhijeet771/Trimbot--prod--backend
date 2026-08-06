export interface IMessageParam {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  tool_calls?: IToolCall[];
  tool_call_id?: string;
}

export interface IToolParameterProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: {
    type: string;
    enum?: string[];
  };
}

export interface IToolParameters {
  type: 'object';
  properties: {
    [key: string]: IToolParameterProperty;
  };
  required?: string[];
}

export interface IToolDefinition {
  name: string;
  description: string;
  parameters: IToolParameters;
}

export interface IToolCall {
  id: string;
  name: string;
  arguments: string; // JSON string
}

export interface IChatResponse {
  message: string;
  toolCalls?: IToolCall[];
  raw?: any;
}

export interface IChatOptions {
  temperature?: number;
  tools?: IToolDefinition[];
  toolChoice?: 'auto' | 'none' | 'required';
}

export interface IAIService {
  generateResponse(
    messages: IMessageParam[],
    options?: IChatOptions
  ): Promise<IChatResponse>;
}
