import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CodeExplanationService } from './code-explanation.service';
import { ExplainCodeDto } from './dto/explain-code.dto';
import { CodeExplanationResponseDto } from './dto/code-explanation-response.dto';

@Controller('explain-code')
export class CodeExplanationController {
  constructor(
    private readonly codeExplanationService: CodeExplanationService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async explainCode(
    @Body() explainCodeDto: ExplainCodeDto,
  ): Promise<CodeExplanationResponseDto> {
    return this.codeExplanationService.explainCode(explainCodeDto);
  }
}
