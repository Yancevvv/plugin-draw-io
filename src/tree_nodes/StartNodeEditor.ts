import { styleBtn, styleTable, styleDivBtn } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { checkAllInputsStartNode, generateStrValueForStartNode, addRowStartNode } from './StartNodeConstructor.js';
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

interface ExtendedMXCell extends MXCell {
    value: MXCellValue;
}

interface StartEditorWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

// Окно редактирования начального узла
export const StartEditorWindow = function (
    this: StartEditorWindowInstance,
    cell: ExtendedMXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): StartEditorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    div.style.width = "100%";
    let table = document.createElement('table');
    table = styleTable(table);
    const tbody = document.createElement('tbody');
    tbody.style.height = "100%";

    fillDataStart(tbody, cell, editorUi);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка создания блока
    let applyBtn = mxUtils.button(getTextByLocale("Apply"), function (): void {
        checkAllInputsStartNode(table);

        const strValue = generateStrValueForStartNode(table);
        const theGraph = editorUi.editor.graph;

        theGraph.getModel().beginUpdate();
        cell.value.setAttribute("label", strValue);
        theGraph.getModel().endUpdate();
        theGraph.refresh(); // update the graph
        win.destroy();
    });

    // Кнопка добавления полей для нового класса
    let addClass = mxUtils.button(getTextByLocale("AddVariable"), function (): void {
        const newRow = addRowStartNode(editorUi);
        const tdDelRow = document.createElement('td');
        const btnDelRow = mxUtils.button(getTextByLocale("Delete"), function (evt?: MouseEvent): void {
            if (evt?.target && evt.target instanceof HTMLElement) {
                const rowToDelete = evt.target.closest('tr');
                if (rowToDelete) {
                    rowToDelete.remove();
                }
            }
        });
        tdDelRow.appendChild(styleBtn(btnDelRow));
        newRow.appendChild(tdDelRow);
        tbody.appendChild(newRow);
    });

    // Добавление кнопок в окно
    let btnDiv = document.createElement('div');
    btnDiv = styleDivBtn(btnDiv);
    addClass = styleBtn(addClass);
    applyBtn = styleBtn(applyBtn);
    btnDiv.appendChild(addClass);
    btnDiv.appendChild(applyBtn);
    div.appendChild(btnDiv);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleStartEditorWindow"),
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
    self.window.setResizable(true);
    self.window.setClosable(true);
    self.window.setVisible(true);
    
    return self;
};

// Заполнение данными в окне
function fillDataStart(
    tbody: HTMLTableSectionElement,
    cell: ExtendedMXCell,
    editorUi: EditorUi
): void {
    const cellValue = cell.value;
    const cellLabel = cellValue.getAttribute('label') || '';
    const values = cellLabel.split('\n');

    values.forEach((element: string, index: number) => {
        if (!element.trim()) return;
        
        const varWithClass = element.split(" - ");
        const varName = varWithClass[0] || '';
        const className = varWithClass[1] || '';

        const row = addRowStartNode(editorUi);

        // Установка имени переменной
        const nameInput = row.getElementsByTagName("td").item(0)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        if (nameInput) {
            nameInput.value = varName;
        }

        // Установка типа (класса)
        const typeSelect = row.getElementsByTagName("td").item(1)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        if (typeSelect) {
            for (let i = 0; i < typeSelect.options.length; ++i) {
                if (typeSelect.options[i].value === className) {
                    typeSelect.options[i].selected = true;
                    break;
                }
            }
        }

        // Добавление кнопки удаления для всех строк кроме первой
        if (index !== 0) {
            const tdDelRow = document.createElement('td');
            const btnDelRow = mxUtils.button(getTextByLocale("Delete"), function (evtDel?: MouseEvent): void {
                if (evtDel?.target && evtDel.target instanceof HTMLElement) {
                    const rowToDelete = evtDel.target.closest('tr');
                    if (rowToDelete) {
                        rowToDelete.remove();
                    }
                }
            });
            tdDelRow.appendChild(styleBtn(btnDelRow));
            row.appendChild(tdDelRow);
        }

        tbody.appendChild(row);
    });
}