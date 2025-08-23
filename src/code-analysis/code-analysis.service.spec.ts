import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CodeAnalysisService } from './code-analysis.service';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('CodeAnalysisService', () => {
  let service: CodeAnalysisService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeAnalysisService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<CodeAnalysisService>(CodeAnalysisService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeCode', () => {
    const mockAnalyzeCodeDto: AnalyzeCodeDto = {
      code: 'SELECT * FROM users WHERE status = 1',
      language: 'sql',
      sqlDialect: 'postgresql',
      responseLanguage: 'pt-br',
    };

    it('should successfully analyze code with JSON response', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  analysis: 'Consulta SQL simples que seleciona todos os campos de usuários ativos',
                  suggestions: ['Evite SELECT *, especifique colunas', 'Considere índices para performance'],
                }),
              },
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await service.analyzeCode(mockAnalyzeCodeDto);

      expect(result.success).toBe(true);
      expect(result.originalCode).toBe(mockAnalyzeCodeDto.code);
      expect(result.analysis).toContain('Consulta SQL simples');
      expect(result.suggestions).toEqual(['Evite SELECT *, especifique colunas', 'Considere índices para performance']);
      expect(result.error).toBeUndefined();
    });

    it('should handle text response fallback', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          choices: [
            {
              message: {
                content: `Esta é uma consulta SQL que seleciona usuários ativos.
                
                Sugestões:
                1. Evite usar SELECT *
                2. Adicione índices para performance
                3. Considere usar LIMIT para grandes resultados`,
              },
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await service.analyzeCode(mockAnalyzeCodeDto);

      expect(result.success).toBe(true);
      expect(result.originalCode).toBe(mockAnalyzeCodeDto.code);
      expect(result.analysis).toContain('consulta SQL que seleciona usuários ativos');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            error: {
              message: 'Invalid API key',
            },
          },
        },
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => errorResponse));

      const result = await service.analyzeCode(mockAnalyzeCodeDto);

      expect(result.success).toBe(false);
      expect(result.originalCode).toBe(mockAnalyzeCodeDto.code);
      expect(result.analysis).toBe('');
      expect(result.suggestions).toEqual([]);
      expect(result.error).toBe('Invalid API key');
    });

    it('should handle 401 unauthorized errors', async () => {
      const errorResponse = {
        response: {
          status: 401,
        },
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => errorResponse));

      const result = await service.analyzeCode(mockAnalyzeCodeDto);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Invalid API key. Please check your DeepSeek API key.',
      );
    });

    it('should handle rate limit errors', async () => {
      const errorResponse = {
        response: {
          status: 429,
        },
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => errorResponse));

      const result = await service.analyzeCode(mockAnalyzeCodeDto);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded. Please try again later.');
    });

    it('should handle missing API key configuration', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const result = await service.analyzeCode(mockAnalyzeCodeDto);

      expect(result.success).toBe(false);
      expect(result.error).toBe('DEEPSEEK_API_KEY not configured');
    });

    it('should work with default parameters when not specified', async () => {
      const simpleDto = {
        code: 'SELECT COUNT(*) FROM orders'
      };

      const mockResponse: AxiosResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  analysis: 'Consulta de agregação que conta registros na tabela orders',
                  suggestions: ['Considere filtros para melhor performance', 'Use índices apropriados'],
                }),
              },
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await service.analyzeCode(simpleDto);

      expect(result.success).toBe(true);
      expect(result.analysis).toContain('Consulta de agregação');
    });

    it('should provide dialect-specific analysis', async () => {
      const dialectDto = {
        code: 'SELECT TOP 10 * FROM users',
        sqlDialect: 't-sql',
        responseLanguage: 'en'
      };

      const mockResponse: AxiosResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  analysis: 'T-SQL query using TOP clause for limiting results',
                  suggestions: ['Consider using OFFSET-FETCH for pagination', 'Add ORDER BY for consistent results'],
                }),
              },
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await service.analyzeCode(dialectDto);

      expect(result.success).toBe(true);
      expect(result.analysis).toContain('T-SQL query');
      expect(result.suggestions).toContain('Consider using OFFSET-FETCH for pagination');
    });
  });
});