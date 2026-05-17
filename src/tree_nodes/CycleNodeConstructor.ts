import { styleBtn, styleDivBtn, styleTextAreaExp, styleBlocklyAreaExp, styleInput, styleSelect } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { toolbox } from '../utils/blocks.js';
import { generateCode, checkValidID } from '../utils/utils.js';
import { parser, root } from '../utils/parser.js';
import { toBlock } from '../utils/code_to_block.js';
import { getClasses } from '../dictionaries/Utils.js';
import * as Blockly from 'blockly';
import { EditorUi, MXGeometry, MXCell, ClassItem } from '../utils/types.js';

// Тип для Blockly workspace
type BlocklyWorkspace = ReturnType<typeof Blockly.inject>;

// Декларация глобальных типов
declare const mxUtils: {
    button: (label: string, handler: (evt?: MouseEvent) => void) => HTMLButtonElement;
};

declare const mxCell: {
    new (value: string, geometry: MXGeometry, style: string): MXCell;
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

interface MxWindow {
    destroyOnClose: boolean;
    destroy(): void;
    setMaximizable(enabled: boolean): void;
    setResizable(enabled: boolean): void;
    setClosable(enabled: boolean): void;
    setVisible(visible: boolean): void;
}

interface CycleNodeConstructorWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

// Окно конструктора узлов цикла
export const CycleNodeConstructorWindow = function (
    this: CycleNodeConstructorWindowInstance,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): CycleNodeConstructorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    const divText = document.createElement('div');
    divText.style.height = "100%";
    const divBlockly = document.createElement('div');
    divBlockly.style.height = "100%";
    divBlockly.style.display = "none";

    const operators = ["And", "Or", "Mutex", "HYP"];

    // Экран с текстом
    let text = document.createElement('textarea');
    text = styleTextAreaExp(text);
    text.style.height = "74%";

    let workspace: BlocklyWorkspace | undefined;

    // Кнопка создания узла (текстовый режим)
    let btnCreateNodeInText = mxUtils.button(getTextByLocale("Create"), function (): void {
        const expression = divText.getElementsByTagName("textarea").item(0)?.value || '';
        if (expression) {
            parser.parse(expression);
        } else {
            throw new Error(getTextByLocale("ExpressionIsMissing"));
        }
        
        let error = "";
        if (!nameVarInText.value) {
            error += getTextByLocale("NameVariableIsMissing");
        } else if (!checkValidID(nameVarInText.value)) {
            error += getTextByLocale("NameVariableIsIncorrect");
        }
        
        const selectedOption = selectClassInText.options[selectClassInText.selectedIndex];
        if (!selectedOption || !selectedOption.value) {
            error += getTextByLocale("TypeVariableIsMissing");
        }
        
        if (error) {
            throw new Error(error);
        }

        const selectedOperatorInText = selectOperatorInText.options[selectOperatorInText.selectedIndex]?.value || "AND";

        const theGraph = editorUi.editor.graph;
        if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
            const pos = theGraph.getInsertPoint();
            const geometry: MXGeometry = {
                x: pos.x,
                y: pos.y,
                width: 120,
                height: 80
            };
            const style = "shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;fontColor=#000000;align=center;editable=0;";
            const newElement = new mxCell("", geometry, style);

            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            const typeInText = selectClassInText.options[selectClassInText.selectedIndex].value;
            theGraph.setAttributeForCell(newElement, 'expression', expression);
            theGraph.setAttributeForCell(newElement, 'typeVar', typeInText);
            theGraph.setAttributeForCell(newElement, 'nameVar', nameVarInText.value);
            theGraph.setAttributeForCell(newElement, 'operator', selectedOperatorInText);
        }
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
        workspace = Blockly.inject('cycleCreateBlocklyDiv', { toolbox: toolbox });
        workspace.clear();
        if (expression && root) {
            parser.parse(expression);
            toBlock(root, workspace);
        }
        if (nameVarInBlockly) nameVarInBlockly.value = nameVarInText.value;
        if (selectOperatorInBlockly) selectOperatorInBlockly.selectedIndex = selectOperatorInText.selectedIndex;
        if (selectClassInBlockly) selectClassInBlockly.selectedIndex = selectClassInText.selectedIndex;
    });

    const nameVarInText = document.createElement('input');
    nameVarInText.type = "text";
    styleInput(nameVarInText);
    nameVarInText.style.height = '5%';
    nameVarInText.placeholder = "New variable";

    const jsonClasses: ClassItem[] = getClasses(editorUi);

    const selectClassInText = document.createElement('select');
    styleSelect(selectClassInText);
    selectClassInText.style.height = '5%';
    jsonClasses.forEach(classItem => {
        const newOption = new Option(classItem.name, classItem.name);
        selectClassInText.options[selectClassInText.options.length] = newOption;
    });

    const selectOperatorInText = document.createElement('select');
    styleSelect(selectOperatorInText);
    selectOperatorInText.style.height = '5%';
    operators.forEach(item => {
        const newOption = new Option(item, item.toUpperCase());
        selectOperatorInText.options[selectOperatorInText.options.length] = newOption;
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
    nestedDiv.id = "cycleCreateBlocklyDiv";
    styleBlocklyAreaExp(nestedDiv, w, h);
    nestedDiv.style.height = h * 0.72 + 'px';

    // Кнопка создания узла (Blockly режим)
    let btnCreateNodeInBlockly = mxUtils.button(getTextByLocale("Create"), function (): void {
        if (!workspace) {
            throw new Error("Workspace not initialized");
        }
        const code = generateCode(workspace);
        if (!code) {
            throw new Error(getTextByLocale("ExpressionIsMissing"));
        } else {
            try {
                parser.parse(code);
            } catch (e) {
                throw new Error(getTextByLocale("EmptyConnection"));
            }
        }
        
        let error = "";
        if (!nameVarInBlockly.value) {
            error += getTextByLocale("NameVariableIsMissing");
        } else if (!checkValidID(nameVarInBlockly.value)) {
            error += getTextByLocale("NameVariableIsIncorrect");
        }
        
        const selectedOption = selectClassInBlockly.options[selectClassInBlockly.selectedIndex];
        if (!selectedOption || !selectedOption.value) {
            error += getTextByLocale("TypeVariableIsMissing");
        }
        
        if (error) {
            throw new Error(error);
        }
        
        const selectedOperatorInBlockly = selectOperatorInBlockly.options[selectOperatorInBlockly.selectedIndex]?.value || "AND";

        const theGraph = editorUi.editor.graph;
        if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
            const pos = theGraph.getInsertPoint();
            const geometry: MXGeometry = {
                x: pos.x,
                y: pos.y,
                width: 120,
                height: 80
            };
            const style = "shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;fontColor=#000000;align=center;editable=0;";
            const newElement = new mxCell("", geometry, style);

            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            const typeInBlockly = selectClassInBlockly.options[selectClassInBlockly.selectedIndex].value;
            theGraph.setAttributeForCell(newElement, 'expression', code);
            theGraph.setAttributeForCell(newElement, 'typeVar', typeInBlockly);
            theGraph.setAttributeForCell(newElement, 'nameVar', nameVarInBlockly.value);
            theGraph.setAttributeForCell(newElement, 'operator', selectedOperatorInBlockly);
        }
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

    const nameVarInBlockly = document.createElement('input');
    nameVarInBlockly.type = "text";
    styleInput(nameVarInBlockly);
    nameVarInBlockly.style.height = '5%';
    nameVarInBlockly.placeholder = "New variable";

    const selectClassInBlockly = document.createElement('select');
    styleSelect(selectClassInBlockly);
    selectClassInBlockly.style.height = '5%';
    jsonClasses.forEach(classItem => {
        const newOption = new Option(classItem.name, classItem.name);
        selectClassInBlockly.options[selectClassInBlockly.options.length] = newOption;
    });

    const selectOperatorInBlockly = document.createElement('select');
    styleSelect(selectOperatorInBlockly);
    selectOperatorInBlockly.style.height = '5%';
    operators.forEach(item => {
        const newOption = new Option(item, item.toUpperCase());
        selectOperatorInBlockly.options[selectOperatorInBlockly.options.length] = newOption;
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
        getTextByLocale("TitleCycleNodeConstructorWindow"),
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