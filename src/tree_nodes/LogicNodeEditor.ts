import { styleBtn } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
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
    value: ExtendedMXCellValue;
}

interface LogicNodeEditorWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

type LogicNodeType = "AND" | "OR" | "HYP";

// Функция обновления логического узла
function updateLogicNode(
    cell: ExtendedMXCell,
    editorUi: EditorUi,
    nodeType: LogicNodeType
): void {
    const theGraph = editorUi.editor.graph;
    theGraph.getModel().beginUpdate();
    cell.value.setAttribute("label", nodeType);
    cell.value.setAttribute("type", nodeType);
    theGraph.getModel().endUpdate();
    theGraph.refresh();
}

// Окно редактирования логических узлов
export const LogicNodeEditorWindow = function (
    this: LogicNodeEditorWindowInstance,
    cell: ExtendedMXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): LogicNodeEditorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.width = '300px';
    div.style.height = '150px';
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "5px";
    div.style.justifyContent = "center";

    // Кнопка изменения узла на "AND"
    let btnCreateANDNode = mxUtils.button('And', function (): void {
        updateLogicNode(cell, editorUi, "AND");
        win.destroy();
    });

    // Кнопка изменения узла на "OR"
    let btnCreateORNode = mxUtils.button('Or', function (): void {
        updateLogicNode(cell, editorUi, "OR");
        win.destroy();
    });

    // Кнопка изменения узла на "HYP"
    let btnCreateHYPNode = mxUtils.button('HYP', function (): void {
        updateLogicNode(cell, editorUi, "HYP");
        win.destroy();
    });

    // Стилизация кнопок
    btnCreateANDNode = styleBtn(btnCreateANDNode);
    btnCreateANDNode.style.minWidth = "32%";
    
    btnCreateORNode = styleBtn(btnCreateORNode);
    btnCreateORNode.style.minWidth = "32%";
    
    btnCreateHYPNode = styleBtn(btnCreateHYPNode);
    btnCreateHYPNode.style.minWidth = "32%";
    
    // Добавление кнопок в окно
    div.appendChild(btnCreateANDNode);
    div.appendChild(btnCreateORNode);
    div.appendChild(btnCreateHYPNode);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleLogicNodeEditorWindow"),
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