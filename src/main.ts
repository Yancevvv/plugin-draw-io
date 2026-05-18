import { getTextByLocale, type LocaleText } from './utils/locale.js';
import { toolbox } from './utils/blocks.js';
import { ClassConstructorWindow, type ClassConstructorWindow as ClassConstructorWindowType } from './dictionaries/ClassConstructor.js';
import { ClassEditorWindow } from './dictionaries/ClassEditor.js';
import { ClassPropertiesConstructorWindow } from './dictionaries/ClassPropertiesConstructor.js';
import { ClassPropertiesEditorWindow } from './dictionaries/ClassPropertiesEditor.js';
import { EnumConstructorWindow } from './dictionaries/EnumConstructor.js';
import { EnumEditorWindow } from './dictionaries/EnumEditor.js';
import { RelationshipsConstructorWindow } from './dictionaries/RelationshipsConstructor.js';
import { RelationshipsEditorWindow } from './dictionaries/RelationshipsEditor.js';
import { StartConstructorWindow } from './tree_nodes/StartNodeConstructor.js';
import { StartEditorWindow } from './tree_nodes/StartNodeEditor.js';
import { ActionNodeConstructorWindow } from './tree_nodes/ActionNodeConstructor.js';
import { ActionNodeEditorWindow } from './tree_nodes/ActionNodeEditor.js';
import { BranchResultNodeConstructorWindow } from './tree_nodes/BranchResultNodeContructor.js';
import { BranchResultNodeEditorWindow } from './tree_nodes/BranchResultNodeEditor.js';
import { ConditionNodeConstructorWindow } from './tree_nodes/ConditionNodeConstructor.js';
import { ConditionNodeEditorWindow } from './tree_nodes/ConditionNodeEditor.js';
import { ConvertToActionNode } from './tree_nodes/ConvertToActionNode.js';
import { ConvertToCycleNode } from './tree_nodes/ConvertToCycleNode.js';
import { ConvertToFalseNode } from './tree_nodes/ConvertToFalseNode.js';
import { ConvertToLogicNode } from './tree_nodes/ConvertToLogicNode.js';
import { ConvertToPredeterminingFactorsNode } from './tree_nodes/ConvertToPredeterminingFactorsNode.js';
import { ConvertToQuestionNode } from './tree_nodes/ConvertToQuestionNode.js';
import { ConvertToStartNode } from './tree_nodes/ConvertToStartNode.js';
import { ConvertToSwitchCaseNode } from './tree_nodes/ConvertToSwitchCaseNode.js';
import { ConvertToTrueNode } from './tree_nodes/ConvertToTrueNode.js';
import { ConvertToUncertaintyNode } from './tree_nodes/ConvertToUncertaintyNode.js';
import { CycleNodeConstructorWindow } from './tree_nodes/CycleNodeConstructor.js';
import { CycleNodeEditorWindow } from './tree_nodes/CycleNodeEditor.js';
import { EditTextInNodeWindow } from './tree_nodes/EditTextInNode.js';
import { EditValueInOutcomeWindow } from './tree_nodes/EditValueInOutcome.js';
import { LogicNodeConstructorWindow } from './tree_nodes/LogicNodeConstructor.js';
import { LogicNodeEditorWindow } from './tree_nodes/LogicNodeEditor.js';
import { PredeterminingFactorsNodeConstructorWindow } from './tree_nodes/PredeterminingFactorsNodeConstructor.js';
import { PredeterminingFactorsNodeEditorWindow } from './tree_nodes/PredeterminingFactorsNodeEditor.js';
import { EditQuestionInfoInNodeWindow } from './tree_nodes/QuestionInfoInNodeEditor.js';
import { EditQuestionInfoInOutcomeWindow } from './tree_nodes/QuestionInfoInOutcome.js';
import { SwitchCaseNodeConstructorWindow } from './tree_nodes/SwitchCaseNodeConstructor.js';
import { SwitchCaseNodeEditorWindow } from './tree_nodes/SwitchCaseNodeEditor.js';
import { WhileNodeConstructorWindow } from './tree_nodes/WhileNodeConstructor.js';
import { WhileNodeEditorWindow } from './tree_nodes/WhileNodeEditor.js';
import { getEnums, getClasses, getProperties, getRelationships } from './dictionaries/Utils.js';
import { exportEnums, exportClasses, exportProperties, exportRelastionships } from './export/Export.js';
import { treeToXml } from './utils/tree_to_xml.js';
import * as Blockly from 'blockly';

