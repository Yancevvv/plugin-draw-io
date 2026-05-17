import { styleTable, styleInput, styleBtn, styleDivBtn, styleSelect, styleSpan } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { checkValidID, checkUniqueValues } from '../utils/utils.js';
import { getEnums, getClasses } from './Utils.js';
import { EditorUi, MxWindow, MXGraph, MXGraphModel, MXGeometry, MXCell, EnumItem, ClassItem } from '../utils/types.js';
// Объявление глобальных типов для mxGraph
declare const mxUtils: {
    button: (label: string, handler: (evt?: MouseEvent) => void) => HTMLButtonElement;
};

interface ClassPropertiesConstructorWindowInstance {
    window: MxWindow;
}

// Окно конструктора блока со свойствами классов
export const ClassPropertiesConstructorWindow = function (
    this: ClassPropertiesConstructorWindowInstance,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): ClassPropertiesConstructorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    const table = document.createElement('table');
    styleTable(table);
    const tbody = document.createElement('tbody');
    tbody.style.height = "100%";
    const rowProperty = addRowProperty(editorUi);

    tbody.appendChild(rowProperty);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка создания блока
    let applyBtn = mxUtils.button(getTextByLocale("Create"), function (): void {
        checkAllInputsProperty(table);
        const theGraph = editorUi.editor.graph;

        checkExistClassPropertiesDictionary(theGraph);

        if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
            const pos = theGraph.getInsertPoint();
            const newElement = new mxCell(
                "",
                { x: pos.x, y: pos.y, width: 267, height: (table.rows.length + 1) * 17 } as MXGeometry,
                "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fontColor=#00CCCC;align=center;editable=0;"
            );

            const strValue = generateStrValueForProperties(table);
            newElement.value = strValue;
            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
        }
        win.destroy();
    });

    // Кнопка добавления полей для нового свойства класса
    let addProperty = mxUtils.button(getTextByLocale("AddPropertyClass"), function (): void {
        const newRowProperty = addRowProperty(editorUi);
        const tdDelRow = document.createElement('td');
        tdDelRow.classList.add('delete');
        const btnDelRow = mxUtils.button(getTextByLocale("Delete"), function (evt?: MouseEvent): void {
            if (evt?.target && evt.target instanceof HTMLElement) {
                evt.target.parentElement?.parentElement?.remove();
            }
        });
        tdDelRow.appendChild(styleBtn(btnDelRow));
        newRowProperty.appendChild(tdDelRow);
        tbody.appendChild(newRowProperty);
    });

    // Добавление кнопок в окно
    let btnDiv = document.createElement('div');
    btnDiv = styleDivBtn(btnDiv);
    applyBtn = styleBtn(applyBtn);
    addProperty = styleBtn(addProperty);
    btnDiv.appendChild(addProperty);
    btnDiv.appendChild(applyBtn);
    div.appendChild(btnDiv);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleClassPropertiesConstructorWindow"),
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

