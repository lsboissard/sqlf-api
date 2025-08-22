import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ExplainCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  language?: string;
}
