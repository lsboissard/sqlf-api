import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CodeAnalysisService } from './code-analysis.service';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { CodeAnalysisResponseDto } from './dto/code-analysis-response.dto';

@Controller('analyze-code')
export class CodeAnalysisController {
  constructor(
    private readonly codeAnalysisService: CodeAnalysisService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async analyzeCode(
    @Body() analyzeCodeDto: AnalyzeCodeDto,
  ): Promise<CodeAnalysisResponseDto> {
    return this.codeAnalysisService.analyzeCode(analyzeCodeDto);
  }
}