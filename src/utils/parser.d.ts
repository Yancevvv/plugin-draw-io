import { ProgramNode } from './create_nodes.js';

/**
 * Типы для ошибок парсера
 */
export interface ParseErrorHash {
    text?: string;
    token?: string | number | null;
    line?: number;
    loc?: unknown;
    expected?: string[];
    recoverable?: boolean;
}

/**
 * Интерфейс лексера
 */
export interface Lexer {
    EOF: number;
    parseError(str: string, hash: ParseErrorHash): void;
    setInput(input: string, yy?: Record<string, unknown>): Lexer;
    input(): string;
    unput(ch: string): Lexer;
    more(): Lexer;
    less(n: number): void;
    pastInput(): string;
    upcomingInput(): string;
    showPosition(): string;
    test_match(match: RegExpMatchArray | null, indexed_rule: number): string | number | false;
    next(): string | number | false;
    lex(): string | number;
    begin(condition: string): void;
    popState(): string;
    _currentRules(): number[];
    topState(n?: number): string;
    pushState(condition: string): void;
    stateStackSize(): number;
    options: {
        ranges?: boolean;
        flex?: boolean;
        backtrack_lexer?: boolean;
    };
    performAction(
        yy: Record<string, unknown>,
        yy_: Lexer,
        avoiding_name_collisions: number,
        YY_START: string
    ): string | number | void;
    rules: RegExp[];
    conditions: Record<string, { rules: number[]; inclusive: boolean }>;
    yylineno: number;
    yyleng: number;
    yytext: string;
    matched: string;
    match: string;
    offset: number;
    done: boolean;
    _more: boolean;
    _backtrack: boolean;
    _input: string;
    conditionStack: string[];
    yylloc: {
        first_line: number;
        last_line: number;
        first_column: number;
        last_column: number;
        range?: [number, number];
    };
    yy?: Record<string, unknown>;
}

/**
 * Интерфейс парсера
 */
export interface Parser {
    yy: Record<string, unknown>;
    lexer: Lexer;
    trace(str: string): void;
    parseError(str: string, hash: ParseErrorHash): void;
    parse(input: string): boolean;
    symbols_: Record<string, number>;
    terminals_: Record<number, string>;
    productions_: number[][];
    performAction(
        yytext: string,
        yyleng: number,
        yylineno: number,
        yy: Record<string, unknown>,
        yystate: number,
        $$: unknown[],
        _$: unknown[]
    ): void;
    table: Record<number, Record<number, number | [number, number]>>;
    defaultActions: Record<number, [number, number]>;
}

/**
 * Конструктор парсера
 */
interface ParserConstructor {
    new (): Parser;
    prototype: Parser;
}

/**
 * Экспортируемый экземпляр парсера
 */
export const parser: Parser & {
    Parser: ParserConstructor;
    parse(input: string): unknown;
};

/**
 * Функция для прямого парсинга
 */
export const parse: (input: string) => unknown;

/**
 * Глобальный корневой узел после парсинга
 */
export let root: ProgramNode | null;