// Добавление строки с новым свойством в конструкторе
export function addRowProperty(editorUi: EditorUi): HTMLTableRowElement {
    const tr1 = document.createElement('tr');

    const td1 = document.createElement('td');
    td1.style.minWidth = "200px";
    let text = document.createElement('input');
    text.type = "text";
    text.placeholder = "Name";
    text = styleInput(text);
    td1.appendChild(text);
    tr1.appendChild(td1);

    // Создание выпадающего списка с типами + enums
    const td2 = document.createElement('td');
    td2.style.minWidth = "150px";
    let selectType = document.createElement('select');
    selectType = styleSelect(selectType);
    const types: string[] = ["Integer", "Double", "Boolean", "String"];
    const jsonEnums: EnumItem[] = getEnums(editorUi);
    jsonEnums.forEach(enumItem => {
        types.push("enum: " + enumItem.nameEnum);
    });
    types.forEach(element => {
        const newOption = new Option(element, element);
        selectType.options[selectType.options.length] = newOption;
    });
    selectType.addEventListener('change', (event: Event) => {
        const target = event.currentTarget as HTMLSelectElement;
        if (!target) return;
        
        if (target.value === "Integer" || target.value === "Double") {
            const nextSibling = target.parentElement?.nextElementSibling;
            if (nextSibling && nextSibling.classList && !nextSibling.classList.contains('range')) {
                const tdRange = document.createElement('td');
                tdRange.style.minWidth = "200px";
                tdRange.classList.add('range');

                let startInput = document.createElement('input');
                startInput.type = "number";
                startInput.placeholder = "0";
                startInput = styleInput(startInput);
                startInput.style.width = '45%';
                tdRange.appendChild(startInput);

                let dash = document.createElement('span');
                dash.innerText = "-";
                dash = styleSpan(dash);
                dash.style.width = '30%';
                tdRange.appendChild(dash);

                let endInput = document.createElement('input');
                endInput.type = "number";
                endInput.placeholder = "9";
                endInput = styleInput(endInput);
                endInput.style.width = '45%';
                tdRange.appendChild(endInput);

                target.parentElement?.parentElement?.insertBefore(tdRange, target.parentElement.nextElementSibling);
            }
        } else {
            const nextSibling = target.parentElement?.nextElementSibling;
            if (nextSibling && nextSibling.classList && nextSibling.classList.contains('range')) {
                nextSibling.remove();
            }
        }
    });
    td2.appendChild(selectType);
    
    const tdRange = document.createElement('td');
    tdRange.style.minWidth = "200px";
    tdRange.classList.add('range');

    let startInput = document.createElement('input');
    startInput.type = "number";
    startInput.placeholder = "0";
    startInput = styleInput(startInput);
    startInput.style.width = '45%';
    tdRange.appendChild(startInput);

    let dash = document.createElement('span');
    dash.innerText = "-";
    dash = styleSpan(dash);
    dash.style.width = '30%';
    tdRange.appendChild(dash);

    let endInput = document.createElement('input');
    endInput.type = "number";
    endInput.placeholder = "9";
    endInput = styleInput(endInput);
    endInput.style.width = '45%';
    tdRange.appendChild(endInput);
    tr1.appendChild(td2);
    tr1.appendChild(tdRange);

    // Создание checkbox isStatic
    const td3 = document.createElement('td');
    td3.style.minWidth = "120px";
    let span = document.createElement('span');
    span = styleSpan(span);
    span.innerText = "is static";
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    td3.appendChild(span);
    td3.appendChild(checkbox);
    tr1.appendChild(td3);

    const tdInputClass = document.createElement('td');
    tdInputClass.style.minWidth = "150px";
    let selectClass = document.createElement('select');
    selectClass = styleSelect(selectClass);
    const jsonClasses: ClassItem[] = getClasses(editorUi);
    jsonClasses.forEach(classItem => {
        const newOption = new Option(classItem.name, classItem.name);
        selectClass.options[selectClass.options.length] = newOption;
    });
    tdInputClass.appendChild(selectClass);

    const tdAddClass = document.createElement('td');
    tdAddClass.style.minWidth = "50px";
    let btnAddClass = mxUtils.button('+', function (evt?: MouseEvent): void {
        if (!evt?.target) return;
        
        const newTdClass = document.createElement('td');
        newTdClass.style.minWidth = "200px";
        let newSelectClass = document.createElement('select');
        newSelectClass = styleSelect(newSelectClass);
        newSelectClass.style.marginRight = "4px";
        newSelectClass.style.width = '85%';
        newSelectClass.style.float = 'left';
        const jsonClassesInner: ClassItem[] = getClasses(editorUi);
        jsonClassesInner.forEach(classItem => {
            const newOption = new Option(classItem.name, classItem.name);
            newSelectClass.options[newSelectClass.options.length] = newOption;
        });
        const btnDelClass = mxUtils.button('-', function (evtDel?: MouseEvent): void {
            if (evtDel?.target && evtDel.target instanceof HTMLElement) {
                evtDel.target.parentElement?.remove();
            }
        });
        newTdClass.appendChild(newSelectClass);
        newTdClass.appendChild(styleBtn(btnDelClass));
        (btnDelClass as HTMLButtonElement).style.float = 'left';
        (btnDelClass as HTMLButtonElement).style.width = '10%';
        
        const targetElement = evt.target as HTMLElement;
        targetElement.parentElement?.parentElement?.insertBefore(newTdClass, targetElement.parentElement);
    });
    btnAddClass = styleBtn(btnAddClass);
    tdAddClass.appendChild(btnAddClass);
    tr1.appendChild(tdInputClass);
    tr1.appendChild(tdAddClass);
    
    return tr1;
}

