import { parser, root } from '../utils/parser.js';
import { getTextByLocale } from '../utils/locale.js';
import { ExprType, ExpressionNode, StatementNode, ProgramNode } from '../../parser/types.js';
import { getProperties } from '../dictionaries/Utils.js';
import { markOutcome } from '../utils/tree_to_xml.js';
import * as Blockly from 'blockly';
import { PropertyItem, EditorUi } from './types.js';

// Тип для Blockly workspace
type BlocklyWorkspace = ReturnType<typeof Blockly.inject>;

// Расширение типа для JavaScript с workspaceToCode
interface BlocklyJavaScript {
    workspaceToCode(workspace: BlocklyWorkspace): string;
    valueToCode(block: Blockly.Block, name: string, order: number): string;
    readonly ORDER_ATOMIC: number;
    readonly ORDER_NONE: number;
    readonly ORDER_ASSIGNMENT: number;
    readonly ORDER_INSTANCEOF: number;
    readonly ORDER_LOGICAL_AND: number;
    readonly ORDER_LOGICAL_OR: number;
    readonly ORDER_LOGICAL_NOT: number;
    readonly ORDER_RELATIONAL: number;
}

// Приведение типа для Blockly.JavaScript
const BlocklyJS = Blockly.JavaScript as unknown as BlocklyJavaScript;

// Список возможных типов
const SemanticType = {
    OBJECT: 'object',
    CLASS: 'class',
    STRING: 'string',
    BOOLEAN: 'bool',
    INT: 'int',
    DOUBLE: 'double',
    COMPARISON_RESULT: 'comparison',
    ENUM: 'enum',
    ASSIGN: 'assign',
    PROPERTY_VALUE: 'propertyValue',
    BLOCK: 'block',
} as const;

type SemanticTypeValue = typeof SemanticType[keyof typeof SemanticType];

// Расширенный тип для узла с edges
interface EdgeCell {
    source?: NodeWithEdges;
    target?: NodeWithEdges;
}

interface NodeWithEdges {
    edges?: EdgeCell[];
}

interface TypeInfo {
    type: string;
    enum?: string;
    range?: string;
}

// Функция для определения типа выражения на верхнем уровне
export function getType(node: ProgramNode | StatementNode | ExpressionNode): SemanticTypeValue | undefined {
    if ('isBlock' in node && node.isBlock && node.block) {
        return SemanticType.BLOCK;
    } else if ('isBlock' in node && !node.isBlock && node.stmt) {
        return getType(node.stmt as StatementNode);
    } else if ('secondExpr' in node && !node.secondExpr && node.firstExpr) {
        return getType(node.firstExpr as ExpressionNode);
    } else if ('secondExpr' in node && node.secondExpr && node.firstExpr) {
        return SemanticType.ASSIGN;
    } else if ('type' in node && node.type === ExprType.IF) {
        return SemanticType.ASSIGN;
    } else if ('type' in node && node.type === ExprType.WITH) {
        return SemanticType.ASSIGN;
    } else if ('type' in node && node.type === ExprType.STRING) {
        return SemanticType.STRING;
    } else if ('type' in node && node.type === ExprType.INT) {
        return SemanticType.INT;
    } else if ('type' in node && node.type === ExprType.DOUBLE) {
        return SemanticType.DOUBLE;
    } else if ('type' in node && node.type === ExprType.ENUM) {
        return SemanticType.ENUM;
    } else if ('type' in node && (node.type === ExprType.BOOLEAN
        || node.type === ExprType.IS
        || node.type === ExprType.CHECK_REL
        || node.type === ExprType.AND
        || node.type === ExprType.OR
        || node.type === ExprType.NOT
        || node.type === ExprType.GREATER
        || node.type === ExprType.LESS
        || node.type === ExprType.GE
        || node.type === ExprType.LE
        || node.type === ExprType.EQUAL
        || node.type === ExprType.NOT_EQUAL
        || node.type === ExprType.EXIST
        || node.type === ExprType.FORALL)) {
        return SemanticType.BOOLEAN;
    } else if ('type' in node && (node.type === ExprType.VAR
        || node.type === ExprType.ID
        || node.type === ExprType.GET_BY_RELATIONSHIP
        || node.type === ExprType.FIND
        || node.type === ExprType.FIND_EXTREM
        || node.type === ExprType.OBJ_VAR
        || node.type === ExprType.CAST)) {
        return SemanticType.OBJECT;
    } else if ('type' in node && (node.type === ExprType.GET_CLASS
        || node.type === ExprType.CLASS)) {
        return SemanticType.CLASS;
    } else if ('type' in node && node.type === ExprType.PROPERTY) {
        return SemanticType.PROPERTY_VALUE;
    } else if ('type' in node && node.type === ExprType.COMPARE) {
        return SemanticType.COMPARISON_RESULT;
    } else {
        console.error("Error: unknown node type", (node as { type?: string }).type);
        return undefined;
    }
}

