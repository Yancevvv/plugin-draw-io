import {
    ProgramNode,
    BlockNode,
    createStmtSeqNode,
    addStmtToStmtSeqNode,
    StatementNode,
    StmtType,
    createAddRelationshipStmtNode,
    createLiteral,
    ExprType,
    createEnum,
    createGetObjectByRel,
    createBinExprNode,
    createCastExprNode,
    createUnaryExprNode,
    createCheckRelExprNode,
    createGetExprNode,
    createFindExtremeExprNode,
    createQuantifierExprNode,
    createIfExprNode,
    createWithExprNode,
    createObjectSeqNode,
    addObjectToObjectSeqNode,
} from './create_nodes.js';

// ============ Типы для парсера ============

export type ParseResult = ProgramNode | BlockNode | StatementNode | unknown;

export interface ParseErrorHash {
    text?: string;
    token?: string | number | null;
    line?: number;
    loc?: unknown;
    expected?: string[];
    recoverable?: boolean;
}

export interface YYLoc {
    first_line: number;
    last_line: number;
    first_column: number;
    last_column: number;
    range?: [number, number];
}

export interface PerformActionContext {
    $?: unknown;
    _$?: YYLoc;
}

type TokenType = string | number;
type ActionResult = number | [number, number];
type TableValue = number | [number, number] | number[];
type TableRow = Record<number, TableValue>;

// Интерфейс для внутреннего состояния парсера
interface ParserInternal {
    trace: (str: string) => void;
    yy: Record<string, unknown>;
    symbols_: Record<string, number>;
    terminals_: Record<number, string>;
    productions_: Array<[number, number]>;
    performAction: (
        yytext: string,
        yyleng: number,
        yylineno: number,
        yy: Record<string, unknown>,
        yystate: number,
        $$: unknown[],
        _$: unknown[]
    ) => void;
    table: Record<number, TableRow>;
    defaultActions: Record<number, TableValue>;
    parseError: (str: string, hash: ParseErrorHash) => void;
    parse: (input: string) => boolean;
    lexer: Lexer;
}

export interface Lexer {
    EOF: number;
    parseError: (str: string, hash: ParseErrorHash) => void;
    setInput: (input: string, yy?: Record<string, unknown>) => Lexer;
    input: () => string;
    unput: (ch: string) => Lexer;
    more: () => Lexer;
    less: (n: number) => void;
    pastInput: () => string;
    upcomingInput: () => string;
    showPosition: () => string;
    test_match: (match: RegExpMatchArray | null, indexed_rule: number) => TokenType | false;
    next: () => TokenType | false;
    lex: () => TokenType;
    begin: (condition: string) => void;
    popState: () => string;
    _currentRules: () => number[];
    topState: (n?: number) => string;
    pushState: (condition: string) => void;
    stateStackSize: () => number;
    options: {
        ranges?: boolean;
        flex?: boolean;
        backtrack_lexer?: boolean;
    };
    performAction: (yy: Record<string, unknown>, yy_: Lexer, avoiding_name_collisions: number, YY_START: string) => TokenType | void;
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
    yylloc: YYLoc;
    yy?: Record<string, unknown>;
}

// Глобальные переменные
export let root: ProgramNode | null = null;

// Вспомогательная функция для создания объектов таблицы
function o(
    base: number | number[] | Record<number, TableValue>,
    val?: TableValue,
    additions?: Record<number, TableValue>
): TableRow {
    const result: TableRow = {};

    if (typeof base === "number") {
        if (val !== undefined) {
            result[base] = val;
        }
    } else if (Array.isArray(base)) {
        if (val !== undefined) {
            for (const v of base) {
                result[v] = val;
            }
        }
    } else {
        for (const key in base) {
            if (Object.prototype.hasOwnProperty.call(base, key)) {
                result[Number(key)] = base[key];
            }
        }
    }

    if (additions) {
        for (const key in additions) {
            if (Object.prototype.hasOwnProperty.call(additions, key)) {
                result[Number(key)] = additions[key];
            }
        }
    }

    return result;
}

