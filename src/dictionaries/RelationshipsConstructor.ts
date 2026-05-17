import { styleTable, styleInput, styleBtn, styleDivBtn, styleSelect, styleSpan } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { checkValidID, checkUniqueValues } from '../utils/utils.js';
import { getClasses } from './Utils.js';
import { EditorUi, MxWindow, MXGraph, MXGraphModel, MXGeometry, MXCell, EnumItem, ClassItem } from '../utils/types.js';
// Объявление глобальных типов для mxGraph
declare const mxUtils: {
    button: (label: string, handler: (evt?: MouseEvent) => void) => HTMLButtonElement;
};

interface RelationshipsConstructorWindowInstance {
    window: MxWindow;
}

// Окно конструктора блока с отношениями для классов
export const RelationshipsConstructorWindow = function (
    this: RelationshipsConstructorWindowInstance,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): RelationshipsConstructorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    const table = document.createElement('table');
    styleTable(table);
    const tbody = document.createElement('tbody');
    tbody.style.height = "100%";

    const rowRelationship = addRowRelationship(editorUi);
    tbody.appendChild(rowRelationship);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка создания блока
    let applyBtn = mxUtils.button(getTextByLocale("Create"), function (): void {
        checkAllInputsRelationship(table);
        const theGraph = editorUi.editor.graph;

        checkExistRelationshipsDictionary(theGraph);

        if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
            const pos = theGraph.getInsertPoint();
            const newElement = new mxCell(
                "",
                { x: pos.x, y: pos.y, width: 267, height: (table.rows.length + 1) * 17 } as MXGeometry,
                "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fontColor=#000000;align=center;editable=0;"
            );

            const valuesRels = generateStrValueForRelationships(table);
            newElement.value = valuesRels[0];
            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            
            for (let i = 0; i < valuesRels[1].length; i++) {
                theGraph.setAttributeForCell(newElement, 'namesRels_' + i, valuesRels[1][i]);
                theGraph.setAttributeForCell(newElement, 'binFlags_' + i, valuesRels[2][i]);
            }
        }
        win.destroy();
    });

    // Кнопка добавления полей для нового отношения между классами
    let addRelationship = mxUtils.button(getTextByLocale("AddRelationship"), function (): void {
        const newRowRelationship = addRowRelationship(editorUi);
        const tdDelRow = document.createElement('td');
        tdDelRow.classList.add('delete');
        const btnDelRow = mxUtils.button(getTextByLocale("Delete"), function (evt?: MouseEvent): void {
            if (evt?.target && evt.target instanceof HTMLElement) {
                evt.target.parentElement?.parentElement?.remove();
            }
        });
        tdDelRow.appendChild(styleBtn(btnDelRow));
        newRowRelationship.appendChild(tdDelRow);
        tbody.appendChild(newRowRelationship);
    });

    // Добавление кнопок в окно
    let btnDiv = document.createElement('div');
    btnDiv = styleDivBtn(btnDiv);
    applyBtn = styleBtn(applyBtn);
    addRelationship = styleBtn(addRelationship);
    btnDiv.appendChild(addRelationship);
    btnDiv.appendChild(applyBtn);
    div.appendChild(btnDiv);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleRelationshipsConstructorWindow"),
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

