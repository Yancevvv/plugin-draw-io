import { styleBtn, styleTable, styleDivBtn, styleInput, styleSelect } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { getClasses } from '../dictionaries/Utils.js';
import { checkValidID } from '../utils/utils.js';
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

interface StartConstructorWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

// Окно конструктора начального узла
export const StartConstructorWindow = function (
    this: StartConstructorWindowInstance,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): StartConstructorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    div.style.width = "100%";
    let table = document.createElement('table');
    table = styleTable(table);
    const tbody = document.createElement('tbody');
    tbody.style.height = "100%";

    const row = addRowStartNode(editorUi);
    tbody.appendChild(row);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка создания блока
    let applyBtn = mxUtils.button(getTextByLocale("Create"), function (): void {
        checkAllInputsStartNode(table);

        const theGraph = editorUi.editor.graph;
        if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
            const pos = theGraph.getInsertPoint();
            const geometry: MXGeometry = {
                x: pos.x,
                y: pos.y,
                width: 165,
                height: 60
            };
            const style = "shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;editable=0;";
            const newElement = new mxCell("", geometry, style);

            const strValue = generateStrValueForStartNode(table);
            newElement.value = strValue;
            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            theGraph.setAttributeForCell(newElement, 'type', "START");
        }
        win.destroy();
    });

    // Кнопка добавления полей для нового класса
    let addClass = mxUtils.button(getTextByLocale("AddVariable"), function (): void {
        const newRow = addRowStartNode(editorUi);
        const tdDelRow = document.createElement('td');
        const btnDelRow = mxUtils.button(getTextByLocale("Delete"), function (evt?: MouseEvent): void {
            if (evt?.target && evt.target instanceof HTMLElement) {
                evt.target.parentElement?.parentElement?.remove();
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
        getTextByLocale("TitleStartConstructorWindow"),
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

// Создание строки с входной переменной
export function addRowStartNode(editorUi: EditorUi): HTMLTableRowElement {
    const tr1 = document.createElement('tr');

    const td1 = document.createElement('td');
    let name = document.createElement('input');
    name.type = "text";
    name = styleInput(name);
    name.placeholder = "Variable name";
    td1.appendChild(name);

    const td2 = document.createElement('td');
    let selectClass = document.createElement('select');
    selectClass = styleSelect(selectClass);
    const jsonClasses: ClassItem[] = getClasses(editorUi);
    jsonClasses.forEach(classItem => {
        const newOption = new Option(classItem.name, classItem.name);
        selectClass.options[selectClass.options.length] = newOption;
    });
    td2.appendChild(selectClass);

    tr1.appendChild(td1);
    tr1.appendChild(td2);
    return tr1;
}

// Валидация полей
export function checkAllInputsStartNode(table: HTMLTableElement): void {
    let errors = "";
    
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows.item(i);
        if (!row) continue;
        
        const nameInput = row.getElementsByTagName("td").item(0)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const checkValue = nameInput?.value || '';
        
        if (checkValue === "") {
            errors += getTextByLocale("nameIsMissing").replace("%i", (i + 1).toString());
        } else if (!checkValidID(checkValue)) {
            errors += getTextByLocale("nameIsIncorrect").replace("%i", (i + 1).toString());
        }
        
        const classSelect = row.getElementsByTagName("td").item(1)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        if (!classSelect || typeof classSelect.options[classSelect.selectedIndex] === "undefined") {
            errors += getTextByLocale("classesIsMissing").replace("%i", (i + 1).toString());
        }
    }
    
    if (errors !== "") {
        throw new Error(errors);
    }
}

// Генерация строкового представления узла
export function generateStrValueForStartNode(table: HTMLTableElement): string {
    let strValue = "";
    
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows.item(i);
        if (!row) continue;
        
        const nameInput = row.getElementsByTagName("td").item(0)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const nameVar = nameInput?.value || '';
        
        const classSelect = row.getElementsByTagName("td").item(1)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        const classVar = classSelect?.options[classSelect.selectedIndex]?.value || '';

        strValue += `${nameVar} - ${classVar}\n`;
    }

    return strValue.slice(0, -1);
}