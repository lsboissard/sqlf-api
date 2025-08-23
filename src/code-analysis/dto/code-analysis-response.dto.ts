export class CodeAnalysisResponseDto {
  originalCode: string;
  analysis: string;
  suggestions: string[];
  success: boolean;
  error?: string;
}