// Добавление строки с новым отношением в конструкторе
export function addRowRelationship(editorUi: EditorUi): HTMLTableRowElement {
    const tr1 = document.createElement('tr');

    const td1 = document.createElement('td');
    td1.style.minWidth = "200px";
    let text = document.createElement('input');
    text.type = "text";
    text = styleInput(text);
    text.placeholder = "Relationship name";
    text.style.width = '100%';
    td1.appendChild(text);
    tr1.appendChild(td1);

    const td2 = document.createElement('td');
    td2.style.minWidth = "200px";
    let extend = document.createElement('input');
    extend.type = "text";
    extend = styleInput(extend);
    extend.placeholder = "Extend";
    td2.appendChild(extend);
    tr1.appendChild(td2);

    // Добавление классов
    const td3 = document.createElement('td');
    td3.style.minWidth = "150px";
    let selectClass = document.createElement('select');
    selectClass = styleSelect(selectClass);
    const jsonClasses: ClassItem[] = getClasses(editorUi);
    jsonClasses.forEach(classItem => {
        const newOption = new Option(classItem.name, classItem.name);
        selectClass.options[selectClass.options.length] = newOption;
    });
    td3.appendChild(selectClass);

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
        
        let btnDelClass = mxUtils.button('-', function (evtDel?: MouseEvent): void {
            if (evtDel?.target && evtDel.target instanceof HTMLElement) {
                evtDel.target.parentElement?.remove();
            }
        });
        btnDelClass = styleBtn(btnDelClass);
        const delButton = btnDelClass as HTMLButtonElement;
        delButton.style.float = 'left';
        delButton.style.width = '10%';
        
        newTdClass.appendChild(newSelectClass);
        newTdClass.appendChild(btnDelClass);
        
        const targetElement = evt.target as HTMLElement;
        targetElement.parentElement?.parentElement?.insertBefore(newTdClass, targetElement.parentElement);
    });
    btnAddClass = styleBtn(btnAddClass);
    tdAddClass.appendChild(btnAddClass);
    tr1.appendChild(td3);
    tr1.appendChild(tdAddClass);

    // Селектор с scale
    const td5 = document.createElement('td');
    td5.style.minWidth = "150px";
    let selectScale = document.createElement('select');
    selectScale = styleSelect(selectScale);
    const scales = ["None", "Linear", "Partially linear"];
    scales.forEach(element => {
        const newOption = new Option(element, element);
        selectScale.options[selectScale.options.length] = newOption;
    });

    selectScale.addEventListener('change', (event: Event) => {
        const target = event.target as HTMLSelectElement;
        const currentTarget = event.currentTarget as HTMLSelectElement;
        if (!target || !currentTarget) return;
        
        const row = target.parentElement?.parentElement;
        if (!row) return;
        
        checkFlags(row, target.options[target.selectedIndex]?.value || "None");
        
        if ((target.options[target.selectedIndex]?.value === "Linear" || target.options[target.selectedIndex]?.value === "Partially linear") &&
            currentTarget.parentElement?.nextElementSibling &&
            !currentTarget.parentElement.nextElementSibling.classList.contains("names")) {
            
            const tdInputNames = document.createElement('td');
            tdInputNames.classList.add("names");
            tdInputNames.style.minWidth = "150px";
            let nameInput = document.createElement('input');
            nameInput.type = "text";
            nameInput = styleInput(nameInput);
            nameInput.placeholder = "Name";
            tdInputNames.appendChild(nameInput);

            const tdAddName = document.createElement('td');
            tdAddName.classList.add("addNames");
            tdAddName.style.minWidth = "50px";
            let btnAddName = mxUtils.button('+', function (evtName?: MouseEvent): void {
                if (!evtName?.target) return;
                
                const newTdName = document.createElement('td');
                newTdName.style.minWidth = "200px";
                let newNameInput = document.createElement('input');
                newNameInput.type = "text";
                newNameInput = styleInput(newNameInput);
                newNameInput.style.marginRight = "4px";
                newNameInput.style.width = '85%';
                newNameInput.style.float = 'left';
                newNameInput.placeholder = "Name";
                
                let btnDelName = mxUtils.button('-', function (evtDel?: MouseEvent): void {
                    if (evtDel?.target && evtDel.target instanceof HTMLElement) {
                        evtDel.target.parentElement?.remove();
                    }
                });
                btnDelName = styleBtn(btnDelName);
                const delButtonName = btnDelName as HTMLButtonElement;
                delButtonName.style.float = 'left';
                delButtonName.style.width = '10%';
                
                newTdName.appendChild(newNameInput);
                newTdName.appendChild(btnDelName);
                
                const targetElement = evtName.target as HTMLElement;
                targetElement.parentElement?.parentElement?.insertBefore(newTdName, targetElement.parentElement);
            });
            btnAddName = styleBtn(btnAddName);
            tdAddName.appendChild(btnAddName);

            if (currentTarget.parentElement?.parentElement) {
                const parent = currentTarget.parentElement.parentElement;
                const nextSibling = currentTarget.parentElement.nextElementSibling;
                if (nextSibling) {
                    parent.insertBefore(tdAddName, nextSibling);
                    parent.insertBefore(tdInputNames, nextSibling);
                } else {
                    parent.appendChild(tdAddName);
                    parent.appendChild(tdInputNames);
                }
            }
        } else if (target.options[target.selectedIndex]?.value === "None" &&
                   currentTarget.parentElement?.nextElementSibling &&
                   currentTarget.parentElement.nextElementSibling.classList.contains("names")) {
            
            let currentTd: Element | null = currentTarget.parentElement.nextElementSibling;
            while (currentTd && !currentTd.classList.contains('addNames')) {
                const toRemove = currentTd;
                currentTd = currentTd.nextElementSibling;
                toRemove.remove();
            }
            if (currentTd) {
                currentTd.remove();
            }
        }
    });
    td5.appendChild(selectScale);
    tr1.appendChild(td5);

    const td6 = document.createElement('td');
    td6.style.minWidth = "200px";
    td6.style.display = "flex";
    let span = document.createElement('span');
    span = styleSpan(span);
    span.innerText = "is relationship between classes";
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.addEventListener('change', (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        if (!target) return;
        
        if (target.checked) {
            const tdType = document.createElement('td');
            tdType.style.minWidth = "150px";
            let selectType = document.createElement('select');
            selectType = styleSelect(selectType);
            const types = ["One to one", "One to many", "Many to one", "Many to many"];
            types.forEach(element => {
                const newOption = new Option(element, element);
                selectType.options[selectType.options.length] = newOption;
            });
            tdType.appendChild(selectType);
            target.parentElement?.parentElement?.insertBefore(tdType, target.parentElement?.nextElementSibling ?? null);
        } else {
            target.parentElement?.nextElementSibling?.remove();
        }
    });
    td6.appendChild(span);
    td6.appendChild(checkbox);
    tr1.appendChild(td6);

    const td7 = document.createElement('td');
    td7.style.minWidth = "120px";
    td7.classList.add("symmetry");
    let span1 = document.createElement('span');
    span1 = styleSpan(span1);
    span1.innerText = "symmetry";
    const checkbox1 = document.createElement('input');
    checkbox1.type = "checkbox";
    td7.appendChild(span1);
    td7.appendChild(checkbox1);
    tr1.appendChild(td7);

    const td8 = document.createElement('td');
    td8.style.minWidth = "140px";
    td8.classList.add("antisymmetry");
    let span2 = document.createElement('span');
    span2 = styleSpan(span2);
    span2.innerText = "antisymmetry";
    const checkbox2 = document.createElement('input');
    checkbox2.type = "checkbox";
    td8.appendChild(span2);
    td8.appendChild(checkbox2);
    tr1.appendChild(td8);

    const td9 = document.createElement('td');
    td9.style.minWidth = "120px";
    td9.classList.add("reflexivity");
    let span3 = document.createElement('span');
    span3 = styleSpan(span3);
    span3.innerText = "reflexivity";
    const checkbox3 = document.createElement('input');
    checkbox3.type = "checkbox";
    td9.appendChild(span3);
    td9.appendChild(checkbox3);
    tr1.appendChild(td9);

    const td10 = document.createElement('td');
    td10.style.minWidth = "160px";
    td10.classList.add("antireflexivity");
    let span4 = document.createElement('span');
    span4 = styleSpan(span4);
    span4.innerText = "anti - reflexivity";
    const checkbox4 = document.createElement('input');
    checkbox4.type = "checkbox";
    td10.appendChild(span4);
    td10.appendChild(checkbox4);
    tr1.appendChild(td10);

    const td11 = document.createElement('td');
    td11.style.minWidth = "120px";
    td11.classList.add("transitivity");
    let span5 = document.createElement('span');
    span5 = styleSpan(span5);
    span5.innerText = "transitivity";
    const checkbox5 = document.createElement('input');
    checkbox5.type = "checkbox";
    td11.appendChild(span5);
    td11.appendChild(checkbox5);
    tr1.appendChild(td11);

    const td12 = document.createElement('td');
    td12.style.minWidth = "140px";
    td12.classList.add("antitransivity");
    let span6 = document.createElement('span');
    span6 = styleSpan(span6);
    span6.innerText = "antitransivity";
    const checkbox6 = document.createElement('input');
    checkbox6.type = "checkbox";
    td12.appendChild(span6);
    td12.appendChild(checkbox6);
    tr1.appendChild(td12);

    return tr1;
}

