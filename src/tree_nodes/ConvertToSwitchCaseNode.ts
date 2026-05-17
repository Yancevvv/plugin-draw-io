import { EditorUi, MXGeometry, MXCell, MXCellValue, MXGraph } from '../utils/types.js';

// Декларация глобальных типов
declare const mxCell: {
    new (value: string, geometry: MXGeometry, style: string): MXCell;
};

// Расширенный интерфейс для клетки с edges
interface EdgeCell {
    source?: MXCell;
    target?: MXCell;
}

interface MXCellWithEdges extends MXCell {
    edges?: EdgeCell[];
}

// Расширенный интерфейс для графа с removeCells
interface MXGraphWithRemoveCells extends MXGraph {
    removeCells(cells: MXCell[]): void;
}

// Окно редактирования значений в ветке
export const ConvertToSwitchCaseNode = function (
    cell: MXCellWithEdges,
    editorUi: EditorUi,
    x: number,
    y: number,
    w: number,
    h: number
): void {
    const theGraph = editorUi.editor.graph as MXGraphWithRemoveCells;

    // Получение текста из cell.value
    let text = '';
    if (typeof cell.value === "object" && cell.value !== null) {
        text = (cell.value as MXCellValue).getAttribute("label") || '';
    } else if (typeof cell.value === "string") {
        text = cell.value;
    }

    if (theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())) {
        const pos = theGraph.getInsertPoint();
        
        // Создаем геометрию для новой клетки
        const geometry: MXGeometry = {
            x: cell.geometry?.x ?? pos.x,
            y: cell.geometry?.y ?? pos.y,
            width: cell.geometry?.width ?? 120,
            height: cell.geometry?.height ?? 60
        };
        
        const style = "rhombus;whiteSpace=wrap;html=1;editable=0;";
        const newElement = new mxCell("", geometry, style) as MXCellWithEdges;

        newElement.vertex = true;
        const addedCell = theGraph.addCell(newElement) as MXCellWithEdges;
        theGraph.setSelectionCell(addedCell);
        theGraph.setAttributeForCell(addedCell, 'expression', "");
        theGraph.setAttributeForCell(addedCell, 'label', text);
        
        theGraph.getModel().beginUpdate();
        
        const edgesNode = cell.edges;
        if (edgesNode && edgesNode.length > 0) {
            edgesNode.forEach((edge: EdgeCell) => {
                if (edge.source === cell) {
                    edge.source = addedCell;
                }
                if (edge.target === cell) {
                    edge.target = addedCell;
                }
                
                if (!addedCell.edges) {
                    addedCell.edges = [edge];
                } else {
                    addedCell.edges.push(edge);
                }
            });
        }
        
        // Удаляем edges у старой клетки
        delete cell.edges;
        
        theGraph.removeCells([cell]);
        theGraph.getModel().endUpdate();
        theGraph.refresh();
    }
};