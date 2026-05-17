import { styleBtn } from '../utils/style.js';
import { getTextByLocale } from '../utils/locale.js';
import { EditorUi, MXCell, MXCellValue, MxWindow } from '../utils/types.js';

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
    ): MxWindow & { contentWrapper?: HTMLElement };
};

interface ExtendedMXCellValue extends MXCellValue {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
}

interface ExtendedMXCell extends MXCell {
    value: ExtendedMXCellValue;
}

interface EditQuestionInfoInNodeWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

// Окно редактирования информации для вопросов в узлах
export const EditQuestionInfoInNodeWindow = function (
    this: EditQuestionInfoInNodeWindowInstance,
    cell: ExtendedMXCell,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): EditQuestionInfoInNodeWindowInstance {
    const self = this;
    const graph = editorUi.editor.graph;

    const isLogicAggreg = cell.value.getAttribute("type") === "AND" || cell.value.getAttribute("type") === "OR";

    // Верстка окна
    const div = document.createElement('div');
    const divText = document.createElement('div');
    divText.style.height = "450px";
    divText.style.overflow = "scroll";

    // _asNextStep
    const asNextStep = document.createElement('textarea');
    asNextStep.style.width = "95%";
    asNextStep.style.height = "100px";
    asNextStep.style.fontSize = "20px";
    asNextStep.style.resize = "vertical";
    const asNextStepAttr = cell.value.getAttribute("_asNextStep");
    if (asNextStepAttr) {
        asNextStep.value = asNextStepAttr;
    }
    
    const divAsNextStep = document.createElement('div');
    divAsNextStep.innerHTML = getTextByLocale("asNextStep");
    divAsNextStep.style.fontSize = "20px";
    divText.appendChild(divAsNextStep);
    divText.appendChild(asNextStep);

    // _question / _description
    const question = document.createElement('textarea');
    question.style.width = "95%";
    question.style.height = "100px";
    question.style.fontSize = "20px";
    question.style.resize = "vertical";
    
    if (isLogicAggreg) {
        const descriptionAttr = cell.value.getAttribute("_description");
        if (descriptionAttr) {
            question.value = descriptionAttr;
        }
    } else {
        const questionAttr = cell.value.getAttribute("_question");
        if (questionAttr) {
            question.value = questionAttr;
        }
    }
    
    const divQuestion = document.createElement('div');
    if (isLogicAggreg) {
        divQuestion.innerHTML = getTextByLocale("descriptionQuestion");
    } else {
        divQuestion.innerHTML = getTextByLocale("questionQuestion");
    }
    divQuestion.style.fontSize = "20px";
    divText.appendChild(divQuestion);
    divText.appendChild(question);

    // _endingCause
    const endingCause = document.createElement('textarea');
    endingCause.style.width = "95%";
    endingCause.style.height = "100px";
    endingCause.style.fontSize = "20px";
    endingCause.style.resize = "vertical";
    const endingCauseAttr = cell.value.getAttribute("_endingCause");
    if (endingCauseAttr) {
        endingCause.value = endingCauseAttr;
    }
    
    const divEndingCause = document.createElement('div');
    divEndingCause.innerHTML = getTextByLocale("endingCause");
    divEndingCause.style.fontSize = "20px";
    divText.appendChild(divEndingCause);
    divText.appendChild(endingCause);

    // Кнопка сохранения узла
    let btnSaveTextInNode = mxUtils.button(getTextByLocale("Save"), function (): void {
        graph.getModel().beginUpdate();
        cell.value.setAttribute("_asNextStep", asNextStep.value);
        
        if (isLogicAggreg) {
            cell.value.setAttribute("_description", question.value);
        } else {
            cell.value.setAttribute("_question", question.value);
        }
        
        cell.value.setAttribute("_endingCause", endingCause.value);
        graph.getModel().endUpdate();
        graph.refresh();
        win.destroy();
    });

    const btnDiv = document.createElement('div');
    btnDiv.style.display = "flex";
    btnDiv.style.gap = "5px";
    btnDiv.style.height = "10%";
    btnDiv.style.alignItems = "center";
    btnDiv.style.justifyContent = "center";

    btnSaveTextInNode = styleBtn(btnSaveTextInNode);
    btnDiv.appendChild(btnSaveTextInNode);

    div.appendChild(divText);
    div.appendChild(btnDiv);

    // Настройки окна
    const win = new mxWindow(
        getTextByLocale("TitleEditQuestionInfoInNodeWindow"),
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
    
    return self;
};