// Валидация всех полей при сохранении
export function checkAllInputsRelationship(table: HTMLTableElement): void {
    let errors = "";
    const arrayNames: string[] = [];
    
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows.item(i);
        if (!row) continue;
        
        const nameInput = row.getElementsByTagName("td").item(0)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const checkValue = nameInput?.value || '';
        arrayNames.push(checkValue);
        
        const extendInput = row.getElementsByTagName("td").item(1)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const checkValueExtend = extendInput?.value || '';
        
        if (checkValue === "") {
            errors += getTextByLocale("nameIsMissing").replace("%i", (i + 1).toString());
        } else if (!checkValidID(checkValue)) {
            errors += getTextByLocale("nameIsIncorrect").replace("%i", (i + 1).toString());
        }
        if (checkValueExtend !== "" && !checkValidID(checkValueExtend)) {
            errors += getTextByLocale("extendRelationshipIsIncorrect").replace("%i", (i + 1).toString());
        }

        let lastIndex = 2;
        let currentSelect = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        let hasntClass = false;
        
        while (currentSelect !== null && currentSelect !== undefined) {
            if (!currentSelect.options[currentSelect.selectedIndex] && !hasntClass) {
                errors += getTextByLocale("classesIsMissing").replace("%i", (i + 1).toString());
                hasntClass = true;
            }
            lastIndex++;
            currentSelect = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        }
        
        lastIndex++;
        currentSelect = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
            
        if (currentSelect && (currentSelect.options[currentSelect.selectedIndex]?.value === "Linear" ||
            currentSelect.options[currentSelect.selectedIndex]?.value === "Partially linear")) {
            lastIndex++;
            let currentInputName = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("input").item(0) as HTMLInputElement;
                
            while (currentInputName !== null && currentInputName !== undefined) {
                if (currentInputName.value === "") {
                    errors += getTextByLocale("nameRelationshipsIsMissing").replace("%i", (i + 1).toString());
                    break;
                } else if (!checkValidID(currentInputName.value)) {
                    errors += getTextByLocale("nameRelationshipsIsIncorrect").replace("%i", (i + 1).toString());
                    break;
                }
                lastIndex++;
                currentInputName = row.getElementsByTagName("td").item(lastIndex)
                    ?.getElementsByTagName("input").item(0) as HTMLInputElement;
            }
        }
    }
    
    if (arrayNames.length !== 0 && !checkUniqueValues(arrayNames)) {
        errors += getTextByLocale("nonUniqueRelationshipName");
    }
    if (errors !== "") {
        throw new Error(errors);
    }
}

