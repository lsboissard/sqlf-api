import { ApiProperty } from '@nestjs/swagger';

export class CodeExplanationResponseDto {
  @ApiProperty({
    description: 'Código original fornecido pelo usuário',
    example: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
  })
  originalCode: string;

  @ApiProperty({
    description: 'Código com explicações e comentários adicionados',
    example: '// Função recursiva para calcular números da sequência de Fibonacci\nfunction fibonacci(n) {\n  // Caso base: se n é 0 ou 1, retorna o próprio valor\n  if (n <= 1) return n;\n  // Caso recursivo: soma dos dois números anteriores na sequência\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
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
