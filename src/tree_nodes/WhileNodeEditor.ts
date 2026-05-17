import { styleBtn, styleDivBtn, styleTextAreaExp, styleBlocklyAreaExp, styleInput, styleSelect } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { toolbox } from '../utils/blocks.js';
import { parser, root } from '../utils/parser.js';
import { toBlock } from '../utils/code_to_block.js';
import { generateCode, checkValidID } from '../utils/utils.js';
import { getClasses } from '../dictionaries/Utils.js';
import * as Blockly from 'blockly';
import { EditorUi, MXCell, MXCellValue, ClassItem, MxWindow } from '../utils/types.js';

// Тип для Blockly workspace
type BlocklyWorkspace = ReturnType<typeof Blockly.inject>;

// Декларация глобальных типов
declare const mxUtils: {
    button: (label: string, handler: (evt?: MouseEvent) => void) => HTMLButtonElement;
};

declare const mxWindow: {
    new (
        title: string,
        content: HTMLElement,
        x: number,
        y: number,
        width: number,
        height: number,
        modal: boolean,
        resizable: boolean
    ): MxWindow & { contentWrapper?: HTMLElement };
};

interface ExtendedMXCellValue extends MXCellValue {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
}

interface ExtendedMXCell extends MXCell {
    value: ExtendedMXCellValue;
}

interface WhileNodeEditorWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

interface WhileNodeData {
    expression: string;
    typeVar: string;
    nameVar: string;
    operator: string;
}

const operators = ["And", "Or"];

// Функция сохранения данных узла
function saveWhileNodeData(
    cell: ExtendedMXCell,
    editorUi: EditorUi,
    data: WhileNodeData
): void {
    const theGraph = editorUi.editor.graph;
    theGraph.getModel().beginUpdate();
    cell.value.setAttribute("expression", data.expression);
    cell.value.setAttribute("typeVar", data.typeVar);
    cell.value.setAttribute("nameVar", data.nameVar);
    cell.value.setAttribute("operator", data.operator);
    theGraph.getModel().endUpdate();
    theGraph.refresh();
}

// Функция получения данных из формы
function getFormData(
    nameVar: string,
    selectClass: HTMLSelectElement,
    selectOperator: HTMLSelectElement,
    expression: string
): WhileNodeData {
    return {
        expression,
        typeVar: selectClass.options[selectClass.selectedIndex]?.value || '',
        nameVar,
        operator: selectOperator.options[selectOperator.selectedIndex]?.value || "AND"
    };
}

// Функция валидации формы
function validateForm(nameVar: string, selectClass: HTMLSelectElement): void {
    const errors: string[] = [];
    
    if (!nameVar) {
        errors.push(getTextByLocale("NameVariableIsMissing"));
    } else if (!checkValidID(nameVar)) {
        errors.push(getTextByLocale("NameVariableIsIncorrect"));
    }
    
    const selectedOption = selectClass.options[selectClass.selectedIndex];
    if (!selectedOption?.value) {
        errors.push(getTextByLocale("TypeVariableIsMissing"));
    }
    
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}

// Функция парсинга выражения
function parseExpression(expression: string): void {
    if (!expression) {
        throw new Error(getTextByLocale("ExpressionIsMissing"));
    }
    parser.parse(expression);
}

// Функция создания select для классов
function createClassSelect(editorUi: EditorUi, selectedType: string): HTMLSelectElement {
    const classes: ClassItem[] = getClasses(editorUi);
    const select = document.createElement('select');
    styleSelect(select);
    select.style.height = '5%';
    
    classes.forEach(classItem => {
        select.options[select.options.length] = new Option(classItem.name, classItem.name);
    });
    
    for (let i = 0; i < select.options.length; ++i) {
        if (select.options[i].value === selectedType) {
            select.options[i].selected = true;
            break;
        }
    }
    return select;
}

// Функция создания select для операторов
function createOperatorSelect(selectedOperator: string): HTMLSelectElement {
    const select = document.createElement('select');
    styleSelect(select);
    select.style.height = '5%';
    
    operators.forEach(item => {
        select.options[select.options.length] = new Option(item, item.toUpperCase());
    });
    
    for (let i = 0; i < select.options.length; ++i) {
        if (select.options[i].value === selectedOperator) {
            select.options[i].selected = true;
            break;
        }
    }
    return select;
}

