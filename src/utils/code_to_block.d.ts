import * as Blockly from 'blockly';
import { ProgramNode, StatementNode, BlockNode, ExpressionNode } from '../parser/types.js';

declare module './code_to_block.js' {
    export function toBlock(rootNode: ProgramNode, workspace: Blockly.Workspace): void;
    export function stmtNodeToBlock(stmtNode: StatementNode, workspace: Blockly.Workspace): Blockly.BlockSvg;
    export function blockNodeToBlock(blockNode: BlockNode, workspace: Blockly.Workspace): void;
    export function printExprNode(exprNode: ExpressionNode, workspace: Blockly.Workspace): Blockly.BlockSvg;
    export function checkTypeBlocks(
        blockInput: Blockly.BlockSvg,
        blockOutput: Blockly.BlockSvg,
        input: string
    ): void;
}