import { styleTable, styleInput, styleBtn, styleDivBtn } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { checkAllInputsEnum, generateStrValueForEnums, addRowEnum } from './EnumConstructor.js';
import { EditorUi, MxWindow, MXGraph, MXGraphModel, MXGeometry, MXCell, EnumItem, ClassItem, MXCellValue } from '../utils/types.js';

interface EnumEditorWindowInstance {
    window: MxWindow;
}

// Окно редактирования блока с enum
export const EnumEditorWindow = function (
    this: EnumEditorWindowInstance,
    cell: MXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): EnumEditorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    let table = document.createElement('table');
    table = styleTable(table);
    const tbody = document.createElement('tbody');
    tbody.style.height = "100%";

    fillDataEnum(tbody, cell);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка сохранения блока
    let applyBtn = mxUtils.button(getTextByLocale("Apply"), function (): void {
        checkAllInputsEnum(tbody);

        const strValue = generateStrValueForEnums(tbody);
        const theGraph = editorUi.editor.graph;

        theGraph.getModel().beginUpdate();
        if (cell.geometry) {
            cell.geometry.height = (table.rows.length + 1) * 17;
        }
        cell.value = strValue;
        theGraph.getModel().endUpdate();
        theGraph.refresh(); // update the graph
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
        getTextByLocale("TitleEnumEditorWindow"),
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
function fillDataEnum(tbody: HTMLTableSectionElement, cell: MXCell): void {
    // Получение строкового значения из cell.value
    let cellValueStr = '';
    
    if (typeof cell.value === 'string') {
        cellValueStr = cell.value;
    } else if (cell.value && typeof cell.value === 'object') {
        const label = (cell.value as MXCellValue).getAttribute('label');
        cellValueStr = label || '';
    }

    if (!cellValueStr) return;

    cellValueStr = cellValueStr.replace('<font color="#000000"><b>Enum</b></font><br>', '');
    const values = cellValueStr.split('<br>');

    values.forEach((element: string, index: number) => {
        if (!element) return;
        
        // Извлечение имени enum
        const nameStart = element.indexOf('<font color="#ff66b3">');
        const nameEnd = element.indexOf('</font>');
        let nameEnum = '';
        if (nameStart !== -1 && nameEnd !== -1) {
            nameEnum = element.slice(nameStart + 22, nameEnd);
            element = element.slice(nameEnd + 7);
        }

        // Извлечение значений enum
        const valuesStart = element.indexOf('<font color="#ff6666">');
        const valuesEnd = element.indexOf('</font>');
        let valuesEnum: string[] = [];
        if (valuesStart !== -1 && valuesEnd !== -1) {
            const valuesStr = element.slice(valuesStart + 22, valuesEnd);
            valuesEnum = valuesStr.split(', ');
            element = element.slice(valuesEnd + 7);
        }

        // Извлечение isLinear
        const linearStart = element.indexOf('<font color="#123123">');
        const linearEnd = element.indexOf('</font>');
        let isLinear = 'false';
        if (linearStart !== -1 && linearEnd !== -1) {
            isLinear = element.slice(linearStart + 22, linearEnd);
            element = element.slice(linearEnd + 7);
        }
        
        // Извлечение nameRDF если есть
        let nameRDF = "";
        if (isLinear === 'true') {
            const rdfStart = element.indexOf('<font color="#fff123">');
            const rdfEnd = element.indexOf('</font>');
            if (rdfStart !== -1 && rdfEnd !== -1) {
                nameRDF = element.slice(rdfStart + 22, rdfEnd);
            }
        }

        const row = addRowEnum();

        // Установка имени enum
        const td0 = row.getElementsByTagName("td").item(0);
        const nameInput = td0?.getElementsByTagName("input").item(0) as HTMLInputElement;
        if (nameInput) {
            nameInput.value = nameEnum;
            if (index === 0) {
                nameInput.disabled = true;
            }
        }

        let lastIndex = 1;
        
        // Заполнение значений enum
        valuesEnum.forEach((value: string, valueIndex: number) => {
            if (lastIndex !== 1) {
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
                if (index !== 0) {
                    newTd.appendChild(btnDel);
                }
                
                const targetTd = row.getElementsByTagName("td").item(lastIndex);
                if (targetTd) {
                    row.insertBefore(newTd, targetTd);
                }
            }
            
            const valueInput = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("input").item(0) as HTMLInputElement;
            if (valueInput) {
                valueInput.value = value;
                if (index === 0) {
                    valueInput.disabled = true;
                    valueInput.style.width = '100%';
                }
            }
            lastIndex++;
        });
        
        // Скрытие кнопки добавления для первой строки
        if (index === 0) {
            const tdAdd = row.getElementsByTagName("td").item(lastIndex);
            if (tdAdd) {
                tdAdd.style.display = "none";
            }
        }
        lastIndex++;

        // Установка чекбокса isLinear
        const linearCheckbox = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        if (linearCheckbox) {
            linearCheckbox.checked = isLinear === 'true';
            if (index === 0) {
                linearCheckbox.disabled = true;
            }
        }
        
        // Добавление поля nameRDF если необходимо
        if (isLinear === 'true') {
            const tdNameRDF = document.createElement('td');
            tdNameRDF.style.minWidth = "150px";
            let inputNameRDF = document.createElement('input');
            inputNameRDF = styleInput(inputNameRDF);
            inputNameRDF.type = "text";
            inputNameRDF.style.width = '90%';
            inputNameRDF.placeholder = "Name in RDF";
            tdNameRDF.appendChild(inputNameRDF);
            
            const targetTd = row.getElementsByTagName("td").item(lastIndex);
            if (targetTd && targetTd.nextElementSibling) {
                row.insertBefore(tdNameRDF, targetTd.nextElementSibling);
            } else if (targetTd) {
                row.appendChild(tdNameRDF);
            }
            
            const rdfInput = row.getElementsByTagName("td").item(lastIndex + 1)
                ?.getElementsByTagName("input").item(0) as HTMLInputElement;
            if (rdfInput) {
                rdfInput.value = nameRDF;
            }
        }

        // Добавление кнопки удаления для всех строк кроме первой
        if (index !== 0) {
            const tdDelRow = document.createElement('td');
            const btnDelRow = mxUtils.button(getTextByLocale("Delete"), function (evtDel?: MouseEvent): void {
                if (evtDel?.target && evtDel.target instanceof HTMLElement) {
                    evtDel.target.parentElement?.parentElement?.remove();
                }
            });
            tdDelRow.appendChild(styleBtn(btnDelRow));
            row.appendChild(tdDelRow);
        }

        tbody.appendChild(row);
    });
}