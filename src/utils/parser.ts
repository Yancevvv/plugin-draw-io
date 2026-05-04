import { 
  parser as originalParser, 
  root as originalRoot,
  string as originalString 
} from './parser.js';

import type { 
  Parser as IParser, 
  ParseOutput, 
  ParseErrorHash 
} from './parser.types.js';

import type { ProgramNode } from './create_nodes.types.js';

// Реэкспорт с правильными типами
export const parser: IParser = originalParser;
export let root: ProgramNode | null = originalRoot;
export const string: string = originalString;

/**
 * Парсит строку выражения в AST
 */
export function parse(input: string): any {
  return parser.parse(input);
}

/**
 * Безопасный парсинг с возвратом результата или ошибки
 */
export function safeParse(input: string): ParseOutput {
  try {
    const ast = parser.parse(input);
    return {
      success: true,
      ast: ast as ProgramNode,
      root: root as ProgramNode
    };
  } catch (error) {
    const err = error as Error & { hash?: ParseErrorHash };
    return {
      success: false,
      message: err.message,
      line: err.hash?.line,
      column: err.hash?.loc?.first_column,
      loc: err.hash?.loc,
      expected: err.hash?.expected,
      token: err.hash?.token,
      text: err.hash?.text
    };
  }
}

/**
 * Сбрасывает состояние парсера
 */
export function reset(): void {
  parser.yy = {};
  parser.lexer.setInput('');
}