// Генерация строкового представления словаря для визуализации
export function generateStrValueForRelationships(table: HTMLTableElement): [string, string[], string[]] {
    let strValue = '<b><font color="#000000">Relationships between objects</font></b>';
    const listNames: string[] = [];
    const binFlags: string[] = [];

    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows.item(i);
        if (!row) continue;
        
        const relationshipInput = row.getElementsByTagName("td").item(0)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const relationship = relationshipInput?.value || '';

        const extendInput = row.getElementsByTagName("td").item(1)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const extendRelationship = extendInput?.value || '';

        const classList: string[] = [];
        const classSelect = row.getElementsByTagName("td").item(2)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        classList[0] = classSelect?.options[classSelect.selectedIndex]?.value || '';
        
        let lastIndex = 3;
        let currentSelect = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
            
        while (currentSelect !== null && currentSelect !== undefined) {
            classList.push(currentSelect.options[currentSelect.selectedIndex]?.value || '');
            lastIndex++;
            currentSelect = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        }
        
        lastIndex++;
        const scaleSelect = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        const scale = scaleSelect?.options[scaleSelect.selectedIndex]?.value || "None";
        
        const namesRels: string[] = [];
        if (scale === "Linear" || scale === "Partially linear") {
            lastIndex++;
            let currentInputName = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("input").item(0) as HTMLInputElement;
                
            while (currentInputName !== null && currentInputName !== undefined) {
                namesRels.push(currentInputName.value);
                lastIndex++;
                currentInputName = row.getElementsByTagName("td").item(lastIndex)
                    ?.getElementsByTagName("input").item(0) as HTMLInputElement;
            }
        }
        listNames.push(namesRels.join(";"));
        lastIndex++;

        const isBetweenCheckbox = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        const isBetween = isBetweenCheckbox?.checked || false;
        
        let type = "";
        if (isBetween) {
            lastIndex++;
            const typeSelect = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
            type = typeSelect?.options[typeSelect.selectedIndex]?.value || "";
        }
        binFlags.push(getMarkedFlags(row));

        strValue += '<br>' + '<font color="#00cccc">' + escapeHtml(relationship) + '</font>';
        if (extendRelationship !== "") {
            strValue += ' (<font color="#00cccc">' + escapeHtml(extendRelationship) + '</font>)';
        }
        strValue += ' <font color="#6666FF">classes:</font> <font color="#ff66b3">' + escapeHtml(classList[0]);
        for (let j = 1; j < classList.length; j++) {
            strValue += ', ' + escapeHtml(classList[j]);
        }
        strValue += '</font>';

        if (scale !== "None") {
            strValue += ' <font color="#6666FF">scale:</font> <font color="#000000">' + escapeHtml(scale) + '</font>';
        }

        strValue += ' <font color="#6666FF">is relationship between classes:</font> <font color="#000000">'
            + isBetween + '</font>';
        if (isBetween) {
            strValue += ' <font color="#6666FF">type:</font> <font color="#000000">' + escapeHtml(type) + '</font>';
        }
    }

    return [strValue, listNames, binFlags];
}