// Импорт типов
import type { 
    EditorUi, 
    MXGraph, 
    MXCell, 
    MxWindow,
    BlocklyWorkspace,
    MXCellValue
} from './utils/types.js';

// Расширенные типы для плагина

declare const mxResources: {
    parse(str: string): void;
    get(key: string, params?: string[], fallback?: string): string;
};

/** Тип для конструктора окна */
type WindowConstructor<T = { window: MxWindow }> = (
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
) => T;

/** Тип для конструктора редактора узла */
type NodeEditorConstructor<T = { window: MxWindow }> = (
    cell: MXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
) => T;

/** Тип для конструктора редактора ветки */
type OutcomeEditorConstructor<T = { window: MxWindow }> = (
    cell: MXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
) => T;

/** Тип для конструктора результата ветки */
type BranchResultConstructor<T = { window: MxWindow }> = (
    editorUi: EditorUi,
    result: boolean | null,
    x: number,
    y: number,
    w: number,
    h: number
) => T;

/** Тип для конструктора конвертации */
type ConvertConstructor = (
    cell: MXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
) => void;

/** Расширенный интерфейс MXGraph с методами выборки */
interface ExtendedMXGraph extends MXGraph {
    getSelectionCount(): number;
    getSelectionCell(): MXCell & { edge?: boolean; style?: string; value: unknown };
}

/** Расширенная ячейка с ребрами */
interface ExtendedMXCell extends MXCell {
    edge?: boolean;
    style?: string;
}

/** EditorUi с дополнительными свойствами для окон плагина */
export interface PluginEditorUi extends EditorUi {
    editor: {
        graph: ExtendedMXGraph;
    };
    // Окна конструкторов
    classConstructorWindow?: ReturnType<WindowConstructor>;
    classPropertiesConstructorWindow?: ReturnType<WindowConstructor>;
    enumConstructorWindow?: ReturnType<WindowConstructor>;
    relationshipsConstructorWindow?: ReturnType<WindowConstructor>;
    startConstructorWindow?: ReturnType<WindowConstructor>;
    branchResultNodeConstructorWindow?: ReturnType<BranchResultConstructor>;
    logicNodeConstructorWindow?: ReturnType<WindowConstructor>;
    predeterminingFactorsNodeConstructorWindow?: ReturnType<WindowConstructor>;
    actionNodeConstructorWindow?: ReturnType<WindowConstructor>;
    cycleNodeConstructorWindow?: ReturnType<WindowConstructor>;
    whileNodeConstructorWindow?: ReturnType<WindowConstructor>;
    conditionNodeConstructorWindow?: ReturnType<WindowConstructor>;
    switchCaseNodeConstructorWindow?: ReturnType<WindowConstructor>;
    
    // Окна редакторов
    classEditorWindow?: ReturnType<NodeEditorConstructor>;
    classPropertiesEditorWindow?: ReturnType<NodeEditorConstructor>;
    enumEditorWindow?: ReturnType<NodeEditorConstructor>;
    relationshipsEditorWindow?: ReturnType<NodeEditorConstructor>;
    startEditorWindow?: ReturnType<NodeEditorConstructor>;
    branchResultNodeEditorWindow?: ReturnType<NodeEditorConstructor>;
    logicNodeEditorWindow?: ReturnType<NodeEditorConstructor>;
    predeterminingFactorsNodeEditorWindow?: ReturnType<NodeEditorConstructor>;
    actionNodeEditorWindow?: ReturnType<NodeEditorConstructor>;
    cycleNodeEditorWindow?: ReturnType<NodeEditorConstructor>;
    whileNodeEditorWindow?: ReturnType<NodeEditorConstructor>;
    conditionNodeEditorWindow?: ReturnType<NodeEditorConstructor>;
    switchCaseNodeEditorWindow?: ReturnType<NodeEditorConstructor>;
    
