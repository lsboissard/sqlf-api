import { ApiProperty } from '@nestjs/swagger';

export class CodeAnalysisResponseDto {
  @ApiProperty({
    description: 'Código original fornecido pelo usuário',
    example: 'function processUser(user) {\n  if (user == null) return;\n  user.name = user.name.toLowerCase();\n  console.log(user);\n}',
  })
  originalCode: string;

  @ApiProperty({
    description: 'Análise detalhada do código fornecido',
    example: 'O código apresenta uma função que processa dados de usuário. A função verifica se o usuário é nulo e modifica o nome para minúsculas antes de imprimir no console.',
  })
  analysis: string;

  @ApiProperty({
    description: 'Lista de sugestões de melhoria para o código',
    example: [
      'Use strict equality (===) instead of loose equality (==) for null checks',
      'Add proper error handling for edge cases',
      'Consider returning the modified user object instead of void',
      'Add input validation to ensure user.name exists before calling toLowerCase()',
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