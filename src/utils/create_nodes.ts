// Вспомогательные функции для парсинга
import {
    LASTID as globalLASTID,
    ExprType,
    StmtType,
    ExpressionNode,
    StatementNode,
    StatementSeq,
    BlockNode,
    ProgramNode,
    ObjectSeq,
    CreateAddRelationshipStmtNodeFunction,
    CreateStmtSeqNodeFunction,
    AddStmtToStmtSeqNodeFunction,
    CreateBinExprNodeFunction,
    CreateGetObjectByRelFunction,
    CreateUnaryExprNodeFunction,
    CreateCastExprNodeFunction,
    CreateLiteralFunction,
    CreateEnumFunction,
    CreateCheckRelExprNodeFunction,
    CreateGetExprNodeFunction,
    CreateFindExtremeExprNodeFunction,
    CreateQuantifierExprNodeFunction,
    CreateIfExprNodeFunction,
    CreateWithExprNodeFunction,
    CreateObjectSeqNodeFunction,
    AddObjectToObjectSeqNodeFunction,
} from '../../parser/types.js';

let LASTID = 0;

export function getNextId(): number {
    return LASTID++;
}

export function ProgramNode(statement: StatementNode | BlockNode, isBlock: boolean): ProgramNode {
    const node: ProgramNode = {
        id: LASTID++,
        isBlock,
        block: isBlock ? (statement as BlockNode) : null,
        stmt: !isBlock ? (statement as StatementNode) : null,
    };
    return node;
}

export function BlockNode(statementSeq: StatementSeq): BlockNode {
    return {
        id: LASTID++,
        statementSeq,
    };
}

export const StmtTypeConst = StmtType;

export function StatementNode(
    type: StmtType,
    firstExpression: ExpressionNode | null,
    secondExpression: ExpressionNode | null
): StatementNode {
    return {
        id: LASTID++,
        type,
        firstExpr: firstExpression,
        secondExpr: secondExpression,
        next: null,
    };
}

export function StatementSeq(first: StatementNode, last: StatementNode): StatementSeq {
    return {
        first,
        last,
    };
}

export function ExpressionNode(): ExpressionNode {
    return {
        id: LASTID++,
        type: null,
        typeIdent: null,
        ident: null,
        rel: null,
        extremeIdent: null,
        string: null,
        int: null,
        double: null,
        boolean: null,
        identValue: null,
        cast: null,
        firstOperand: null,
        secondOperand: null,
        objectSeq: null,
        next: null,
    };
}

export function ObjectSeq(first: ExpressionNode, last: ExpressionNode): ObjectSeq {
    return {
        first,
        last,
    };
}

// Функции создания узлов
export const createAddRelationshipStmtNode: CreateAddRelationshipStmtNodeFunction = (first, relationship, objectSeq) => {
    const second = ExpressionNode();
    second.type = ExprType.ID;
    second.ident = relationship;
    second.objectSeq = objectSeq;
    return StatementNode(StmtType.ADD_RELATION, first, second);
};

export const createStmtSeqNode: CreateStmtSeqNodeFunction = (stmt) => {
    return StatementSeq(stmt, stmt);
};

export const addStmtToStmtSeqNode: AddStmtToStmtSeqNodeFunction = (seqStmt, stmt) => {
    seqStmt.last.next = stmt;
    seqStmt.last = stmt;
    return seqStmt;
};

export const createBinExprNode: CreateBinExprNodeFunction = (typeNode, firstExprOperand, secondExprOperand) => {
    const newNode = ExpressionNode();
    newNode.type = typeNode;
    newNode.firstOperand = firstExprOperand;
    if (typeNode === ExprType.PROPERTY) {
        newNode.ident = secondExprOperand as string;
    } else {
        newNode.secondOperand = secondExprOperand as ExpressionNode;
    }
    return newNode;
};

