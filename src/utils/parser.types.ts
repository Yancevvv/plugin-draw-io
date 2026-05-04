import { ProgramNode } from './create_nodes.types.js';

/** Типы выражений в языке предметной области */
export enum ExprType {
  // Литералы
  ID = 'ID',
  CLASS = 'CLASS',
  STRING = 'STRING',
  INT = 'INT',
  DOUBLE = 'DOUBLE',
  BOOLEAN = 'BOOLEAN',
  OBJ_VAR = 'OBJ_VAR',
  VAR = 'VAR',
  
  // Операторы
  GET_BY_RELATIONSHIP = 'get by relationship',
  PROPERTY = 'PROPERTY',
  IS = 'IS',
  GREATER = 'GREATER',
  LESS = 'LESS',
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  GE = 'GE',
  LE = 'LE',
  COMPARE = 'COMPARE',
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  
  // Специальные
  GET_CLASS = 'GET_CLASS',
  FIND = 'FIND',
  FIND_EXTREM = 'FIND_EXTREM',
  EXIST = 'EXIST',
  FORALL = 'FORALL',
  CAST = 'cast',
  IF = 'IF',
  WITH = 'WITH',
  ENUM = 'ENUM',
  GET_OBJECT_BY_REL = 'GET_OBJECT_BY_REL',
  CHECK_REL = 'CHECK_REL',
}

/** Типы утверждений (statements) */
export enum StmtType {
  EXPR = 'EXPR',
  ASSIGNMENT = 'ASSIGNMENT',
  ADD_RELATIONSHIP = 'ADD_RELATIONSHIP',
}

/** Базовый интерфейс узла AST */
export interface ASTNode {
  type: string;
  loc?: SourceLocation;
}

/** Позиция в исходном коде */
export interface SourceLocation {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
  range?: [number, number];
}

/** Результат парсинга */
export interface ParseResult {
  success: true;
  ast: ProgramNode;
  root: ProgramNode;
}

/** Ошибка парсинга */
export interface ParseError {
  success: false;
  message: string;
  line?: number;
  column?: number;
  loc?: SourceLocation;
  expected?: string[];
  token?: string;
  text?: string;
}

/** Объединённый тип результата */
export type ParseOutput = ParseResult | ParseError;

/** Данные для parseError */
export interface ParseErrorHash {
  text?: string;
  token?: string;
  line?: number;
  loc?: SourceLocation;
  expected?: string[];
  recoverable?: boolean;
  [key: string]: any;
}

/** Расширенный интерфейс лексера (включая внутренние свойства Jison) */
export interface Lexer {
  EOF: 1;
  
  // Публичные свойства
  yy: Record<string, any>;
  yytext: string;
  yyleng: number;
  yylineno: number;
  yylloc: SourceLocation;
  options: {
    ranges?: boolean;
    flex?: boolean;
    backtrack_lexer?: boolean;
  };
  
  // Внутренние свойства Jison
  _input: string;
  _more: boolean;
  _backtrack: boolean;
  done: boolean;
  matched: string;
  match: string;
  conditionStack: string[];
  offset: number;
  
  // Методы
  setInput(input: string, yy?: Record<string, any>): this;
  lex(): number | string;
  next(): number | string;
  input(): string;
  unput(ch: string): this;
  more(): this;
  reject(): this;
  less(n: number): void;
  pastInput(): string;
  upcomingInput(): string;
  showPosition(): string;
  test_match(match: RegExpMatchArray, indexed_rule: number): boolean;
  _currentRules(): number[];
  topState(n?: number): string;
  begin(condition: string): void;
  popState(): string;
  pushState(condition: string): void;
  stateStackSize(): number;
  performAction(
    yy: any,
    yy_: Lexer,
    $avoiding_name_collisions: number,
    YY_START: number
  ): number | string | void;
  parseError(str: string, hash: any): void;
  
  // Условия лексера
  conditions?: Record<string, { rules: number[]; inclusive: boolean }>;
  rules?: RegExp[];
}

/** Расширенный интерфейс парсера */
export interface Parser {
  // Публичные методы
  parse(input: string): any;
  setInput(input: string): void;
  parseError(str: string, hash: ParseErrorHash): void;
  
  // Внутренние свойства Jison
  trace?: (str: string) => void;
  yy: Record<string, any>;
  lexer: Lexer;
  symbols_?: Record<string, number>;
  terminals_?: Record<number, string>;
  productions_?: Array<[number, number]>;
  table?: any;
  defaultActions?: Record<number, number[]>;
  performAction?: (
    this: { $: any },
    yytext: string,
    yyleng: number,
    yylineno: number,
    yy: Record<string, any>,
    yystate: number,
    $$: any[],
    _$: SourceLocation[]
  ) => any;
  
  // Для совместимости с Jison
  [key: string]: any;
}