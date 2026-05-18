// Файл со стилями

/**
 * Применяет стили к таблице
 * @param table - HTML элемент таблицы
 * @returns стилизованная таблица
 */
export function styleTable(table: HTMLTableElement): HTMLTableElement {
    table.style.width = '100%';
    table.style.height = '80%';
    table.style.overflow = "scroll";
    table.style.display = "block";
    table.style.borderCollapse = "separate";
    table.style.borderSpacing = "10px 0";
    return table;
}

/**
 * Применяет стили к контейнеру кнопок
 * @param divBtn - HTML элемент контейнера
 * @returns стилизованный контейнер
 */
export function styleDivBtn(divBtn: HTMLDivElement): HTMLDivElement {
    divBtn.style.display = "flex";
    divBtn.style.height = "20%";
    divBtn.style.alignItems = "center";
    divBtn.style.gap = "5px";
    divBtn.style.justifyContent = "center";
    return divBtn;
}

/**
 * Применяет стили к кнопке
 * @param btn - HTML элемент кнопки
 * @returns стилизованная кнопка
 */
export function styleBtn(btn: HTMLButtonElement): HTMLButtonElement {
    btn.style.minHeight = "50%";
    btn.style.fontSize = "18px";
    return btn;
}

/**
 * Применяет стили к полю ввода
 * @param input - HTML элемент поля ввода (input или textarea)
 * @returns стилизованное поле ввода
 */
export function styleInput<T extends HTMLInputElement | HTMLTextAreaElement>(input: T): T {
    input.style.width = '100%';
    input.style.fontSize = '20px';
    return input;
}

/**
 * Применяет стили к выпадающему списку
 * @param select - HTML элемент select
 * @returns стилизованный select
 */
export function styleSelect(select: HTMLSelectElement): HTMLSelectElement {
    select.style.width = '100%';
    select.style.fontSize = '20px';
    return select;
}

/**
 * Применяет стили к span элементу
 * @param span - HTML элемент span
 * @returns стилизованный span
 */
export function styleSpan(span: HTMLSpanElement): HTMLSpanElement {
    span.style.fontSize = '20px';
    return span;
}

/**
 * Применяет стили к текстовой области для выражений
 * @param textarea - HTML элемент textarea
 * @returns стилизованная textarea
 */
export function styleTextAreaExp(textarea: HTMLTextAreaElement): HTMLTextAreaElement {
    textarea.style.fontSize = "30px";
    textarea.style.width = "100%";
    textarea.style.resize = "none";
    textarea.style.height = "80%";
    return textarea;
}

/**
 * Применяет стили к области Blockly
 * @param blocklyDiv - HTML элемент контейнера Blockly
 * @param w - ширина окна
 * @param h - высота окна
 * @returns стилизованный контейнер Blockly
 */
export function styleBlocklyAreaExp(blocklyDiv: HTMLDivElement, w: number, h: number): HTMLDivElement {
    blocklyDiv.style.width = w + 'px';
    blocklyDiv.style.height = h * 0.78 + 'px';
    return blocklyDiv;
}