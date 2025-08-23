import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SqlDialect, ResponseLanguage } from '../../common/enums';

export class AnalyzeCodeDto {
  @ApiProperty({
    description: 'Código SQL a ser analisado',
    example: 'SELECT * FROM users WHERE status = 1 AND created_at > \'2023-01-01\'',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Linguagem de programação do código',
    example: 'sql',
    type: String,
    required: false,
    default: 'sql',
  })
  @IsString()
  @IsOptional()
  language?: string = 'sql';

  @ApiProperty({
    description: 'Dialeto SQL a ser considerado na análise',
    enum: SqlDialect,
    example: SqlDialect.MYSQL,
    required: false,
    default: SqlDialect.STANDARD,
  })
  @IsEnum(SqlDialect)
  @IsOptional()
  sqlDialect?: SqlDialect = SqlDialect.STANDARD;

  @ApiProperty({
    description: 'Idioma da resposta de análise',
    enum: ResponseLanguage,
    example: ResponseLanguage.PT_BR,
    required: false,
    default: ResponseLanguage.PT_BR,
  })
  @IsEnum(ResponseLanguage)
  @IsOptional()
  responseLanguage?: ResponseLanguage = ResponseLanguage.PT_BR;
}