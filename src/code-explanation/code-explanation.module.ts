import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CodeExplanationController } from './code-explanation.controller';
import { CodeExplanationService } from './code-explanation.service';

@Module({
  imports: [HttpModule],
  controllers: [CodeExplanationController],
  providers: [CodeExplanationService],
})
export class CodeExplanationModule {}
