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
import { CodeExplanationService } from './code-explanation.service';
import { ExplainCodeDto } from './dto/explain-code.dto';
import { CodeExplanationResponseDto } from './dto/code-explanation-response.dto';

@ApiTags('Code Explanation')
@Controller('explain-code')
export class CodeExplanationController {
  constructor(
    private readonly codeExplanationService: CodeExplanationService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Explicar código',
    description: 'Adiciona comentários e explicações detalhadas ao código fornecido usando IA',
  })
  @ApiBody({
    type: ExplainCodeDto,
    description: 'Dados do código a ser explicado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Código explicado com sucesso',
    type: CodeExplanationResponseDto,
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
  async explainCode(
    @Body() explainCodeDto: ExplainCodeDto,
  ): Promise<CodeExplanationResponseDto> {
    return this.codeExplanationService.explainCode(explainCodeDto);
  }
}
