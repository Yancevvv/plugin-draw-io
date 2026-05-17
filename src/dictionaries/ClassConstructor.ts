import { styleTable, styleInput, styleBtn, styleDivBtn } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { toolbox } from '../utils/blocks.js';
import { checkValidID, checkUniqueValues } from '../utils/utils.js';
import { parser } from '../utils/parser.js';
import * as Blockly from 'blockly';
import { EditorUi, MxWindow, MXGraph, MXGraphModel, MXGeometry, MXCell, EnumItem, ClassItem, mxUtilsType, BlocklyType, ParserType } from '../utils/types.js';

// ============ Глобальные объекты ============

declare const mxUtils: mxUtilsType;
declare const mxCell: new (value: string, geometry: MXGeometry, style: string) => MXCell;
declare const mxGeometry: new (x: number, y: number, width: number, height: number) => MXGeometry;
declare const mxWindow: new (
    title: string,
    content: HTMLElement,
    x: number,
    y: number,
    width: number,
    height: number,
    modal: boolean,
    resizable: boolean
) => MxWindow;

// Приведение типов для Blockly
const BlocklyTyped = Blockly as unknown as BlocklyType;

// Приведение типов для parser
const parserTyped = parser as ParserType;

// ============ Функции ============

// Окно конструктора блока с классами
export const ClassConstructorWindow = function (
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): void {
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    div.style.width = "100%";
    let table = document.createElement('table');
    table = styleTable(table);
    const tbody = document.createElement('tbody');
    tbody.style.height = "100%";

    let row = addRowClass();
    tbody.appendChild(row);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка создания блока
    let applyBtn = mxUtils.button(getTextByLocale("Create"), function (): void {
        checkAllInputsClass(table);

        for (let i = 0; i < table.rows.length; i++) {
            const rowItem = table.rows.item(i);
            if (!rowItem) continue;
            
            const textarea = getTextareaFromRow(rowItem, 2);
            const expression = textarea?.value || '';
            if (expression) {
                if (parserTyped.parse) {
                    parserTyped.parse(expression);
                }
            }
        }

        const theGraph = editorUi.editor.graph;

        checkExistClassDictionary(theGraph);

        if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
            const pos = theGraph.getInsertPoint();
            const newElement = new mxCell(
                "",
                new mxGeometry(pos.x, pos.y, 267, (table.rows.length + 1) * 17),
                "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fontColor=#6666FF;align=center;editable=0;"
            );

            const strValue = generateStrValueForClasses(table);
            newElement.value = strValue;
            newElement.vertex = true;
            theGraph.setSelectionCell(theGraph.addCell(newElement));
            
            for (let i = 0; i < table.rows.length; i++) {
                const rowItem = table.rows.item(i);
                if (!rowItem) continue;
                
                const textarea = getTextareaFromRow(rowItem, 2);
                const expression = textarea?.value || '';
                theGraph.setAttributeForCell(newElement, 'expression_' + i, expression);
            }
        }
        win.destroy();
    });

    // Кнопка добавления полей для нового класса
    let addClass = mxUtils.button(getTextByLocale("AddClass"), function (): void {
        const newRow = addRowClass();
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

    // Кнопка открытия окна с блокли для выражений
    const openBlockly = mxUtils.button(getTextByLocale("OpenBlockly"), function (): void {
        const widthBlockly = window.screen.width - 400;
        const heightBlockly = window.screen.height - 300;
        const mainDivBlockly = document.createElement('div');
        const divBlockly = document.createElement('div');
        divBlockly.id = 'classCreateBlocklyDiv';
        divBlockly.style.width = widthBlockly + 'px';
        divBlockly.style.height = heightBlockly * 0.83 + 'px';
        mainDivBlockly.appendChild(divBlockly);

        const divInput = document.createElement('div');
        divInput.style.width = '100%';
        let codeInput = document.createElement('input');
        codeInput = styleInput(codeInput);
        codeInput.id = 'outputCode';
        divInput.appendChild(codeInput);
        mainDivBlockly.appendChild(divInput);

        const toCodeBtn = mxUtils.button(getTextByLocale("toСode"), function (): void {
            const code = BlocklyTyped.JavaScript?.workspaceToCode(workspaceInWindow);
            if (code) {
                codeInput.value = code;
            }
        });
        let btnDivBlockly = document.createElement('div');
        btnDivBlockly = styleDivBtn(btnDivBlockly);
        const styledToCodeBtn = styleBtn(toCodeBtn);
        styledToCodeBtn.style.marginTop = "5px";
        btnDivBlockly.appendChild(styledToCodeBtn);
        mainDivBlockly.appendChild(btnDivBlockly);

        const win2 = new mxWindow(
            'Blockly',
            mainDivBlockly,
            document.body.offsetLeft + 100,
            document.body.offsetTop + 100,
            widthBlockly,
            heightBlockly,
            true,
            true
        );
        win2.destroyOnClose = true;
        win2.setMaximizable(false);
        win2.setResizable(false);
        win2.setClosable(true);
        win2.setVisible(true);
        
        const workspaceInWindow = BlocklyTyped.inject('classCreateBlocklyDiv', { toolbox: toolbox });
    });

    // Добавление кнопок в окно
    let btnDiv = document.createElement('div');
    btnDiv = styleDivBtn(btnDiv);
    addClass = styleBtn(addClass);
    applyBtn = styleBtn(applyBtn);
    btnDiv.appendChild(addClass);
    btnDiv.appendChild(applyBtn);
    btnDiv.appendChild(styleBtn(openBlockly));
    div.appendChild(btnDiv);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleClassConstructorWindow"),
        div,
        x,
        y,
        w,
        h,
        true,
        true
    );
    win.destroyOnClose = true;
    win.setMaximizable(false);
    win.setResizable(true);
    win.setClosable(true);
    win.setVisible(true);
};