// Окно редактирования узлов while
export const WhileNodeEditorWindow = function (
    this: WhileNodeEditorWindowInstance,
    cell: ExtendedMXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): WhileNodeEditorWindowInstance {
    const self = this;
    
    // Получение сохраненных значений
    const savedExpression = cell.value.getAttribute('expression') || '';
    const savedTypeVar = cell.value.getAttribute('typeVar') || '';
    const savedNameVar = cell.value.getAttribute('nameVar') || '';
    const savedOperator = cell.value.getAttribute('operator') || 'AND';

    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    const divText = document.createElement('div');
    divText.style.height = "100%";
    const divBlockly = document.createElement('div');
    divBlockly.style.height = "100%";
    divBlockly.style.display = "none";

    // Экран с текстом
    let text = document.createElement('textarea');
    text = styleTextAreaExp(text);
    text.style.height = "74%";
    text.value = savedExpression;

    let workspace: BlocklyWorkspace | undefined;

    // Элементы управления (текстовый режим)
    const nameVarInText = document.createElement('input');
    nameVarInText.type = "text";
    styleInput(nameVarInText);
    nameVarInText.style.height = '5%';
    nameVarInText.placeholder = "New variable";
    nameVarInText.value = savedNameVar;

    const selectClassInText = createClassSelect(editorUi, savedTypeVar);
    const selectOperatorInText = createOperatorSelect(savedOperator);

    // Кнопка сохранения узла (текстовый режим)
    let btnCreateNodeInText = mxUtils.button(getTextByLocale("Apply"), function (): void {
        const expression = divText.getElementsByTagName("textarea").item(0)?.value || '';
        parseExpression(expression);
        validateForm(nameVarInText.value, selectClassInText);
        
        const formData = getFormData(nameVarInText.value, selectClassInText, selectOperatorInText, expression);
        saveWhileNodeData(cell, editorUi, formData);
        win.destroy();
    });

    // Кнопка переключения на Blockly
    const btnSwitchToBlockly = mxUtils.button(getTextByLocale("SwitchBlockly"), function (): void {
        const expression = divText.getElementsByTagName("textarea").item(0)?.value || '';
        if (expression) {
            parser.parse(expression);
        }
        divText.style.display = "none";
        divBlockly.style.display = "block";
        if (nestedDiv) {
            nestedDiv.innerHTML = '';
        }
        workspace = Blockly.inject('cycleUpdateBlocklyDiv', { toolbox: toolbox });
        workspace.clear();
        if (expression && root) {
            parser.parse(expression);
            toBlock(root, workspace);
        }
        if (nameVarInBlockly) nameVarInBlockly.value = nameVarInText.value;
        if (selectOperatorInBlockly) selectOperatorInBlockly.selectedIndex = selectOperatorInText.selectedIndex;
        if (selectClassInBlockly) selectClassInBlockly.selectedIndex = selectClassInText.selectedIndex;
    });

    divText.appendChild(text);
    let btnTextDiv = document.createElement('div');
    btnTextDiv = styleDivBtn(btnTextDiv);
    btnTextDiv.style.height = "10%";
    btnCreateNodeInText = styleBtn(btnCreateNodeInText);
    const btnSwitchToBlocklyStyled = styleBtn(btnSwitchToBlockly);
    divText.appendChild(nameVarInText);
    divText.appendChild(selectClassInText);
    divText.appendChild(selectOperatorInText);
    btnTextDiv.appendChild(btnCreateNodeInText);
    btnTextDiv.appendChild(btnSwitchToBlocklyStyled);
    divText.appendChild(btnTextDiv);
    div.appendChild(divText);

    // Экран с Blockly
    const nestedDiv = document.createElement('div');
    nestedDiv.id = "cycleUpdateBlocklyDiv";
    styleBlocklyAreaExp(nestedDiv, w, h);
    nestedDiv.style.height = h * 0.72 + 'px';

    // Элементы управления (Blockly режим)
    const nameVarInBlockly = document.createElement('input');
    nameVarInBlockly.type = "text";
    styleInput(nameVarInBlockly);
    nameVarInBlockly.style.height = '5%';
    nameVarInBlockly.placeholder = "New variable";
    nameVarInBlockly.value = savedNameVar;

    const selectClassInBlockly = createClassSelect(editorUi, savedTypeVar);
    const selectOperatorInBlockly = createOperatorSelect(savedOperator);

    // Кнопка сохранения узла (Blockly режим)
    let btnCreateNodeInBlockly = mxUtils.button(getTextByLocale("Apply"), function (): void {
        if (!workspace) {
            throw new Error("Workspace not initialized");
        }
        const code = generateCode(workspace);
        parseExpression(code);
        validateForm(nameVarInBlockly.value, selectClassInBlockly);
        
        const formData = getFormData(nameVarInBlockly.value, selectClassInBlockly, selectOperatorInBlockly, code);
        saveWhileNodeData(cell, editorUi, formData);
        win.destroy();
    });

    // Кнопка переключения на текстовый вариант
    const btnSwitchToText = mxUtils.button(getTextByLocale("SwitchText"), function (): void {
        if (!workspace) return;
        const code = generateCode(workspace);
        divBlockly.style.display = "none";
        divText.style.display = "block";
        const textarea = divText.getElementsByTagName("textarea").item(0);
        if (textarea) textarea.value = code;
        nameVarInText.value = nameVarInBlockly.value;
        selectOperatorInText.selectedIndex = selectOperatorInBlockly.selectedIndex;
        selectClassInText.selectedIndex = selectClassInBlockly.selectedIndex;
    });

    divBlockly.appendChild(nestedDiv);
    let btnBlockDiv = document.createElement('div');
    btnBlockDiv = styleDivBtn(btnBlockDiv);
    btnBlockDiv.style.height = "8%";
    btnCreateNodeInBlockly = styleBtn(btnCreateNodeInBlockly);
    const btnSwitchToTextStyled = styleBtn(btnSwitchToText);
    divBlockly.appendChild(nameVarInBlockly);
    divBlockly.appendChild(selectClassInBlockly);
    divBlockly.appendChild(selectOperatorInBlockly);
    btnBlockDiv.appendChild(btnCreateNodeInBlockly);
    btnBlockDiv.appendChild(btnSwitchToTextStyled);
    divBlockly.appendChild(btnBlockDiv);
    div.appendChild(divBlockly);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleWhileNodeEditorWindow"),
        div,
        x,
        y,
        w,
        h,
        true,
        true
    );
    self.window = win;
    if (self.window.contentWrapper) {
        self.window.contentWrapper.style.height = "100%";
    }
    self.window.destroyOnClose = true;
    self.window.setMaximizable(false);
    self.window.setResizable(false);
    self.window.setClosable(true);
    self.window.setVisible(true);
    
    return self;
};