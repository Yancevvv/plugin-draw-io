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

interface ExtendedMXCell extends MXCell {
    source?: ExtendedMXCell;
    style?: string;
    value: string | MXCellValue;
}

interface ExtendedMXCellValue extends MXCellValue {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
}

interface EditQuestionInfoInOutcomeWindowInstance {
    window: MxWindow & { contentWrapper?: HTMLElement };
}

// Окно редактирования информации для вопросов в узлах
export const EditQuestionInfoInOutcomeWindow = function (
    this: EditQuestionInfoInOutcomeWindowInstance,
    cell: ExtendedMXCell & { value: ExtendedMXCellValue },
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): EditQuestionInfoInOutcomeWindowInstance {
    const self = this;
    const graph = editorUi.editor.graph;

    const outNode = cell.source;
    if (outNode == null) {
        throw new Error(getTextByLocale("sourceNodeIsMissing"));
    }
    if (!cell.value || typeof cell.value !== "object") {
        throw new Error(getTextByLocale("ValueInOutcomeIsMissing"));
    }

    // Верстка окна
    const div = document.createElement('div');
    const divText = document.createElement('div');
    divText.style.height = "450px";
    divText.style.overflow = "scroll";
    
    const isThoughtBranch = typeof outNode.value === "object"
        && (outNode.value.getAttribute('type') === "START"
            || ((outNode.value.getAttribute('type') === "AND" || outNode.value.getAttribute('type') === "OR")
                && typeof cell.value === "object" && cell.value.getAttribute("type") === "Branch")
            || ((outNode.value.getAttribute('operator') === "AND" || outNode.value.getAttribute('operator') === "OR")
                && typeof cell.value === "object" && cell.value.getAttribute("type") === "Body"));
    
    const isPredeterminingBranch = typeof cell.value === "object"
        && cell.value.getAttribute('type') === "predeterminingBranch";
    
    if (isThoughtBranch && !isPredeterminingBranch) {
        // _description
        const description = document.createElement('textarea');
        description.id = "_description";
        description.style.width = "95%";
        description.style.height = "100px";
        description.style.fontSize = "20px";
        description.style.resize = "vertical";
        const descriptionAttr = cell.value.getAttribute("_description");
        if (descriptionAttr) {
            description.value = descriptionAttr;
        }
        const divDescription = document.createElement('div');
        divDescription.innerHTML = getTextByLocale("descriptionOutcome");
        divDescription.style.fontSize = "20px";
        divText.appendChild(divDescription);
        divText.appendChild(description);

        // _nextStepQuestion
        const nextStepQuestion = document.createElement('textarea');
        nextStepQuestion.id = "_nextStepQuestion";
        nextStepQuestion.style.width = "95%";
        nextStepQuestion.style.height = "100px";
        nextStepQuestion.style.fontSize = "20px";
        nextStepQuestion.style.resize = "vertical";
        const nextStepQuestionAttr = cell.value.getAttribute("_nextStepQuestion");
        if (nextStepQuestionAttr) {
            nextStepQuestion.value = nextStepQuestionAttr;
        }
        const divNextStepQuestion = document.createElement('div');
        divNextStepQuestion.innerHTML = getTextByLocale("nextStepQuestion");
        divNextStepQuestion.style.fontSize = "20px";
        divText.appendChild(divNextStepQuestion);
        divText.appendChild(nextStepQuestion);

        // _nextStepExplanation
        const nextStepExplanation = document.createElement('textarea');
        nextStepExplanation.id = "_nextStepExplanation";
        nextStepExplanation.style.width = "95%";
        nextStepExplanation.style.height = "100px";
        nextStepExplanation.style.fontSize = "20px";
        nextStepExplanation.style.resize = "vertical";
        const nextStepExplanationAttr = cell.value.getAttribute("_nextStepExplanation");
        if (nextStepExplanationAttr) {
            nextStepExplanation.value = nextStepExplanationAttr;
        }
        const divNextStepExplanation = document.createElement('div');
        divNextStepExplanation.innerHTML = getTextByLocale("nextStepExplanation");
        divNextStepExplanation.style.fontSize = "20px";
        divText.appendChild(divNextStepExplanation);
        divText.appendChild(nextStepExplanation);
    } else if (!isThoughtBranch && isPredeterminingBranch) {
        // _text
        const text = document.createElement('textarea');
        text.id = "_text";
        text.style.width = "95%";
        text.style.height = "100px";
        text.style.fontSize = "20px";
        text.style.resize = "vertical";
        const textAttr = cell.value.getAttribute("_text");
        if (textAttr) {
            text.value = textAttr;
        }
        const divTextO = document.createElement('div');
        divTextO.innerHTML = getTextByLocale("textQuestion");
        divTextO.style.fontSize = "20px";
        divText.appendChild(divTextO);
        divText.appendChild(text);

        // _explanation
        const explanation = document.createElement('textarea');
        explanation.id = "_explanation";
        explanation.style.width = "95%";
        explanation.style.height = "100px";
        explanation.style.fontSize = "20px";
        explanation.style.resize = "vertical";
        const explanationAttr = cell.value.getAttribute("_explanation");
        if (explanationAttr) {
            explanation.value = explanationAttr;
        }
        const divExplanation = document.createElement('div');
        divExplanation.innerHTML = getTextByLocale("explanation");
        divExplanation.style.fontSize = "20px";
        divText.appendChild(divExplanation);
        divText.appendChild(explanation);

        // _nextStepQuestionOutcome
        const nextStepQuestionOutcome = document.createElement('textarea');
        nextStepQuestionOutcome.id = "_nextStepQuestionOutcome";
        nextStepQuestionOutcome.style.width = "95%";
        nextStepQuestionOutcome.style.height = "100px";
        nextStepQuestionOutcome.style.fontSize = "20px";
        nextStepQuestionOutcome.style.resize = "vertical";
        const nextStepQuestionOutcomeAttr = cell.value.getAttribute("_nextStepQuestionOutcome");
        if (nextStepQuestionOutcomeAttr) {
            nextStepQuestionOutcome.value = nextStepQuestionOutcomeAttr;
        }
        const divNextStepQuestionOutcome = document.createElement('div');
        divNextStepQuestionOutcome.innerHTML = getTextByLocale("nextStepQuestionOutcome");
        divNextStepQuestionOutcome.style.fontSize = "20px";
        divText.appendChild(divNextStepQuestionOutcome);
        divText.appendChild(nextStepQuestionOutcome);

        // _nextStepBranchResult
        const nextStepBranchResult = document.createElement('textarea');
        nextStepBranchResult.id = "_nextStepBranchResult";
        nextStepBranchResult.style.width = "95%";
        nextStepBranchResult.style.height = "100px";
        nextStepBranchResult.style.fontSize = "20px";
        nextStepBranchResult.style.resize = "vertical";
        const nextStepBranchResultAttr = cell.value.getAttribute("_nextStepBranchResult");
        if (nextStepBranchResultAttr) {
            nextStepBranchResult.value = nextStepBranchResultAttr;
        }
        const divNextStepBranchResult = document.createElement('div');
        divNextStepBranchResult.innerHTML = getTextByLocale("nextStepBranchResult");
        divNextStepBranchResult.style.fontSize = "20px";
        divText.appendChild(divNextStepBranchResult);
        divText.appendChild(nextStepBranchResult);

        // _nextStepExplanationOutcome
        const nextStepExplanationOutcome = document.createElement('textarea');
        nextStepExplanationOutcome.id = "_nextStepExplanationOutcome";
        nextStepExplanationOutcome.style.width = "95%";
        nextStepExplanationOutcome.style.height = "100px";
        nextStepExplanationOutcome.style.fontSize = "20px";
        nextStepExplanationOutcome.style.resize = "vertical";
        const nextStepExplanationOutcomeAttr = cell.value.getAttribute("_nextStepExplanationOutcome");
        if (nextStepExplanationOutcomeAttr) {
            nextStepExplanationOutcome.value = nextStepExplanationOutcomeAttr;
        }
        const divNextStepExplanationOutcome = document.createElement('div');
        divNextStepExplanationOutcome.innerHTML = getTextByLocale("nextStepExplanationOutcome");
        divNextStepExplanationOutcome.style.fontSize = "20px";
        divText.appendChild(divNextStepExplanationOutcome);
        divText.appendChild(nextStepExplanationOutcome);

        // _description
        const description = document.createElement('textarea');
        description.id = "_description";
        description.style.width = "95%";
        description.style.height = "100px";
        description.style.fontSize = "20px";
        description.style.resize = "vertical";
        const descriptionAttr = cell.value.getAttribute("_description");
        if (descriptionAttr) {
            description.value = descriptionAttr;
        }
        const divDescription = document.createElement('div');
        divDescription.innerHTML = getTextByLocale("descriptionOutcome");
        divDescription.style.fontSize = "20px";
        divText.appendChild(divDescription);
        divText.appendChild(description);

        // _nextStepQuestionThoughtBranch
        const nextStepQuestionThoughtBranch = document.createElement('textarea');
        nextStepQuestionThoughtBranch.id = "_nextStepQuestionThoughtBranch";
        nextStepQuestionThoughtBranch.style.width = "95%";
        nextStepQuestionThoughtBranch.style.height = "100px";
        nextStepQuestionThoughtBranch.style.fontSize = "20px";
        nextStepQuestionThoughtBranch.style.resize = "vertical";
        const nextStepQuestionThoughtBranchAttr = cell.value.getAttribute("_nextStepQuestionThoughtBranch");
        if (nextStepQuestionThoughtBranchAttr) {
            nextStepQuestionThoughtBranch.value = nextStepQuestionThoughtBranchAttr;
        }
        const divNextStepQuestionThoughtBranch = document.createElement('div');
        divNextStepQuestionThoughtBranch.innerHTML = getTextByLocale("nextStepQuestion");
        divNextStepQuestionThoughtBranch.style.fontSize = "20px";
        divText.appendChild(divNextStepQuestionThoughtBranch);
        divText.appendChild(nextStepQuestionThoughtBranch);

        // _nextStepExplanationThoughtBranch
        const nextStepExplanationThoughtBranch = document.createElement('textarea');
        nextStepExplanationThoughtBranch.id = "_nextStepExplanationThoughtBranch";
        nextStepExplanationThoughtBranch.style.width = "95%";
        nextStepExplanationThoughtBranch.style.height = "100px";
        nextStepExplanationThoughtBranch.style.fontSize = "20px";
        nextStepExplanationThoughtBranch.style.resize = "vertical";
        const nextStepExplanationThoughtBranchAttr = cell.value.getAttribute("_nextStepExplanationThoughtBranch");
        if (nextStepExplanationThoughtBranchAttr) {
            nextStepExplanationThoughtBranch.value = nextStepExplanationThoughtBranchAttr;
        }
        const divNextStepExplanationThoughtBranch = document.createElement('div');
        divNextStepExplanationThoughtBranch.innerHTML = getTextByLocale("nextStepExplanation");
        divNextStepExplanationThoughtBranch.style.fontSize = "20px";
        divText.appendChild(divNextStepExplanationThoughtBranch);
        divText.appendChild(nextStepExplanationThoughtBranch);
    } else if (!isThoughtBranch && !isPredeterminingBranch) {
        // _text
        const text = document.createElement('textarea');
        text.id = "_text";
        text.style.width = "95%";
        text.style.height = "100px";
        text.style.fontSize = "20px";
        text.style.resize = "vertical";
        const textAttr = cell.value.getAttribute("_text");
        if (textAttr) {
            text.value = textAttr;
        }
        const divTextO = document.createElement('div');
        divTextO.innerHTML = getTextByLocale("textQuestion");
        divTextO.style.fontSize = "20px";
        divText.appendChild(divTextO);
        divText.appendChild(text);

        // _explanation
        const explanation = document.createElement('textarea');
        explanation.id = "_explanation";
        explanation.style.width = "95%";
        explanation.style.height = "100px";
        explanation.style.fontSize = "20px";
        explanation.style.resize = "vertical";
        const explanationAttr = cell.value.getAttribute("_explanation");
        if (explanationAttr) {
            explanation.value = explanationAttr;
        }
        const divExplanation = document.createElement('div');
        divExplanation.innerHTML = getTextByLocale("explanation");
        divExplanation.style.fontSize = "20px";
        divText.appendChild(divExplanation);
        divText.appendChild(explanation);

        // _nextStepQuestion
        const nextStepQuestion = document.createElement('textarea');
        nextStepQuestion.id = "_nextStepQuestion";
        nextStepQuestion.style.width = "95%";
        nextStepQuestion.style.height = "100px";
        nextStepQuestion.style.fontSize = "20px";
        nextStepQuestion.style.resize = "vertical";
        const nextStepQuestionAttr = cell.value.getAttribute("_nextStepQuestion");
        if (nextStepQuestionAttr) {
            nextStepQuestion.value = nextStepQuestionAttr;
        }
        const divNextStepQuestion = document.createElement('div');
        divNextStepQuestion.innerHTML = getTextByLocale("nextStepQuestionOutcome");
        divNextStepQuestion.style.fontSize = "20px";
        divText.appendChild(divNextStepQuestion);
        divText.appendChild(nextStepQuestion);

        // _nextStepBranchResult
        const nextStepBranchResult = document.createElement('textarea');
        nextStepBranchResult.id = "_nextStepBranchResult";
        nextStepBranchResult.style.width = "95%";
        nextStepBranchResult.style.height = "100px";
        nextStepBranchResult.style.fontSize = "20px";
        nextStepBranchResult.style.resize = "vertical";
        const nextStepBranchResultAttr = cell.value.getAttribute("_nextStepBranchResult");
        if (nextStepBranchResultAttr) {
            nextStepBranchResult.value = nextStepBranchResultAttr;
        }
        const divNextStepBranchResult = document.createElement('div');
        divNextStepBranchResult.innerHTML = getTextByLocale("nextStepBranchResult");
        divNextStepBranchResult.style.fontSize = "20px";
        divText.appendChild(divNextStepBranchResult);
        divText.appendChild(nextStepBranchResult);

        // _nextStepExplanation
        const nextStepExplanation = document.createElement('textarea');
        nextStepExplanation.id = "_nextStepExplanation";
        nextStepExplanation.style.width = "95%";
        nextStepExplanation.style.height = "100px";
        nextStepExplanation.style.fontSize = "20px";
        nextStepExplanation.style.resize = "vertical";
        const nextStepExplanationAttr = cell.value.getAttribute("_nextStepExplanation");
        if (nextStepExplanationAttr) {
            nextStepExplanation.value = nextStepExplanationAttr;
        }
        const divNextStepExplanation = document.createElement('div');
        divNextStepExplanation.innerHTML = getTextByLocale("nextStepExplanationOutcome");
        divNextStepExplanation.style.fontSize = "20px";
        divText.appendChild(divNextStepExplanation);
        divText.appendChild(nextStepExplanation);
    }

    // Кнопка сохранения узла
    let btnSaveTextInNode = mxUtils.button(getTextByLocale("Save"), function (): void {
        graph.getModel().beginUpdate();
        
        if (isThoughtBranch && !isPredeterminingBranch) {
            const descriptionElem = divText.querySelector("#_description") as HTMLTextAreaElement;
            const nextStepQuestionElem = divText.querySelector("#_nextStepQuestion") as HTMLTextAreaElement;
            const nextStepExplanationElem = divText.querySelector("#_nextStepExplanation") as HTMLTextAreaElement;
            
            if (descriptionElem) cell.value.setAttribute("_description", descriptionElem.value);
            if (nextStepQuestionElem) cell.value.setAttribute("_nextStepQuestion", nextStepQuestionElem.value);
            if (nextStepExplanationElem) cell.value.setAttribute("_nextStepExplanation", nextStepExplanationElem.value);
        } else if (!isThoughtBranch && isPredeterminingBranch) {
            const textElem = divText.querySelector("#_text") as HTMLTextAreaElement;
            const explanationElem = divText.querySelector("#_explanation") as HTMLTextAreaElement;
            const nextStepBranchResultElem = divText.querySelector("#_nextStepBranchResult") as HTMLTextAreaElement;
            const nextStepQuestionOutcomeElem = divText.querySelector("#_nextStepQuestionOutcome") as HTMLTextAreaElement;
            const nextStepExplanationOutcomeElem = divText.querySelector("#_nextStepExplanationOutcome") as HTMLTextAreaElement;
            const descriptionElem = divText.querySelector("#_description") as HTMLTextAreaElement;
            const nextStepQuestionThoughtBranchElem = divText.querySelector("#_nextStepQuestionThoughtBranch") as HTMLTextAreaElement;
            const nextStepExplanationThoughtBranchElem = divText.querySelector("#_nextStepExplanationThoughtBranch") as HTMLTextAreaElement;
            
            if (textElem) cell.value.setAttribute("_text", textElem.value);
            if (explanationElem) cell.value.setAttribute("_explanation", explanationElem.value);
            if (nextStepBranchResultElem) cell.value.setAttribute("_nextStepBranchResult", nextStepBranchResultElem.value);
            if (nextStepQuestionOutcomeElem) cell.value.setAttribute("_nextStepQuestionOutcome", nextStepQuestionOutcomeElem.value);
            if (nextStepExplanationOutcomeElem) cell.value.setAttribute("_nextStepExplanationOutcome", nextStepExplanationOutcomeElem.value);
            if (descriptionElem) cell.value.setAttribute("_description", descriptionElem.value);
            if (nextStepQuestionThoughtBranchElem) cell.value.setAttribute("_nextStepQuestionThoughtBranch", nextStepQuestionThoughtBranchElem.value);
            if (nextStepExplanationThoughtBranchElem) cell.value.setAttribute("_nextStepExplanationThoughtBranch", nextStepExplanationThoughtBranchElem.value);
        } else if (!isThoughtBranch && !isPredeterminingBranch) {
            const textElem = divText.querySelector("#_text") as HTMLTextAreaElement;
            const explanationElem = divText.querySelector("#_explanation") as HTMLTextAreaElement;
            const nextStepBranchResultElem = divText.querySelector("#_nextStepBranchResult") as HTMLTextAreaElement;
            const nextStepQuestionElem = divText.querySelector("#_nextStepQuestion") as HTMLTextAreaElement;
            const nextStepExplanationElem = divText.querySelector("#_nextStepExplanation") as HTMLTextAreaElement;
            
            if (textElem) cell.value.setAttribute("_text", textElem.value);
            if (explanationElem) cell.value.setAttribute("_explanation", explanationElem.value);
            if (nextStepBranchResultElem) cell.value.setAttribute("_nextStepBranchResult", nextStepBranchResultElem.value);
            if (nextStepQuestionElem) cell.value.setAttribute("_nextStepQuestion", nextStepQuestionElem.value);
            if (nextStepExplanationElem) cell.value.setAttribute("_nextStepExplanation", nextStepExplanationElem.value);
        }
        
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
        getTextByLocale("TitleEditQuestionInfoInOutcomeWindow"),
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