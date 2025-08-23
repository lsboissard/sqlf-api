import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { CodeAnalysisResponseDto } from './dto/code-analysis-response.dto';

@Injectable()
export class CodeAnalysisService {
  private readonly logger = new Logger(CodeAnalysisService.name);
  private readonly deepSeekApiUrl =
    'https://api.deepseek.com/v1/chat/completions';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async analyzeCode(
    analyzeCodeDto: AnalyzeCodeDto,
  ): Promise<CodeAnalysisResponseDto> {
    try {
      const { 
        code, 
        language = 'sql',
        sqlDialect = 'standard',
        responseLanguage = 'pt-br'
      } = analyzeCodeDto;
      const apiKey = this.configService.get<string>('app.deepseekApiKey');

      if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY not configured');
      }

      const prompt = this.buildAnalysisPrompt(code, language, sqlDialect, responseLanguage);

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

      this.logger.debug('Sending code analysis request to DeepSeek API');

      const response = await firstValueFrom(
        this.httpService.post(this.deepSeekApiUrl, requestBody, { headers }),
      );

      const analysisResult = this.extractAnalysisResult(response.data);

      return {
        originalCode: code,
        analysis: analysisResult.analysis,
        suggestions: analysisResult.suggestions,
        success: true,
      };
    } catch (error) {
      this.logger.error('Error calling DeepSeek API for code analysis', error);

      const errorMessage = this.getErrorMessage(error);

      return {
        originalCode: analyzeCodeDto.code,
        analysis: '',
        suggestions: [],
        success: false,
        error: errorMessage,
      };
    }
  }

  private buildAnalysisPrompt(code: string, language: string, sqlDialect: string, responseLanguage: string): string {
    const isPortuguese = responseLanguage === 'pt-br';
    const dialectInfo = this.getDialectInfo(sqlDialect);
    
    if (isPortuguese) {
      return `Você é um engenheiro de software sênior e revisor de código SQL. Por favor, analise o seguinte código ${dialectInfo} e forneça:

1. Uma análise detalhada da estrutura, padrões e qualidade do código
2. Uma lista de sugestões específicas de melhoria

Por favor, formate sua resposta como JSON com a seguinte estrutura:
{
  "analysis": "Análise detalhada do código...",
  "suggestions": ["Sugestão 1", "Sugestão 2", "..."]
}

Foque em:
- Legibilidade e manutenibilidade do código
- Otimizações de performance específicas para ${sqlDialect.toUpperCase()}
- Melhores práticas e padrões de design
- Potenciais bugs ou casos extremos
- Considerações de segurança (se aplicável)
- Recomendações de teste

Código SQL para analisar:
\`\`\`sql
${code}
\`\`\``;
    } else {
      return `You are a senior software engineer and SQL code reviewer. Please analyze the following ${dialectInfo} code and provide:

1. A detailed analysis of the code's structure, patterns, and quality
2. A list of specific improvement suggestions

Please format your response as JSON with the following structure:
{
  "analysis": "Detailed analysis of the code...",
  "suggestions": ["Suggestion 1", "Suggestion 2", "..."]
}

Focus on:
- Code readability and maintainability
- Performance optimizations specific to ${sqlDialect.toUpperCase()}
- Best practices and design patterns
- Potential bugs or edge cases
- Security considerations (if applicable)
- Testing recommendations

SQL code to analyze:
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

  private extractAnalysisResult(apiResponse: any): {
    analysis: string;
    suggestions: string[];
  } {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (apiResponse?.choices?.[0]?.message?.content) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        let content = apiResponse.choices[0].message.content.trim();

        // Remove markdown code blocks if present
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        content = content.replace(/```[\w]*\n/g, '').replace(/```/g, '');

        try {
          // Try to parse as JSON first
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsed = JSON.parse(content);
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            analysis: parsed.analysis || 'No analysis provided',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            suggestions: Array.isArray(parsed.suggestions)
              ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                parsed.suggestions
              : [],
          };
        } catch (jsonError) {
          // If JSON parsing fails, try to extract analysis and suggestions from text
          return this.parseTextResponse(content);
        }
      }

      throw new Error('Invalid response format from DeepSeek API');
    } catch (error) {
      this.logger.error(
        'Error extracting analysis result from API response',
        error,
      );
      throw new Error('Failed to process DeepSeek API response');
    }
  }

  private parseTextResponse(content: string): {
    analysis: string;
    suggestions: string[];
  } {
    // Fallback text parsing if JSON format fails
    const lines = content.split('\n').filter((line) => line.trim());
    let analysis = '';
    const suggestions: string[] = [];
    let currentSection = 'analysis';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('suggestion') || 
          trimmedLine.toLowerCase().includes('recommendation') ||
          trimmedLine.match(/^\d+\./) || 
          trimmedLine.startsWith('-') || 
          trimmedLine.startsWith('*')) {
        currentSection = 'suggestions';
        
        // Extract suggestion text, removing bullets/numbers
        const suggestionText = trimmedLine
          .replace(/^\d+\.\s*/, '')
          .replace(/^[-*]\s*/, '')
          .trim();
        
        if (suggestionText && !suggestionText.toLowerCase().includes('suggestion')) {
          suggestions.push(suggestionText);
        }
      } else if (currentSection === 'analysis') {
        analysis += (analysis ? ' ' : '') + trimmedLine;
      }
    }

    return {
      analysis: analysis || 'Code analysis completed',
      suggestions: suggestions.length > 0 ? suggestions : ['No specific suggestions provided'],
    };
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
    if (error?.message) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return error.message;
    }

    return 'An unexpected error occurred while analyzing your code.';
  }
}