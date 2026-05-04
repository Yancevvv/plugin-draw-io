import type {
  ASTNode,
  ProgramNode,
  BlockNode,
  StatementNode,
  StatementSeq,
  ExpressionNode,
  ObjectSeq,
} from './create_nodes.types.js';

import { ExprType, StmtType } from './parser.types.js';

// GLOBAL STATE

let LASTID = 0;

// CLASS DEFINITIONS

export class ProgramNodeImpl implements ProgramNode {
  id: number;
  next: ASTNode | null = null;
  isBlock: boolean;
  block: BlockNode | null;
  stmt: StatementNode | null;

  constructor(statement: ASTNode | null, isBlock: boolean) {
    this.id = LASTID++;
    this.isBlock = isBlock;
    if (isBlock) {
      this.block = statement as BlockNode | null;
      this.stmt = null;
    } else {
      this.block = null;
      this.stmt = statement as StatementNode | null;
    }
  }
}

export class BlockNodeImpl implements BlockNode {
  id: number;
  next: ASTNode | null = null;
  statementSeq: StatementSeq;

  constructor(statementSeq: StatementSeq) {
    this.id = LASTID++;
    this.statementSeq = statementSeq;
  }
}

export class StatementNodeImpl implements StatementNode {
  id: number;
  next: ASTNode | null = null;
  type: StmtType;
  firstExpr: ASTNode | null;
  secondExpr: ASTNode | null;

  constructor(type: StmtType, firstExpression: ASTNode | null, secondExpression: ASTNode | null) {
    this.id = LASTID++;
    this.type = type;
    this.firstExpr = firstExpression;
    this.secondExpr = secondExpression;
  }
}

export class StatementSeqImpl implements StatementSeq {
  id: number;
  next: ASTNode | null = null;
  first: StatementNode | null;
  last: StatementNode | null;

  constructor(first: StatementNode | null, last: StatementNode | null) {
    this.id = LASTID++;
    this.first = first;
    this.last = last;
  }
}

export class ExpressionNodeImpl implements ExpressionNode {
  id: number;
  next: ASTNode | null = null;
  type: ExprType | null = null;
  typeIdent: string | null = null;
  ident: string | null = null;
  identValue: string | null = null;
  rel: string | null = null;
  extremeIdent: string | null = null;
  string: string | null = null;
  int: number | null = null;
  double: number | null = null;
  boolean: boolean | null = null;
  cast: string | null = null;
  firstOperand: ASTNode | null = null;
  secondOperand: ASTNode | null = null;
  objectSeq: ObjectSeq | null = null;

  constructor() {
    this.id = LASTID++;
  }
}

export class ObjectSeqImpl implements ObjectSeq {
  id: number;
  next: ASTNode | null = null;
  first: ExpressionNode | null;
  last: ExpressionNode | null;

  constructor(first: ExpressionNode | null, last: ExpressionNode | null) {
    this.id = LASTID++;
    this.first = first;
    this.last = last;
  }
}

// FACTORY FUNCTIONS

export function createProgramNode(statement: ASTNode | null, isBlock: boolean): ProgramNode {
  return new ProgramNodeImpl(statement, isBlock);
}

export function createBlockNode(statementSeq: StatementSeq): BlockNode {
  return new BlockNodeImpl(statementSeq);
}

export function createStatementNode(
  type: StmtType,
  firstExpression: ASTNode | null,
  secondExpression: ASTNode | null
): StatementNode {
  return new StatementNodeImpl(type, firstExpression, secondExpression);
}

export function createStatementSeq(first: StatementNode | null, last: StatementNode | null): StatementSeq {
  return new StatementSeqImpl(first, last);
}

export function createExpressionNode(): ExpressionNode {
  return new ExpressionNodeImpl();
}

export function createObjectSeq(first: ExpressionNode | null, last: ExpressionNode | null): ObjectSeq {
  return new ObjectSeqImpl(first, last);
}

// FACTORY FUNCTIONS — STATEMENTS

export function createAddRelationshipStmtNode(
  first: ASTNode,
  relationship: string,
  objectSeq: ObjectSeq
): StatementNode {
  const second = createExpressionNode();
  second.type = ExprType.ID;
  second.ident = relationship;
  second.objectSeq = objectSeq;
  return createStatementNode(StmtType.ADD_RELATIONSHIP, first, second);
}

export function createStmtSeqNode(stmt: StatementNode): StatementSeq {
  return createStatementSeq(stmt, stmt);
}

export function addStmtToStmtSeqNode(seqStmt: StatementSeq, stmt: StatementNode): StatementSeq {
  if (seqStmt.last) {
    seqStmt.last.next = stmt;
  }
  seqStmt.last = stmt;
  return seqStmt;
}

