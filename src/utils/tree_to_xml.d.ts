import { EditorUi, MXCell, MXGraph } from './types.js';

/**
 * Интерфейс для узла с ребрами
 */
interface NodeWithEdges {
    edges?: EdgeCell[];
    style?: string;
    value: {
        getAttribute(name: string): string | null;
        setAttribute(name: string, value: string): void;
    };
}

/**
 * Интерфейс для ребра графа
 */
interface EdgeCell {
    source?: NodeWithEdges;
    target?: NodeWithEdges;
    value: {
        getAttribute(name: string): string | null;
        setAttribute(name: string, value: string): void;
    };
}

/**
 * Преобразование дерева решений в XML
 * @param editorUi - редактор UI
 * @returns XML строка
 */
export function treeToXml(editorUi: EditorUi): string;

/**
 * Преобразование стартового узла в XML
 * @param doc - XML документ
 * @param startNode - стартовый узел
 * @param editorUi - редактор UI
 * @returns XML элемент стартового узла
 */
export function startNodeToXml(
    doc: Document,
    startNode: NodeWithEdges,
    editorUi: EditorUi
): Element;

/**
 * Получение переменных из значения узла
 * @param doc - XML документ
 * @param nodeValue - строковое значение узла
 * @returns XML элемент с переменными
 */
export function getVariables(doc: Document, nodeValue: string): Element;

/**
 * Преобразование узлов switch-case в XML
 * @param doc - XML документ
 * @param node - узел
 * @param editorUi - редактор UI
 * @returns XML элемент или null
 */
export function switchCaseNodes(
    doc: Document,
    node: NodeWithEdges,
    editorUi: EditorUi
): Element | null;

/**
 * Преобразование узла результата ветки (Истина/Ложь/Null) в XML
 * @param doc - XML документ
 * @param node - узел
 * @param resultBranch - результат (true/false/null)
 * @returns XML элемент BranchResultNode
 */
export function branchResultNodeToXml(
    doc: Document,
    node: NodeWithEdges,
    resultBranch: boolean | null
): Element;

/**
 * Преобразование узла вопроса в XML
 * @param doc - XML документ
 * @param node - узел
 * @param isSwitch - является ли switch-case узлом
 * @param editorUi - редактор UI
 * @returns XML элемент QuestionNode
 */
export function questionNodeToXml(
    doc: Document,
    node: NodeWithEdges,
    isSwitch: boolean,
    editorUi: EditorUi
): Element;

/**
 * Преобразование узла действия в XML
 * @param doc - XML документ
 * @param node - узел
 * @param editorUi - редактор UI
 * @returns XML элемент FindActionNode
 */
export function actionNodeToXml(
    doc: Document,
    node: NodeWithEdges,
    editorUi: EditorUi
): Element;

/**
 * Преобразование узла цикла "while" в XML
 * @param doc - XML документ
 * @param node - узел
 * @param editorUi - редактор UI
 * @returns XML элемент WhileCycleNode
 */
export function whileNodeToXml(
    doc: Document,
    node: NodeWithEdges,
    editorUi: EditorUi
): Element;

/**
 * Преобразование узла цикла в XML
 * @param doc - XML документ
 * @param node - узел
 * @param editorUi - редактор UI
 * @returns XML элемент CycleAggregationNode
 */
export function cycleNodeToXml(
    doc: Document,
    node: NodeWithEdges,
    editorUi: EditorUi
): Element;

/**
 * Преобразование логического узла (AND/OR/HYP) в XML
 * @param doc - XML документ
 * @param node - узел
 * @param editorUi - редактор UI
 * @returns XML элемент BranchAggregationNode
 */
export function logicNodeToXml(
    doc: Document,
    node: NodeWithEdges,
    editorUi: EditorUi
): Element;

/**
 * Преобразование узла предрешающих факторов (Mutex) в XML
 * @param doc - XML документ
 * @param node - узел
 * @param editorUi - редактор UI
 * @returns XML элемент BranchAggregationNode
 */
export function predeterminingNodeToXml(
    doc: Document,
    node: NodeWithEdges,
    editorUi: EditorUi
): Element;

/**
 * Добавление веток (outcome) к узлу
 * @param doc - XML документ
 * @param parentNode - родительский XML элемент
 * @param node - узел графа
 * @param editorUi - редактор UI
 * @returns родительский узел с добавленными ветками
 */
export function outcomeToXml(
    doc: Document,
    parentNode: Element,
    node: NodeWithEdges,
    editorUi: EditorUi
): Element;

/**
 * Подсветка ветки с ошибкой (красным цветом)
 * @param graph - граф mxGraph
 * @param cell - ячейка для подсветки
 */
export function markOutcome(graph: MXGraph, cell: MXCell): void;

/**
 * Получение информации о вопросе для ветки (ThoughtBranch)
 * @param thoughtBranchNode - XML элемент
 * @param edge - ребро графа
 * @returns XML элемент с заполненной информацией
 */
export function getQuestionInfoThoughtBranch(
    thoughtBranchNode: Element,
    edge: EdgeCell
): Element;

/**
 * Получение информации о вопросе для исхода (Outcome)
 * @param resultNode - XML элемент
 * @param edge - ребро графа
 * @returns XML элемент с заполненной информацией
 */
export function getQuestionInfoOutcome(
    resultNode: Element,
    edge: EdgeCell
): Element;

/**
 * Получение информации о вопросе для узла
 * @param resultNode - XML элемент
 * @param node - узел графа
 * @param isLogic - является ли логическим узлом
 * @returns XML элемент с заполненной информацией
 */
export function getQuestionInfoNode(
    resultNode: Element,
    node: NodeWithEdges,
    isLogic: boolean
): Element;

/**
 * Проверка корректности предрешающих веток
 * @param node - узел графа
 * @returns массив результирующих узлов
 */
export function checkCorrectPredeterminingBranch(node: NodeWithEdges): NodeWithEdges[];