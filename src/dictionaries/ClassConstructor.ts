import { styleTable, styleInput, styleBtn, styleDivBtn } from '../utils/style.js';
import { getTextByLocale, type LocaleKey } from '../utils/locale.js';
import { toolbox } from '../utils/blocks.js';
import { checkValidID, checkUniqueValues } from '../utils/utils.js';
import { type Parser, type ParseResult, type ParseError } from '../utils/parser.types.ts';
import {parser} from '../utils/parser.ts'
import * as Blockly from 'blockly';

// TYPES & INTERFACES

/** Данные класса для конструктора */
export interface ClassDefinition {
  id: string;
  name: string;
  extend?: string;
  expression: string;
  createdAt: number;
}

/** Результат валидации */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/** Конфигурация окна конструктора */
export interface ClassConstructorConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  editorUi: mxEditorUi;
}

/** Ссылка на DOM-элементы строки таблицы */
interface ClassTableRowElements {
  row: HTMLTableRowElement;
  nameInput: HTMLInputElement;
  extendInput: HTMLInputElement;
  expressionTextarea: HTMLTextAreaElement;
  deleteBtn?: HTMLButtonElement;
}

/** Ошибки парсинга выражений */
interface ExpressionParseResult {
  success: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
    expression: string;
  };
}

// CLASS: ClassConstructorWindow

export class ClassConstructorWindow {
  public window: mxWindow | null = null;
  
  private readonly editorUi: mxEditorUi;
  private readonly config: ClassConstructorConfig;
  private readonly classes: Map<string, ClassDefinition> = new Map();
  private rowElements: Map<string, ClassTableRowElements> = new Map();
  
  private table: HTMLTableElement | null = null;
  private tbody: HTMLTableSectionElement | null = null;
  
  constructor(config: ClassConstructorConfig) {
    this.editorUi = config.editorUi;
    this.config = config;
    
    this.init();
  }
  
  /** Инициализация окна */
  private init(): void {
    const { x, y, width, height } = this.config;
    
    // Создаём контейнер
    const div = document.createElement('div');
    div.style.height = '100%';
    div.style.width = '100%';
    
    // Создаём таблицу
    this.table = document.createElement('table');
    this.table = styleTable(this.table);
    this.tbody = document.createElement('tbody');
    this.tbody.style.height = '100%';
    
    // Добавляем первую строку
    const firstRow = this.addRowClass();
    if (this.tbody) {
      this.tbody.appendChild(firstRow);
    }
    
    if (this.table && this.tbody) {
      this.table.appendChild(this.tbody);
    }
    
    if (this.table) {
      div.appendChild(this.table);
    }
    
    // Создаём панель кнопок
    const btnDiv = this.createButtonPanel();
    div.appendChild(btnDiv);
    
    // Создаём окно
    this.window = new mxWindow(
      getTextByLocale('TitleClassConstructorWindow' as LocaleKey),
      div,
      x,
      y,
      width,
      height,
      true,
      true
    );
    
    this.configureWindow();
    
    if (this.window) {
      this.window.setVisible(true);
    }
  }
  
  /** Настройка окна */
  private configureWindow(): void {
    if (!this.window) return;
    
    this.window.destroyOnClose = true;
    this.window.setMaximizable(false);
    this.window.setResizable(true);
    this.window.setClosable(true);
  }
  
  /** Создание панели кнопок */
  private createButtonPanel(): HTMLDivElement {
    const btnDiv = styleDivBtn(document.createElement('div'));
    
    // Кнопка "Добавить класс"
    const addClassBtn = mxUtils.button(
      getTextByLocale('AddClass' as LocaleKey),
      () => this.handleAddClass()
    );
    btnDiv.appendChild(styleBtn(addClassBtn));
    
    // Кнопка "Применить"
    const applyBtn = mxUtils.button(
      getTextByLocale('Create' as LocaleKey),
      () => this.handleApply()
    );
    btnDiv.appendChild(styleBtn(applyBtn));
    
    // Кнопка "Открыть Blockly"
    const openBlocklyBtn = mxUtils.button(
      getTextByLocale('OpenBlockly' as LocaleKey),
      () => this.handleOpenBlockly()
    );
    btnDiv.appendChild(styleBtn(openBlocklyBtn));
    
    return btnDiv;
  }
  