// Вспомогательная функция для получения textarea из строки таблицы
function getTextareaFromRow(row: HTMLTableRowElement, cellIndex: number): HTMLTextAreaElement | null {
    const td = row.getElementsByTagName("td").item(cellIndex);
    if (!td) return null;
    const textarea = td.getElementsByTagName("textarea").item(0);
    return textarea instanceof HTMLTextAreaElement ? textarea : null;
}

// Вспомогательная функция для получения input из строки таблицы
function getInputFromRow(row: HTMLTableRowElement, cellIndex: number): HTMLInputElement | null {
    const td = row.getElementsByTagName("td").item(cellIndex);
    if (!td) return null;
    const input = td.getElementsByTagName("input").item(0);
    return input instanceof HTMLInputElement ? input : null;
}

// Добавление строки с новым классом в конструкторе
export function addRowClass(): HTMLTableRowElement {
    const tr1 = document.createElement('tr');
    tr1.style.width = '100%';
    
    const td1 = document.createElement('td');
    td1.style.width = '25%';
    let name = document.createElement('input');
    name.type = "text";
    name = styleInput(name);
    name.placeholder = "Class name";
    td1.appendChild(name);
    
    const td2 = document.createElement('td');
    td2.style.width = '25%';
    let extend = document.createElement('input');
    extend.type = "text";
    extend = styleInput(extend);
    extend.placeholder = "Extend";
    td2.appendChild(extend);
    
    const td3 = document.createElement('td');
    td3.style.width = '25%';
    let expression = document.createElement('textarea');
    expression = styleInput(expression);
    expression.style.resize = 'vertical';
    expression.placeholder = "Expression";
    td3.appendChild(expression);
    
    tr1.appendChild(td1);
    tr1.appendChild(td2);
    tr1.appendChild(td3);
    return tr1;
}

// Валидация всех полей при сохранении
export function checkAllInputsClass(table: HTMLTableElement): void {
    let errors = "";
    const arrayNames: string[] = [];
    
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows.item(i);
        if (!row) continue;
        
        const nameInput = getInputFromRow(row, 0);
        const checkValue = nameInput?.value || '';
        arrayNames.push(checkValue);
        
        const extendInput = getInputFromRow(row, 1);
        const checkValueExtend = extendInput?.value || '';
        
        if (checkValue === "") {
            errors += getTextByLocale("nameIsMissing").replace("%i", (i + 1).toString());
        } else if (!checkValidID(checkValue)) {
            errors += getTextByLocale("nameIsIncorrect").replace("%i", (i + 1).toString());
        }
        if (checkValueExtend !== "" && !checkValidID(checkValueExtend)) {
            errors += getTextByLocale("extendClassIsIncorrect").replace("%i", (i + 1).toString());
        }
    }
    
    if (arrayNames.length !== 0 && !checkUniqueValues(arrayNames)) {
        errors += getTextByLocale("nonUniqueClassName");
    }
    
    if (errors !== "") {
        throw new Error(errors);
    }
}

// Генерация строкового представления словаря для визуализации
export function generateStrValueForClasses(table: HTMLTableElement): string {
    let strValue = '<font color="#000000"><b>Classes</b></font>';

    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows.item(i);
        if (!row) continue;
        
        const nameInput = getInputFromRow(row, 0);
        const nameClass = nameInput?.value || '';
        
        const extendInput = getInputFromRow(row, 1);
        const classExtend = extendInput?.value || '';

        strValue += '<br><font color="#ff66b3">' + escapeHtml(nameClass) + '</font>';
        if (classExtend !== "") {
            strValue += ' (<font color="#ff66b3">' + escapeHtml(classExtend) + '</font>)';
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
function checkExistClassDictionary(graph: MXGraph): void {
    const cells = graph.getModel().cells;
    
    for (const key of Object.keys(cells)) {
        const cellValue = cells[key].value;
        
        if (cellValue && typeof cellValue === "object" && cellValue !== null) {
            // Проверяем, есть ли у объекта метод getAttribute
            const maybeElement = cellValue as unknown as { getAttribute?: (attr: string) => string | null };
            
            if (maybeElement.getAttribute) {
                const label = maybeElement.getAttribute('label');
                if (label && label.startsWith('<font color="#000000"><b>Classes</b></font>')) {
                    // TODO: Возможно это плохой способ, надо протестировать
                    throw new Error(getTextByLocale("ClassExists"));
                }
            }
        }
    }
}