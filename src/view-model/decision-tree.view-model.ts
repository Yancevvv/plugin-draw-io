export interface DecisionTreeViewState {
  nodes: TreeNodeView[];
  currentPath: string[];
  selectedNodeId: string | null;
  userAnswers: Map<string, string>;
}

export interface TreeNodeView {
  id: string;
  label: string;
  type: 'question' | 'branch' | 'result';
  isAnswered: boolean;
  isActive: boolean;
  children: TreeNodeView[];
  result?: 'CORRECT' | 'INCORRECT';
}

export class DecisionTreeViewStateManager {
  private state: DecisionTreeViewState;

  constructor() {
    this.state = {
      nodes: [],
      currentPath: [],
      selectedNodeId: null,
      userAnswers: new Map()
    };
  }

  updateState(updates: Partial<DecisionTreeViewState>): void {
    this.state = { ...this.state, ...updates };
  }

  getState(): DecisionTreeViewState {
    return this.state;
  }
}