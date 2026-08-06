import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const requiredEnv = [
  'JWT_SECRET',
  'MONGODB_URI'
];

requiredEnv.forEach((envName) => {
  if (!process.env[envName]) {
    throw new Error(`Missing critical environment variable: ${envName}`);
  }
});

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiProvider: (process.env.AI_PROVIDER || 'openai').toLowerCase(),
  aiModelName: process.env.AI_MODEL_NAME || 'gpt-4o',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  claudeApiKey: process.env.CLAUDE_API_KEY || '',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  xaiApiKey: process.env.XAI_API_KEY || '',
};

export default config;
