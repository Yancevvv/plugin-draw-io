import { styleBtn, styleInput, styleDivBtn } from '../utils/style.js';
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

interface PredeterminingFactorsNodeEditorWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

// Окно редактирования узлов "Предрешающие факторы"
export const PredeterminingFactorsNodeEditorWindow = function (
    this: PredeterminingFactorsNodeEditorWindowInstance,
    cell: ExtendedMXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): PredeterminingFactorsNodeEditorWindowInstance {
    const self = this;
    
    // Получение текущего значения
    const currentValue = cell.value.getAttribute('label') || '';

    // Верстка окна
    const div = document.createElement('div');
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.height = '100%';
    const tbody = document.createElement('tbody');

    const row = document.createElement('tr');
    const tdName = document.createElement('td');
    let nameInput = document.createElement('input');
    nameInput.type = "text";
    nameInput = styleInput(nameInput);
    nameInput.placeholder = "Value";
    nameInput.value = currentValue;
    tdName.appendChild(nameInput);
    row.appendChild(tdName);
    tbody.appendChild(row);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка сохранения узла
    let btnCreateNode = mxUtils.button(getTextByLocale("Apply"), function (): void {
        const rowItem = table.rows.item(0);
        const tdItem = rowItem?.getElementsByTagName("td").item(0);
        const inputItem = tdItem?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const newValue = inputItem?.value || '';

        const theGraph = editorUi.editor.graph;

        theGraph.getModel().beginUpdate();
        cell.value.setAttribute('label', newValue);
        theGraph.getModel().endUpdate();
        theGraph.refresh();
        win.destroy();
    });

    const btnDiv = document.createElement('div');
    styleDivBtn(btnDiv);
    btnCreateNode = styleBtn(btnCreateNode);
    btnDiv.appendChild(btnCreateNode);
    div.appendChild(btnDiv);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitlePredeterminingFactorsNodeEditorWindow"),
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