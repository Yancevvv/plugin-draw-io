import type { DecisionTreeXml, ThoughtBranch, QuestionNode, Outcome } from '../types/decision-tree';

export interface RenderState {
  zoom: number;
  pan: { x: number; y: number };
  highlightedNodes: string[];
  currentQuestionId?: string;
}

export interface DecisionTreeViewModel {
  thoughtBranch: ThoughtBranchViewModel;
  currentQuestion?: QuestionNodeViewModel;
  navigationStack: NavigationItem[];
  renderState: RenderState;
}

export interface ThoughtBranchViewModel {
  id: string;
  description: string;
  alias: string;
  type: 'aggregation' | 'question' | 'outcome' | 'findAction';
  children: ThoughtBranchViewModel[];
  isExpanded: boolean;
  branchResult?: 'CORRECT' | 'INCORRECT';
  rawData?: any;
}

export interface QuestionNodeViewModel {
  id: string;
  question: string;
  explanation?: string;
  options: OutcomeOption[];
  expression?: string;
  asNextStep?: string;
  endingCause?: string;
}

export interface OutcomeOption {
  value: string;
  explanation: string;
  nextStepExplanation?: string;
  nextStepQuestion?: string;
  isSelected: boolean;
}

export interface NavigationItem {
  nodeId: string;
  type: 'question' | 'answer' | 'branch';
  timestamp: Date;
  data?: any;
}

export class DecisionTreeService {
  private viewModel: DecisionTreeViewModel;

  constructor() {
    this.viewModel = {
      thoughtBranch: {} as ThoughtBranchViewModel,
      navigationStack: [],
      renderState: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        highlightedNodes: []
      }
    };
  }

  toViewModel(decisionTree: DecisionTreeXml): DecisionTreeViewModel {
    const thoughtBranch = this.convertThoughtBranch(decisionTree.DecisionTree.ThoughtBranch);
    
    return {
      thoughtBranch,
      navigationStack: [],
      renderState: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        highlightedNodes: []
      }
    };
  }

  private convertThoughtBranch(branch: any, level: number = 0): ThoughtBranchViewModel {
    const vm: ThoughtBranchViewModel = {
      id: branch['@_TEMPLATING_ID'] || `branch-${level}`,
      description: branch['@_RU_description'] || branch['@_EN_description'] || 'No description',
      alias: branch['@_alias'] || 'unknown',
      type: this.getBranchType(branch),
      children: [],
      isExpanded: level < 2,
      branchResult: branch.BranchResultNode?.value,
      rawData: branch
    };

    // Рекурсивно обрабатываем BranchAggregationNode
    if (branch.BranchAggregationNode) {
      const aggregationChildren = Array.isArray(branch.BranchAggregationNode.ThoughtBranch)
        ? branch.BranchAggregationNode.ThoughtBranch
        : [branch.BranchAggregationNode.ThoughtBranch];
      
      aggregationChildren?.forEach((child: any) => {
        if (child) vm.children.push(this.convertThoughtBranch(child, level + 1));
      });
    }
    
    // Обрабатываем QuestionNode
    if (branch.QuestionNode) {
      vm.children.push(this.convertThoughtBranch(branch.QuestionNode, level + 1));
    }
    
    // Обрабатываем Outcome
    if (branch.Outcome) {
      const outcomes = Array.isArray(branch.Outcome) ? branch.Outcome : [branch.Outcome];
      outcomes.forEach((outcome: any) => {
        vm.children.push(this.convertThoughtBranch(outcome, level + 1));
      });
    }
    
    // Обрабатываем FindActionNode
    if (branch.FindActionNode) {
      vm.children.push(this.convertThoughtBranch(branch.FindActionNode, level + 1));
    }

    return vm;
  }

  private getBranchType(branch: any): 'aggregation' | 'question' | 'outcome' | 'findAction' {
    if (branch.BranchAggregationNode) return 'aggregation';
    if (branch.QuestionNode) return 'question';
    if (branch.BranchResultNode) return 'outcome';
    if (branch.FindActionNode) return 'findAction';
    if (branch['@_alias']?.includes('find')) return 'findAction';
    return 'question';
  }

  getCurrentQuestion(viewModel: DecisionTreeViewModel): QuestionNodeViewModel | null {
    const findFirstQuestion = (branch: ThoughtBranchViewModel): QuestionNodeViewModel | null => {
      if (branch.type === 'question' && !branch.branchResult && branch.rawData?.QuestionNode) {
        const questionNode = branch.rawData.QuestionNode;
        const outcomes = questionNode.Outcome ? (Array.isArray(questionNode.Outcome) ? questionNode.Outcome : [questionNode.Outcome]) : [];
        
        return {
          id: branch.id,
          question: questionNode['@_RU_question'] || questionNode['@_EN_question'],
          explanation: questionNode['@_RU_asNextStep'] || questionNode['@_EN_asNextStep'],
          options: outcomes.map((outcome: any) => ({
            value: outcome.value,
            explanation: outcome['@_RU_explanation'] || outcome['@_EN_explanation'],
            nextStepExplanation: outcome['@_RU_nextStepExplanation'] || outcome['@_EN_nextStepExplanation'],
            nextStepQuestion: outcome['@_RU_nextStepQuestion'] || outcome['@_EN_nextStepQuestion'],
            isSelected: false
          })),
          asNextStep: questionNode['@_RU_asNextStep'] || questionNode['@_EN_asNextStep'],
          endingCause: questionNode['@_RU_endingCause'] || questionNode['@_EN_endingCause']
        };
      }
      
      for (const child of branch.children) {
        const result = findFirstQuestion(child);
        if (result) return result;
      }
      
      return null;
    };
    
    const question = findFirstQuestion(viewModel.thoughtBranch);
    if (question) {
      this.viewModel.currentQuestion = question;
    }
    return question;
  }

  handleUserAnswer(questionId: string, answerValue: string): void {
    this.viewModel.navigationStack.push({
      nodeId: questionId,
      type: 'answer',
      timestamp: new Date(),
      data: { answer: answerValue }
    });
    
    this.updateBranchState(questionId, answerValue);
  }

  private updateBranchState(questionId: string, answerValue: string): void {
    const updateRecursive = (branch: ThoughtBranchViewModel): boolean => {
      if (branch.id === questionId && branch.type === 'question') {
        branch.branchResult = answerValue === 'CORRECT' ? 'CORRECT' : 'INCORRECT';
        return true;
      }
      
      for (const child of branch.children) {
        if (updateRecursive(child)) return true;
      }
      
      return false;
    };
    
    updateRecursive(this.viewModel.thoughtBranch);
    
    // После обновления пересчитываем текущий вопрос
    this.getCurrentQuestion(this.viewModel);
  }

  updateRenderState(updates: Partial<RenderState>): void {
    this.viewModel.renderState = { ...this.viewModel.renderState, ...updates };
  }
}