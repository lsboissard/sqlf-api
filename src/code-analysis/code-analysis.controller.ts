import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CodeAnalysisService } from './code-analysis.service';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { CodeAnalysisResponseDto } from './dto/code-analysis-response.dto';

@ApiTags('Code Analysis')
@Controller('analyze-code')
export class CodeAnalysisController {
  constructor(
    private readonly codeAnalysisService: CodeAnalysisService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Analisar código SQL',
    description: 'Analisa o código SQL fornecido e oferece sugestões de melhoria específicas para o dialeto especificado',
  })
  @ApiBody({
    type: AnalyzeCodeDto,
    description: 'Dados do código SQL a ser analisado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Código analisado com sucesso',
    type: CodeAnalysisResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Código é obrigatório' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Erro ao processar requisição' },
      },
    },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async analyzeCode(
    @Body() analyzeCodeDto: AnalyzeCodeDto,
  ): Promise<CodeAnalysisResponseDto> {
    return this.codeAnalysisService.analyzeCode(analyzeCodeDto);
  }
}