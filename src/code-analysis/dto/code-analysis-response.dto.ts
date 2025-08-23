import { ApiProperty } from '@nestjs/swagger';

export class CodeAnalysisResponseDto {
  @ApiProperty({
    description: 'Código SQL original fornecido pelo usuário',
    example: 'SELECT * FROM users WHERE status = 1 AND created_at > \'2023-01-01\'',
  })
  originalCode: string;

  @ApiProperty({
    description: 'Análise detalhada do código SQL fornecido',
    example: 'O código apresenta uma consulta SQL simples que seleciona todos os campos da tabela users. A consulta utiliza filtros para buscar apenas usuários ativos e criados recentemente.',
  })
  analysis: string;

  @ApiProperty({
    description: 'Lista de sugestões de melhoria para o código SQL',
    example: [
      'Evite usar SELECT * em consultas de produção, especifique apenas as colunas necessárias',
      'Considere criar um índice composto em (status, created_at) para melhor performance',
      'Use parâmetros para a data em vez de valores hard-coded',
      'Considere usar uma função de data para melhor legibilidade',
      'Replace console.log with proper logging mechanism'
    ],
    type: [String],
  })
  suggestions: string[];

  @ApiProperty({
    description: 'Indica se a análise foi processada com sucesso',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de erro caso ocorra algum problema (opcional)',
    example: 'Erro ao analisar o código',
    required: false,
  })
  error?: string;
}