import { styleTable, styleBtn, styleDivBtn, styleSelect } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { getClasses } from './Utils.js';
import { checkAllInputsProperty, generateStrValueForProperties, addRowProperty } from './ClassPropertiesConstructor.js';
import { EditorUi, MxWindow, MXGraph, MXGraphModel, MXGeometry, MXCell, EnumItem, ClassItem, MXCellValue } from '../utils/types.js';
// Объявление глобальных типов для mxGraph
declare const mxUtils: {
    button: (label: string, handler: (evt?: MouseEvent) => void) => HTMLButtonElement;
};

interface ClassPropertiesEditorWindowInstance {
    window: MxWindow;
}

// Окно редактирования блока со свойствами классов
export const ClassPropertiesEditorWindow = function (
    this: ClassPropertiesEditorWindowInstance,
    cell: MXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): ClassPropertiesEditorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    let table = document.createElement('table');
    table = styleTable(table);
    const tbody = document.createElement('tbody');
    tbody.style.height = "100%";

    fillDataProperties(tbody, cell, editorUi);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка сохранения блока
    let applyBtn = mxUtils.button(getTextByLocale("Apply"), function (): void {
        checkAllInputsProperty(table);

        const strValue = generateStrValueForProperties(table);
        const theGraph = editorUi.editor.graph;

        theGraph.getModel().beginUpdate();
        if (cell.geometry) {
            cell.geometry.height = (table.rows.length + 1) * 17;
        }
        if (typeof cell.value === 'string') {
            cell.value = strValue;
        } else if (cell.value && typeof cell.value === 'object') {
            (cell.value as MXCellValue).setAttribute("label", strValue);
        }
        theGraph.getModel().endUpdate();
        theGraph.refresh(); // update the graph
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
        getTextByLocale("TitleClassPropertiesEditorWindow"),
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
function fillDataProperties(
    tbody: HTMLTableSectionElement,
    cell: MXCell,
    editorUi: EditorUi
): void {
    let cellValue = cell.value;

    if (typeof cellValue !== 'string') {
        return;  // или обработайте иначе
    }

    cellValue = cellValue.replace('<b><font color="#000000">Class and Object properties</font></b><br>', '');
    const values = cellValue.split('<br>');

    values.forEach((element: string, index: number) => {
        if (!element) return;
        
        // Извлечение имени свойства
        const nameStart = element.indexOf('<font color="#');
        const nameEnd = element.indexOf('</font>');
        let nameProperty = '';
        let currentPos = 0;
        
        if (nameStart !== -1 && nameEnd !== -1) {
            nameProperty = element.slice(nameStart + 22, nameEnd);
            currentPos = nameEnd + 7;
            element = element.slice(currentPos);
        }

        // Извлечение классов
        let classes: string[] = [];
        const classStart = element.indexOf('(<font color="#fc49a4">');
        if (classStart !== -1) {
            const classEnd = element.indexOf('</font>');
            if (classEnd !== -1) {
                const valuesStr = element.slice(classStart + 23, classEnd);
                classes = valuesStr.split(', ');
                const closePos = element.indexOf('</font>)');
                if (closePos !== -1) {
                    element = element.slice(closePos + 8);
                }
            }
        }

        // Извлечение типа
        const typeStart = element.indexOf('<font color="#000000">');
        const typeEnd = element.indexOf('</font>');
        let type = '';
        if (typeStart !== -1 && typeEnd !== -1) {
            type = element.slice(typeStart + 22, typeEnd);
            element = element.slice(typeEnd + 7);
        }

        // Извлечение диапазона (для Integer/Double)
        let range = "";
        if (type === "Integer" || type === "Double") {
            const rangeStart = element.indexOf('<font color="#000000">: ');
            if (rangeStart !== -1) {
                const rangeEnd = element.indexOf('</font>');
                if (rangeEnd !== -1) {
                    range = element.slice(rangeStart + 24, rangeEnd);
                    element = element.slice(rangeEnd + 7);
                }
            }
        }
        
        // Извлечение isStatic
        const staticLabelIndex = element.indexOf('<font color="#19c3c0">isStatic:</font>');
        if (staticLabelIndex !== -1) {
            element = element.slice(staticLabelIndex + 38);
        }
        
        const isStaticStart = element.indexOf('<font color="#000000">');
        const isStaticEnd = element.indexOf('</font>');
        let isStatic = 'false';
        if (isStaticStart !== -1 && isStaticEnd !== -1) {
            isStatic = element.slice(isStaticStart + 22, isStaticEnd);
        }

        const row = addRowProperty(editorUi);

        // Установка имени свойства
        const td0 = row.getElementsByTagName("td").item(0);
        const nameInput = td0?.getElementsByTagName("input").item(0) as HTMLInputElement;
        if (nameInput) nameInput.value = nameProperty;

        // Установка типа
        const td1 = row.getElementsByTagName("td").item(1);
        const typeSelect = td1?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        if (typeSelect) {
            for (let i = 0; i < typeSelect.options.length; ++i) {
                if (typeSelect.options[i].value === type) {
                    typeSelect.options[i].selected = true;
                    break;
                }
            }
        }

        let lastIndex = 2;
        
        // Проверяем, есть ли ячейка с диапазоном
        const tdRange = row.getElementsByTagName("td").item(lastIndex);
        
        // Обработка диапазона для числовых типов
        if (type === "Integer" || type === "Double") {
            const ranges = range.split("-");
            if (tdRange) {
                const inputs = tdRange.getElementsByTagName("input");
                const startInput = inputs.item(0) as HTMLInputElement;
                const endInput = inputs.item(1) as HTMLInputElement;
                if (startInput) startInput.value = ranges[0] || '';
                if (endInput) endInput.value = ranges[1] || '';
            }
            lastIndex++;
        } else {
            // Удаляем ячейку с диапазоном, если тип не числовой и если она существует
            if (tdRange && tdRange.classList && tdRange.classList.contains('range')) {
                tdRange.remove();
            }
            // Если удалили, то индекс не увеличиваем
        }

        // Установка чекбокса isStatic
        if (type === "Integer" || type === "Double") {
            const tdStatic = row.getElementsByTagName("td").item(lastIndex);
            if (tdStatic) {
                const checkbox = tdStatic.getElementsByTagName("input").item(0) as HTMLInputElement;
                if (checkbox) checkbox.checked = isStatic === 'true';
            }
            lastIndex++;
        } else {
            const tdStatic = row.getElementsByTagName("td").item(2);
            if (tdStatic && tdStatic.classList && !tdStatic.classList.contains('range')) {
                const checkbox = tdStatic.getElementsByTagName("input").item(0) as HTMLInputElement;
                if (checkbox) checkbox.checked = isStatic === 'true';
            }
            lastIndex = 3;
        }

        // Добавление дополнительных классов
        classes.forEach((className: string, classIndex: number) => {
            if (classIndex !== 0) {
                const newTdClass = document.createElement('td');
                newTdClass.style.minWidth = "200px";
                let newSelectClass = document.createElement('select');
                newSelectClass = styleSelect(newSelectClass);
                newSelectClass.style.marginRight = "4px";
                newSelectClass.style.width = '85%';
                newSelectClass.style.float = 'left';
                
                const jsonClasses: ClassItem[] = getClasses(editorUi);
                jsonClasses.forEach(classItem => {
                    const newOption = new Option(classItem.name, classItem.name);
                    newSelectClass.options[newSelectClass.options.length] = newOption;
                });
                
                const btnDelClass = mxUtils.button('-', function (evt?: MouseEvent): void {
                    if (evt?.target && evt.target instanceof HTMLElement) {
                        evt.target.parentElement?.remove();
                    }
                });
                const delButton = styleBtn(btnDelClass);
                delButton.style.float = 'left';
                delButton.style.width = '10%';
                newTdClass.appendChild(newSelectClass);
                newTdClass.appendChild(delButton);
                
                const targetTd = row.getElementsByTagName("td").item(lastIndex);
                if (targetTd) {
                    row.insertBefore(newTdClass, targetTd);
                }
            }
            
            // Выбор соответствующего значения в селекте
            const tdClass = row.getElementsByTagName("td").item(lastIndex);
            const classSelect = tdClass?.getElementsByTagName("select").item(0) as HTMLSelectElement;
            if (classSelect) {
                for (let i = 0; i < classSelect.options.length; ++i) {
                    if (classSelect.options[i].value === className) {
                        classSelect.options[i].selected = true;
                        break;
                    }
                }
            }
            lastIndex++;
        });

        // Добавление кнопки удаления для всех строк кроме первой
        if (index !== 0) {
            const tdDelRow = document.createElement('td');
            const btnDelRow = mxUtils.button(getTextByLocale("Delete"), function (evt?: MouseEvent): void {
                if (evt?.target && evt.target instanceof HTMLElement) {
                    evt.target.parentElement?.parentElement?.remove();
                }
            });
            tdDelRow.appendChild(styleBtn(btnDelRow));
            row.appendChild(tdDelRow);
        }

        tbody.appendChild(row);
    });
}