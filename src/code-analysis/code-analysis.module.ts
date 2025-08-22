import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CodeAnalysisController } from './code-analysis.controller';
import { CodeAnalysisService } from './code-analysis.service';

@Module({
  imports: [HttpModule],
  controllers: [CodeAnalysisController],
  providers: [CodeAnalysisService],
})
export class CodeAnalysisModule {}