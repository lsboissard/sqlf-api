import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeExplanationModule } from './code-explanation/code-explanation.module';

@Module({
  imports: [CodeExplanationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
