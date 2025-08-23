import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExplainCodeDto {
  @ApiProperty({
    description: 'Código a ser explicado',
    example: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Linguagem de programação do código (opcional)',
    example: 'javascript',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  language?: string;
}
