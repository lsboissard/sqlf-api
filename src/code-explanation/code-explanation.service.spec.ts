import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { CodeExplanationService } from './code-explanation.service';
import { ExplainCodeDto } from './dto/explain-code.dto';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('CodeExplanationService', () => {
  let service: CodeExplanationService;
  let httpService: HttpService;

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
      ],
    }).compile();

    service = module.get<CodeExplanationService>(CodeExplanationService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('explainCode', () => {
    const mockExplainCodeDto: ExplainCodeDto = {
      code: 'function hello() { return "world"; }',
      apiKey: 'test-api-key',
      language: 'javascript',
    };

    it('should successfully explain code', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          choices: [
            {
              message: {
                content:
                  '// Function that returns a greeting\nfunction hello() { return "world"; }',
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
        'Function that returns a greeting',
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
  });
});
