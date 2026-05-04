/// <reference types="blockly" />

declare global {
  // mxWindow
  interface mxWindowConstructor {
    new(
      title: string,
      content: HTMLElement | string,
      x: number,
      y: number,
      width?: number,
      height?: number,
      resizable?: boolean,
      scrollable?: boolean
    ): mxWindow;
  }

  interface mxWindow {
    destroy(): void;
    setVisible(visible: boolean): void;
    setClosable(closable: boolean): void;
    setResizable(resizable: boolean): void;
    setMaximizable(maximizable: boolean): void;
    destroyOnClose: boolean;
    init(): void;
  }

  const mxWindow: mxWindowConstructor;

  // mxCell
  interface mxCellConstructor {
    new(value?: any, geometry?: mxGeometry, style?: string): mxCell;
  }

  interface mxCell {
    value: any;
    vertex: boolean;
    connectable: boolean;
    geometry: mxGeometry | null;
    id?: string;
    parent: mxCell | null;
    source: mxCell | null;
    target: mxCell | null;
    edge: boolean;
    visible: boolean;
    collapsed: boolean;
    
    setAttribute(name: string, value: string): void;
    getAttribute(name: string, defaultValue?: string): string | null;
    clone(): mxCell;
  }

  const mxCell: mxCellConstructor;

  // mxGeometry
  interface mxGeometryConstructor {
    new(x?: number, y?: number, width?: number, height?: number): mxGeometry;
  }

  interface mxGeometry {
    x: number;
    y: number;
    width: number;
    height: number;
    relative: boolean;
    offset: mxPoint | null;
    
    setPoint(point: mxPoint | null): void;
    getTerminalPoint(isSource: boolean): mxPoint | null;
  }

  const mxGeometry: mxGeometryConstructor;

  // mxPoint
  interface mxPointConstructor {
    new(x?: number, y?: number): mxPoint;
  }

  interface mxPoint {
    x: number;
    y: number;
  }

  const mxPoint: mxPointConstructor;

  // mxGraph
  interface mxGraph {
    getModel(): mxGraphModel;
    getInsertPoint(): { x: number; y: number };
    addCell(cell: mxCell, parent?: mxCell, index?: number, source?: mxCell, target?: mxCell): mxCell;
    setSelectionCell(cell: mxCell | null): void;
    isEnabled(): boolean;
    isCellLocked(cell: mxCell): boolean;
    getDefaultParent(): mxCell;
    removeCells(cells: mxCell[], includeEdges?: boolean): mxCell[];
    getChildCells(parent?: mxCell, vertices?: boolean, edges?: boolean): mxCell[];
    insertVertex(parent: mxCell, id: string | null, value: any, x: number, y: number, width: number, height: number, style?: string): mxCell;
    insertEdge(parent: mxCell, id: string | null, value: any, source: mxCell, target: mxCell, style?: string): mxCell;
    getStylesheet(): mxStylesheet;
    addListener(eventType: string, listener: (sender: any, evt: any) => void): void;
    removeListener(listener: (sender: any, evt: any) => void): void;
  }

  interface mxGraphModel {
    cells: Record<string, mxCell>;
    beginUpdate(): void;
    endUpdate(): void;
  }

  interface mxStylesheet {
    putCellStyle(name: string, style: Record<string, any>): void;
    getCellStyle(name: string): Record<string, any>;
  }

  // mxUtils
  interface mxUtilsStatic {
    button(label: string, handler: (evt: Event) => void): HTMLButtonElement;
    alert(message: string): void;
    bind(obj: any, func: (...args: any[]) => any): (...args: any[]) => any;
  }

  const mxUtils: mxUtilsStatic;

  // mxEvent
  interface mxEventStatic {
    CLICK: string;
    CELLS_MOVED: string;
    CONNECT: string;
    CHANGE: string;
    addListener(source: any, eventName: string, funct: (sender: any, evt: any) => void): void;
    removeListener(funct: (sender: any, evt: any) => void): void;
  }

  const mxEvent: mxEventStatic;

  // mxDialog 
  interface mxDialogConstructor {
    new(
      content: HTMLElement,
      x: number,
      y: number,
      width: number,
      height: number,
      resizable?: boolean,
      scrollable?: boolean
    ): mxDialog;
  }

  interface mxDialog {
    init(): void;
    destroy(): void;
  }

  const mxDialog: mxDialogConstructor;

  // mxEditorUi
  interface mxEditorUi {
    editor: {
      graph: mxGraph;
    };
    setModified(modified: boolean): void;
    graph: mxGraph;
    menubar?: any;
  }
}

export {};