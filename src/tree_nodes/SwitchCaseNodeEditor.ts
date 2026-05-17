import { styleBtn, styleDivBtn, styleTextAreaExp, styleBlocklyAreaExp } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { toolbox } from '../utils/blocks.js';
import { parser, root } from '../utils/parser.js';
import { toBlock } from '../utils/code_to_block.js';
import { generateCode } from '../utils/utils.js';
import * as Blockly from 'blockly';
import { EditorUi, MXCell, MXCellValue, MxWindow } from '../utils/types.js';

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

interface SwitchCaseNodeEditorWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

// Функция сохранения выражения в узле
function saveSwitchCaseExpression(
    cell: ExtendedMXCell,
    editorUi: EditorUi,
    expression: string
): void {
    const theGraph = editorUi.editor.graph;
    theGraph.getModel().beginUpdate();
    cell.value.setAttribute("expression", expression);
    theGraph.getModel().endUpdate();
    theGraph.refresh();
}

// Функция проверки и парсинга выражения
function parseExpression(expression: string): void {
    if (!expression) {
        throw new Error(getTextByLocale("ExpressionIsMissing"));
    }
    parser.parse(expression);
}

// Окно редактирования узлов switch-case
export const SwitchCaseNodeEditorWindow = function (
    this: SwitchCaseNodeEditorWindowInstance,
    cell: ExtendedMXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): SwitchCaseNodeEditorWindowInstance {
    const self = this;
    
    // Получение сохраненного выражения
    const savedExpression = cell.value.getAttribute('expression') || '';

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
    text.style.height = "90%";
    text.value = savedExpression;

    let workspace: BlocklyWorkspace | undefined;

    // Кнопка сохранения узла (текстовый режим)
    let btnCreateNodeInText = mxUtils.button(getTextByLocale("Apply"), function (): void {
        const expression = divText.getElementsByTagName("textarea").item(0)?.value || '';
        parseExpression(expression);
        saveSwitchCaseExpression(cell, editorUi, expression);
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
        workspace = Blockly.inject('switchCaseUpdateBlocklyDiv', { toolbox: toolbox });
        workspace.clear();
        if (expression && root) {
            parser.parse(expression);
            toBlock(root, workspace);
        }
    });

    divText.appendChild(text);
    let btnTextDiv = document.createElement('div');
    btnTextDiv = styleDivBtn(btnTextDiv);
    btnTextDiv.style.height = "10%";
    btnCreateNodeInText = styleBtn(btnCreateNodeInText);
    const btnSwitchToBlocklyStyled = styleBtn(btnSwitchToBlockly);
    btnTextDiv.appendChild(btnCreateNodeInText);
    btnTextDiv.appendChild(btnSwitchToBlocklyStyled);
    divText.appendChild(btnTextDiv);
    div.appendChild(divText);

    // Экран с Blockly
    const nestedDiv = document.createElement('div');
    nestedDiv.id = "switchCaseUpdateBlocklyDiv";
    styleBlocklyAreaExp(nestedDiv, w, h);
    nestedDiv.style.height = h * 0.88 + 'px';

    // Кнопка сохранения узла (Blockly режим)
    let btnCreateNodeInBlockly = mxUtils.button(getTextByLocale("Apply"), function (): void {
        if (!workspace) {
            throw new Error("Workspace not initialized");
        }
        const code = generateCode(workspace);
        parseExpression(code);
        saveSwitchCaseExpression(cell, editorUi, code);
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
    });

    divBlockly.appendChild(nestedDiv);
    let btnBlockDiv = document.createElement('div');
    btnBlockDiv = styleDivBtn(btnBlockDiv);
    btnBlockDiv.style.height = "8%";
    btnCreateNodeInBlockly = styleBtn(btnCreateNodeInBlockly);
    const btnSwitchToTextStyled = styleBtn(btnSwitchToText);
    btnBlockDiv.appendChild(btnCreateNodeInBlockly);
    btnBlockDiv.appendChild(btnSwitchToTextStyled);
    divBlockly.appendChild(btnBlockDiv);
    div.appendChild(divBlockly);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleSwitchCaseNodeEditorWindow"),
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