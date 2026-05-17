import { styleBtn, styleDivBtn } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { getTextFromCode } from '../utils/utils.js';
import { EditorUi, MXCell, MXCellValue, MxWindow } from '../utils/types.js';

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
    value: string | ExtendedMXCellValue;
}

interface EditTextInNodeWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

// Окно редактирования человекочитаемого текста узлов
export const EditTextInNodeWindow = function (
    this: EditTextInNodeWindowInstance,
    cell: ExtendedMXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): EditTextInNodeWindowInstance {
    const self = this;
    const graph = editorUi.editor.graph;

    // Верстка окна
    const div = document.createElement('div');
    const divText = document.createElement('div');
    const text = document.createElement('textarea');
    text.style.width = "100%";
    text.style.resize = "none";
    text.style.height = "400px";
    text.style.fontSize = "30px";
    
    // Получение значения text из cell
    if (typeof cell.value === "object" && cell.value !== null) {
        text.value = (cell.value as ExtendedMXCellValue).getAttribute("label") || '';
    } else if (typeof cell.value === "string") {
        text.value = cell.value;
    } else {
        text.value = '';
    }
    
    // Получение выражения из cell
    let expr = '';
    if (typeof cell.value === "object" && cell.value !== null) {
        expr = (cell.value as ExtendedMXCellValue).getAttribute("expression") || '';
    }

    // Кнопка сохранения текста в узле
    let btnSaveTextInNode = mxUtils.button(getTextByLocale("Save"), function (): void {
        const textInNode = divText.getElementsByTagName("textarea").item(0)?.value || '';
        graph.getModel().beginUpdate();
        
        if (typeof cell.value === "object" && cell.value !== null) {
            (cell.value as ExtendedMXCellValue).setAttribute("label", textInNode);
        } else {
            cell.value = textInNode;
        }
        
        graph.getModel().endUpdate();
        graph.refresh();
        win.destroy();
    });

    // Кнопка генерации человекочитаемого текста
    const btnGenerateTextInNode = mxUtils.button(getTextByLocale("Generate"), function (): void {
        let code = "";
        if (typeof cell.value === "object" && cell.value !== null) {
            code = (cell.value as ExtendedMXCellValue).getAttribute("expression") || '';
        }
        const textInNode = getTextFromCode(code, editorUi);
        if (textInNode !== "") {
            text.value = textInNode;
        }
    });

    // Отображение выражения в узле
    const divExprText = document.createElement('div');
    divExprText.innerHTML = getTextByLocale("ExpressionInNode") + expr;
    divExprText.style.height = "60px";
    divExprText.style.overflow = "scroll";
    divExprText.style.fontSize = "20px";
    
    divText.appendChild(divExprText);
    divText.appendChild(text);
    
    const btnDiv = document.createElement('div');
    styleDivBtn(btnDiv);
    btnDiv.style.marginTop = "10px";
    btnSaveTextInNode = styleBtn(btnSaveTextInNode);
    const btnGenerateTextInNodeStyled = styleBtn(btnGenerateTextInNode);
    btnDiv.appendChild(btnSaveTextInNode);
    btnDiv.appendChild(btnGenerateTextInNodeStyled);
    
    div.appendChild(divText);
    div.appendChild(btnDiv);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleEditTextInNodeWindow"),
        div,
        x,
        y,
        w,
        h,
        true,
        true
    );
    self.window = win;
    self.window.destroyOnClose = true;
    self.window.setMaximizable(false);
    self.window.setResizable(false);
    self.window.setClosable(true);
    self.window.setVisible(true);
    
    return self;
};