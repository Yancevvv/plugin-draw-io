import { styleTable, styleInput, styleBtn, styleDivBtn, styleSpan } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { checkValidID, checkUniqueValues } from '../utils/utils.js';
import { EditorUi, MxWindow, MXGraph, MXGraphModel, MXGeometry, MXCell, EnumItem, ClassItem, MXCellValue } from '../utils/types.js';

interface EnumConstructorWindowInstance {
    window: MxWindow;
}

// Окно конструктора блока с enum
export const EnumConstructorWindow = function (
    this: EnumConstructorWindowInstance,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): EnumConstructorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    const table = document.createElement('table');
    styleTable(table);
    const tbody = document.createElement('tbody');
    tbody.style.height = "100%";

    const row = addRowEnum();
    addComparisonResult(row);
    tbody.appendChild(row);

    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка создания блока
    let applyBtn = mxUtils.button(getTextByLocale("Create"), function (): void {
        checkAllInputsEnum(tbody);

        const theGraph = editorUi.editor.graph;

        checkExistEnumDictionary(theGraph);

        if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
            const pos = theGraph.getInsertPoint();
            const newElement = new mxCell(
                "",
                { x: pos.x, y: pos.y, width: 267, height: (table.rows.length + 1) * 17 } as MXGeometry,
                "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fontColor=#6666FF;align=center;editable=0;"
            );

            const strValue = generateStrValueForEnums(tbody);
            newElement.value = strValue;
            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
        }
        win.destroy();
    });

    // Кнопка добавления полей для нового enum
    let addEnum = mxUtils.button(getTextByLocale("AddEnum"), function (): void {
        const newRow = addRowEnum();
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
    applyBtn = styleBtn(applyBtn);
    addEnum = styleBtn(addEnum);
    btnDiv.appendChild(addEnum);
    btnDiv.appendChild(applyBtn);
    div.appendChild(btnDiv);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleEnumConstructorWindow"),
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

// Добавление строки с новым enum в конструкторе
export function addRowEnum(): HTMLTableRowElement {
    const tr1 = document.createElement('tr');
    
    const td1 = document.createElement('td');
    td1.style.minWidth = "200px";
    let text = document.createElement('input');
    text.type = "text";
    text = styleInput(text);
    text.placeholder = "Name enum";
    td1.appendChild(text);
    tr1.appendChild(td1);

    const td2 = document.createElement('td');
    td2.style.minWidth = "150px";
    let text2 = document.createElement('input');
    text2.type = "text";
    text2 = styleInput(text2);
    text2.placeholder = "Value";
    td2.appendChild(text2);
    tr1.appendChild(td2);

    const tdAdd = document.createElement('td');
    tdAdd.style.minWidth = "50px";
    let btnAdd = mxUtils.button('+', function (evt?: MouseEvent): void {
        if (!evt?.target) return;
        
        const newTd = document.createElement('td');
        newTd.style.minWidth = "200px";
        let newInput = document.createElement('input');
        newInput.type = "text";
        newInput = styleInput(newInput);
        newInput.style.marginRight = "4px";
        newInput.style.width = '85%';
        newInput.style.float = 'left';
        newInput.placeholder = "Value";
        
        let btnDel = mxUtils.button('-', function (evtDel?: MouseEvent): void {
            if (evtDel?.target && evtDel.target instanceof HTMLElement) {
                evtDel.target.parentElement?.remove();
            }
        });
        btnDel = styleBtn(btnDel);
        const delButton = btnDel as HTMLButtonElement;
        delButton.style.float = 'left';
        delButton.style.width = '10%';
        
        newTd.appendChild(newInput);
        newTd.appendChild(btnDel);
        
        const targetElement = evt.target as HTMLElement;
        targetElement.parentElement?.parentElement?.insertBefore(newTd, targetElement.parentElement);
    });
    btnAdd = styleBtn(btnAdd);
    tdAdd.appendChild(btnAdd);
    tr1.appendChild(tdAdd);

    const td3 = document.createElement('td');
    td3.style.minWidth = "100px";
    let span = document.createElement('span');
    span = styleSpan(span);
    span.innerText = "is linear";
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.addEventListener('change', (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        if (!target) return;
        
        if (target.checked) {
            const tdNameRDF = document.createElement('td');
            tdNameRDF.style.minWidth = "150px";
            let inputNameRDF = document.createElement('input');
            inputNameRDF = styleInput(inputNameRDF);
            inputNameRDF.type = "text";
            inputNameRDF.style.width = '90%';
            inputNameRDF.placeholder = "Name in RDF";
            tdNameRDF.appendChild(inputNameRDF);
            target.parentElement?.parentElement?.insertBefore(tdNameRDF, target.parentElement?.nextElementSibling ?? null);
        } else {
            target.parentElement?.nextElementSibling?.remove();
        }
    });

    td3.appendChild(span);
    td3.appendChild(checkbox);
    tr1.appendChild(td3);
    
    return tr1;
}

// Валидация всех полей при сохранении
export function checkAllInputsEnum(table: HTMLTableSectionElement): void {
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

        let lastIndex = 1;
        let currentInput = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        let isErrorValue = false;
        
        while (currentInput !== null && currentInput !== undefined) {
            if (currentInput.value === "" && !isErrorValue) {
                errors += getTextByLocale("valueIsMissing").replace("%i", (i + 1).toString());
                isErrorValue = true;
            } else if (!checkValidID(currentInput.value) && !isErrorValue) {
                errors += getTextByLocale("valueIsIncorrect").replace("%i", (i + 1).toString());
                isErrorValue = true;
            }
            lastIndex++;
            currentInput = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        }
        
        lastIndex++;
        const isLinearCheckbox = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const isLinear = isLinearCheckbox?.checked || false;
        
        let checkRdfName = "";
        if (isLinear) {
            const rdfInput = row.getElementsByTagName("td").item(lastIndex + 1)
                ?.getElementsByTagName("input").item(0) as HTMLInputElement;
            checkRdfName = rdfInput?.value || '';
        }
        
        if (isLinear && checkRdfName === "") {
            errors += getTextByLocale("nameRDFIsMissing").replace("%i", (i + 1).toString());
        } else if (isLinear && !checkValidID(checkRdfName)) {
            errors += getTextByLocale("nameRDFIsIncorrect").replace("%i", (i + 1).toString());
        }
    }
    
    if (arrayNames.length !== 0 && !checkUniqueValues(arrayNames)) {
        errors += getTextByLocale("nonUniqueEnumName");
    }
    if (errors !== "") {
        throw new Error(errors);
    }
}

// Генерация строкового представления словаря для визуализации
export function generateStrValueForEnums(table: HTMLTableSectionElement): string {
    let strValue = '<font color="#000000"><b>Enum</b></font>';

    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows.item(i);
        if (!row) continue;
        
        const nameInput = row.getElementsByTagName("td").item(0)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const nameEnum = nameInput?.value || '';
        
        const valuesEnum: string[] = [];
        const firstValueInput = row.getElementsByTagName("td").item(1)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        valuesEnum[0] = firstValueInput?.value || '';

        let lastIndex = 2;
        let currentInput = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
            
        while (currentInput !== null && currentInput !== undefined) {
            valuesEnum.push(currentInput.value);
            lastIndex++;
            currentInput = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        }
        
        lastIndex++;
        const isLinearCheckbox = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const isLinear = isLinearCheckbox?.checked || false;
        
        let nameRDF = "";
        if (isLinear) {
            const rdfInput = row.getElementsByTagName("td").item(lastIndex + 1)
                ?.getElementsByTagName("input").item(0) as HTMLInputElement;
            nameRDF = rdfInput?.value || '';
        }

        strValue += '<br><font color="#ff66b3">' + escapeHtml(nameEnum) + '</font> values:(<font color="#ff6666">' + escapeHtml(valuesEnum[0]);
        for (let j = 1; j < valuesEnum.length; j++) {
            strValue += ', ' + escapeHtml(valuesEnum[j]);
        }
        strValue += '</font>) isLinear: <font color="#123123">' + isLinear + '</font>';
        if (isLinear) {
            strValue += ' nameRDF: <font color="#fff123">' + escapeHtml(nameRDF) + '</font>';
        }
    }

    return strValue;
}

