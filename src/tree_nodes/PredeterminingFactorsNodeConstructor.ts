import { styleBtn, styleInput, styleDivBtn } from '../utils/style.js';
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

interface PredeterminingFactorsNodeConstructorWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

// Окно создания узлов "Предрешающие факторы"
export const PredeterminingFactorsNodeConstructorWindow = function (
    this: PredeterminingFactorsNodeConstructorWindowInstance,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): PredeterminingFactorsNodeConstructorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.height = '100%';
    const tbody = document.createElement('tbody');

    const row = document.createElement('tr');
    const tdName = document.createElement('td');
    let name = document.createElement('input');
    name.type = "text";
    name = styleInput(name);
    name.placeholder = "Value";
    tdName.appendChild(name);
    row.appendChild(tdName);
    tbody.appendChild(row);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка создания узла
    let btnCreateNode = mxUtils.button(getTextByLocale("Create"), function (): void {
        const theGraph = editorUi.editor.graph;
        if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
            const pos = theGraph.getInsertPoint();
            const geometry: MXGeometry = {
                x: pos.x,
                y: pos.y,
                width: 120,
                height: 80
            };
            const style = "shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;fontColor=#000000;editable=0;";
            const newElement = new mxCell("", geometry, style);
            
            const rowItem = table.rows.item(0);
            const tdItem = rowItem?.getElementsByTagName("td").item(0);
            const inputItem = tdItem?.getElementsByTagName("input").item(0) as HTMLInputElement;
            newElement.value = inputItem?.value || '';
            
            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            
            if (inputItem) {
                inputItem.value = "";
            }
            
            theGraph.setAttributeForCell(newElement, 'type', "predetermining");
        }
        win.destroy();
    });

    const btnDiv = document.createElement('div');
    styleDivBtn(btnDiv);
    btnCreateNode = styleBtn(btnCreateNode);
    btnDiv.appendChild(btnCreateNode);
    div.appendChild(btnDiv);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitlePredeterminingFactorsNodeConstructorWindow"),
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