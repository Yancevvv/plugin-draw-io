export interface DecisionTreeXml {
  DecisionTree: {
    InputVariables?: InputVariables;
    ThoughtBranch: ThoughtBranch | ThoughtBranch[];  
  };
}

export interface InputVariables {
  DecisionTreeVarDecl?: DecisionTreeVarDecl | DecisionTreeVarDecl[];
  AdditionalVarDecl?: AdditionalVarDecl | AdditionalVarDecl[];
}

export interface DecisionTreeVarDecl {
  name: string;      
  type: string;      
}

export interface AdditionalVarDecl {
  name: string;
  type: string;
  Expression?: Expression;
}

export interface Expression {
  GetExtreme?: GetExtreme;
  GetPropertyValue?: GetPropertyValue;
  GetByCondition?: GetByCondition;
  LogicalAnd?: LogicalAnd;
  CheckClass?: CheckClass;
  CheckRelationship?: CheckRelationship | CheckRelationship[];
  Compare?: Compare;
}

export interface GetExtreme {
  extremeVarName: string;  
  type: string;
  varName: string;
  CheckRelationship?: CheckRelationship | CheckRelationship[];
}

export interface GetPropertyValue {
  propertyName: string;  
  DecisionTreeVar: DecisionTreeVar;
}

export interface GetByCondition {
  type: string;
  varName: string;
  LogicalAnd?: LogicalAnd;
}

export interface LogicalAnd {
  LogicalAnd?: LogicalAnd | LogicalAnd[];
  CheckClass?: CheckClass;
  CheckRelationship?: CheckRelationship;
  Compare?: Compare;
}

export interface CheckClass {
  Variable: Variable;
  Class: Class;
}

export interface CheckRelationship {
  relationshipName: string; 
  DecisionTreeVar?: DecisionTreeVar;
  Variable?: Variable | Variable[];
  GetByRelationship?: GetByRelationship;
}

export interface Compare {
  operator: 'Equal' | 'NotEqual' | 'Greater' | 'Less';
  GetClass?: GetClass;
  Variable?: Variable;
  DecisionTreeVar?: DecisionTreeVar;
}

export interface GetClass {
  GetByRelationship?: GetByRelationship;
  DecisionTreeVar?: DecisionTreeVar;
}

export interface GetByRelationship {
  relationshipName: string;
  Variable?: Variable;
}

export interface DecisionTreeVar {
  name: string;
}

export interface Variable {
  name: string;
}

export interface Class {
  name: string;
}

export interface ThoughtBranch {
  '_EN_description'?: string;
  '_EN_error_prefix'?: string;
  '_EN_hint_prefix'?: string;
  '_RU_description'?: string;
  '_RU_error_prefix'?: string;
  '_RU_hint_prefix'?: string;
  '_TEMPLATING_ID': string;  
  '_alias': string;
  BranchAggregationNode?: BranchAggregationNode;
  QuestionNode?: QuestionNode;
  Outcome?: Outcome | Outcome[];
  FindActionNode?: FindActionNode;
  FindError?: FindError | FindError[];
  BranchResultNode?: BranchResultNode;
}

export interface BranchAggregationNode {
  '_EN_asNextStep'?: string;
  '_EN_description'?: string;
  '_EN_endingCause'?: string;
  '_RU_asNextStep'?: string;
  '_RU_description'?: string;
  '_RU_endingCause'?: string;
  '_TEMPLATING_ID': string;
  '_alias': string;
  operator: 'AND' | 'OR';  
  ThoughtBranch?: ThoughtBranch | ThoughtBranch[];
  QuestionNode?: QuestionNode;
}

export interface QuestionNode {
  '_EN_asNextStep'?: string;
  '_EN_endingCause'?: string;
  '_EN_question'?: string;
  '_RU_asNextStep'?: string;
  '_RU_endingCause'?: string;
  '_RU_question'?: string;
  '_TEMPLATING_ID': string;
  '_alias': string;
  Expression?: Expression;
  Outcome?: Outcome | Outcome[];
}

export interface Outcome {
  '_EN_explanation'?: string;
  '_EN_nextStepExplanation'?: string;
  '_EN_nextStepQuestion'?: string;
  '_RU_explanation'?: string;
  '_RU_nextStepExplanation'?: string;
  '_RU_nextStepQuestion'?: string;
  '_TEMPLATING_ID'?: string;
  value: string;  
  BranchResultNode?: BranchResultNode;
  FindActionNode?: FindActionNode;
}

export interface BranchResultNode {
  '_EN_explanation'?: string;
  '_RU_explanation'?: string;
  '_TEMPLATING_ID'?: string;
  '_skill'?: string;  
  value: 'CORRECT' | 'INCORRECT';
}

export interface FindActionNode {
  '_EN_asNextStep'?: string;
  '_EN_question'?: string;
  '_RU_asNextStep'?: string;
  '_RU_question'?: string;
  '_TEMPLATING_ID': string;
  '_alias': string;
  DecisionTreeVarDecl?: DecisionTreeVarDecl | DecisionTreeVarDecl[]; 
  Expression?: Expression;
  FindError?: FindError | FindError[];
}

export interface FindError {
  '_EN_explanation'?: string;
  '_RU_explanation'?: string;
  '_TEMPLATING_ID': string;
  '_alias'?: string;
  '_priority'?: string;  
  Expression?: Expression;
}