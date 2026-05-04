import type { ExprType, StmtType } from './parser.types.js';

// TYPE ALIASES
export type ExprTypeValue = ExprType;
export type StmtTypeValue = StmtType;

// CORE AST NODE INTERFACES
export interface ASTNode {
  id: number;
  next: ASTNode | null;
}

export interface ProgramNode extends ASTNode {
  isBlock: boolean;
  block: BlockNode | null;
  stmt: StatementNode | null;
}

export interface BlockNode extends ASTNode {
  statementSeq: StatementSeq;
}

export interface StatementNode extends ASTNode {
  type: StmtType;
  firstExpr: ASTNode | null;
  secondExpr: ASTNode | null;
}

export interface StatementSeq extends ASTNode {
  first: StatementNode | null;
  last: StatementNode | null;
}

export interface ObjectSeq extends ASTNode {
  first: ExpressionNode | null;
  last: ExpressionNode | null;
}

export interface ExpressionNode extends ASTNode {
  type: ExprType | null;
  typeIdent: string | null;
  ident: string | null;
  identValue: string | null;
  rel: string | null;
  extremeIdent: string | null;
  string: string | null;
  int: number | null;
  double: number | null;
  boolean: boolean | null;
  cast: string | null;
  firstOperand: ASTNode | null;
  secondOperand: ASTNode | null;
  objectSeq: ObjectSeq | null;
}