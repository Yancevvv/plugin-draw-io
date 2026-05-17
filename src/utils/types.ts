// Типы для mxGraph
export interface MXGeometry {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface MXCellValue {
    setAttribute(name: string, value: string): void;
    getAttribute(name: string): string | null;
}

export interface MXCell {
    value: string | MXCellValue;
    vertex?: boolean;
    geometry?: MXGeometry;
}

export interface MXGraphModel {
    cells: Record<string, { value: string | null | MXCellValue; getAttribute?: (attr: string) => string | null }>;
    beginUpdate(): void;
    endUpdate(): void;
}

export interface MXGraph {
    getModel(): MXGraphModel;
    refresh(): void;
    isEnabled(): boolean;
    isCellLocked(cell: unknown): boolean;
    getDefaultParent(): unknown;
    getInsertPoint(): { x: number; y: number };
    addCell(cell: MXCell): MXCell;
    setSelectionCell(cell: MXCell): void;
    setAttributeForCell(cell: MXCell, attribute: string, value: string): void;
    removeCells(cells: MXCell[]): void;
}

export interface MxWindow {
    destroyOnClose: boolean;
    destroy(): void;
    setMaximizable(enabled: boolean): void;
    setResizable(enabled: boolean): void;
    setClosable(enabled: boolean): void;
    setVisible(visible: boolean): void;
}

export interface EditorUi {
    editor: {
        graph: MXGraph;
    };
}

// Типы для данных
export interface EnumItem {
    nameEnum: string;
    values: string[];
    isLinear: string;
    nameRDF: string;
}

export interface ClassItem {
    name: string;
    extend: string;
    expression: string | null;
}

export interface PropertyItem {
    name: string;
    type: string;
    range: string;
    isStatic: string;
    classes: string[];
}

export interface RelationshipItem {
    name: string;
    extend: string;
    classes: string[];
    scale: string;
    isBetween: string;
    type: string;
    namesRels: string | null;
    binFlags: string | null;
    decFlags: number;
}

export interface mxUtilsType {
    button(label: string, handler: (evt?: MouseEvent) => void): HTMLButtonElement;
}

export interface BlocklyType {
    JavaScript: {
        workspaceToCode(workspace: BlocklyWorkspace): string;
    };
    inject(elementId: string, config: { toolbox: unknown }): BlocklyWorkspace;
}

export interface BlocklyWorkspace {
    
}

export interface ParserType {
    parse(expression: string): unknown;
}

// Декларации глобальных объектов
declare global {
    const mxUtils: {
        button: (label: string, handler: (evt?: MouseEvent) => void) => HTMLButtonElement;
    };
    
    const mxCell: {
        new (value: string, geometry: MXGeometry, style: string): MXCell;
    };
    
    const mxWindow: {
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
}