// Простая функция для экранирования HTML
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Проверка существования словаря на полотне в draw io
function checkExistEnumDictionary(graph: MXGraph): void {
    const cells = graph.getModel().cells;
    Object.keys(cells).forEach(function (key: string) {
        const cellValue = cells[key].value;
        if (typeof cellValue === "string" && cellValue.startsWith('<font color="#000000"><b>Enum</b></font>')) {
            throw new Error("Enum dictionary already exists");
        }
    });
}

// Добавление по умолчанию дефолтного enum
function addComparisonResult(row: HTMLTableRowElement): void {
    const nameEnum = "comparisonResult";
    const valuesEnum = ["greater", "less", "equal", "undetermined"];
    const isLinear = false;

    const nameInput = row.getElementsByTagName("td").item(0)
        ?.getElementsByTagName("input").item(0) as HTMLInputElement;
    if (nameInput) {
        nameInput.value = nameEnum;
        nameInput.disabled = true;
    }

    let lastIndex = 1;
    valuesEnum.forEach((element: string) => {
        if (lastIndex !== 1) {
            const newTd = document.createElement('td');
            newTd.style.minWidth = "200px";
            let newInput = document.createElement('input');
            newInput.type = "text";
            newInput = styleInput(newInput);
            newInput.style.width = '100%';
            newInput.style.float = 'left';
            newInput.placeholder = "Value";
            newTd.appendChild(newInput);
            const targetTd = row.getElementsByTagName("td").item(lastIndex);
            if (targetTd) {
                row.insertBefore(newTd, targetTd);
            }
        }
        
        const valueInput = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        if (valueInput) {
            valueInput.value = element;
            valueInput.disabled = true;
        }
        lastIndex++;
    });
    
    const tdToHide = row.getElementsByTagName("td").item(lastIndex);
    if (tdToHide) {
        tdToHide.style.display = "none";
    }

    const linearCheckbox = row.getElementsByTagName("td").item(lastIndex + 1)
        ?.getElementsByTagName("input").item(0) as HTMLInputElement;
    if (linearCheckbox) {
        linearCheckbox.checked = isLinear;
        linearCheckbox.disabled = true;
    }
}