// FACTORY FUNCTIONS — EXPRESSIONS

export function createBinExprNode(
  typeNode: ExprType,
  firstExprOperand: ASTNode,
  secondExprOperand: ASTNode | string
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = typeNode;
  newNode.firstOperand = firstExprOperand;
  
  if (typeNode === ExprType.PROPERTY && typeof secondExprOperand === 'string') {
    newNode.ident = secondExprOperand;
  } else {
    newNode.secondOperand = secondExprOperand as ASTNode;
  }
  
  return newNode;
}

export function createGetObjectByRel(
  firstExprOperand: ASTNode,
  relationship: string
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = ExprType.GET_BY_RELATIONSHIP;
  newNode.rel = relationship;
  newNode.firstOperand = firstExprOperand;
  return newNode;
}

export function createUnaryExprNode(
  typeNode: ExprType,
  operand: ASTNode
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = typeNode;
  newNode.firstOperand = operand;
  return newNode;
}

export function createCastExprNode(
  cast: string,
  operand: ASTNode
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = ExprType.CAST;
  newNode.firstOperand = operand;
  newNode.cast = cast;
  return newNode;
}

export function createLiteral(
  typeNode: ExprType,
  literal: string | number | boolean
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = typeNode;
  
  switch (typeNode) {
    case ExprType.ID:
    case ExprType.CLASS:
      newNode.ident = literal as string;
      break;
    case ExprType.OBJ_VAR:
      newNode.ident = (literal as string).substring(4);
      break;
    case ExprType.VAR:
      newNode.ident = (literal as string).substring(1);
      break;
    case ExprType.STRING:
      newNode.string = literal as string;
      break;
    case ExprType.INT:
      newNode.int = Number(literal);
      break;
    case ExprType.DOUBLE:
      newNode.double = Number(literal);
      break;
    case ExprType.BOOLEAN:
      newNode.boolean = literal as boolean;
      break;
    default:
      break;
  }
  
  return newNode;
}

export function createEnum(
  idOwner: string,
  idValue: string
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = ExprType.ENUM;
  newNode.ident = idOwner;
  newNode.identValue = idValue;
  return newNode;
}

export function createCheckRelExprNode(
  expression: ASTNode,
  relationship: string,
  objectSeq: ObjectSeq
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = ExprType.CHECK_REL;
  newNode.firstOperand = expression;
  newNode.rel = relationship;
  newNode.objectSeq = objectSeq;
  return newNode;
}

export function createGetExprNode(
  typeNode: ExprType,
  type: string,
  id: string,
  expression: ASTNode
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = typeNode;
  newNode.firstOperand = expression;
  newNode.typeIdent = type;
  newNode.ident = id;
  return newNode;
}

export function createFindExtremeExprNode(
  extremeVarName: string,
  extremeCondition: ASTNode,
  typeVar: string,
  varName: string,
  condition: ASTNode
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = ExprType.FIND_EXTREM;
  newNode.extremeIdent = extremeVarName;
  newNode.firstOperand = extremeCondition;
  newNode.typeIdent = typeVar;
  newNode.ident = varName;
  newNode.secondOperand = condition;
  return newNode;
}

export function createQuantifierExprNode(
  typeNode: ExprType,
  type: string,
  id: string,
  expression1: ASTNode,
  expression2: ASTNode
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = typeNode;
  newNode.firstOperand = expression1;
  newNode.secondOperand = expression2;
  newNode.typeIdent = type;
  newNode.ident = id;
  return newNode;
}

export function createIfExprNode(
  condition: ASTNode,
  expression: ASTNode
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = ExprType.IF;
  newNode.firstOperand = condition;
  newNode.secondOperand = expression;
  return newNode;
}

export function createWithExprNode(
  id: string,
  expression1: ASTNode,
  expression2: ASTNode
): ExpressionNode {
  const newNode = createExpressionNode();
  newNode.type = ExprType.WITH;
  newNode.firstOperand = expression1;
  newNode.secondOperand = expression2;
  newNode.ident = id;
  return newNode;
}

export function createObjectSeqNode(expr: ExpressionNode): ObjectSeq {
  return createObjectSeq(expr, expr);
}

export function addObjectToObjectSeqNode(
  seq: ObjectSeq,
  expr: ExpressionNode
): ObjectSeq {
  if (seq.last) {
    seq.last.next = expr;
  }
  seq.last = expr;
  return seq;
}

// GLOBAL EXPORTS (для обратной совместимости с parser)

export let root: ProgramNode | null = null;
export let stringBuffer: string = '';

// HELPER: Сброс ID (для тестов)

export function resetIdCounter(): void {
  LASTID = 0;
}