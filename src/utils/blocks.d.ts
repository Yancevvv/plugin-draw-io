import * as Blockly from 'blockly';

declare module './blocks.js' {
    export const toolbox: {
        kind: string;
        contents: Array<{
            kind: string;
            name: string;
            colour: string;
            contents: Array<{
                kind: string;
                type: string;
            }>;
        }>;
    };
}

// Глобальные расширения Blockly типов
declare module 'blockly' {
    namespace Blocks {
        interface Block {
            itemCount_?: number;
            updateShape_(): void;
            valueConnection_?: Blockly.Connection;
            isInsertionMarker(): boolean;
            getInputTargetBlock(name: string): Block | null;
            inputList: Array<{
                fieldRow: Array<{
                    setValue(value: string | number | boolean): void;
                }>;
                connection: Blockly.Connection;
            }>;
        }
    }

    namespace JavaScript {
        function valueToCode(
            block: Block,
            name: string,
            order: number
        ): string;
        
        const ORDER_ATOMIC: number;
        const ORDER_NONE: number;
        const ORDER_ASSIGNMENT: number;
        const ORDER_INSTANCEOF: number;
        const ORDER_LOGICAL_AND: number;
        const ORDER_LOGICAL_OR: number;
        const ORDER_LOGICAL_NOT: number;
        const ORDER_RELATIONAL: number;
    }

    namespace Xml {
        function workspaceToDom(workspace: Workspace): Element;
        function domToWorkspace(xml: Element, workspace: Workspace): void;
        function createElement(tagName: string): Element;
    }

    interface Mutator {
        reconnect(connection: Connection | null, block: Block, inputName: string): void;
    }

    interface FieldTextInput {
        new (value: string, validator?: (newValue: string) => string | null): FieldTextInput;
        setValue(value: string): void;
    }

    interface FieldNumber {
        new (value: number, min?: number, max?: number, precision?: number): FieldNumber;
        setValue(value: number): void;
    }

    interface FieldCheckbox {
        new (value: string): FieldCheckbox;
        setValue(value: string): void;
    }

    interface FieldDropdown {
        new (options: string[][]): FieldDropdown;
        setValue(value: string): void;
    }

    interface BlockSvg {
        new (workspace: Workspace, type: string): BlockSvg;
        initSvg(): void;
        render(): void;
        getInput(name: string): { connection: Connection } | null;
        outputConnection: Connection;
        itemCount_?: number;
        updateShape_(): void;
        inputList: Array<{
            fieldRow: Array<{
                setValue(value: string | number | boolean): void;
            }>;
            connection: Connection;
        }>;
    }

    interface Connection {
        getCheck(): string[];
        connect(targetConnection: Connection): void;
        disconnect(): void;
        targetConnection: Connection | null;
    }

    interface Workspace {
        clear(): void;
        newBlock(type: string): Block;
    }
}