import { styleBtn } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { EditorUi, MXGeometry, MXCell, ClassItem, MxWindow } from '../utils/types.js';

// Декларация глобальных типов
declare const mxUtils: {
    button: (label: string, handler: (evt?: MouseEvent) => void) => HTMLButtonElement;
};

declare const mxCell: {
    new (value: string, geometry: MXGeometry, style: string): MXCell & { value?: string };
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

interface LogicNodeConstructorWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

// Окно создания логических узлов
export const LogicNodeConstructorWindow = function (
    this: LogicNodeConstructorWindowInstance,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): LogicNodeConstructorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.width = '300px';
    div.style.height = '150px';
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "5px";
    div.style.justifyContent = "center";

    // Кнопка создания узла "AND"
    let btnCreateANDNode = mxUtils.button('And', function (): void {
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
            newElement.value = "AND";
            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            theGraph.setAttributeForCell(newElement, 'type', "AND");
        }
        win.destroy();
    });

    // Кнопка создания узла "OR"
    let btnCreateORNode = mxUtils.button('Or', function (): void {
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
            newElement.value = "OR";
            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            theGraph.setAttributeForCell(newElement, 'type', "OR");
        }
        win.destroy();
    });

    // Кнопка создания узла "HYP"
    let btnCreateHYPNode = mxUtils.button('HYP', function (): void {
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
            newElement.value = "HYP";
            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            theGraph.setAttributeForCell(newElement, 'type', "HYP");
        }
        win.destroy();
    });

    btnCreateANDNode = styleBtn(btnCreateANDNode);
    btnCreateANDNode.style.minWidth = "32%";
    btnCreateORNode = styleBtn(btnCreateORNode);
    btnCreateORNode.style.minWidth = "32%";
    btnCreateHYPNode = styleBtn(btnCreateHYPNode);
    btnCreateHYPNode.style.minWidth = "32%";
    div.appendChild(btnCreateANDNode);
    div.appendChild(btnCreateORNode);
    div.appendChild(btnCreateHYPNode);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleLogicNodeConstructorWindow"),
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