// Перевод блоков в код
export function generateCode(workspace: BlocklyWorkspace): string {
    const topBlocks = workspace.getTopBlocks(false);
    if (topBlocks.length > 1) {
        throw new Error(getTextByLocale("moreBlocksInWorkspace"));
    }
    let code = BlocklyJS.workspaceToCode(workspace);
    if (code.slice(-1) === "\n") {
        code = code.slice(0, -2);
    }
    return code;
}

// Получение типа узла на основе кода в нем
export function getTypeFromCode(code: string, editorUi: EditorUi): TypeInfo {
    parser.parse(code);
    const nodeType = getType(root as ProgramNode | StatementNode | ExpressionNode);
    let result: TypeInfo = { type: nodeType || '' };
    
    if (result.type === SemanticType.PROPERTY_VALUE) {
        const propertyName = (root as StatementNode)?.firstExpr?.['ident' as keyof ExpressionNode] as string;
        const properties: PropertyItem[] = getProperties(editorUi);
        const foundProp = properties.filter(el => el.name === propertyName);
        
        if (typeof foundProp[0] === "undefined") {
            throw new Error(getTextByLocale("propertyIsMissingInDict").replace("%propertyName", String(propertyName)));
        }
        
        result = { ...foundProp[0] } as unknown as TypeInfo;
        let propType = result.type;

        if (propType !== "Integer" && propType !== "Double"
            && propType !== "Boolean" && propType !== "String") {
            result.enum = propType.slice(6);
            propType = propType.slice(0, 4);
        }
        
        if (propType === "Integer") {
            propType = "int";
        }
        if (propType === "Boolean") {
            propType = "bool";
        }
        result.type = propType.toLowerCase();
    } else if (result.type === SemanticType.COMPARISON_RESULT) {
        result.enum = "comparisonResult";
        result.type = "enum";
    } else if (result.type === SemanticType.ENUM && (root as StatementNode)?.firstExpr?.type === ExprType.ENUM) {
        result.enum = (root as StatementNode)?.firstExpr?.['ident' as keyof ExpressionNode] as string || '';
    }
    
    return result;
}

// Формирование начального текста на основе выражения в узле
export function getTextFromCode(code: string, editorUi: EditorUi): string {
    if (code === "") {
        return "";
    }
    const type = getTypeFromCode(code, editorUi);
    
    if (type.type === "int" || type.type === "double") {
        return "How many ";
    } else if (type.type === "bool") {
        return "Is ";
    } else if (type.type === "enum" && type.enum !== "comparisonResult") {
        return "What is ";
    } else if (type.type === "enum" && type.enum === "comparisonResult") {
        return "Compare ";
    }
    return "";
}

// Получение текста на основе значений в стрелке
export function getTextFromValueInOutcome(value: string): string {
    if (value === "") {
        return "";
    } else if (value === "True") {
        return "Yes";
    } else if (value === "False") {
        return "No";
    }
    return value;
}

// Функция для проверки цикла в графе
export function CheckCycleInTree(startNode: NodeWithEdges, editorUi: EditorUi): void {
    if (hasCycle(startNode, editorUi)) {
        throw new Error(getTextByLocale("hasCycleInTree"));
    }
}

// Проверка на цикл в графе
function hasCycle(rootNode: NodeWithEdges, editorUi: EditorUi): boolean {
    const visited = new Set<NodeWithEdges>();
    
    function dfs(node: NodeWithEdges): boolean {
        if (!node.edges) return false;
        if (visited.has(node)) return true;

        visited.add(node);

        for (let i = 0; i < node.edges.length; i++) {
            const child = node.edges[i].target;
            if (!child) {
                throw new Error(getTextByLocale("TargetNodeIsMissing"));
            }
            if (child !== node && dfs(child)) {
                return true;
            }
        }
        return false;
    }

    return dfs(rootNode);
}

// Экранирование специальных символов
export function specialChars(str: string): string {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Валидация названий переменных
export function checkValidID(str: string): boolean {
    return /^[a-zA-Z_][A-Za-z0-9_]*$/.test(str);
}

// Проверка на уникальность элементов в массиве
export function checkUniqueValues(values: string[]): boolean {
    const setUniqueValues = new Set(values);
    const arrayUniqueValues = Array.from(setUniqueValues);
    return arrayUniqueValues.length === values.length;
}