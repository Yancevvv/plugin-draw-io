import { styleTable, styleInput, styleBtn, styleDivBtn, styleSelect } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { getClasses } from './Utils.js';
import { checkAllInputsRelationship, generateStrValueForRelationships, addRowRelationship, checkFlags } from './RelationshipsConstructor.js';
import { EditorUi, MxWindow, MXGraph, MXGraphModel, MXGeometry, MXCell, EnumItem, ClassItem, MXCellValue } from '../utils/types.js';
// Объявление глобальных типов для mxGraph
declare const mxUtils: {
    button: (label: string, handler: (evt?: MouseEvent) => void) => HTMLButtonElement;
};

interface RelationshipsEditorWindowInstance {
    window: MxWindow;
}

// Окно редактирования блока с отношениями для классов
export const RelationshipsEditorWindow = function (
    this: RelationshipsEditorWindowInstance,
    cell: MXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): RelationshipsEditorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    let table = document.createElement('table');
    table = styleTable(table);
    const tbody = document.createElement('tbody');
    tbody.style.height = "100%";

    fillDataRelationships(tbody, cell, editorUi);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка сохранения блока
    let applyBtn = mxUtils.button(getTextByLocale("Apply"), function (): void {
        checkAllInputsRelationship(table);

        const valuesRels = generateStrValueForRelationships(table);
        const theGraph = editorUi.editor.graph;

        theGraph.getModel().beginUpdate();
        // Проверка на существование geometry
        if (cell.geometry) {
            cell.geometry.height = (table.rows.length + 1) * 17;
        }
        
        // Проверка типа cell.value для установки атрибутов
        if (typeof cell.value === 'object' && cell.value !== null) {
            const cellValueObj = cell.value as MXCellValue;
            cellValueObj.setAttribute("label", valuesRels[0]);
            for (let i = 0; i < valuesRels[1].length; i++) {
                cellValueObj.setAttribute('namesRels_' + i, valuesRels[1][i]);
                cellValueObj.setAttribute('binFlags_' + i, valuesRels[2][i]);
            }
        } else if (typeof cell.value === 'string') {
            // Если значение - строка, обновляем его
            cell.value = valuesRels[0];
        }
        theGraph.getModel().endUpdate();
        theGraph.refresh(); // update the graph
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
        getTextByLocale("TitleRelationshipsEditorWindow"),
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
function fillDataRelationships(
    tbody: HTMLTableSectionElement,
    cell: MXCell,
    editorUi: EditorUi
): void {
    // Получение атрибутов из cell.value
    let cellLabel = '';
    let namesRelsMap: Record<string, string> = {};
    let binFlagsMap: Record<string, string> = {};
    
    if (typeof cell.value === 'object' && cell.value !== null) {
        const cellValueObj = cell.value as MXCellValue;
        cellLabel = cellValueObj.getAttribute('label') || '';
        
        // Получение всех namesRels и binFlags атрибутов
        for (let i = 0; i < 100; i++) {
            const namesRelsValue = cellValueObj.getAttribute('namesRels_' + i);
            const binFlagsValue = cellValueObj.getAttribute('binFlags_' + i);
            if (namesRelsValue !== null) namesRelsMap[i] = namesRelsValue;
            if (binFlagsValue !== null) binFlagsMap[i] = binFlagsValue;
        }
    } else if (typeof cell.value === 'string') {
        cellLabel = cell.value;
    }

    if (!cellLabel) return;

    cellLabel = cellLabel.replace('<b><font color="#000000">Relationships between objects</font></b><br>', '');
    const values = cellLabel.split('<br>');

    values.forEach((element: string, index: number) => {
        if (!element) return;
        
        // Извлечение имени отношения
        const nameStart = element.indexOf('<font color="#00cccc">');
        const nameEnd = element.indexOf('</font>');
        let nameRelationship = '';
        if (nameStart !== -1 && nameEnd !== -1) {
            nameRelationship = element.slice(nameStart + 22, nameEnd);
            element = element.slice(nameEnd + 7);
        }

        // Извлечение extend отношения
        let extendRelationship = "";
        const extendStart = element.indexOf('(<font color="#00cccc">');
        if (extendStart !== -1) {
            const extendEnd = element.indexOf('</font>)');
            if (extendEnd !== -1) {
                extendRelationship = element.slice(extendStart + 23, extendEnd);
                element = element.slice(extendEnd + 8);
            }
        }

        // Извлечение классов
        const classesStart = element.indexOf('classes:</font>');
        if (classesStart !== -1) {
            element = element.slice(classesStart + 15);
        }
        
        const valuesStart = element.indexOf('<font color="#ff66b3">');
        const valuesEnd = element.indexOf('</font>');
        let classes: string[] = [];
        if (valuesStart !== -1 && valuesEnd !== -1) {
            const valuesStr = element.slice(valuesStart + 22, valuesEnd);
            classes = valuesStr.split(', ');
            element = element.slice(valuesEnd + 7);
        }

        // Извлечение scale
        let scale = "";
        const scaleLabelIndex = element.indexOf('<font color="#6666FF">scale:</font>');
        if (scaleLabelIndex !== -1) {
            element = element.slice(scaleLabelIndex + 13);
            const scaleStart = element.indexOf('<font color="#000000">');
            const scaleEnd = element.indexOf('</font>');
            if (scaleStart !== -1 && scaleEnd !== -1) {
                scale = element.slice(scaleStart + 22, scaleEnd);
                element = element.slice(scaleEnd + 7);
            }
        }

        // Извлечение isBetween
        const betweenLabelIndex = element.indexOf('classes:</font>');
        if (betweenLabelIndex !== -1) {
            element = element.slice(betweenLabelIndex + 15);
        }
        
        const isBetweenStart = element.indexOf('<font color="#000000">');
        const isBetweenEnd = element.indexOf('</font>');
        let isBetween = 'false';
        if (isBetweenStart !== -1 && isBetweenEnd !== -1) {
            isBetween = element.slice(isBetweenStart + 22, isBetweenEnd);
            element = element.slice(isBetweenEnd + 7);
        }
        
        // Извлечение type
        let type = "";
        if (isBetween === "true") {
            const typeLabelIndex = element.indexOf('type:</font>');
            if (typeLabelIndex !== -1) {
                element = element.slice(typeLabelIndex + 12);
                const typeStart = element.indexOf('<font color="#000000">');
                const typeEnd = element.indexOf('</font>');
                if (typeStart !== -1 && typeEnd !== -1) {
                    type = element.slice(typeStart + 22, typeEnd);
                }
            }
        }

        const namesRels = namesRelsMap[index] || '';
        const binFlags = binFlagsMap[index] || '';

        const row = addRowRelationship(editorUi);

        // Установка имени отношения
        const td0 = row.getElementsByTagName("td").item(0);
        const nameInput = td0?.getElementsByTagName("input").item(0) as HTMLInputElement;
        if (nameInput) nameInput.value = nameRelationship;

        // Установка extend
        const td1 = row.getElementsByTagName("td").item(1);
        const extendInput = td1?.getElementsByTagName("input").item(0) as HTMLInputElement;
        if (extendInput) extendInput.value = extendRelationship;

        let lastIndex = 2;
        
        // Заполнение классов
        classes.forEach((className: string, classIndex: number) => {
            if (lastIndex !== 2) {
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
                
                const targetTd = row.getElementsByTagName("td").item(lastIndex);
                if (targetTd) {
                    row.insertBefore(newTdClass, targetTd);
                }
            }
            
            const classSelect = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
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
        
        lastIndex++;
        
        // Установка scale
        const scaleSelect = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
        if (scaleSelect) {
            for (let i = 0; i < scaleSelect.options.length; ++i) {
                if (scaleSelect.options[i].value === scale) {
                    scaleSelect.options[i].selected = true;
                    break;
                }
            }
        }
        
        checkFlags(row, scale);
        
        const namesRelsArray = namesRels.split(";");
        
        // Добавление полей для имен отношений если scale не "None"
        if (scale === "Linear" || scale === "Partially linear") {
            const tdInputNames = document.createElement('td');
            tdInputNames.classList.add("names");
            tdInputNames.style.minWidth = "150px";
            let nameInputField = document.createElement('input');
            nameInputField.type = "text";
            nameInputField = styleInput(nameInputField);
            nameInputField.placeholder = "Name";
            tdInputNames.appendChild(nameInputField);

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

            const currentTd = row.getElementsByTagName("td").item(lastIndex);
            if (currentTd && currentTd.nextElementSibling) {
                row.insertBefore(tdAddName, currentTd.nextElementSibling);
                row.insertBefore(tdInputNames, currentTd.nextElementSibling);
            } else if (currentTd) {
                row.appendChild(tdAddName);
                row.appendChild(tdInputNames);
            }

            lastIndex++;
            
            namesRelsArray.forEach((nameValue: string, nameIndex: number) => {
                if (nameIndex !== 0) {
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
                    
                    const targetTd = row.getElementsByTagName("td").item(lastIndex);
                    if (targetTd) {
                        row.insertBefore(newTdName, targetTd);
                    }
                }
                
                const nameInputElement = row.getElementsByTagName("td").item(lastIndex)
                    ?.getElementsByTagName("input").item(0) as HTMLInputElement;
                if (nameInputElement) {
                    nameInputElement.value = nameValue;
                }
                lastIndex++;
            });
        }
        
        if (!scale) {
            fillFlags(row, binFlags);
        }
        
        lastIndex++;
        
        // Установка чекбокса isBetween
        const betweenCheckbox = row.getElementsByTagName("td").item(lastIndex)
            ?.getElementsByTagName("input").item(0) as HTMLInputElement;
        if (betweenCheckbox) {
            betweenCheckbox.checked = isBetween === 'true';
        }
        
        // Добавление поля type если необходимо
        if (isBetween === 'true') {
            const tdType = document.createElement('td');
            tdType.style.minWidth = "150px";
            let selectType = document.createElement('select');
            selectType = styleSelect(selectType);
            selectType.style.width = '100%';
            const types = ["One to one", "One to many", "Many to one", "Many to many"];
            types.forEach(typeValue => {
                const newOption = new Option(typeValue, typeValue);
                selectType.options[selectType.options.length] = newOption;
            });
            tdType.appendChild(selectType);
            
            const currentTd = row.getElementsByTagName("td").item(lastIndex);
            if (currentTd && currentTd.nextElementSibling) {
                row.insertBefore(tdType, currentTd.nextElementSibling);
            } else if (currentTd) {
                row.appendChild(tdType);
            }

            lastIndex++;
            
            const typeSelect = row.getElementsByTagName("td").item(lastIndex)
                ?.getElementsByTagName("select").item(0) as HTMLSelectElement;
            if (typeSelect) {
                for (let i = 0; i < typeSelect.options.length; ++i) {
                    if (typeSelect.options[i].value === type) {
                        typeSelect.options[i].selected = true;
                        break;
                    }
                }
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

// Заполнение флагов у отношения
function fillFlags(row: Element, strBinFlags: string): void {
    const arrayBinFlags = strBinFlags.split('');

    const symInput = row.getElementsByClassName("symmetry")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement;
    const antiSymInput = row.getElementsByClassName("antisymmetry")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement;
    const relfInput = row.getElementsByClassName("reflexivity")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement;
    const antiRelfInput = row.getElementsByClassName("antireflexivity")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement;
    const transInput = row.getElementsByClassName("transitivity")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement;
    const antiTransInput = row.getElementsByClassName("antitransivity")[0]?.getElementsByTagName("input").item(0) as HTMLInputElement;
    
    if (symInput) symInput.checked = arrayBinFlags[0] === "1";
    if (antiSymInput) antiSymInput.checked = arrayBinFlags[1] === "1";
    if (relfInput) relfInput.checked = arrayBinFlags[2] === "1";
    if (antiRelfInput) antiRelfInput.checked = arrayBinFlags[3] === "1";
    if (transInput) transInput.checked = arrayBinFlags[4] === "1";
    if (antiTransInput) antiTransInput.checked = arrayBinFlags[5] === "1";
}