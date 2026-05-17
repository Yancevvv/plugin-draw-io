import { styleBtn, styleDivBtn, styleInput, styleSelect } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { getTypeFromCode, getTextFromValueInOutcome } from '../utils/utils.js';
import { getClasses, getEnums } from '../dictionaries/Utils.js';
import { EditorUi, MXCell, MXCellValue, ClassItem, EnumItem } from '../utils/types.js';

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
    ): MxWindow;
};

interface MxWindow {
    destroyOnClose: boolean;
    destroy(): void;
    setMaximizable(enabled: boolean): void;
    setResizable(enabled: boolean): void;
    setClosable(enabled: boolean): void;
    setVisible(visible: boolean): void;
}

interface TypeNode {
    type: string;
    range?: string;
    enum?: string;
}

interface EditValueInOutcomeWindowInstance {
    window: MxWindow;
}

interface ExtendedMXCell extends MXCell {
    source?: ExtendedMXCell;
    style?: string;
    value: string | MXCellValue;
}

// Окно редактирования значений в ветке
export const EditValueInOutcomeWindow = function (
    this: EditValueInOutcomeWindowInstance,
    cell: ExtendedMXCell & { value: MXCellValue },
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): EditValueInOutcomeWindowInstance {
    const self = this;
    const graph = editorUi.editor.graph;

    // Верстка окна
    const div = document.createElement('div');
    const divText = document.createElement('div');
    const labelText = document.createElement('label');
    labelText.innerHTML = getTextByLocale("HumanReadableText");
    labelText.style.fontSize = '20px';
    let text = document.createElement('input');
    text.type = "text";
    text = styleInput(text);
    text.placeholder = "Human-readable text";
    labelText.appendChild(text);
    divText.appendChild(labelText);

    const outNode = cell.source;
    if (outNode == null) {
        throw new Error(getTextByLocale("sourceNodeIsMissing"));
    }
    
    let typeValue = "";
    
    if (typeof outNode.value === "object" && outNode.value !== null) {
        const outNodeValue = outNode.value as MXCellValue;
        const expression = outNodeValue.getAttribute('expression');
        
        if (expression) {
            const typeNode = getTypeFromCode(expression, editorUi) as TypeNode;
            
            if (outNode.style === "rounded=1;whiteSpace=wrap;html=1;fontFamily=Helvetica;fontSize=12;editable=0;") {
                const labelValue = document.createElement('label');
                labelValue.innerHTML = getTextByLocale("value");
                labelValue.style.fontSize = '20px';
                const selectValue = document.createElement('select');
                styleSelect(selectValue);
                selectValue.id = "value_input";
                selectValue.style.width = '100%';
                const values = ["Found", "Not found"];
                values.forEach(item => {
                    const newOption = new Option(item, item);
                    selectValue.options[selectValue.options.length] = newOption;
                });
                labelValue.appendChild(selectValue);
                divText.appendChild(labelValue);
            } else if (typeNode.type === "int" && 
                       outNodeValue.getAttribute('operator') !== "AND" && 
                       outNodeValue.getAttribute('operator') !== "OR" && 
                       outNodeValue.getAttribute('operator') !== "HYP") {
                typeValue = "int";
                const labelType = document.createElement('label');
                labelType.innerHTML = getTextByLocale("value");
                labelType.style.fontSize = '20px';
                const numberInt = document.createElement('input');
                styleInput(numberInt);
                numberInt.id = "value_input";
                numberInt.type = "number";
                if (typeNode.range) {
                    const ranges = typeNode.range.split('-');
                    numberInt.min = ranges[0];
                    numberInt.max = ranges[1];
                }
                numberInt.style.width = '100%';
                labelType.appendChild(numberInt);
                divText.appendChild(labelType);
            } else if (typeNode.type === "bool" && 
                       outNodeValue.getAttribute('operator') !== "AND" && 
                       outNodeValue.getAttribute('operator') !== "OR" && 
                       outNodeValue.getAttribute('operator') !== "HYP") {
                typeValue = "bool";
                const labelValue = document.createElement('label');
                labelValue.innerHTML = getTextByLocale("value");
                labelValue.style.fontSize = '20px';
                const selectValue = document.createElement('select');
                styleSelect(selectValue);
                selectValue.id = "value_input";
                selectValue.style.width = '100%';
                const optionTrue = new Option("True", "True");
                selectValue.options[selectValue.options.length] = optionTrue;
                const optionFalse = new Option("False", "False");
                selectValue.options[selectValue.options.length] = optionFalse;
                labelValue.appendChild(selectValue);
                divText.appendChild(labelValue);
            } else if (typeNode.type === "class" && 
                       outNodeValue.getAttribute('operator') !== "AND" && 
                       outNodeValue.getAttribute('operator') !== "OR" && 
                       outNodeValue.getAttribute('operator') !== "HYP") {
                typeValue = "class";
                const labelValue = document.createElement('label');
                labelValue.innerHTML = getTextByLocale("value");
                labelValue.style.fontSize = '20px';
                const selectValue = document.createElement('select');
                styleSelect(selectValue);
                selectValue.id = "value_input";
                selectValue.style.width = '100%';
                const jsonClasses: ClassItem[] = getClasses(editorUi);
                jsonClasses.forEach(classItem => {
                    const newOption = new Option(classItem.name, classItem.name);
                    selectValue.options[selectValue.options.length] = newOption;
                });
                labelValue.appendChild(selectValue);
                divText.appendChild(labelValue);
            } else if (typeNode.type === "double" && 
                       outNodeValue.getAttribute('operator') !== "AND" && 
                       outNodeValue.getAttribute('operator') !== "OR" && 
                       outNodeValue.getAttribute('operator') !== "HYP") {
                typeValue = "double";
                const labelType = document.createElement('label');
                labelType.innerHTML = getTextByLocale("value");
                labelType.style.fontSize = '20px';
                const numberInt = document.createElement('input');
                styleInput(numberInt);
                numberInt.id = "value_input";
                numberInt.type = "number";
                numberInt.step = "0.01";
                if (typeNode.range) {
                    const ranges = typeNode.range.split('-');
                    numberInt.min = ranges[0];
                    numberInt.max = ranges[1];
                }
                numberInt.style.width = '100%';
                labelType.appendChild(numberInt);
                divText.appendChild(labelType);
            } else if (typeNode.type === "string" && 
                       outNodeValue.getAttribute('operator') !== "AND" && 
                       outNodeValue.getAttribute('operator') !== "OR" && 
                       outNodeValue.getAttribute('operator') !== "HYP") {
                typeValue = "string";
                const labelType = document.createElement('label');
                labelType.innerHTML = getTextByLocale("value");
                labelType.style.fontSize = '20px';
                const textValue = document.createElement('input');
                styleInput(textValue);
                textValue.id = "value_input";
                textValue.type = "text";
                textValue.style.width = '100%';
                textValue.placeholder = "value string";
                labelType.appendChild(textValue);
                divText.appendChild(labelType);
            } else if (typeNode.type === "enum" && 
                       outNodeValue.getAttribute('operator') !== "AND" && 
                       outNodeValue.getAttribute('operator') !== "OR" && 
                       outNodeValue.getAttribute('operator') !== "HYP") {
                typeValue = "enum";
                const labelValue = document.createElement('label');
                labelValue.innerHTML = getTextByLocale("value");
                labelValue.style.fontSize = '20px';
                const selectValue = document.createElement('select');
                styleSelect(selectValue);
                selectValue.id = "value_input";
                selectValue.style.width = '100%';
                const enumsList: EnumItem[] = getEnums(editorUi);
                const findEnum = enumsList.filter(el => el.nameEnum === typeNode.enum);
                if (findEnum[0] !== undefined) {
                    findEnum[0].values.forEach(enumValue => {
                        const newOption = new Option(typeNode.enum + ":" + enumValue, typeNode.enum + ":" + enumValue);
                        selectValue.options[selectValue.options.length] = newOption;
                    });
                } else {
                    throw new Error(getTextByLocale("EnumIsMissing"));
                }
                labelValue.appendChild(selectValue);
                divText.appendChild(labelValue);
            } else if (typeNode.type === "assign" && 
                       outNodeValue.getAttribute('operator') !== "AND" && 
                       outNodeValue.getAttribute('operator') !== "OR" && 
                       outNodeValue.getAttribute('operator') !== "HYP") {
                throw new Error(getTextByLocale("AssignInNode"));
            }
        }
    }

    if (typeof outNode.value === "object" && outNode.value !== null) {
        const outNodeValue = outNode.value as MXCellValue;
        
        if (outNodeValue.getAttribute('type') === "START") {
            const labelType = document.createElement('label');
            labelType.innerHTML = getTextByLocale("type");
            labelType.style.fontSize = '20px';
            const selectTypes = document.createElement('select');
            styleSelect(selectTypes);
            selectTypes.id = "type_input";
            selectTypes.style.width = '100%';
            const types = ["int", "bool", "double", "object", "enum"];
            types.forEach(type => {
                const newOption = new Option(type, type);
                selectTypes.options[selectTypes.options.length] = newOption;
            });
            labelType.appendChild(selectTypes);
            divText.appendChild(labelType);
        } else if (outNodeValue.getAttribute('type') === "predetermining") {
            const labelType = document.createElement('label');
            labelType.innerHTML = getTextByLocale("type");
            labelType.style.fontSize = '20px';
            const selectTypes = document.createElement('select');
            styleSelect(selectTypes);
            selectTypes.id = "type_input";
            selectTypes.style.width = '100%';
            const types = ["Branch", "Correct", "Error", "Null"];
            types.forEach(type => {
                const newOption = new Option(type, type);
                selectTypes.options[selectTypes.options.length] = newOption;
            });
            labelType.appendChild(selectTypes);
            divText.appendChild(labelType);
        } else if (outNodeValue.getAttribute('type') === "AND" || 
                   outNodeValue.getAttribute('type') === "OR" || 
                   outNodeValue.getAttribute('type') === "HYP") {
            const labelType = document.createElement('label');
            labelType.innerHTML = getTextByLocale("type");
            labelType.style.fontSize = '20px';
            const selectTypes = document.createElement('select');
            styleSelect(selectTypes);
            selectTypes.id = "type_input";
            selectTypes.style.width = '100%';
            const types = ["Branch", "Correct", "Error", "Null"];
            types.forEach(type => {
                const newOption = new Option(type, type);
                selectTypes.options[selectTypes.options.length] = newOption;
            });
            labelType.appendChild(selectTypes);
            divText.appendChild(labelType);
        } else if (outNodeValue.getAttribute('operator') === "AND" || 
                   outNodeValue.getAttribute('operator') === "OR" || 
                   outNodeValue.getAttribute('operator') === "HYP") {
            const labelType = document.createElement('label');
            labelType.innerHTML = getTextByLocale("type");
            labelType.style.fontSize = '20px';
            const selectTypes = document.createElement('select');
            styleSelect(selectTypes);
            selectTypes.id = "type_input";
            selectTypes.style.width = '100%';
            const types = ["Body", "Correct", "Error", "Null"];
            types.forEach(type => {
                const newOption = new Option(type, type);
                selectTypes.options[selectTypes.options.length] = newOption;
            });
            labelType.appendChild(selectTypes);
            divText.appendChild(labelType);
        }
    }

    // Кнопка сохранения значений в ветке
    const btnSaveValueInOutcome = mxUtils.button(getTextByLocale("Save"), function (): void {
        checkAllInputsOutcome(divText, cell.source?.value as MXCellValue);
        const textInOutcome = text.value;
        graph.getModel().beginUpdate();
        graph.setAttributeForCell(cell, 'label', textInOutcome);
        
        const vin = document.getElementById("value_input") as HTMLSelectElement | HTMLInputElement | null;
        let valInOutcome = "";
        if (vin !== null && vin.tagName === "SELECT") {
            valInOutcome = (vin as HTMLSelectElement).options[(vin as HTMLSelectElement).selectedIndex].value;
            graph.setAttributeForCell(cell, 'typeValue', typeValue);
        } else if (vin !== null && vin.tagName === "INPUT") {
            valInOutcome = (vin as HTMLInputElement).value;
            graph.setAttributeForCell(cell, 'typeValue', typeValue);
        }
        graph.setAttributeForCell(cell, 'value', valInOutcome);

        const typeOutcome = document.getElementById("type_input") as HTMLSelectElement | null;
        if (typeOutcome) {
            const typeInOutcome = typeOutcome.options[typeOutcome.selectedIndex].value;
            graph.setAttributeForCell(cell, 'type', typeInOutcome);
        }

        if (!cell.style?.includes("editable=0;")) {
            if (cell.style) {
                cell.style += "editable=0;";
            }
        }
        if (cell.style) {
            cell.style = cell.style.replace("strokeColor=#FF0000;", "");
        }

        graph.getModel().endUpdate();
        graph.refresh();
        win.destroy();
    });

    // Кнопка генерации человекочитаемого текста
    const btnGenerateTextInOutcome = mxUtils.button(getTextByLocale("Generate"), function (): void {
        const vin = document.getElementById("value_input") as HTMLSelectElement | HTMLInputElement | null;
        const typeSelect = document.getElementById("type_input") as HTMLSelectElement | null;
        let humanStr = "";
        
        if (vin !== null && vin.tagName === "SELECT") {
            const valSelect = (vin as HTMLSelectElement).options[(vin as HTMLSelectElement).selectedIndex].value;
            humanStr = getTextFromValueInOutcome(valSelect);
        } else if (vin !== null && vin.tagName === "INPUT") {
            humanStr = getTextFromValueInOutcome((vin as HTMLInputElement).value);
        } else if (vin === null && 
                   typeof cell.source?.value === "object" && 
                   (cell.source.value as MXCellValue).getAttribute('type') !== "START" && 
                   typeSelect) {
            humanStr = typeSelect.options[typeSelect.selectedIndex].value;
        }
        text.value = humanStr;
    });

    const btnDiv = document.createElement('div');
    styleDivBtn(btnDiv);
    btnDiv.style.marginTop = "10px";
    styleBtn(btnSaveValueInOutcome);
    styleBtn(btnGenerateTextInOutcome);
    btnDiv.appendChild(btnSaveValueInOutcome);
    btnDiv.appendChild(btnGenerateTextInOutcome);
    div.appendChild(divText);
    div.appendChild(btnDiv);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleEditValueInOutcomeWindow"),
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
    self.window.setResizable(false);
    self.window.setClosable(true);
    self.window.setVisible(true);

    // Заполнение существующих значений
    if (cell.value !== null && typeof cell.value === "object") {
        text.value = cell.value.getAttribute("label") || '';
        
        const vin = document.getElementById("value_input") as HTMLSelectElement | HTMLInputElement | null;
        if (vin !== null && vin.tagName === "SELECT") {
            const valInCell = cell.value.getAttribute("value");
            for (let index = 0; index < (vin as HTMLSelectElement).options.length; ++index) {
                if ((vin as HTMLSelectElement).options[index].value === valInCell) {
                    (vin as HTMLSelectElement).options[index].selected = true;
                }
            }
        } else if (vin !== null && vin.tagName === "INPUT") {
            (vin as HTMLInputElement).value = cell.value.getAttribute("value") || '';
        }
        
        const type = cell.value.getAttribute("type");
        const typeInput = document.getElementById("type_input") as HTMLSelectElement | null;
        if (type && typeInput) {
            for (let index = 0; index < typeInput.options.length; ++index) {
                if (typeInput.options[index].value === type) {
                    typeInput.options[index].selected = true;
                }
            }
        }
    }
    
    return self;
};

// Валидация полей
function checkAllInputsOutcome(div: HTMLElement, outNodeValue: MXCellValue | undefined): void {
    let errors = "";
    const inputElement = div.getElementsByTagName("input").item(0) as HTMLInputElement;
    
    if ((inputElement?.value === "") && 
        typeof outNodeValue === "object" && 
        outNodeValue?.getAttribute('type') !== "START") {
        errors += getTextByLocale("HumanReadableTextIsMissing");
    }
    
    const valueInput = document.getElementById("value_input") as HTMLInputElement | HTMLSelectElement | null;
    if (valueInput !== null && (valueInput as HTMLInputElement).value === "") {
        errors += getTextByLocale("ValueOutcomeIsMissing");
    }
    
    if (errors !== "") {
        throw new Error(errors);
    }
}