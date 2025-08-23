import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CodeExplanationService } from './code-explanation.service';
import { ExplainCodeDto } from './dto/explain-code.dto';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('CodeExplanationService', () => {
  let service: CodeExplanationService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeExplanationService,
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

    service = module.get<CodeExplanationService>(CodeExplanationService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('explainCode', () => {
    const mockExplainCodeDto: ExplainCodeDto = {
      code: 'SELECT * FROM users WHERE status = 1',
      language: 'sql',
      sqlDialect: 'mysql',
      responseLanguage: 'pt-br',
    };

    it('should successfully explain code', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          choices: [
            {
              message: {
                content:
                  '-- Seleciona todos os campos dos usuários ativos\nSELECT * FROM users WHERE status = 1',
              },
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await service.explainCode(mockExplainCodeDto);

      expect(result.success).toBe(true);
      expect(result.originalCode).toBe(mockExplainCodeDto.code);
      expect(result.explainedCode).toContain(
        'Seleciona todos os campos dos usuários ativos',
      );
      expect(result.error).toBeUndefined();
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

      const result = await service.explainCode(mockExplainCodeDto);

      expect(result.success).toBe(false);
      expect(result.originalCode).toBe(mockExplainCodeDto.code);
      expect(result.explainedCode).toBe('');
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

      const result = await service.explainCode(mockExplainCodeDto);

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

      const result = await service.explainCode(mockExplainCodeDto);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded. Please try again later.');
    });

    it('should handle missing API key configuration', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const result = await service.explainCode(mockExplainCodeDto);

      expect(result.success).toBe(false);
      expect(result.error).toBe('DEEPSEEK_API_KEY not configured');
    });

    it('should work with default parameters when not specified', async () => {
      const simpleDto = {
        code: 'SELECT name FROM users'
      };

      const mockResponse: AxiosResponse = {
        data: {
          choices: [
            {
              message: {
                content: '-- Seleciona nomes dos usuários\nSELECT name FROM users',
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

      const result = await service.explainCode(simpleDto);

      expect(result.success).toBe(true);
      expect(result.explainedCode).toContain('Seleciona nomes dos usuários');
    });

    it('should use English when responseLanguage is en', async () => {
      const englishDto = {
        code: 'SELECT * FROM products',
        responseLanguage: 'en'
      };

      const mockResponse: AxiosResponse = {
        data: {
          choices: [
            {
              message: {
                content: '-- Select all fields from products table\nSELECT * FROM products',
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

      const result = await service.explainCode(englishDto);

      expect(result.success).toBe(true);
      expect(result.explainedCode).toContain('Select all fields');
    });
  });
});