    // Другие окна
    editTextInNodeWindow?: ReturnType<NodeEditorConstructor>;
    editValueInOutcomeWindow?: ReturnType<OutcomeEditorConstructor>;
    editQuestionInfoInNodeWindow?: ReturnType<NodeEditorConstructor>;
    editQuestionInfoInOutcomeWindow?: ReturnType<OutcomeEditorConstructor>;
    
    // Конвертеры
    convertToQuestionNode?: void;
    
    // Действия
    actions: {
        addAction(name: string, handler: (this: PluginEditorUi) => void): void;
    };
    menus: {
        addMenuItem(menu: unknown, itemId: string): void;
    };
    menubar: {
        addMenu(
            label: string, 
            builder: (menu: unknown, parent: unknown) => void, 
            statusContainer: unknown
        ): void;
        editorUi: PluginEditorUi;
        statusContainer: unknown;
    };
    sidebar: {
        container: HTMLElement;
    };
}

// Вспомогательные функции


/**
 * Скачивание файла
 */
function downloadAsFile(data: string, filename: string, mimeType: string): void {
    const a = document.createElement("a");
    const file = new Blob([data], { type: mimeType });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 100);
}

/**
 * Type guard для проверки типа значения ячейки
 */
function isMXCellValue(value: unknown): value is MXCellValue {
    return typeof value === 'object' && value !== null && 'getAttribute' in value;
}

/**
 * Безопасное получение атрибута из ячейки
 */
function getCellAttribute(cell: MXCell, attr: string): string | null {
    if (isMXCellValue(cell.value)) {
        return cell.value.getAttribute(attr);
    }
    return null;
}

/**
 * Проверка стиля ячейки
 */
function hasCellStyle(cell: MXCell, style: string): boolean {
    const extendedCell = cell as ExtendedMXCell;
    return extendedCell.style === style;
}

/**
 * Проверка, является ли ячейка ребром
 */
function isCellEdge(cell: MXCell): boolean {
    const extendedCell = cell as ExtendedMXCell;
    return !!extendedCell.edge;
}

// Основная функция плагина

/**
 * Загрузка плагина в draw.io
 */
