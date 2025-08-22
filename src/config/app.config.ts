import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
}));