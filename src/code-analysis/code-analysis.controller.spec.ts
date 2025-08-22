import { Test, TestingModule } from '@nestjs/testing';
import { CodeAnalysisController } from './code-analysis.controller';
import { CodeAnalysisService } from './code-analysis.service';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { CodeAnalysisResponseDto } from './dto/code-analysis-response.dto';

describe('CodeAnalysisController', () => {
  let controller: CodeAnalysisController;
  let service: CodeAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodeAnalysisController],
      providers: [
        {
          provide: CodeAnalysisService,
          useValue: {
            analyzeCode: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CodeAnalysisController>(CodeAnalysisController);
    service = module.get<CodeAnalysisService>(CodeAnalysisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyzeCode', () => {
    it('should call service and return response', async () => {
      const mockDto: AnalyzeCodeDto = {
        code: 'function add(a, b) { return a + b; }',
        language: 'javascript',
      };

      const mockResponse: CodeAnalysisResponseDto = {
        originalCode: mockDto.code,
        analysis: 'Simple addition function with good structure',
        suggestions: ['Add input validation', 'Add JSDoc comments'],
        success: true,
      };

      jest.spyOn(service, 'analyzeCode').mockResolvedValue(mockResponse);

      const result = await controller.analyzeCode(mockDto);

      expect(service.analyzeCode).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResponse);
    });
  });
});