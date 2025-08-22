import { Test, TestingModule } from '@nestjs/testing';
import { CodeExplanationController } from './code-explanation.controller';
import { CodeExplanationService } from './code-explanation.service';
import { ExplainCodeDto } from './dto/explain-code.dto';
import { CodeExplanationResponseDto } from './dto/code-explanation-response.dto';

describe('CodeExplanationController', () => {
  let controller: CodeExplanationController;
  let service: CodeExplanationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodeExplanationController],
      providers: [
        {
          provide: CodeExplanationService,
          useValue: {
            explainCode: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CodeExplanationController>(
      CodeExplanationController,
    );
    service = module.get<CodeExplanationService>(CodeExplanationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('explainCode', () => {
    it('should call service and return response', async () => {
      const mockDto: ExplainCodeDto = {
        code: 'function test() { return 42; }',
        language: 'javascript',
      };

      const mockResponse: CodeExplanationResponseDto = {
        originalCode: mockDto.code,
        explainedCode:
          '// Returns the answer to everything\nfunction test() { return 42; }',
        success: true,
      };

      jest.spyOn(service, 'explainCode').mockResolvedValue(mockResponse);

      const result = await controller.explainCode(mockDto);

      expect(service.explainCode).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResponse);
    });
  });
});