  // ROW MANAGEMENT
  
  /** Добавление строки с новым классом */
  public addRowClass(data?: Partial<ClassDefinition>): HTMLTableRowElement {
    const tr = document.createElement('tr');
    tr.style.width = '100%';
    
    const rowId = data?.id || `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Column 1: Class Name
    const tdName = document.createElement('td');
    tdName.style.width = '25%';
    const nameInput = styleInput(document.createElement('input'));
    nameInput.type = 'text';
    nameInput.placeholder = 'Class name';
    nameInput.value = data?.name || '';
    nameInput.dataset.field = 'name';
    tdName.appendChild(nameInput);
    
    // Column 2: Extend
    const tdExtend = document.createElement('td');
    tdExtend.style.width = '25%';
    const extendInput = styleInput(document.createElement('input'));
    extendInput.type = 'text';
    extendInput.placeholder = 'Extend';
    extendInput.value = data?.extend || '';
    extendInput.dataset.field = 'extend';
    tdExtend.appendChild(extendInput);
    
    // Column 3: Expression
    const tdExpression = document.createElement('td');
    tdExpression.style.width = '25%';
    const expressionTextarea = styleInput(document.createElement('textarea'));
    expressionTextarea.style.resize = 'vertical';
    expressionTextarea.placeholder = 'Expression';
    expressionTextarea.value = data?.expression || '';
    expressionTextarea.dataset.field = 'expression';
    tdExpression.appendChild(expressionTextarea);
    
    // Column 4: Delete button 
    const tdDelete = document.createElement('td');
    tdDelete.style.width = '25%';
    
    // Сохраняем ссылки на элементы
    const rowElements: ClassTableRowElements = {
      row: tr,
      nameInput,
      extendInput,
      expressionTextarea
    };
    
    // Добавляем кнопку удаления, если это не первая строка
    if (this.tbody && this.tbody.rows.length > 0) {
      const deleteBtn = mxUtils.button(
        getTextByLocale('Delete' as LocaleKey),
        (evt: Event) => {
          evt.preventDefault();
          this.handleDeleteRow(rowId);
        }
      );
      tdDelete.appendChild(styleBtn(deleteBtn));
      rowElements.deleteBtn = deleteBtn;
    }
    
    // Собираем строку
    tr.appendChild(tdName);
    tr.appendChild(tdExtend);
    tr.appendChild(tdExpression);
    tr.appendChild(tdDelete);
    
    // Сохраняем маппинг
    this.rowElements.set(rowId, rowElements);
    
    return tr;
  }
  
  /** Удаление строки */
  private handleDeleteRow(rowId: string): void {
    const elements = this.rowElements.get(rowId);
    if (elements?.row.parentNode) {
      elements.row.parentNode.removeChild(elements.row);
      this.rowElements.delete(rowId);
      this.classes.delete(rowId);
    }
  }
  
  /** Обработчик кнопки "Добавить класс" */
  private handleAddClass(): void {
    if (!this.tbody) return;
    
    const newRow = this.addRowClass();
    this.tbody.appendChild(newRow);
  }
  
  // VALIDATION & PARSING
  
  /** Валидация всех полей */
  public validateAllInputs(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const classNames: string[] = [];
    
    for (const [rowId, elements] of this.rowElements.entries()) {
      const rowIndex = Array.from(this.rowElements.keys()).indexOf(rowId) + 1;
      
      const className = elements.nameInput.value.trim();
      const extendName = elements.extendInput.value.trim();
      const expression = elements.expressionTextarea.value.trim();
      
      // Валидация имени класса
      if (!className) {
        errors.push(
          getTextByLocale('nameIsMissing' as LocaleKey).replace('%i', String(rowIndex))
        );
      } else if (!checkValidID(className)) {
        errors.push(
          getTextByLocale('nameIsIncorrect' as LocaleKey).replace('%i', String(rowIndex))
        );
      } else {
        classNames.push(className);
      }
      
      // Валидация extends
      if (extendName && !checkValidID(extendName)) {
        errors.push(
          getTextByLocale('extendClassIsIncorrect' as LocaleKey).replace('%i', String(rowIndex))
        );
      }
      
      // Валидация выражения
      if (expression) {
        const parseResult = this.validateExpression(expression, rowIndex);
        if (!parseResult.success) {
          errors.push(
            getTextByLocale('expressionParseError' as LocaleKey)
              .replace('%i', String(rowIndex))
              .replace('%e', parseResult.error?.message || 'Unknown error')
          );
        }
      }
    }
    
    // Проверка уникальности имён
    if (!checkUniqueValues(classNames)) {
      errors.push(getTextByLocale('nonUniqueClassName' as LocaleKey));
    }
    
    // Проверка циклических зависимостей
    const cycleCheck = this.checkCircularDependencies();
    if (!cycleCheck.isValid) {
      errors.push(...cycleCheck.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /** Валидация выражения через parser */
  private validateExpression(expression: string, rowIndex: number): ExpressionParseResult {
    try {
      // Парсинг выражения
      const result = (parser as Parser).parse(expression) as ParseResult;
      
      // Если парсер возвращает ошибки в другом формате, обрабатываем их
      if (result && typeof result === 'object' && 'errors' in result) {
        const parseErrors = result.errors as ParseError[] | undefined;
        if (parseErrors && parseErrors.length > 0) {
          return {
            success: false,
            error: {
              message: parseErrors[0].message || 'Parse error',
              line: parseErrors[0].line,
              column: parseErrors[0].column,
              expression
            }
          };
        }
      }
      
      // Проверяем success флаг
      if (result && typeof result === 'object' && 'success' in result) {
        if (!result.success) {
          return {
            success: false,
            error: {
              message: 'Parse failed',
              expression
            }
          };
        }
      }
      
      return { success: true };
      
    } catch (error) {
      // Обрабатываем исключения от парсера
      const parseError = error as Error | ParseError;
      
      return {
        success: false,
        error: {
          message: parseError.message || 'Unknown parse error',
          line: (parseError as ParseError).line,
          column: (parseError as ParseError).column,
          expression
        }
      };
    }
  }
  
  /** Проверка циклических зависимостей в наследовании */
  private checkCircularDependencies(): ValidationResult {
    const errors: string[] = [];
    
    // Строим граф зависимостей
    const dependencies = new Map<string, string>();
    for (const [rowId, elements] of this.rowElements.entries()) {
      const className = elements.nameInput.value.trim();
      const extendName = elements.extendInput.value.trim();
      
      if (className && extendName) {
        dependencies.set(className, extendName);
      }
    }
    
    // DFS для поиска циклов
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (node: string): boolean => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;
      
      visited.add(node);
      recursionStack.add(node);
      
      const parent = dependencies.get(node);
      if (parent && hasCycle(parent)) {
        return true;
      }
      
      recursionStack.delete(node);
      return false;
    };
    
    for (const className of dependencies.keys()) {
      if (hasCycle(className)) {
        errors.push(
          getTextByLocale('circularDependency' as LocaleKey).replace('%c', className)
        );
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  // DATA GENERATION & EXPORT
  
  /** Генерация строкового представления для визуализации */
  public generateStrValueForClasses(): string {
    let strValue = '<font color="#000000"><b>Classes</b></font>';
    
    for (const [, elements] of this.rowElements.entries()) {
      const nameClass = elements.nameInput.value.trim();
      const classExtend = elements.extendInput.value.trim();
      
      if (!nameClass) continue;
      
      strValue += `<br><font color="#ff66b3">${this.escapeHtml(nameClass)}</font>`;
      if (classExtend) {
        strValue += ` (<font color="#ff66b3">${this.escapeHtml(classExtend)}</font>)`;
      }
    }
    
    return strValue;
  }
  
  /** Сбор данных классов в массив */
  public collectClassDefinitions(): ClassDefinition[] {
    const definitions: ClassDefinition[] = [];
    
    for (const [rowId, elements] of this.rowElements.entries()) {
      const name = elements.nameInput.value.trim();
      if (!name) continue;
      
      definitions.push({
        id: rowId,
        name,
        extend: elements.extendInput.value.trim() || undefined,
        expression: elements.expressionTextarea.value.trim(),
        createdAt: Date.now()
      });
    }
    
    return definitions;
  }
  
  /** Экранирование HTML для безопасного отображения */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
  
  // GRAPH INTEGRATION
  
  /** Проверка существования словаря классов на графе */
  private checkExistClassDictionary(graph: mxGraph): boolean {
    const model = graph.getModel();
    const cells = model.cells;
    
    for (const cellId of Object.keys(cells)) {
      const cell = cells[cellId];
      if (!cell?.value) continue;
      
      // Проверяем через атрибуты, а не через парсинг HTML-строки
      const cellValue = cell.value;
      
      // Если value — это XML-элемент (в mxGraph)
      if (cellValue instanceof Element) {
        const label = cellValue.getAttribute('label') || '';
        if (label.includes('Classes') && label.includes('classDictionary')) {
          return true;
        }
      }
      
      // Если value — это строка (fallback для старых версий)
      if (typeof cellValue === 'string') {
        // Ищем по безопасному маркеру
        if (cellValue.includes('data-type="classDictionary"')) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /** Добавление словаря классов на граф */
  private addClassDictionaryToGraph(classes: ClassDefinition[]): void {
    const graph = this.editorUi.editor.graph;
    
    if (!graph.isEnabled() || graph.isCellLocked(graph.getDefaultParent())) {
      return;
    }
    
    // Проверка на дубликаты 
    if (this.checkExistClassDictionary(graph)) {
      throw new Error(getTextByLocale('ClassExists' as LocaleKey));
    }
    
    const pos = graph.getInsertPoint();
    const height = 40 + this.rowElements.size * 30;
    
    // Создаём ячейку с правильными атрибутами
    const newElement = new mxCell(
      this.generateStrValueForClasses(),
      new mxGeometry(pos.x, pos.y, 300, height),
      'shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fontColor=#6666FF;align=center;editable=0;'
    );
    
    // Добавляем маркер типа для надёжного поиска в будущем
    newElement.setAttribute('data-type', 'classDictionary');
    newElement.setAttribute('class-count', String(classes.length));
    newElement.setAttribute('created-at', String(Date.now()));
    
    newElement.vertex = true;
    newElement.connectable = false;
    
    // Сохраняем выражения как атрибуты для последующего использования
    classes.forEach((cls, index) => {
      newElement.setAttribute(`class_${index}_name`, cls.name);
      newElement.setAttribute(`class_${index}_extend`, cls.extend || '');
      newElement.setAttribute(`class_${index}_expression`, cls.expression);
      newElement.setAttribute(`class_${index}_id`, cls.id);
    });
    
    // Добавляем на граф
    graph.setSelectionCell(graph.addCell(newElement));
    
    // Сохраняем в модель данных (если используется)
    const model = graph.getModel();
    if (model.endUpdate) {
      model.endUpdate();
    }
  }
  
  // EVENT HANDLERS
  
  /** Обработчик кнопки "Применить" */
  private handleApply(): void {
    try {
      // 1. Валидация
      const validation = this.validateAllInputs();
      if (!validation.isValid) {
        // Показываем ошибки пользователю
        const errorDialog = new mxWindow(
          getTextByLocale('ValidationError' as LocaleKey),
          `<div style="color: red; padding: 10px;">
            ${validation.errors.map(e => `<div>• ${e}</div>`).join('')}
          </div>`,
          document.body.offsetLeft + 200,
          document.body.offsetTop + 100,
          400,
          200,
          true,
          true
        );
        errorDialog.setClosable(true);
        errorDialog.setVisible(true);
        return;
      }
      
      // 2. Сбор данных
      const classes = this.collectClassDefinitions();
      if (classes.length === 0) {
        throw new Error(getTextByLocale('noClassesDefined' as LocaleKey));
      }
      
      // 3. Добавление на граф
      this.addClassDictionaryToGraph(classes);
      
      // 4. Успешное завершение
      this.destroy();
      
    } catch (error) {
      // Обработка непредвиденных ошибок
      console.error('ClassConstructor error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : getTextByLocale('unknownError' as LocaleKey);
      
      mxUtils.alert(errorMessage);
    }
  }
  
  /** Обработчик кнопки "Открыть Blockly" */
  private handleOpenBlockly(): void {
    const widthBlockly = window.screen.width - 400;
    const heightBlockly = window.screen.height - 300;
    
    const mainDivBlockly = document.createElement('div');
    
    // Контейнер для Blockly
    const divBlockly = document.createElement('div');
    divBlockly.id = 'classCreateBlocklyDiv';
    divBlockly.style.width = `${widthBlockly}px`;
    divBlockly.style.height = `${heightBlockly * 0.83}px`;
    mainDivBlockly.appendChild(divBlockly);
    
    // Поле ввода для кода
    const divInput = document.createElement('div');
    divInput.style.width = '100%';
    divInput.style.marginTop = '10px';
    
    const codeInput = styleInput(document.createElement('input'));
    codeInput.id = 'outputCode';
    codeInput.placeholder = 'Generated code will appear here...';
    divInput.appendChild(codeInput);
    mainDivBlockly.appendChild(divInput);
    
    // Кнопка генерации кода
    const btnDivBlockly = styleDivBtn(document.createElement('div'));
    const toCodeBtn = mxUtils.button(
      getTextByLocale('toСode' as LocaleKey),
      () => {
        try {
          // Пытаемся получить workspace разными способами
          let workspace: any = null;
          
          if (typeof Blockly.getMainWorkspace === 'function') {
            workspace = Blockly.getMainWorkspace();
          } else if (typeof (Blockly as any).getWorkspaceById === 'function') {
            workspace = (Blockly as any).getWorkspaceById('classCreateBlocklyDiv');
          }
          
          if (workspace) {
            // Проверяем наличие JavaScript генератора
            const jsGenerator = (Blockly as any).JavaScript;
            if (jsGenerator && typeof jsGenerator.workspaceToCode === 'function') {
              const code = jsGenerator.workspaceToCode(workspace) || '';
              codeInput.value = code;
            } else {
              // Пытаемся через глобальный объект
              const globalBlockly = window as any;
              if (globalBlockly.Blockly && globalBlockly.Blockly.JavaScript) {
                const code = globalBlockly.Blockly.JavaScript.workspaceToCode(workspace);
                codeInput.value = code;
              } else {
                throw new Error('Blockly JavaScript generator not found');
              }
            }
          } else {
            throw new Error('Blockly workspace not found');
          }
        } catch (err) {
          console.error('Blockly code generation error:', err);
          mxUtils.alert(getTextByLocale('blocklyError' as LocaleKey));
        }
      }
    );
    
    btnDivBlockly.appendChild(styleBtn(toCodeBtn));
    toCodeBtn.style.marginTop = '5px';
    mainDivBlockly.appendChild(btnDivBlockly);
    
    // Создаём окно Blockly
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
    
    // Инициализация Blockly
    try {
      const workspaceInWindow = Blockly.inject('classCreateBlocklyDiv', {
        toolbox: toolbox as any,
        scrollbars: true,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        }
      });
      
      // Сохраняем ссылку для использования в кнопке
      (win2 as any).blocklyWorkspace = workspaceInWindow;
      
    } catch (err) {
      console.error('Blockly inject error:', err);
      mxUtils.alert('Failed to initialize Blockly');
    }
  }
  
  /** Очистка ресурсов */
  public destroy(): void {
    if (this.window) {
      this.window.destroy();
      this.window = null;
    }
    
    this.rowElements.clear();
    this.classes.clear();
    this.table = null;
    this.tbody = null;
  }
}

// LEGACY COMPATIBILITY EXPORTS

/**
 * Legacy export для обратной совместимости с существующим кодом
 * @deprecated Использование класса ClassConstructorWindow напрямую
 */
export const ClassConstructorWindowLegacy = function(
  this: any,
  editorUi: mxEditorUi, 
  x: number, 
  y: number, 
  w: number, 
  h: number
) {
  const instance = new ClassConstructorWindow({
    editorUi,
    x,
    y,
    width: w,
    height: h
  });
  
  // Копия window для совместимости
  this.window = instance.window;
  
  return instance;
};

/**
 * Legacy export функции addRowClass
 * @deprecated Использование метода класса
 */
export function addRowClassLegacy(): HTMLTableRowElement {
  // Создаём временный экземпляр для доступа к методу
  const dummy = new ClassConstructorWindow({
    editorUi: {} as mxEditorUi,
    x: 0, y: 0, width: 0, height: 0
  });
  return dummy.addRowClass();
}