export function loadPlugin(): void {
    // Проверка среды выполнения
    const draw = (window as { Draw?: { loadPlugin: (callback: (ui: PluginEditorUi) => void) => void } }).Draw;
    if (typeof window === 'undefined' || !draw) {
        return;
    }
    
    draw.loadPlugin(function (ui: PluginEditorUi): void {
        const graph: ExtendedMXGraph = ui.editor.graph;

        // Настройка sidebar
        const sidebarContainer = ui.sidebar.container;
        if (sidebarContainer.firstChild instanceof HTMLElement) {
            sidebarContainer.firstChild.click();
        }
        if (sidebarContainer.lastChild) {
            sidebarContainer.insertBefore(sidebarContainer.lastChild, sidebarContainer.firstChild);
            sidebarContainer.insertBefore(sidebarContainer.lastChild, sidebarContainer.firstChild);
        }

        // Добавление пунктов меню
        
        const addMenuSection = (label: string, items: string[]): void => {
            ui.menubar.addMenu(label, (menu: unknown) => {
                items.forEach(item => ui.menus.addMenuItem(menu, item));
            }, ui.menubar.editorUi);
        };

        addMenuSection(getTextByLocale("menuItemDictionaryConstructors"), [
            'classesConstructor', 'classPropertiesConstructor', 
            'relationshipsConstructor', 'enumConstructor'
        ]);

        addMenuSection(getTextByLocale("menuItemNodeConstructors"), [
            'startNodeConstructor', 'TrueNodeCreate', 'FalseNodeCreate', 'LogicNodeCreate',
            'PredeterminingFactorsNodeCreate', 'UncertaintyNodeCreate', 'actionNodeConstructor',
            'cycleNodeConstructor', 'whileNodeConstructor', 'conditionNodeConstructor', 'switchCaseNodeConstructor'
        ]);

        addMenuSection(getTextByLocale("menuItemExport"), [
            'exportClass', 'exportProperty', 'exportRelationship', 'exportEnum', 'exportTree'
        ]);

        addMenuSection(getTextByLocale("menuItemEdit"), [
            'editValue', 'editTextInNode', 'editQuestionInfo'
        ]);

        addMenuSection(getTextByLocale("menuItemConverNode"), [
            'convertStartNode', 'convertTrueNode', 'convertFalseNode', 'convertLogicNode',
            'convertPredeterminingFactorsNode', 'convertUncertaintyNode', 'convertActionNode',
            'convertCycleNode', 'convertConditionNode', 'convertSwitchCaseNode'
        ]);

        // Привязка локаоизации к действиям
        
        const parseResource = (key: keyof LocaleText): void => {
            mxResources.parse(`${key}=${getTextByLocale(key)}`);
        };

        const resourceKeys: (keyof LocaleText)[] = [
            "classesConstructor", "classPropertiesConstructor", "relationshipsConstructor", "enumConstructor",
            "actionNodeConstructor", "cycleNodeConstructor", "whileNodeConstructor", "conditionNodeConstructor",
            "switchCaseNodeConstructor", "exportEnum", "exportClass", "exportProperty", "exportRelationship",
            "exportTree", "TrueNodeCreate", "FalseNodeCreate", "LogicNodeCreate", "PredeterminingFactorsNodeCreate",
            "UncertaintyNodeCreate", "startNodeConstructor", "editValue", "editTextInNode", "editQuestionInfo",
            "convertStartNode", "convertTrueNode", "convertFalseNode", "convertLogicNode",
            "convertPredeterminingFactorsNode", "convertUncertaintyNode", "convertActionNode", "convertCycleNode",
            "convertConditionNode", "convertSwitchCaseNode"
        ];
        
        resourceKeys.forEach(parseResource);

        // Вспомогательные функции для окон
        
        const showWindow = <T extends { window: MxWindow }>(
            existingWindow: T | undefined,
            windowFactory: () => T
        ): T => {
            if (!existingWindow?.window?.content) {
                const newWindow = windowFactory();
                newWindow.window.setVisible(true);
                return newWindow;
            }
            return existingWindow;
        };

        const showConstructorWindow = <T extends { window: MxWindow }>(
            context: PluginEditorUi,
            key: keyof PluginEditorUi,
            factory: () => T
        ): void => {
            const existing = context[key] as T | undefined;
            const newWindow = showWindow(existing, factory);
            (context[key] as T) = newWindow;
        };

        // Действия: конструкторы словарей

        ui.actions.addAction('classesConstructor', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'classConstructorWindow', () => {
                return ClassConstructorWindow.call(
                    this, 
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                );
            });
        });

        ui.actions.addAction('classPropertiesConstructor', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'classPropertiesConstructorWindow', () => {
                return ClassPropertiesConstructorWindow.call(
                    this, 
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                );
            });
        });

        ui.actions.addAction('enumConstructor', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'enumConstructorWindow', () => {
                return EnumConstructorWindow.call(
                    this, 
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                )
            });
        });

        ui.actions.addAction('relationshipsConstructor', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'relationshipsConstructorWindow', () => {
                return RelationshipsConstructorWindow.call(
                    this, 
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                )
            });
        });

        ui.actions.addAction('startNodeConstructor', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'startConstructorWindow', () => {
                return StartConstructorWindow.call(
                    this, 
                    (document.body.offsetWidth - 880) / 2, 
                    120, 
                    900, 
                    550
                )
            });
        });

        ui.actions.addAction('TrueNodeCreate', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'branchResultNodeConstructorWindow', () => {
                return BranchResultNodeConstructorWindow.call(
                    this, true,
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                )
            });
        });

        ui.actions.addAction('FalseNodeCreate', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'branchResultNodeConstructorWindow', () => {
                return BranchResultNodeConstructorWindow.call(
                    this, false,
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                )
            });
        });

        ui.actions.addAction('LogicNodeCreate', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'logicNodeConstructorWindow', () => {
                return LogicNodeConstructorWindow.call(
                    this, 
                    (document.body.offsetWidth - 880) / 2, 
                    120, 
                    300, 
                    150
                )
            });
        });

        ui.actions.addAction('PredeterminingFactorsNodeCreate', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'predeterminingFactorsNodeConstructorWindow', () => {
                return PredeterminingFactorsNodeConstructorWindow.call(
                    this, 
                    (document.body.offsetWidth - 880) / 2, 
                    120, 
                    600, 
                    150
                )
            });
        });

        ui.actions.addAction('UncertaintyNodeCreate', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'branchResultNodeConstructorWindow', () => {
                return BranchResultNodeConstructorWindow.call(
                    this, null,
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                )
            });
        });

        ui.actions.addAction('actionNodeConstructor', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'actionNodeConstructorWindow', () => {
                return ActionNodeConstructorWindow.call(
                    this, 
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                )
            });
        });

        ui.actions.addAction('cycleNodeConstructor', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'cycleNodeConstructorWindow', () => {
                return CycleNodeConstructorWindow.call(
                    this, 
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                )
            });
        });

        ui.actions.addAction('whileNodeConstructor', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'whileNodeConstructorWindow', () => {
                return WhileNodeConstructorWindow.call(
                    this, 
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                )
            });
        });

        ui.actions.addAction('conditionNodeConstructor', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'conditionNodeConstructorWindow', () => {
                return ConditionNodeConstructorWindow.call(
                    this, 
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                )
            });
        });

        ui.actions.addAction('switchCaseNodeConstructor', function(this: PluginEditorUi): void {
            showConstructorWindow(this, 'switchCaseNodeConstructorWindow', () => {
                return SwitchCaseNodeConstructorWindow.call(
                    this, 
                    document.body.offsetLeft + 100, 
                    document.body.offsetTop + 100, 
                    window.screen.width - 200, 
                    window.screen.height - 300
                )
            });
        });

        // Действия: экспорт

        ui.actions.addAction('exportEnum', () => {
            const text = exportEnums(getEnums(ui));
            downloadAsFile(text, "enums.csv", "text/csv");
        });

        ui.actions.addAction('exportClass', () => {
            const text = exportClasses(getClasses(ui), globalWS);
            downloadAsFile(text, "classes.csv", "text/csv");
        });

        ui.actions.addAction('exportProperty', () => {
            const text = exportProperties(getProperties(ui));
            downloadAsFile(text, "properties.csv", "text/csv");
        });

        ui.actions.addAction('exportRelationship', () => {
            const text = exportRelastionships(getRelationships(ui));
            downloadAsFile(text, "relationships.csv", "text/csv");
        });

        ui.actions.addAction('exportTree', () => {
            const text = treeToXml(ui);
            downloadAsFile(text, "tree.xml", "application/xml");
        });

        // Действие: редактирование значения

        ui.actions.addAction('editValue', function(this: PluginEditorUi): void {
            if (!graph.isEnabled() || graph.getSelectionCount() !== 1) return;
            
            const selectedCell = graph.getSelectionCell();
            if (!selectedCell?.value) return;

            const cellValue = selectedCell.value;
            const cellStyle = selectedCell.style;

            // Утилита для открытия редактора
            const openEditor = <T extends { window: MxWindow }>(
                storageKey: keyof PluginEditorUi,
                editorFactory: () => T
            ): void => {
                const existing = this[storageKey] as T | undefined;
                if (!existing?.window?.content) {
                    const editor = editorFactory();
                    editor.window.setVisible(true);
                    (this[storageKey] as T) = editor;
                }
            };

            // Condition node
            if (typeof cellValue === 'object' && cellValue !== null && 
                hasCellStyle(selectedCell, "ellipse;whiteSpace=wrap;html=1;rounded=0;editable=0;")) {
                openEditor('conditionNodeEditorWindow', () => {
                    return ConditionNodeEditorWindow.call(selectedCell, this, 
                        document.body.offsetLeft + 100, document.body.offsetTop + 100, 
                        window.screen.width - 200, window.screen.height - 300
                    )
                });
            }
            // Action node
            else if (typeof cellValue === 'object' && cellValue !== null && 
                     hasCellStyle(selectedCell, "rounded=1;whiteSpace=wrap;html=1;fontFamily=Helvetica;fontSize=12;editable=0;")) {
                openEditor('actionNodeEditorWindow', () => {
                    return ActionNodeEditorWindow.call(selectedCell, this,
                        document.body.offsetLeft + 100, document.body.offsetTop + 100,
                        window.screen.width - 200, window.screen.height - 300
                    )
                });
            }
            // While node
            else if (typeof cellValue === 'object' && cellValue !== null &&
                     getCellAttribute(selectedCell, 'operator') && 
                     getCellAttribute(selectedCell, 'typeCycle')) {
                openEditor('whileNodeEditorWindow', () => {
                    return WhileNodeEditorWindow.call(selectedCell, this,
                        document.body.offsetLeft + 100, document.body.offsetTop + 100,
                        window.screen.width - 200, window.screen.height - 300
                    )
                });
            }
            // Cycle node
            else if (typeof cellValue === 'object' && cellValue !== null &&
                     getCellAttribute(selectedCell, 'operator')) {
                openEditor('cycleNodeEditorWindow', () => {
                    return CycleNodeEditorWindow.call(selectedCell, this,
                        document.body.offsetLeft + 100, document.body.offsetTop + 100,
                        window.screen.width - 200, window.screen.height - 300
                    )
                });
            }
            // Switch case node
            else if (typeof cellValue === 'object' && cellValue !== null &&
                     hasCellStyle(selectedCell, "rhombus;whiteSpace=wrap;html=1;editable=0;")) {
                openEditor('switchCaseNodeEditorWindow', () => {
                    return SwitchCaseNodeEditorWindow.call(selectedCell, this,
                        document.body.offsetLeft + 100, document.body.offsetTop + 100,
                        window.screen.width - 200, window.screen.height - 300
                    )
                });
            }
            // Start node
            else if (typeof cellValue === 'object' && cellValue !== null &&
                     getCellAttribute(selectedCell, 'type') === "START") {
                openEditor('startEditorWindow', () => {
                    return StartEditorWindow.call(selectedCell, this,
                        (document.body.offsetWidth - 880) / 2, 120, 900, 550
                    )
                });
            }
            // Predetermining factors node
            else if (typeof cellValue === 'object' && cellValue !== null &&
                     getCellAttribute(selectedCell, 'type') === "predetermining") {
                openEditor('predeterminingFactorsNodeEditorWindow', () => {
                    return PredeterminingFactorsNodeEditorWindow.call(selectedCell, this,
                        (document.body.offsetWidth - 880) / 2, 120, 600, 150
                    )
                });
            }
            // Logic node (AND/OR)
            else if (typeof cellValue === 'object' && cellValue !== null &&
                     (getCellAttribute(selectedCell, 'type') === "AND" || getCellAttribute(selectedCell, 'type') === "OR")) {
                openEditor('logicNodeEditorWindow', () => {
                    return LogicNodeEditorWindow.call(selectedCell, this,
                        (document.body.offsetWidth - 880) / 2, 120, 300, 150
                    )
                });
            }
            // Branch result nodes (True/False/Uncertainty)
            else if (typeof cellValue === 'object' && cellValue !== null &&
                     (hasCellStyle(selectedCell, "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;editable=0;") ||
                      hasCellStyle(selectedCell, "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;editable=0;") ||
                      hasCellStyle(selectedCell, "rounded=1;whiteSpace=wrap;html=1;fillColor=#e6e6e6;strokeColor=#666666;editable=0;"))) {
                openEditor('branchResultNodeEditorWindow', () => {
                    return BranchResultNodeEditorWindow.call(selectedCell, this,
                        document.body.offsetLeft + 100, document.body.offsetTop + 100,
                        window.screen.width - 200, window.screen.height - 300
                    )
                });
            }
            // Class dictionary
            else if (typeof cellValue === 'object' && cellValue !== null &&
                     getCellAttribute(selectedCell, 'label')?.startsWith('<font color="#000000"><b>Classes</b></font>')) {
                openEditor('classEditorWindow', () => {
                    return ClassEditorWindow.call(selectedCell, this,
                        document.body.offsetLeft + 100, document.body.offsetTop + 100,
                        window.screen.width - 200, window.screen.height - 300
                    )
                });
            }
            // Enum dictionary (string value)
            else if (typeof cellValue === 'string' &&
                     cellValue.startsWith('<font color="#000000"><b>Enum</b></font>')) {
                openEditor('enumEditorWindow', () => {
                    return EnumEditorWindow.call(selectedCell, this,
                        document.body.offsetLeft + 100, document.body.offsetTop + 100,
                        window.screen.width - 200, window.screen.height - 300
                    )
                });
            }
            // Properties dictionary (string value)
            else if (typeof cellValue === 'string' &&
                     cellValue.startsWith('<b><font color="#000000">Class and Object properties</font></b>')) {
                openEditor('classPropertiesEditorWindow', () => {
                    return ClassPropertiesEditorWindow.call(selectedCell, this,
                        document.body.offsetLeft + 100, document.body.offsetTop + 100,
                        window.screen.width - 200, window.screen.height - 300
                    )
                });
            }
            // Relationships dictionary
            else if (typeof cellValue === 'object' && cellValue !== null &&
                     getCellAttribute(selectedCell, 'label')?.startsWith('<b><font color="#000000">Relationships between objects</font></b>')) {
                openEditor('relationshipsEditorWindow', () => {
                    return RelationshipsEditorWindow.call(selectedCell, this,
                        document.body.offsetLeft + 100, document.body.offsetTop + 100,
                        window.screen.width - 200, window.screen.height - 300
                    )
                });
            }
            // Edge
            else if (isCellEdge(selectedCell)) {
                openEditor('editValueInOutcomeWindow', () => {
                    return EditValueInOutcomeWindow.call(selectedCell, this,
                        (document.body.offsetWidth - 880) / 2, 120, 900, 200
                    )
                });
            }
        });

        // Действие: редактирование текта в узле

        ui.actions.addAction('editTextInNode', function(this: PluginEditorUi): void {
            if (!graph.isEnabled() || graph.getSelectionCount() !== 1) return;
            
            const selectedCell = graph.getSelectionCell();
            if (!selectedCell?.value) return;

            const cellValue = selectedCell.value;
            const cellStyle = selectedCell.style;

            const isStringCell = typeof cellValue === 'string' && cellValue !== "" &&
                !cellValue.startsWith('<font color="#000000"><b>Enum</b></font>') &&
                !cellValue.startsWith('<b><font color="#000000">Class and Object properties</font></b>') &&
                cellStyle !== "rounded=1;whiteSpace=wrap;html=1;fillColor=#e6e6e6;strokeColor=#666666;editable=0;" && 
                !isCellEdge(selectedCell);

            const isObjectCell = typeof cellValue === 'object' && cellValue !== null &&
                !getCellAttribute(selectedCell, 'label')?.startsWith('<font color="#000000"><b>Classes</b></font>') &&
                !getCellAttribute(selectedCell, 'label')?.startsWith('<b><font color="#000000">Relationships between objects</font></b>') &&
                getCellAttribute(selectedCell, 'type') !== "AND" &&
                getCellAttribute(selectedCell, 'type') !== "OR" &&
                getCellAttribute(selectedCell, 'type') !== "predetermining" &&
                getCellAttribute(selectedCell, 'type') !== "START" && 
                !isCellEdge(selectedCell);

            if ((isStringCell || isObjectCell) && !this.editTextInNodeWindow?.window?.content) {
                this.editTextInNodeWindow = EditTextInNodeWindow.call(
                    selectedCell, this,
                    (document.body.offsetWidth - 880) / 2, 120, 900, 550
                );
                this.editTextInNodeWindow.window.setVisible(true);
            }
        });

        // Действие: редактирование информации вопроса

        ui.actions.addAction('editQuestionInfo', function(this: PluginEditorUi): void {
            if (!graph.isEnabled() || graph.getSelectionCount() !== 1) return;
            
            const selectedCell = graph.getSelectionCell();
            if (!selectedCell?.value) return;

            const cellValue = selectedCell.value;
            const cellStyle = selectedCell.style;

            const isStringCell = typeof cellValue === 'string' && cellValue !== "" &&
                !cellValue.startsWith('<font color="#000000"><b>Enum</b></font>') &&
                !cellValue.startsWith('<b><font color="#000000">Class and Object properties</font></b>') &&
                cellStyle !== "rounded=1;whiteSpace=wrap;html=1;fillColor=#e6e6e6;strokeColor=#666666;editable=0;" && 
                !isCellEdge(selectedCell);

            const isObjectCell = typeof cellValue === 'object' && cellValue !== null &&
                cellStyle !== "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;editable=0;" &&
                cellStyle !== "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;editable=0;" &&
                !getCellAttribute(selectedCell, 'label')?.startsWith('<font color="#000000"><b>Classes</b></font>') &&
                !getCellAttribute(selectedCell, 'label')?.startsWith('<b><font color="#000000">Relationships between objects</font></b>') &&
                getCellAttribute(selectedCell, 'type') !== "START" && 
                !isCellEdge(selectedCell);

            if ((isStringCell || isObjectCell) && !this.editQuestionInfoInNodeWindow?.window?.content) {
                this.editQuestionInfoInNodeWindow = EditQuestionInfoInNodeWindow.call(
                    selectedCell, this,
                    (document.body.offsetWidth - 880) / 2, 120, 900, 550
                );
                this.editQuestionInfoInNodeWindow.window.setVisible(true);
            } else if (isCellEdge(selectedCell)) {
                this.editQuestionInfoInOutcomeWindow = EditQuestionInfoInOutcomeWindow.call(
                    selectedCell, this,
                    (document.body.offsetWidth - 880) / 2, 120, 900, 550
                );
                this.editQuestionInfoInOutcomeWindow.window.setVisible(true);
            }
        });

        // Действия: конвертация узлов

        const createConvertAction = (Converter: ConvertConstructor) => {
            return function(this: PluginEditorUi): void {
                if (graph.isEnabled() && graph.getSelectionCount() === 1) {
                    const selectedCell = graph.getSelectionCell();
                    Converter(selectedCell, this,
                        (document.body.offsetWidth - 880) / 2, 120, 900, 550
                    );
                }
            };
        };

        ui.actions.addAction('convertStartNode', createConvertAction(ConvertToStartNode));
        ui.actions.addAction('convertTrueNode', createConvertAction(ConvertToTrueNode));
        ui.actions.addAction('convertFalseNode', createConvertAction(ConvertToFalseNode));
        ui.actions.addAction('convertLogicNode', createConvertAction(ConvertToLogicNode));
        ui.actions.addAction('convertPredeterminingFactorsNode', createConvertAction(ConvertToPredeterminingFactorsNode));
        ui.actions.addAction('convertUncertaintyNode', createConvertAction(ConvertToUncertaintyNode));
        ui.actions.addAction('convertActionNode', createConvertAction(ConvertToActionNode));
        ui.actions.addAction('convertCycleNode', createConvertAction(ConvertToCycleNode));
        ui.actions.addAction('convertConditionNode', createConvertAction(ConvertToQuestionNode));
        ui.actions.addAction('convertSwitchCaseNode', createConvertAction(ConvertToSwitchCaseNode));
        
        document.querySelectorAll('div.geMenubar > a.geMenubar')
            .forEach((node: Element): void => {
                node.className = 'geItem';
            });
    });
}

// Глобальное пространство workspace для blockly

const divForGlobalWS = document.createElement('div');
divForGlobalWS.id = "globalWS";
document.body.appendChild(divForGlobalWS);

export const globalWS = Blockly.inject('globalWS', { 
    toolbox
});

// Автозагрузка плагина

const draw = (window as { Draw?: { loadPlugin: (callback: (ui: PluginEditorUi) => void) => void } }).Draw;
if (typeof window !== 'undefined' && draw) {
    loadPlugin();
}