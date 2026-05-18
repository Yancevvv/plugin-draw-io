// Типы для узлов AST

export let LASTID = 0;

// Типы выражений
export enum ExprType {
    ID = 'id',
    STRING = 'string',
    INT = 'int',
    DOUBLE = 'double',
    BOOLEAN = 'boolean',
    CLASS = 'class',
    OBJ_VAR = 'obj_var',
    VAR = 'var',
    ENUM = 'enum',
    GET_BY_RELATIONSHIP = 'get by relationship',
    PROPERTY = 'property',
    IS = 'is',
    GREATER = 'greater',
    LESS = 'less',
    EQUAL = 'equal',
    NOT_EQUAL = 'not equal',
    GE = 'ge',
    LE = 'le',
    COMPARE = 'compare',
    AND = 'and',
    OR = 'or',
    NOT = 'not',
    CHECK_REL = 'check_rel',
    GET_CLASS = 'get_class',
    FIND = 'find',
    FIND_EXTREM = 'find extreme',
    EXIST = 'exist',
    FORALL = 'forall',
    CAST = 'cast',
    IF = 'if',
    WITH = 'with',
}

// Типы операторов
export enum StmtType {
    EXPR = 'expr',
    ASSIGNMENT = 'assignment',
    ADD_RELATION = 'add_relation',
}

// Базовый интерфейс для узлов
export interface BaseNode {
    id: number;
}

// Expression Node
export interface ExpressionNode extends BaseNode {
    type: ExprType | null;
    typeIdent: string | null;
    ident: string | null;
    rel: string | null;
    extremeIdent: string | null;
    string: string | null;
    int: number | null;
    double: number | null;
    boolean: boolean | null;
    identValue: string | null;
    cast: ExpressionNode | null;
    firstOperand: ExpressionNode | null;
    secondOperand: ExpressionNode | null;
    objectSeq: ObjectSeq | null;
    next: ExpressionNode | null;
}

// Statement Node
export interface StatementNode extends BaseNode {
    type: StmtType;
    firstExpr: ExpressionNode | null;
    secondExpr: ExpressionNode | null;
    next: StatementNode | null;
}

// Statement Sequence
export interface StatementSeq {
    first: StatementNode;
    last: StatementNode;
}

// Block Node
export interface BlockNode extends BaseNode {
    statementSeq: StatementSeq;
}

// Program Node
export interface ProgramNode extends BaseNode {
    isBlock: boolean;
    block: BlockNode | null;
    stmt: StatementNode | null;
}

// Object Sequence
export interface ObjectSeq {
    first: ExpressionNode;
    last: ExpressionNode;
}

// Функции создания узлов
export type CreateLiteralFunction = (typeNode: ExprType, literal: string | number | boolean) => ExpressionNode;
export type CreateBinExprNodeFunction = (typeNode: ExprType, firstExprOperand: ExpressionNode, secondExprOperand: ExpressionNode | string) => ExpressionNode;
export type CreateUnaryExprNodeFunction = (typeNode: ExprType, operand: ExpressionNode) => ExpressionNode;
export type CreateCastExprNodeFunction = (cast: ExpressionNode, operand: ExpressionNode) => ExpressionNode;
export type CreateEnumFunction = (idOwner: string, idValue: string) => ExpressionNode;
export type CreateGetObjectByRelFunction = (firstExprOperand: ExpressionNode, relationship: string) => ExpressionNode;
export type CreateCheckRelExprNodeFunction = (expression: ExpressionNode, relationship: string, objectSeq: ObjectSeq) => ExpressionNode;
export type CreateGetExprNodeFunction = (typeNode: ExprType, type: string, id: string, expression: ExpressionNode) => ExpressionNode;
export type CreateFindExtremeExprNodeFunction = (extremeVarName: string, extremeCondition: ExpressionNode, typeVar: string, varName: string, condition: ExpressionNode) => ExpressionNode;
export type CreateQuantifierExprNodeFunction = (typeNode: ExprType, type: string, id: string, expression1: ExpressionNode, expression2: ExpressionNode) => ExpressionNode;
export type CreateIfExprNodeFunction = (condition: ExpressionNode, expression: ExpressionNode) => ExpressionNode;
export type CreateWithExprNodeFunction = (id: string, expression1: ExpressionNode, expression2: ExpressionNode) => ExpressionNode;
export type CreateStmtSeqNodeFunction = (stmt: StatementNode) => StatementSeq;
export type AddStmtToStmtSeqNodeFunction = (seqStmt: StatementSeq, stmt: StatementNode) => StatementSeq;
export type CreateObjectSeqNodeFunction = (expr: ExpressionNode) => ObjectSeq;
export type AddObjectToObjectSeqNodeFunction = (seq: ObjectSeq, expr: ExpressionNode) => ObjectSeq;
export type CreateAddRelationshipStmtNodeFunction = (first: ExpressionNode, relationship: string, objectSeq: ObjectSeq) => StatementNode;