export const createGetObjectByRel: CreateGetObjectByRelFunction = (firstExprOperand, relationship) => {
    const newNode = ExpressionNode();
    newNode.type = ExprType.GET_BY_RELATIONSHIP;
    newNode.rel = relationship;
    newNode.firstOperand = firstExprOperand;
    return newNode;
};

export const createUnaryExprNode: CreateUnaryExprNodeFunction = (typeNode, operand) => {
    const newNode = ExpressionNode();
    newNode.type = typeNode;
    newNode.firstOperand = operand;
    return newNode;
};

export const createCastExprNode: CreateCastExprNodeFunction = (cast, operand) => {
    const newNode = ExpressionNode();
    newNode.type = ExprType.CAST;
    newNode.firstOperand = operand;
    newNode.cast = cast;
    return newNode;
};

export const createLiteral: CreateLiteralFunction = (typeNode, literal) => {
    const newNode = ExpressionNode();
    newNode.type = typeNode;
    
    switch (typeNode) {
        case ExprType.ID:
            newNode.ident = literal as string;
            break;
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
    }
    return newNode;
};

export const createEnum: CreateEnumFunction = (idOwner, idValue) => {
    const newNode = ExpressionNode();
    newNode.type = ExprType.ENUM;
    newNode.ident = idOwner;
    newNode.identValue = idValue;
    return newNode;
};

export const createCheckRelExprNode: CreateCheckRelExprNodeFunction = (expression, relationship, objectSeq) => {
    const newNode = ExpressionNode();
    newNode.type = ExprType.CHECK_REL;
    newNode.firstOperand = expression;
    newNode.rel = relationship;
    newNode.objectSeq = objectSeq;
    return newNode;
};

export const createGetExprNode: CreateGetExprNodeFunction = (typeNode, type, id, expression) => {
    const newNode = ExpressionNode();
    newNode.type = typeNode;
    newNode.firstOperand = expression;
    newNode.typeIdent = type;
    newNode.ident = id;
    return newNode;
};

export const createFindExtremeExprNode: CreateFindExtremeExprNodeFunction = (
    extremeVarName, extremeCondition, typeVar, varName, condition
) => {
    const newNode = ExpressionNode();
    newNode.type = ExprType.FIND_EXTREM;
    newNode.extremeIdent = extremeVarName;
    newNode.firstOperand = extremeCondition;
    newNode.typeIdent = typeVar;
    newNode.ident = varName;
    newNode.secondOperand = condition;
    return newNode;
};

export const createQuantifierExprNode: CreateQuantifierExprNodeFunction = (typeNode, type, id, expression1, expression2) => {
    const newNode = ExpressionNode();
    newNode.type = typeNode;
    newNode.firstOperand = expression1;
    newNode.secondOperand = expression2;
    newNode.typeIdent = type;
    newNode.ident = id;
    return newNode;
};

export const createIfExprNode: CreateIfExprNodeFunction = (condition, expression) => {
    const newNode = ExpressionNode();
    newNode.type = ExprType.IF;
    newNode.firstOperand = condition;
    newNode.secondOperand = expression;
    return newNode;
};

export const createWithExprNode: CreateWithExprNodeFunction = (id, expression1, expression2) => {
    const newNode = ExpressionNode();
    newNode.type = ExprType.WITH;
    newNode.firstOperand = expression1;
    newNode.secondOperand = expression2;
    newNode.ident = id;
    return newNode;
};

export const createObjectSeqNode: CreateObjectSeqNodeFunction = (expr) => {
    return ObjectSeq(expr, expr);
};

export const addObjectToObjectSeqNode: AddObjectToObjectSeqNodeFunction = (seq, expr) => {
    seq.last.next = expr;
    seq.last = expr;
    return seq;
};

// Глобальные переменные (для обратной совместимости)
export let root: ProgramNode | null = null;
export let stringBuffer = '';

// Сброс LASTID (для тестирования)
export function resetLastId(): void {
    LASTID = 0;
}