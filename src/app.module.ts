import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeExplanationModule } from './code-explanation/code-explanation.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    CodeExplanationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