// Проверка существования словаря на полотне в draw io
function checkExistRelationshipsDictionary(graph: MXGraph): void {
    const cells = graph.getModel().cells;
    Object.keys(cells).forEach(function (key: string) {
        const cellValue = cells[key].value;
        if (cellValue && typeof cellValue === "object" && cellValue !== null) {
            const maybeElement = cellValue as unknown as { getAttribute?: (attr: string) => string | null };
            if (maybeElement.getAttribute) {
                const label = maybeElement.getAttribute('label');
                if (label && label.startsWith('<b><font color="#000000">Relationships between objects</font></b>')) {
                    throw new Error(getTextByLocale("RelationshipExists"));
                }
            }
        }
    });
}

// Установка флагов выбранной шкале
export function checkFlags(row: Element, scale: string): void {
    const tdSym = row.getElementsByClassName("symmetry")[0];
    const tdAntiSym = row.getElementsByClassName("antisymmetry")[0];
    const tdRelf = row.getElementsByClassName("reflexivity")[0];
    const tdAntiRelf = row.getElementsByClassName("antireflexivity")[0];
    const tdTrans = row.getElementsByClassName("transitivity")[0];
    const tdAntiTrans = row.getElementsByClassName("antitransivity")[0];
    
    if (!tdSym || !tdAntiSym || !tdRelf || !tdAntiRelf || !tdTrans || !tdAntiTrans) return;
    
    const symInput = tdSym.getElementsByTagName("input").item(0) as HTMLInputElement;
    const antiSymInput = tdAntiSym.getElementsByTagName("input").item(0) as HTMLInputElement;
    const relfInput = tdRelf.getElementsByTagName("input").item(0) as HTMLInputElement;
    const antiRelfInput = tdAntiRelf.getElementsByTagName("input").item(0) as HTMLInputElement;
    const transInput = tdTrans.getElementsByTagName("input").item(0) as HTMLInputElement;
    const antiTransInput = tdAntiTrans.getElementsByTagName("input").item(0) as HTMLInputElement;
    
    if (scale === "Linear") {
        if (symInput) { symInput.checked = false; symInput.disabled = true; }
        if (antiSymInput) { antiSymInput.checked = true; antiSymInput.disabled = true; }
        if (relfInput) { relfInput.checked = true; relfInput.disabled = true; }
        if (antiRelfInput) { antiRelfInput.checked = false; antiRelfInput.disabled = true; }
        if (transInput) { transInput.checked = false; transInput.disabled = true; }
        if (antiTransInput) { antiTransInput.checked = false; antiTransInput.disabled = true; }
    } else if (scale === "Partially linear") {
        if (symInput) { symInput.checked = false; symInput.disabled = true; }
        if (antiSymInput) { antiSymInput.checked = true; antiSymInput.disabled = true; }
        if (relfInput) { relfInput.checked = true; relfInput.disabled = true; }
        if (antiRelfInput) { antiRelfInput.checked = false; antiRelfInput.disabled = true; }
        if (transInput) { transInput.checked = true; transInput.disabled = true; }
        if (antiTransInput) { antiTransInput.checked = false; antiTransInput.disabled = true; }
    } else if (scale === "None") {
        if (symInput) { symInput.checked = false; symInput.disabled = false; }
        if (antiSymInput) { antiSymInput.checked = false; antiSymInput.disabled = false; }
        if (relfInput) { relfInput.checked = false; relfInput.disabled = false; }
        if (antiRelfInput) { antiRelfInput.checked = false; antiRelfInput.disabled = false; }
        if (transInput) { transInput.checked = false; transInput.disabled = false; }
        if (antiTransInput) { antiTransInput.checked = false; antiTransInput.disabled = false; }
    }
}

// Генерация строки на основе установленных флагов
function getMarkedFlags(row: Element): string {
    const sym = (row.getElementsByClassName("symmetry")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement)?.checked || false;
    const antiSym = (row.getElementsByClassName("antisymmetry")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement)?.checked || false;
    const relf = (row.getElementsByClassName("reflexivity")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement)?.checked || false;
    const antiRelf = (row.getElementsByClassName("antireflexivity")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement)?.checked || false;
    const trans = (row.getElementsByClassName("transitivity")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement)?.checked || false;
    const antiTrans = (row.getElementsByClassName("antitransivity")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement)?.checked || false;
    
    return `${Number(sym)}${Number(antiSym)}${Number(relf)}${Number(antiRelf)}${Number(trans)}${Number(antiTrans)}`;
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