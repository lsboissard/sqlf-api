import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ExplainCodeDto } from './dto/explain-code.dto';
import { CodeExplanationResponseDto } from './dto/code-explanation-response.dto';

@Injectable()
export class CodeExplanationService {
  private readonly logger = new Logger(CodeExplanationService.name);
  private readonly deepSeekApiUrl =
    'https://api.deepseek.com/v1/chat/completions';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async explainCode(
    explainCodeDto: ExplainCodeDto,
  ): Promise<CodeExplanationResponseDto> {
    try {
      const { 
        code, 
        language = 'sql',
        sqlDialect = 'standard',
        responseLanguage = 'pt-br'
      } = explainCodeDto;
      const apiKey = this.configService.get<string>('app.deepseekApiKey');

      if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY not configured');
      }

      const prompt = this.buildPrompt(code, language, sqlDialect, responseLanguage);

      const requestBody = {
        model: 'deepseek-coder',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      };

      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };

      this.logger.debug('Sending request to DeepSeek API');

      const response = await firstValueFrom(
        this.httpService.post(this.deepSeekApiUrl, requestBody, { headers }),
      );

      const explainedCode = this.extractExplainedCode(response.data);

      return {
        originalCode: code,
        explainedCode,
        success: true,
      };
    } catch (error) {
      this.logger.error('Error calling DeepSeek API', error);

      return {
        originalCode: explainCodeDto.code,
        explainedCode: '',
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  private buildPrompt(code: string, language: string, sqlDialect: string, responseLanguage: string): string {
    const isPortuguese = responseLanguage === 'pt-br';
    
    const dialectInfo = this.getDialectInfo(sqlDialect);
    
    if (isPortuguese) {
      return `Você é um especialista em documentação de código SQL. Por favor, adicione comentários claros e úteis ao seguinte código ${dialectInfo} para explicar o que ele faz.

Regras:
1. Adicione comentários que expliquem o propósito e a lógica
2. Mantenha a estrutura original do código intacta
3. Use sintaxe de comentários SQL (-- para linha única, /* */ para múltiplas linhas)
4. Torne os comentários concisos mas informativos
5. Considere as particularidades do dialeto ${sqlDialect.toUpperCase()}
6. Retorne APENAS o código SQL comentado, sem texto adicional

Código SQL para comentar:
\`\`\`sql
${code}
\`\`\``;
    } else {
      return `You are a SQL code documentation expert. Please add clear, helpful comments to the following ${dialectInfo} code to explain what it does.

Rules:
1. Add comments that explain the purpose and logic
2. Keep the original code structure intact
3. Use SQL comment syntax (-- for single line, /* */ for multi-line)
4. Make comments concise but informative
5. Consider the particularities of ${sqlDialect.toUpperCase()} dialect
6. Return ONLY the commented SQL code, no additional text

SQL code to comment:
\`\`\`sql
${code}
\`\`\``;
    }
  }

  private getDialectInfo(sqlDialect: string): string {
    const dialectMap: Record<string, { en: string; pt: string }> = {
      't-sql': { en: 'T-SQL (SQL Server)', pt: 'T-SQL (SQL Server)' },
      'mysql': { en: 'MySQL', pt: 'MySQL' },
      'postgresql': { en: 'PostgreSQL', pt: 'PostgreSQL' },
      'oracle': { en: 'Oracle Database', pt: 'Oracle Database' },
      'sqlite': { en: 'SQLite', pt: 'SQLite' },
      'standard': { en: 'Standard SQL', pt: 'SQL Padrão' },
    };
    
    return dialectMap[sqlDialect]?.en || 'SQL';
  }

  private extractExplainedCode(apiResponse: any): string {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (apiResponse?.choices?.[0]?.message?.content) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        let content = apiResponse.choices[0].message.content.trim();

        // Remove markdown code blocks if present
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        content = content.replace(/```[\w]*\n/g, '').replace(/```/g, '');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return content;
      }

      throw new Error('Invalid response format from DeepSeek API');
    } catch (error) {
      this.logger.error(
        'Error extracting explained code from API response',
        error,
      );
      throw new Error('Failed to process DeepSeek API response');
    }
  }

  private getErrorMessage(error: any): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error?.response?.data?.error?.message) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return error.response.data.error.message;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error?.response?.status === 401) {
      return 'Invalid API key. Please check your DeepSeek API key.';
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error?.response?.status === 429) {
      return 'Rate limit exceeded. Please try again later.';
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error?.response?.status) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return `API request failed with status ${error.response.status}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return error?.message || 'Unknown error occurred while processing the code';
  }
}
