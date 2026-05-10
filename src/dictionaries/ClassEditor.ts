import { styleTable, styleBtn, styleDivBtn } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { toolbox } from '../utils/blocks.js';
import { parser } from '../utils/parser.js';
import { checkAllInputsClass, addRowClass, generateStrValueForClasses } from './ClassConstructor.js';
import * as Blockly from 'blockly';
import { EditorUi, MxWindow, MXGraph, MXGraphModel, MXGeometry, MXCell, EnumItem, ClassItem, mxUtilsType, BlocklyType, ParserType, MXCellValue } from './types.js';

interface ClassEditorWindowInstance {
    window: MxWindow;
    window2?: MxWindow;
}

// Приведение типов для Blockly
const BlocklyTyped = Blockly as typeof Blockly & {
    JavaScript: {
        workspaceToCode(workspace: unknown): string;
    };
};

// Окно редактирования блока с классами
export const ClassEditorWindow = function (
    this: ClassEditorWindowInstance,
    cell: MXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): ClassEditorWindowInstance {
    const self = this;
    
    // Верстка окна
    const div = document.createElement('div');
    div.style.height = "100%";
    div.style.width = "100%";
    let table = document.createElement('table');
    table = styleTable(table);
    const tbody = document.createElement('tbody');
    tbody.style.height = "100%";

    fillDataClass(tbody, cell);
    table.appendChild(tbody);
    div.appendChild(table);

    // Кнопка сохранения блока
    let applyBtn = mxUtils.button(getTextByLocale("Apply"), function (): void {
        checkAllInputsClass(table);

        for (let i = 0; i < table.rows.length; i++) {
            const rowItem = table.rows.item(i);
            if (!rowItem) continue;
            
            const td = rowItem.getElementsByTagName("td").item(2);
            if (!td) continue;
            
            const textarea = td.getElementsByTagName("textarea").item(0);
            const expression = textarea?.value || '';
            
            if (expression) {
                // TODO: Возможно сделать обработку ошибок и выводить свои ошибки
                parser.parse(expression);
            }
        }

        const strValue = generateStrValueForClasses(table);
        const theGraph = editorUi.editor.graph;

        theGraph.getModel().beginUpdate();
        if (cell.geometry) {
            cell.geometry.height = (table.rows.length + 1) * 17;
        }
        // Проверка типа cell.value для установки атрибута
        if (typeof cell.value === 'string') {
            cell.value = strValue;
        } else if (cell.value && typeof cell.value === 'object') {
            (cell.value as MXCellValue).setAttribute("label", strValue);
        }

        for (let i = 0; i < table.rows.length; i++) {
            const rowItem = table.rows.item(i);
            if (!rowItem) continue;
            
            const td = rowItem.getElementsByTagName("td").item(2);
            if (!td) continue;
            
            const textarea = td.getElementsByTagName("textarea").item(0);
            const expression = textarea?.value || '';
            if (typeof cell.value === 'object' && cell.value !== null) {
                (cell.value as MXCellValue).setAttribute('expression_' + i, expression);
            }
        }
        theGraph.getModel().endUpdate();
        theGraph.refresh(); 
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
        const mainDivBlockly = document.createElement('div');
        const divBlockly = document.createElement('div');
        divBlockly.id = 'classUpdateBlocklyDiv';
        divBlockly.style.width = '850px';
        divBlockly.style.height = '500px';
        mainDivBlockly.appendChild(divBlockly);

        const divInput = document.createElement('div');
        divInput.style.width = '850px';
        const codeInput = document.createElement('input');
        codeInput.style.width = '100%';
        codeInput.id = 'outputCode';
        divInput.appendChild(codeInput);
        mainDivBlockly.appendChild(divInput);

        const toCodeBtn = mxUtils.button(getTextByLocale("toСode"), function (): void {
            const code = BlocklyTyped.JavaScript?.workspaceToCode(workspaceInWindow);
            if (code) {
                codeInput.value = code;
            }
        });
        mainDivBlockly.appendChild(toCodeBtn);

        self.window2 = new mxWindow(
            'Blockly',
            mainDivBlockly,
            (document.body.offsetWidth - 880) / 2,
            120,
            900,
            580,
            true,
            true
        );
        self.window2.destroyOnClose = true;
        self.window2.setMaximizable(false);
        self.window2.setResizable(false);
        self.window2.setClosable(true);
        self.window2.setVisible(true);
        
        const workspaceInWindow = Blockly.inject('classUpdateBlocklyDiv', { toolbox: toolbox });
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
        getTextByLocale("TitleClassEditorWindow"),
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
function fillDataClass(tbody: HTMLTableSectionElement, cell: MXCell): void {
    const cellValue = cell.value;
    let cellLabel = '';
    
    if (typeof cell.value === 'string') {
        cellLabel = cell.value;
    } else if (cell.value && typeof cell.value === 'object') {
        const label = (cell.value as MXCellValue).getAttribute('label');
        cellLabel = label || '';
    }

    if (!cellLabel) return;
    cellLabel = cellLabel.replace('<font color="#000000"><b>Classes</b></font><br>', '');
    const values = cellLabel.split('<br>');

    values.forEach((element: string, index: number) => {
        if (!element) return;
        
        const nameClassStart = element.indexOf('<font color="#ff66b3">');
        const nameClassEnd = element.indexOf('</font>');
        
        let nameClass = '';
        if (nameClassStart !== -1 && nameClassEnd !== -1) {
            nameClass = element.slice(nameClassStart + 22, nameClassEnd);
            element = element.slice(nameClassEnd + 7);
        }

        let classExtend = "";
        const extendStart = element.indexOf('(<font color="#ff66b3">');
        if (extendStart !== -1) {
            const extendEnd = element.indexOf('</font>)');
            if (extendEnd !== -1) {
                classExtend = element.slice(extendStart + 23, extendEnd);
                element = element.slice(extendEnd + 8);
            }
        }

        let expression = '';
        if (typeof cell.value === 'object' && cell.value !== null) {
            const attrValue = (cell.value as MXCellValue).getAttribute('expression_' + index);
            expression = attrValue || '';
        }

        const row = addRowClass();

        const td0 = row.getElementsByTagName("td").item(0);
        if (td0) {
            const nameInput = td0.getElementsByTagName("input").item(0) as HTMLInputElement;
            if (nameInput) nameInput.value = nameClass;
        }

        const td1 = row.getElementsByTagName("td").item(1);
        if (td1) {
            const extendInput = td1.getElementsByTagName("input").item(0) as HTMLInputElement;
            if (extendInput) extendInput.value = classExtend;
        }

        const td2 = row.getElementsByTagName("td").item(2);
        if (td2) {
            const expressionTextarea = td2.getElementsByTagName("textarea").item(0) as HTMLTextAreaElement;
            if (expressionTextarea) expressionTextarea.value = expression;
        }

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