import { ApiProperty } from '@nestjs/swagger';

export class CodeExplanationResponseDto {
  @ApiProperty({
    description: 'Código SQL original fornecido pelo usuário',
    example: 'SELECT * FROM users WHERE status = 1 AND created_at > \'2023-01-01\'',
  })
  originalCode: string;

  @ApiProperty({
    description: 'Código SQL com explicações e comentários adicionados',
    example: '-- Seleciona todas as colunas da tabela users\nSELECT * \nFROM users \n-- Filtra apenas usuários ativos (status = 1)\nWHERE status = 1 \n  -- E que foram criados após 1º de janeiro de 2023\n  AND created_at > \'2023-01-01\'',
  })
  explainedCode: string;

  @ApiProperty({
    description: 'Indica se a explicação foi processada com sucesso',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de erro caso ocorra algum problema (opcional)',
    example: 'Erro ao processar o código',
    required: false,
  })
  error?: string;
}
