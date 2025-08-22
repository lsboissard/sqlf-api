import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AnalyzeCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  language?: string;
}