// Валидация всех полей при сохранении
export function checkAllInputsProperty(table: HTMLTableElement): void {
    let errors = "";
    const arrayNames: string[] = [];
    
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows.item(i);
        if (!row) continue;
        
        const nameInput = row.getElementsByTagName("td").item(0)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const checkValue = nameInput?.value || '';
        arrayNames.push(checkValue);
        
        if (checkValue === "") {
            errors += getTextByLocale("nameIsMissing").replace("%i", (i + 1).toString());
        } else if (!checkValidID(checkValue)) {
            errors += getTextByLocale("nameIsIncorrect").replace("%i", (i + 1).toString());
        }

        const typeSelect = row.getElementsByTagName("td").item(1)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        if (!typeSelect) continue;
        
        const type = typeSelect.options[typeSelect.selectedIndex]?.value || '';

        let lastIndex = 2;
        if (type === "Integer" || type === "Double") {
            const startInput = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("input").item(0) as HTMLInputElement;
            const endInput = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("input").item(1) as HTMLInputElement;
                
            if (!startInput?.value) {
                errors += getTextByLocale("startValueIsMissing").replace("%i", (i + 1).toString());
            }
            if (!endInput?.value) {
                errors += getTextByLocale("endValueIsMissing").replace("%i", (i + 1).toString());
            }
            lastIndex++;
        }

        lastIndex++;
        let currentSelect = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement | null;
            
        while (currentSelect !== null && currentSelect !== undefined) {
            if (!currentSelect.options[currentSelect.selectedIndex]) {
                errors += getTextByLocale("classesIsMissing").replace("%i", (i + 1).toString());
                break;
            }
            lastIndex++;
            currentSelect = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("select").item(0) as HTMLSelectElement | null;
        }
    }
    
    if (arrayNames.length !== 0 && !checkUniqueValues(arrayNames)) {
        errors += getTextByLocale("nonUniquePropertyName");
    }
    if (errors !== "") {
        throw new Error(errors);
    }
}

// Генерация строкового представления словаря для визуализации
export function generateStrValueForProperties(table: HTMLTableElement): string {
    let strValue = '<b><font color="#000000">Class and Object properties</font></b>';

    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows.item(i);
        if (!row) continue;
        
        const propertyInput = row.getElementsByTagName("td").item(0)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const property = propertyInput?.value || '';

        const typeSelect = row.getElementsByTagName("td").item(1)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        const type = typeSelect?.options[typeSelect.selectedIndex]?.value || '';

        let lastIndex = 2;
        let startValue = '';
        let endValue = '';
        
        if (type === "Integer" || type === "Double") {
            const startInput = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("input").item(0) as HTMLInputElement;
            const endInput = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("input").item(1) as HTMLInputElement;
            startValue = startInput?.value || '';
            endValue = endInput?.value || '';
            lastIndex++;
        }

        const isStaticCheckbox = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const isStatic = isStaticCheckbox?.checked || false;
        lastIndex++;
        
        const classList: string[] = [];
        const classSelect = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
            
        if (classSelect && classSelect.options[classSelect.selectedIndex]) {
            classList[0] = classSelect.options[classSelect.selectedIndex].value;
        } else {
            classList[0] = '';
        }
        
        lastIndex++;
        let currentSelect = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement | null;
            
        while (currentSelect !== null && currentSelect !== undefined) {
            if (currentSelect.options[currentSelect.selectedIndex]) {
                classList.push(currentSelect.options[currentSelect.selectedIndex].value);
            }
            lastIndex++;
            currentSelect = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("select").item(0) as HTMLSelectElement | null;
        }

        if (isStatic) {
            strValue += '<br><font color="#FF8000">' + property + '</font>';
        } else {
            strValue += '<br><font color="#00CC00">' + property + '</font>';
        }

        strValue += ' (<font color="#fc49a4">' + (classList[0] || '');
        for (let j = 1; j < classList.length; j++) {
            strValue += ', ' + classList[j];
        }
        strValue += '</font>) <font color="#000000">' + type + '</font>';

        if (type === "Integer" || type === "Double") {
            strValue += '<font color="#000000">: ' + startValue + '-' + endValue + '</font>';
        }

        strValue += ' <font color="#19c3c0">isStatic:</font> '
            + '<font color="#000000">' + isStatic + '</font>';
    }

    return strValue;
}

// Проверка существования словаря на полотне в draw io
function checkExistClassPropertiesDictionary(graph: MXGraph): boolean {
    const cells = graph.getModel().cells;
    if (!cells) {
        return false;
    }
    Object.keys(cells).forEach(function (key: string) {
        const cell = cells[key];

        const cellValue = cell?.value;
        
        if (typeof cellValue === "string" && 
            cellValue.startsWith('<b><font color="#000000">Class and Object properties</font></b>')) {
            throw new Error(getTextByLocale("PropertyExists"));
        }
    });
    return false;
}