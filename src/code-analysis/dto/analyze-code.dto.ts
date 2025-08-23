import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeCodeDto {
  @ApiProperty({
    description: 'Código a ser analisado',
    example: 'function processUser(user) {\n  if (user == null) return;\n  user.name = user.name.toLowerCase();\n  console.log(user);\n}',
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