// Парсер 
export const parser = ((): ParserInternal => {
    const $V0 = [1, 6];
    const $V1 = [1, 15];
    const $V2 = [1, 7];
    const $V3 = [1, 8];
    const $V4 = [1, 9];
    const $V5 = [1, 10];
    const $V6 = [1, 11];
    const $V7 = [1, 12];
    const $V8 = [1, 13];
    const $V9 = [1, 14];
    const $Va = [1, 16];
    const $Vb = [1, 17];
    const $Vc = [1, 18];
    const $Vd = [1, 19];
    const $Ve = [1, 20];
    const $Vf = [1, 21];
    const $Vg = [1, 22];
    const $Vh = [1, 25];
    const $Vi = [1, 26];
    const $Vj = [1, 27];
    const $Vk = [1, 28];
    const $Vl = [1, 29];
    const $Vm = [1, 30];
    const $Vn = [1, 31];
    const $Vo = [1, 32];
    const $Vp = [1, 33];
    const $Vq = [1, 34];
    const $Vr = [1, 35];
    const $Vs = [1, 36];
    const $Vt = [1, 8, 9, 11, 12, 16, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 45, 51];
    const $Vu = [1, 8, 9, 11, 12, 16, 29, 30, 31, 32, 33, 34, 35, 38, 39, 45, 51];
    const $Vv = [1, 8, 9, 11, 12, 16, 29, 32, 33, 38, 39, 45, 51];
    const $Vw = [8, 13, 14, 17, 19, 20, 21, 22, 23, 24, 25, 40, 42, 43, 47, 48, 49, 50];
    const $Vx = [1, 100];
    const $Vy = [16, 51];
    const $Vz = [1, 8, 9, 11, 12, 16, 45, 51];

    const tableData: Record<number, TableRow> = {
        0: o({3: 1, 4: 2, 5: 3, 6: [1, 5] as [number, number], 10: 4, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        1: o(1, [3] as [number]),
        2: o(1, [2, 1] as [number, number]),
        3: o(1, [2, 2] as [number, number]),
        4: o($V4, [2, 6] as [number, number], {11: [1, 23] as [number, number], 12: [1, 24] as [number, number], 27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        5: o({4: 38, 7: 37, 10: 4, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        6: o($Vt, [2, 9] as [number, number], {26: [1, 39] as [number, number]}),
        7: o(18, [1, 40] as [number, number]),
        8: o($Vt, [2, 11] as [number, number]),
        9: o($Vt, [2, 12] as [number, number]),
        10: o($Vt, [2, 13] as [number, number]),
        11: o($Vt, [2, 14] as [number, number]),
        12: o($Vt, [2, 15] as [number, number]),
        13: o($Vt, [2, 16] as [number, number]),
        14: o($Vt, [2, 17] as [number, number]),
        15: o({10: 41, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        16: o({10: 42, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        17: o(13, [1, 43] as [number, number]),
        18: o(13, [1, 44] as [number, number]),
        19: o(13, [1, 45] as [number, number]),
        20: o(13, [1, 46] as [number, number]),
        21: o(14, [1, 47] as [number, number]),
        22: o(14, [1, 48] as [number, number]),
        23: o({10: 49, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        24: o(13, [1, 50] as [number, number]),
        25: o(13, [1, 51] as [number, number]),
        26: o({13: [1, 52] as [number, number], 36: [1, 53] as [number, number], 41: [1, 54] as [number, number]}),
        27: o({10: 55, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        28: o({10: 56, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        29: o({10: 57, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        30: o({10: 58, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        31: o({10: 59, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        32: o({10: 60, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        33: o({10: 61, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        34: o({10: 62, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        35: o({10: 63, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        36: o({10: 64, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        37: o({4: 66, 8: [1, 65] as [number, number], 10: 4, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        38: o(9, [1, 67] as [number, number]),
        39: o(13, [1, 68] as [number, number]),
        40: o(13, [1, 69] as [number, number]),
        41: o({16: [1, 70] as [number, number], 27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        42: o($Vu, [2, 33] as [number, number], {27: $Vh, 28: $Vi, 37: $Vq}),
        43: o(13, [1, 71] as [number, number]),
        44: o(44, [1, 72] as [number, number]),
        45: o(13, [1, 73] as [number, number]),
        46: o(13, [1, 74] as [number, number]),
        47: o({10: 75, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        48: o(13, [1, 76] as [number, number]),
        49: o($V4, [2, 7] as [number, number], {27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        50: o(14, [1, 77] as [number, number]),
        51: o($Vt, [2, 19] as [number, number], {14: [1, 78] as [number, number]}),
        52: o($Vt, [2, 20] as [number, number]),
        53: o(14, [1, 79] as [number, number]),
        54: o(14, [1, 80] as [number, number]),
        55: o([1, 8, 9, 11, 12, 16, 29, 38, 39, 45, 51], [2, 21] as [number, number], {27: $Vh, 28: $Vi, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq}),
        56: o($Vu, [2, 22] as [number, number], {27: $Vh, 28: $Vi, 37: $Vq}),
        57: o($Vu, [2, 23] as [number, number], {27: $Vh, 28: $Vi, 37: $Vq}),
        58: o($Vv, [2, 24] as [number, number], {27: $Vh, 28: $Vi, 30: $Vk, 31: $Vl, 34: $Vo, 35: $Vp, 37: $Vq}),
        59: o($Vv, [2, 25] as [number, number], {27: $Vh, 28: $Vi, 30: $Vk, 31: $Vl, 34: $Vo, 35: $Vp, 37: $Vq}),
        60: o($Vu, [2, 26] as [number, number], {27: $Vh, 28: $Vi, 37: $Vq}),
        61: o($Vu, [2, 27] as [number, number], {27: $Vh, 28: $Vi, 37: $Vq}),
        62: o($Vt, [2, 30] as [number, number]),
        63: o([1, 8, 9, 11, 12, 16, 38, 39, 45, 51], [2, 31] as [number, number], {27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq}),
        64: o([1, 8, 9, 11, 12, 16, 39, 45, 51], [2, 32] as [number, number], {27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr}),
        65: o(1, [2, 3] as [number, number]),
        66: o(9, [1, 81] as [number, number]),
        67: o($Vw, [2, 4] as [number, number]),
        68: o($Vt, [2, 18] as [number, number]),
        69: o($Vt, [2, 10] as [number, number]),
        70: o($Vt, [2, 29] as [number, number]),
        71: o(6, [1, 82] as [number, number]),
        72: o({10: 83, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        73: o(44, [1, 84] as [number, number]),
        74: o(44, [1, 85] as [number, number]),
        75: o({16: [1, 86] as [number, number], 27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        76: o(11, [1, 87] as [number, number]),
        77: o({10: 89, 13: $V0, 14: $V1, 15: 88, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        78: o({10: 89, 13: $V0, 14: $V1, 15: 90, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        79: o({10: 91, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        80: o(16, [1, 92] as [number, number]),
        81: o($Vw, [2, 5] as [number, number]),
        82: o({10: 93, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        83: o({27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs, 45: [1, 94] as [number, number]}),
        84: o({10: 95, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        85: o({10: 96, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        86: o({10: 97, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        87: o({10: 98, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        88: o({16: [1, 99] as [number, number], 51: $Vx}),
        89: o($Vy, [2, 42] as [number, number], {27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        90: o({16: [1, 101] as [number, number], 51: $Vx}),
        91: o({16: [1, 102] as [number, number], 27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        92: o($Vt, [2, 35] as [number, number]),
        93: o({8: [1, 103] as [number, number], 27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        94: o(46, [1, 104] as [number, number]),
        95: o({27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs, 45: [1, 105] as [number, number]}),
        96: o({27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs, 45: [1, 106] as [number, number]}),
        97: o($Vz, [2, 40] as [number, number], {27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        98: o({16: [1, 107] as [number, number], 27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        99: o($V4, [2, 8] as [number, number]),
        100: o({10: 108, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        101: o($Vt, [2, 34] as [number, number]),
        102: o($Vt, [2, 28] as [number, number]),
        103: o($Vt, [2, 36] as [number, number]),
        104: o(13, [1, 109] as [number, number]),
        105: o(6, [1, 110] as [number, number]),
        106: o(6, [1, 111] as [number, number]),
        107: o({10: 112, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        108: o($Vy, [2, 43] as [number, number], {27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        109: o(13, [1, 113] as [number, number]),
        110: o({10: 114, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        111: o({10: 115, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        112: o($Vz, [2, 41] as [number, number], {27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        113: o(6, [1, 116] as [number, number]),
        114: o({8: [1, 117] as [number, number], 27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        115: o({8: [1, 118] as [number, number], 27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        116: o({10: 119, 13: $V0, 14: $V1, 17: $V2, 19: $V3, 20: $V4, 21: $V5, 22: $V6, 23: $V7, 24: $V8, 25: $V9, 40: $Va, 42: $Vb, 43: $Vc, 47: $Vd, 48: $Ve, 49: $Vf, 50: $Vg}),
        117: o($Vt, [2, 38] as [number, number]),
        118: o($Vt, [2, 39] as [number, number]),
        119: o({8: [1, 120] as [number, number], 27: $Vh, 28: $Vi, 29: $Vj, 30: $Vk, 31: $Vl, 32: $Vm, 33: $Vn, 34: $Vo, 35: $Vp, 37: $Vq, 38: $Vr, 39: $Vs}),
        120: o($Vt, [2, 37] as [number, number]),
    };

    class ParserImpl implements ParserInternal {
        trace(str: string): void {}
        
        yy: Record<string, unknown> = {};
        
        symbols_: Record<string, number> = {
            "error": 2, "program": 3, "stmt": 4, "block": 5, "{": 6, "stmt_seq": 7,
            "}": 8, ";": 9, "exp": 10, "=": 11, "+=>": 12, "ID": 13, "(": 14,
            "object_seq": 15, ")": 16, "CLASS_LITERAL": 17, ":": 18, "STRING": 19,
            "INT": 20, "DOUBLE": 21, "TRUE": 22, "FALSE": 23, "OBJ_VAR": 24, "VAR": 25,
            "::": 26, "->": 27, ".": 28, "IS": 29, ">": 30, "<": 31, "==": 32, "!=": 33,
            ">=": 34, "<=": 35, "COMPARE": 36, "AS": 37, "AND": 38, "OR": 39, "NOT": 40,
            "CLASS": 41, "FIND": 42, "FIND_EXTREM": 43, "[": 44, "]": 45, "AMONG": 46,
            "EXIST": 47, "FORALL": 48, "IF": 49, "WITH": 50, ",": 51, "$accept": 0, "$end": 1
        };
        
        terminals_: Record<number, string> = {
            2: "error", 6: "{", 8: "}", 9: ";", 11: "=", 12: "+=>", 13: "ID", 14: "(",
            16: ")", 17: "CLASS_LITERAL", 18: ":", 19: "STRING", 20: "INT", 21: "DOUBLE",
            22: "TRUE", 23: "FALSE", 24: "OBJ_VAR", 25: "VAR", 26: "::", 27: "->", 28: ".",
            29: "IS", 30: ">", 31: "<", 32: "==", 33: "!=", 34: ">=", 35: "<=", 36: "COMPARE",
            37: "AS", 38: "AND", 39: "OR", 40: "NOT", 41: "CLASS", 42: "FIND", 43: "FIND_EXTREM",
            44: "[", 45: "]", 46: "AMONG", 47: "EXIST", 48: "FORALL", 49: "IF", 50: "WITH", 51: ","
        };
        
        productions_: Array<[number, number]> = [
            [0, 0], [3, 1], [3, 1], [5, 3], [7, 2], [7, 3], [4, 1], [4, 3], [4, 6],
            [10, 1], [10, 3], [10, 1], [10, 1], [10, 1], [10, 1], [10, 1], [10, 1],
            [10, 1], [10, 3], [10, 3], [10, 3], [10, 3], [10, 3], [10, 3], [10, 3],
            [10, 3], [10, 3], [10, 3], [10, 6], [10, 3], [10, 3], [10, 3], [10, 3],
            [10, 2], [10, 6], [10, 5], [10, 6], [10, 11], [10, 9], [10, 9], [10, 5],
            [10, 7], [15, 1], [15, 3]
        ];
        
        performAction(
            yytext: string,
            yyleng: number,
            yylineno: number,
            yy: Record<string, unknown>,
            yystate: number,
            $$: unknown[],
            _$: unknown[]
        ): void {
            const $0 = $$.length - 1;
            const lastValue = $$[$0];
            
            switch (yystate) {
                case 1:
                    root = new ProgramNode(lastValue, false);
                    (this as any).$ = lastValue;
                    break;
                case 2:
                    root = new ProgramNode(lastValue, true);
                    (this as any).$ = lastValue;
                    break;
                case 3:
                    (this as any).$ = new BlockNode($$[$0 - 1]);
                    break;
                case 4:
                    (this as any).$ = createStmtSeqNode($$[$0 - 1]);
                    break;
                case 5:
                    (this as any).$ = addStmtToStmtSeqNode($$[$0 - 2], $$[$0 - 1]);
                    break;
                case 6:
                    (this as any).$ = new StatementNode(StmtType.EXPR, lastValue, null);
                    break;
                case 7:
                    (this as any).$ = new StatementNode(StmtType.ASSIGNMENT, $$[$0 - 2], lastValue);
                    break;
                case 8:
                    (this as any).$ = createAddRelationshipStmtNode($$[$0 - 5], $$[$0 - 3], $$[$0 - 1]);
                    break;
                case 9:
                    (this as any).$ = createLiteral(ExprType.ID, lastValue);
                    break;
                case 10:
                    (this as any).$ = createLiteral(ExprType.CLASS, lastValue);
                    break;
                case 11:
                    (this as any).$ = createLiteral(ExprType.STRING, lastValue);
                    break;
                case 12:
                    (this as any).$ = createLiteral(ExprType.INT, lastValue);
                    break;
                case 13:
                    (this as any).$ = createLiteral(ExprType.DOUBLE, lastValue);
                    break;
                case 14:
                    (this as any).$ = createLiteral(ExprType.BOOLEAN, true);
                    break;
                case 15:
                    (this as any).$ = createLiteral(ExprType.BOOLEAN, false);
                    break;
                case 16:
                    (this as any).$ = createLiteral(ExprType.OBJ_VAR, lastValue);
                    break;
                case 17:
                    (this as any).$ = createLiteral(ExprType.VAR, lastValue);
                    break;
                case 18:
                    (this as any).$ = createEnum($$[$0 - 2], lastValue);
                    break;
                case 19:
                    (this as any).$ = createGetObjectByRel($$[$0 - 2], lastValue);
                    break;
                case 20:
                    (this as any).$ = createBinExprNode(ExprType.PROPERTY, $$[$0 - 2], lastValue);
                    break;
                case 21:
                    (this as any).$ = createBinExprNode(ExprType.IS, $$[$0 - 2], lastValue);
                    break;
                case 22:
                    (this as any).$ = createBinExprNode(ExprType.GREATER, $$[$0 - 2], lastValue);
                    break;
                case 23:
                    (this as any).$ = createBinExprNode(ExprType.LESS, $$[$0 - 2], lastValue);
                    break;
                case 24:
                    (this as any).$ = createBinExprNode(ExprType.EQUAL, $$[$0 - 2], lastValue);
                    break;
                case 25:
                    (this as any).$ = createBinExprNode(ExprType.NOT_EQUAL, $$[$0 - 2], lastValue);
                    break;
                case 26:
                    (this as any).$ = createBinExprNode(ExprType.GE, $$[$0 - 2], lastValue);
                    break;
                case 27:
                    (this as any).$ = createBinExprNode(ExprType.LE, $$[$0 - 2], lastValue);
                    break;
                case 28:
                    (this as any).$ = createBinExprNode(ExprType.COMPARE, $$[$0 - 5], $$[$0 - 1]);
                    break;
                case 29:
                    (this as any).$ = $$[$0 - 1];
                    break;
                case 30:
                    (this as any).$ = createCastExprNode(lastValue, $$[$0 - 2]);
                    break;
                case 31:
                    (this as any).$ = createBinExprNode(ExprType.AND, $$[$0 - 2], lastValue);
                    break;
                case 32:
                    (this as any).$ = createBinExprNode(ExprType.OR, $$[$0 - 2], lastValue);
                    break;
                case 33:
                    (this as any).$ = createUnaryExprNode(ExprType.NOT, lastValue);
                    break;
                case 34:
                    (this as any).$ = createCheckRelExprNode($$[$0 - 5], $$[$0 - 3], $$[$0 - 1]);
                    break;
                case 35:
                    (this as any).$ = createUnaryExprNode(ExprType.GET_CLASS, $$[$0 - 4]);
                    break;
                case 36:
                    (this as any).$ = createGetExprNode(ExprType.FIND, $$[$0 - 4], $$[$0 - 3], $$[$0 - 1]);
                    break;
                case 37:
                    (this as any).$ = createFindExtremeExprNode($$[$0 - 9], $$[$0 - 7], $$[$0 - 4], $$[$0 - 3], $$[$0 - 1]);
                    break;
                case 38:
                    (this as any).$ = createQuantifierExprNode(ExprType.EXIST, $$[$0 - 7], $$[$0 - 6], $$[$0 - 4], $$[$0 - 1]);
                    break;
                case 39:
                    (this as any).$ = createQuantifierExprNode(ExprType.FORALL, $$[$0 - 7], $$[$0 - 6], $$[$0 - 4], $$[$0 - 1]);
                    break;
                case 40:
                    (this as any).$ = createIfExprNode($$[$0 - 2], lastValue);
                    break;
                case 41:
                    (this as any).$ = createWithExprNode($$[$0 - 4], $$[$0 - 2], lastValue);
                    break;
                case 42:
                    (this as any).$ = createObjectSeqNode(lastValue);
                    break;
                case 43:
                    (this as any).$ = addObjectToObjectSeqNode($$[$0 - 2], lastValue);
                    break;
            }
        }
        
        table: Record<number, TableRow> = tableData;
        
        defaultActions: Record<number, [number, number]> = { 2: [2, 1], 3: [2, 2], 65: [2, 3] };
        
        parseError(str: string, hash: ParseErrorHash): void {
            if (hash.recoverable) {
                this.trace(str);
            } else {
                const error = new Error(str);
                (error as any).hash = hash;
                throw error;
            }
        }
        
        parse(input: string): boolean {
            const self = this;
            let stack: number[] = [0];
            const vstack: unknown[] = [null];
            const lstack: YYLoc[] = [];
            const table = this.table;
            let yytext = '';
            let yylineno = 0;
            let yyleng = 0;
            let recovering = 0;
            const TERROR = 2;
            const EOF = 1;
            const lexer = Object.create(this.lexer) as Lexer;
            const sharedState: { yy: Record<string, unknown> } = { yy: {} };
            
            for (const k in this.yy) {
                if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
                    sharedState.yy[k] = this.yy[k];
                }
            }
            
            lexer.setInput(input, sharedState.yy);
            sharedState.yy.lexer = lexer;
            sharedState.yy.parser = this;
            
            if (typeof (lexer as any).yylloc === 'undefined') {
                (lexer as any).yylloc = {};
            }
            
            let yyloc: YYLoc = (lexer as any).yylloc;
            lstack.push(yyloc);
            const ranges = lexer.options?.ranges ?? false;
            
            if (typeof sharedState.yy.parseError === 'function') {
                this.parseError = sharedState.yy.parseError.bind(sharedState.yy) as (str: string, hash: ParseErrorHash) => void;
            }
            
            const popStack = (n: number): void => {
                stack.length = stack.length - 2 * n;
                vstack.length = vstack.length - n;
                lstack.length = lstack.length - n;
            };
            
            const lex = (): number => {
                const token = lexer.lex();
                if (typeof token !== 'number') {
                    const tokenNum = this.symbols_[token];
                    return tokenNum !== undefined ? tokenNum : token as unknown as number;
                }
                return token;
            };
            
            let symbol: number | null = null;
            let preErrorSymbol: number | null = null;
            let state: number;
            let action: number | [number, number] | undefined;
            let newState: number;
            let expected: string[];
            
            while (true) {
                state = stack[stack.length - 1];
                
                if (this.defaultActions[state]) {
                    action = this.defaultActions[state];
                } else {
                    if (symbol === null) {
                        symbol = lex();
                    }

                    const tableState = table[state];
                    const tableAction = tableState ? tableState[symbol] : undefined;

                    if (Array.isArray(tableAction)) {
                        if (tableAction.length === 2) {
                            action = tableAction as [number, number];
                        } else {
                            throw new Error(
                                `Invalid parser action array length=${tableAction.length}. Expected tuple [number, number].`
                            );
                        }
                    } else {
                        action = tableAction;
                    }
                }
                
                if (action === undefined) {
                    expected = [];
                    for (const p in table[state]) {
                        const pNum = Number(p);
                        if (this.terminals_[pNum] && pNum > TERROR) {
                            expected.push("'" + this.terminals_[pNum] + "'");
                        }
                    }
                    
                    let errStr: string;
                    if (lexer.showPosition) {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ", got '" + (this.terminals_[symbol ?? 0] ?? symbol) + "'";
                    } else {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol === EOF ? 'end of input' : "'" + (this.terminals_[symbol ?? 0] ?? symbol) + "'");
                    }
                    
                    this.parseError(errStr, {
                        text: lexer.match,
                        token: this.terminals_[symbol ?? 0] ?? (symbol !== null ? symbol.toString() : null),
                        line: lexer.yylineno,
                        loc: yyloc,
                        expected: expected
                    });
                }
                
                if (Array.isArray(action) && action.length > 1) {
                    throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
                }
                
                const actionValue = Array.isArray(action) ? action[0] : action;
                
                switch (actionValue) {
                    case 1:
                        stack.push(symbol!);
                        vstack.push(lexer.yytext);
                        lstack.push(lexer.yylloc);
                        const action1Value = Array.isArray(action) ? action[1] : action;
                        stack.push(action1Value as number);
                        symbol = null;
                        if (!preErrorSymbol) {
                            yyleng = lexer.yyleng;
                            yytext = lexer.yytext;
                            yylineno = lexer.yylineno;
                            yyloc = lexer.yylloc;
                            if (recovering > 0) {
                                recovering--;
                            }
                        } else {
                            symbol = preErrorSymbol;
                            preErrorSymbol = null;
                        }
                        break;
                    case 2:
                        const prodIndex = Array.isArray(action) ? action[1] : action;
                        if (prodIndex === undefined || prodIndex >= this.productions_.length) {
                            throw new Error(`Invalid production index: ${prodIndex}`);
                        }
                        const production = this.productions_[prodIndex];
                        if (!production) {
                            throw new Error(`Production not found at index: ${prodIndex}`);
                        }
                        const len = production[1];
                        const yyval: PerformActionContext = {};
                        yyval.$ = vstack[vstack.length - len];
                        const lastLoc = lstack[lstack.length - 1];
                        const firstLoc = lstack[lstack.length - (len || 1)];
                        yyval._$ = {
                            first_line: firstLoc?.first_line ?? lastLoc.first_line,
                            last_line: lastLoc.last_line,
                            first_column: firstLoc?.first_column ?? lastLoc.first_column,
                            last_column: lastLoc.last_column
                        };
                        if (ranges) {
                            yyval._$.range = [
                                firstLoc?.range?.[0] ?? 0,
                                lastLoc.range?.[1] ?? 0
                            ];
                        }
                        const args = Array.from(arguments).slice(1);
                        this.performAction.apply(yyval, [
                            yytext,
                            yyleng,
                            yylineno,
                            sharedState.yy,
                            prodIndex,
                            vstack,
                            lstack
                        ] as unknown as [string, number, number, Record<string, unknown>, number, unknown[], unknown[]]);
                        
                        if (len) {
                            stack = stack.slice(0, -1 * len * 2);
                            vstack.length = vstack.length - len;
                            lstack.length = lstack.length - len;
                        }
                        stack.push(production[0]);
                        vstack.push(yyval.$);
                        lstack.push(yyval._$!);
                        const nextState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                        if (nextState === undefined) {
                            throw new Error(`No transition for state ${stack[stack.length - 2]} and symbol ${stack[stack.length - 1]}`);
                        }
                        newState = nextState as number;
                        stack.push(newState);
                        break;
                    case 3:
                        return true;
                }
            }
        }
        
        lexer!: Lexer;
    }
    
    // Лексер
    const createLexer = (): Lexer => {
        let stringBuffer = '';
        
        const lexerObj: Lexer = {
            EOF: 1,
            parseError: function(this: Lexer, str: string, hash: ParseErrorHash): void {
                if (this.yy?.parser) {
                    (this.yy.parser as ParserInternal).parseError(str, hash);
                } else {
                    throw new Error(str);
                }
            },
            setInput: function(this: Lexer, input: string, yy?: Record<string, unknown>): Lexer {
                this.yy = yy || this.yy || {};
                this._input = input;
                this._more = this._backtrack = this.done = false;
                this.yylineno = this.yyleng = 0;
                this.yytext = this.matched = this.match = '';
                this.conditionStack = ['INITIAL'];
                this.yylloc = {
                    first_line: 1,
                    first_column: 0,
                    last_line: 1,
                    last_column: 0
                };
                if (this.options.ranges) {
                    this.yylloc.range = [0, 0];
                }
                this.offset = 0;
                return this;
            },
            input: function(this: Lexer): string {
                const ch = this._input[0];
                this.yytext += ch;
                this.yyleng++;
                this.offset++;
                this.match += ch;
                this.matched += ch;
                const lines = ch.match(/(?:\r\n?|\n).*/g);
                if (lines) {
                    this.yylineno++;
                    this.yylloc.last_line++;
                } else {
                    this.yylloc.last_column++;
                }
                if (this.options.ranges) {
                    this.yylloc.range![1]++;
                }
                this._input = this._input.slice(1);
                return ch;
            },
            unput: function(this: Lexer, ch: string): Lexer {
                const len = ch.length;
                const lines = ch.split(/(?:\r\n?|\n)/g);
                this._input = ch + this._input;
                this.yytext = this.yytext.substr(0, this.yytext.length - len);
                this.offset -= len;
                const oldLines = this.match.split(/(?:\r\n?|\n)/g);
                this.match = this.match.substr(0, this.match.length - 1);
                this.matched = this.matched.substr(0, this.matched.length - 1);
                if (lines.length - 1) {
                    this.yylineno -= lines.length - 1;
                }
                const r = this.yylloc.range;
                this.yylloc = {
                    first_line: this.yylloc.first_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.first_column,
                    last_column: lines ?
                        (lines.length === oldLines.length ? this.yylloc.first_column : 0) +
                        oldLines[oldLines.length - lines.length].length - lines[0].length :
                        this.yylloc.first_column - len
                };
                if (this.options.ranges && r) {
                    this.yylloc.range = [r[0], r[0] + this.yyleng - len];
                }
                this.yyleng = this.yytext.length;
                return this;
            },
            more: function(this: Lexer): Lexer {
                this._more = true;
                return this;
            },
            less: function(this: Lexer, n: number): void {
                this.unput(this.match.slice(n));
            },
            pastInput: function(this: Lexer): string {
                const past = this.matched.substr(0, this.matched.length - this.match.length);
                return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
            },
            upcomingInput: function(this: Lexer): string {
                let next = this.match;
                if (next.length < 20) {
                    next += this._input.substr(0, 20 - next.length);
                }
                return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
            },
            showPosition: function(this: Lexer): string {
                const pre = this.pastInput();
                const c = new Array(pre.length + 1).join("-");
                return pre + this.upcomingInput() + "\n" + c + "^";
            },
            test_match: function(this: Lexer, match: RegExpMatchArray | null, indexed_rule: number): TokenType | false {
                let token: TokenType | false = false;
                let backup: Partial<Lexer> | null = null;
                
                if (this.options.backtrack_lexer) {
                    backup = {
                        yylineno: this.yylineno,
                        yylloc: {
                            first_line: this.yylloc.first_line,
                            last_line: this.yylloc.last_line,
                            first_column: this.yylloc.first_column,
                            last_column: this.yylloc.last_column,
                            range: this.yylloc.range ? [...this.yylloc.range] : undefined
                        },
                        yytext: this.yytext,
                        match: this.match,
                        matched: this.matched,
                        yyleng: this.yyleng,
                        offset: this.offset,
                        _more: this._more,
                        _input: this._input,
                        yy: this.yy,
                        conditionStack: [...this.conditionStack],
                        done: this.done
                    };
                }
                
                const lines = match?.[0].match(/(?:\r\n?|\n).*/g);
                if (lines) {
                    this.yylineno += lines.length;
                }
                
                this.yylloc = {
                    first_line: this.yylloc.last_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.last_column,
                    last_column: lines ?
                        lines[lines.length - 1].length - (lines[lines.length - 1].match(/\r?\n?/)?.[0].length ?? 0) :
                        this.yylloc.last_column + (match?.[0].length ?? 0)
                };
                
                this.yytext += match?.[0] ?? '';
                this.match += match?.[0] ?? '';
                this.yyleng = this.yytext.length;
                
                if (this.options.ranges) {
                    if (!this.yylloc.range) this.yylloc.range = [0, 0];
                    this.yylloc.range = [this.offset, this.offset + this.yyleng];
                    this.offset += this.yyleng;
                }
                
                this._more = false;
                this._backtrack = false;
                this._input = this._input.slice(match?.[0].length ?? 0);
                this.matched += match?.[0] ?? '';
                
                const result = this.performAction(this.yy ?? {}, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
                if (result !== undefined && result !== null) {
                    token = result as TokenType;;
                }
                
                if (this.done && this._input) {
                    this.done = false;
                }
                
                if (token !== false) {
                    return token;
                } else if (this._backtrack && backup) {
                    Object.assign(this, backup);
                    return false;
                }
                return false;
            },
            next: function(this: Lexer): TokenType | false {
                if (this.done) {
                    return this.EOF;
                }
                if (!this._input) {
                    this.done = true;
                }
                
                let token: TokenType | false = false;
                let match: RegExpMatchArray | null = null;
                let index = 0;
                
                if (!this._more) {
                    this.yytext = '';
                    this.match = '';
                }
                
                const rules = this._currentRules();
                for (let i = 0; i < rules.length; i++) {
                    const tempMatch = this._input.match(this.rules[rules[i]]);
                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                        match = tempMatch;
                        index = i;
                        if (this.options.backtrack_lexer) {
                            token = this.test_match(tempMatch, rules[i]);
                            if (token !== false) {
                                return token;
                            } else if (this._backtrack) {
                                match = null;
                                continue;
                            } else {
                                return false;
                            }
                        } else if (!this.options.flex) {
                            break;
                        }
                    }
                }
                
                if (match) {
                    token = this.test_match(match, rules[index]);
                    if (token !== false) {
                        return token;
                    }
                    return false;
                }
                
                if (this._input === "") {
                    return this.EOF;
                } else {
                    this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                        text: "",
                        token: null,
                        line: this.yylineno
                    });
                    return this.EOF;
                }
            },
            lex: function(this: Lexer): TokenType {
                const r = this.next();
                if (r !== false && r !== undefined) {
                    return r;
                } else {
                    return this.lex();
                }
            },
            begin: function(this: Lexer, condition: string): void {
                this.conditionStack.push(condition);
            },
            popState: function(this: Lexer): string {
                const n = this.conditionStack.length - 1;
                if (n > 0) {
                    return this.conditionStack.pop()!;
                } else {
                    return this.conditionStack[0];
                }
            },
            _currentRules: function(this: Lexer): number[] {
                if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
                    return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
                } else {
                    return this.conditions["INITIAL"].rules;
                }
            },
            topState: function(this: Lexer, n?: number): string {
                const idx = this.conditionStack.length - 1 - Math.abs(n ?? 0);
                if (idx >= 0) {
                    return this.conditionStack[idx];
                } else {
                    return "INITIAL";
                }
            },
            pushState: function(this: Lexer, condition: string): void {
                this.begin(condition);
            },
            stateStackSize: function(this: Lexer): number {
                return this.conditionStack.length;
            },
            options: {},
            performAction: function(this: Lexer, yy: Record<string, unknown>, yy_: Lexer, avoiding_name_collisions: number, YY_START: string): TokenType | void {
                switch (avoiding_name_collisions) {
                    case 0: yy_.yytext = 'true'; return 22;
                    case 1: yy_.yytext = 'false'; return 23;
                    case 2: return 41;
                    case 3: return 42;
                    case 4: return 43;
                    case 5: return 29;
                    case 6: return 38;
                    case 7: return 39;
                    case 8: return 40;
                    case 9: return 36;
                    case 10: return 47;
                    case 11: return 48;
                    case 12: return 'WHERE';
                    case 13: return 46;
                    case 14: return 49;
                    case 15: return 50;
                    case 16: return 37;
                    case 17: return 17;
                    case 18: return 27;
                    case 19: return 6;
                    case 20: return 8;
                    case 21: return 44;
                    case 22: return 45;
                    case 23: return 32;
                    case 24: return 33;
                    case 25: return 34;
                    case 26: return 35;
                    case 27: return 11;
                    case 28: return 14;
                    case 29: return 16;
                    case 30: return 51;
                    case 31: return 9;
                    case 32: return 30;
                    case 33: return 31;
                    case 34: return 26;
                    case 35: return 12;
                    case 36: return 18;
                    case 37: yy_.yytext = yy_.yytext.slice(4); return 24;
                    case 38: return 13;
                    case 39: return 25;
                    case 40: stringBuffer = ''; this.begin('STRING'); return;
                    case 41: stringBuffer += yy_.yytext; return;
                    case 42: stringBuffer += '\n'; return;
                    case 43: stringBuffer += '\t'; return;
                    case 44: stringBuffer += '\\'; return;
                    case 45: throw new Error('Error: invalid escape\n');
                    case 46: throw new Error('Error: unfinished string.\n');
                    case 47: stringBuffer += '"'; return;
                    case 48: stringBuffer += "'"; return;
                    case 49: this.begin('INITIAL'); yy_.yytext = stringBuffer; return 19;
                    case 50: this.begin('INITIAL'); throw new Error('Error: expected ".\n');
                    case 51: return 21;
                    case 52: return 20;
                    case 53: return 28;
                    case 54: return;
                }
            },
            rules: [
                /^(?:true\b)/, /^(?:false\b)/, /^(?:getClass\b)/, /^(?:find\b)/,
                /^(?:findExtreme\b)/, /^(?:is\b)/, /^(?:and\b)/, /^(?:or\b)/,
                /^(?:not\b)/, /^(?:compare\b)/, /^(?:exist\b)/, /^(?:forall\b)/,
                /^(?:where\b)/, /^(?:among\b)/, /^(?:if\b)/, /^(?:with\b)/,
                /^(?:as\b)/, /^(?:class\b)/, /^(?:->)/, /^(?:\{)/, /^(?:\})/,
                /^(?:\[)/, /^(?:\])/, /^(?:==)/, /^(?:!=)/, /^(?:>=)/, /^(?:<=)/,
                /^(?:=)/, /^(?:\()/, /^(?:\))/, /^(?:,)/, /^(?:;)/, /^(?:>)/,
                /^(?:<)/, /^(?:::)/, /^(?:\+=>)/, /^(?::)/, /^(?:obj:[a-zA-Z_][A-Za-z0-9_]*)/,
                /^(?:[a-zA-Z_][A-Za-z0-9_]*)/, /^(?:\$[a-zA-Z_][A-Za-z0-9_]*)/, /^(?:")/,
                /^(?:[^\\\"\n]+)/, /^(?:\\n)/, /^(?:\\t)/, /^(?:\\\\)/, /^(?:\\[^nt\"\'\\])/,
                /^(?:\n)/, /^(?:\\")/, /^(?:\\')/, /^(?:")/, /^(?:$)/,
                /^(?:([0-9]+\.[0-9]*|[0-9]*\.[0-9]+))/, /^(?:[0-9]+)/, /^(?:\.)/, /^(?:\s+)/
            ],
            conditions: {
                "STRING": { rules: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50], inclusive: false },
                "INITIAL": { rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 51, 52, 53, 54], inclusive: true }
            },
            yylineno: 0,
            yyleng: 0,
            yytext: '',
            matched: '',
            match: '',
            offset: 0,
            done: false,
            _more: false,
            _backtrack: false,
            _input: '',
            conditionStack: [],
            yylloc: { first_line: 1, last_line: 1, first_column: 0, last_column: 0 }
        };
        
        return lexerObj;
    };
    
    const parserInstance = new ParserImpl();
    parserInstance.lexer = createLexer();
    parserInstance.table = {} as Record<number, Record<number, number | [number, number]>>;
    
    return parserInstance;
})();

// Экспорты для совместимости
export const parse = (input: string): ParseResult => {
    return parser.parse(input) as unknown as ParseResult;
};