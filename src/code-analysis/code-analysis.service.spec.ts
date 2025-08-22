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
      code: 'function add(a, b) { return a + b; }',
      language: 'javascript',
    };

    it('should successfully analyze code with JSON response', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  analysis: 'Simple addition function with clear purpose',
                  suggestions: ['Add input validation', 'Add JSDoc comments'],
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
      expect(result.analysis).toContain('Simple addition function');
      expect(result.suggestions).toEqual(['Add input validation', 'Add JSDoc comments']);
      expect(result.error).toBeUndefined();
    });

    it('should handle text response fallback', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          choices: [
            {
              message: {
                content: `This is a simple addition function.
                
                Suggestions:
                1. Add input validation
                2. Add JSDoc comments
                3. Consider error handling`,
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
      expect(result.analysis).toContain('simple addition function');
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
  });
});