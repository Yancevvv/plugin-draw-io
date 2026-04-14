import { describe, it, expect, beforeEach } from 'vitest';
import { XmlParserService } from '../xml-parser.service';

// Вспомогательные утилиты для нормализации
function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getFirst<T>(value: T | T[] | undefined): T | undefined {
  const arr = toArray(value);
  return arr[0];
}

describe('XmlParserService', () => {
  let service: XmlParserService;

  beforeEach(() => {
    service = new XmlParserService();
  });
  
  const simpleXml = `<?xml version="1.0" encoding="UTF-8"?>
<DecisionTree>
  <ThoughtBranch _TEMPLATING_ID="1" _alias="main">
    <QuestionNode _RU_question="Тестовый вопрос?" _EN_question="Test question?">
      <Outcome value="CORRECT" _RU_explanation="Правильно" _EN_explanation="Correct">
        <BranchResultNode value="CORRECT"/>
      </Outcome>
    </QuestionNode>
  </ThoughtBranch>
</DecisionTree>`;

  const complexXml = `<?xml version="1.0" encoding="UTF-8"?>
<DecisionTree>
  <InputVariables>
    <DecisionTreeVarDecl name="X" type="operator"/>
    <AdditionalVarDecl name="X1" type="token">
      <Expression>
        <GetExtreme extremeVarName="x1" type="token" varName="x_token">
          <CheckRelationship relationshipName="has">
            <DecisionTreeVar name="X"/>
            <Variable name="x_token"/>
          </CheckRelationship>
          <CheckRelationship relationshipName="leftOf">
            <Variable name="x1"/>
            <Variable name="x_token"/>
          </CheckRelationship>
        </GetExtreme>
      </Expression>
    </AdditionalVarDecl>
  </InputVariables>
  <ThoughtBranch _TEMPLATING_ID="1" _alias="main" _EN_description="Main branch" _RU_description="Главная ветка">
    <BranchAggregationNode operator="AND" _TEMPLATING_ID="2" _alias="main.and">
      <ThoughtBranch _TEMPLATING_ID="3" _alias="left">
        <QuestionNode _RU_question="Проверка левого операнда?" _EN_question="Check left operand?">
          <Outcome value="CORRECT" _RU_explanation="Правильно" _EN_explanation="Correct">
            <BranchResultNode value="CORRECT" _skill="left_check"/>
          </Outcome>
          <Outcome value="INCORRECT" _RU_explanation="Неправильно" _EN_explanation="Incorrect">
            <BranchResultNode value="INCORRECT"/>
          </Outcome>
        </QuestionNode>
      </ThoughtBranch>
      <ThoughtBranch _TEMPLATING_ID="4" _alias="right">
        <QuestionNode _RU_question="Проверка правого операнда?" _EN_question="Check right operand?">
          <Outcome value="CORRECT" _RU_explanation="Верно" _EN_explanation="True">
            <FindActionNode _EN_question="Find token" _RU_question="Найти токен" _TEMPLATING_ID="5">
              <DecisionTreeVarDecl name="X2" type="token"/>
              <Expression>
                <GetByCondition type="token" varName="x2">
                  <LogicalAnd>
                    <CheckClass>
                      <Variable name="x2"/>
                      <Class name="token"/>
                    </CheckClass>
                    <CheckRelationship relationshipName="belongsTo">
                      <Variable name="x2"/>
                      <DecisionTreeVar name="X"/>
                    </CheckRelationship>
                  </LogicalAnd>
                </GetByCondition>
              </Expression>
              <FindError _EN_explanation="Token not found" _RU_explanation="Токен не найден" _TEMPLATING_ID="6" _priority="1"/>
            </FindActionNode>
          </Outcome>
        </QuestionNode>
      </ThoughtBranch>
    </BranchAggregationNode>
  </ThoughtBranch>
</DecisionTree>`;

  describe('parseXmlToDecisionTree', () => {
    it('should parse simple XML to DecisionTreeXml', () => {
      const result = service.parseXmlToDecisionTree(simpleXml);
      
      expect(result).toBeDefined();
      expect(result.DecisionTree).toBeDefined();
      const thoughtBranch = getFirst(result.DecisionTree.ThoughtBranch);
      expect(thoughtBranch).toBeDefined();
      expect(thoughtBranch?.['_TEMPLATING_ID']).toBe('1');
      expect(thoughtBranch?.['_alias']).toBe('main');
    });

    it('should parse complex XML with InputVariables', () => {
      const result = service.parseXmlToDecisionTree(complexXml);
      
      expect(result.DecisionTree.InputVariables).toBeDefined();
      
      const inputVars = result.DecisionTree.InputVariables;
      if (!inputVars) return;
      
      // DecisionTreeVarDecl
      const dtVarDecl = getFirst(inputVars.DecisionTreeVarDecl);
      expect(dtVarDecl).toBeDefined();
      expect(dtVarDecl?.name).toBe('X');
      expect(dtVarDecl?.type).toBe('operator');
      
      // AdditionalVarDecl
      const additionalVar = getFirst(inputVars.AdditionalVarDecl);
      expect(additionalVar).toBeDefined();
      expect(additionalVar?.name).toBe('X1');
      expect(additionalVar?.type).toBe('token');
      
      // Expression
      const expression = additionalVar?.Expression;
      expect(expression).toBeDefined();
      
      const getExtreme = expression?.GetExtreme;
      expect(getExtreme).toBeDefined();
      expect(getExtreme?.extremeVarName).toBe('x1');
      expect(getExtreme?.type).toBe('token');
      expect(getExtreme?.varName).toBe('x_token');
      
      // CheckRelationship - нормализуем массив
      const relationships = toArray(getExtreme?.CheckRelationship);
      expect(relationships).toHaveLength(2);
      expect(relationships[0]?.relationshipName).toBe('has');
      expect(relationships[1]?.relationshipName).toBe('leftOf');
    });

    it('should parse ThoughtBranch with attributes correctly', () => {
      const result = service.parseXmlToDecisionTree(complexXml);
      const thoughtBranch = getFirst(result.DecisionTree.ThoughtBranch);
      
      expect(thoughtBranch?.['_TEMPLATING_ID']).toBe('1');
      expect(thoughtBranch?.['_alias']).toBe('main');
      expect(thoughtBranch?.['_EN_description']).toBe('Main branch');
      expect(thoughtBranch?.['_RU_description']).toBe('Главная ветка');
    });

    it('should parse BranchAggregationNode with multiple children', () => {
      const result = service.parseXmlToDecisionTree(complexXml);
      const thoughtBranch = getFirst(result.DecisionTree.ThoughtBranch);
      const aggregationNode = thoughtBranch?.BranchAggregationNode;
      
      expect(aggregationNode).toBeDefined();
      expect(aggregationNode?.operator).toBe('AND');
      expect(aggregationNode?.['_TEMPLATING_ID']).toBe('2');
      expect(aggregationNode?.['_alias']).toBe('main.and');
      
      const thoughtBranches = toArray(aggregationNode?.ThoughtBranch);
      expect(thoughtBranches).toHaveLength(2);
    });

    it('should parse QuestionNode with multiple Outcomes', () => {
      const result = service.parseXmlToDecisionTree(complexXml);
      const thoughtBranch = getFirst(result.DecisionTree.ThoughtBranch);
      const aggregationNode = thoughtBranch?.BranchAggregationNode;
      const thoughtBranches = toArray(aggregationNode?.ThoughtBranch);
      const leftBranch = thoughtBranches[0];
      const questionNode = leftBranch?.QuestionNode;
      
      expect(questionNode).toBeDefined();
      expect(questionNode?.['_RU_question']).toBe('Проверка левого операнда?');
      
      const outcomes = toArray(questionNode?.Outcome);
      expect(outcomes).toHaveLength(2);
      
      const correctOutcome = outcomes[0];
      expect(correctOutcome?.value).toBe('CORRECT');
      
      const branchResultNode = correctOutcome?.BranchResultNode;
      expect(branchResultNode).toBeDefined();
      expect(branchResultNode?.value).toBe('CORRECT');
      expect(branchResultNode?.['_skill']).toBe('left_check');
    });

    it('should parse FindActionNode with nested Expression', () => {
      const result = service.parseXmlToDecisionTree(complexXml);
      const thoughtBranch = getFirst(result.DecisionTree.ThoughtBranch);
      const aggregationNode = thoughtBranch?.BranchAggregationNode;
      const thoughtBranches = toArray(aggregationNode?.ThoughtBranch);
      const rightBranch = thoughtBranches[1];
      const questionNode = rightBranch?.QuestionNode;
      const outcomes = toArray(questionNode?.Outcome);
      const correctOutcome = outcomes[0];
      const findActionNode = correctOutcome?.FindActionNode;
      
      expect(findActionNode).toBeDefined();
      expect(findActionNode?.['_TEMPLATING_ID']).toBe('5');
      expect(findActionNode?.['_RU_question']).toBe('Найти токен');
      
      const decisionTreeVarDecl = getFirst(findActionNode?.DecisionTreeVarDecl);
      expect(decisionTreeVarDecl).toBeDefined();
      expect(decisionTreeVarDecl?.name).toBe('X2');
      expect(decisionTreeVarDecl?.type).toBe('token');
      
      const expression = findActionNode?.Expression;
      expect(expression).toBeDefined();
      expect(expression?.GetByCondition).toBeDefined();
      
      const findError = getFirst(findActionNode?.FindError);
      expect(findError).toBeDefined();
      expect(findError?._priority).toBe('1');
    });

    it('should throw error on invalid XML structure', () => {
      const invalidXml = '<Invalid></Invalid>';
      expect(() => service.parseXmlToDecisionTree(invalidXml)).toThrow('Invalid DecisionTree XML: missing DecisionTree root');
    });

    it('should throw error when ThoughtBranch is missing', () => {
      const noThoughtBranchXml = '<DecisionTree><InputVariables/></DecisionTree>';
      expect(() => service.parseXmlToDecisionTree(noThoughtBranchXml)).toThrow('missing ThoughtBranch');
    });
  });

  describe('xmlToJson conversion', () => {
    it('should convert simple XML to JSON object', () => {
      const json = service.xmlToJson(simpleXml);
      
      expect(json).toBeInstanceOf(Object);
      expect(json.DecisionTree).toBeDefined();
      const thoughtBranch = getFirst(json.DecisionTree.ThoughtBranch);
      expect(thoughtBranch).toBeDefined();
      expect(thoughtBranch?._TEMPLATING_ID).toBe('1');
    });

    it('should preserve all attributes without prefix', () => {
      const xml = `<TestNode id="123" name="test" active="true"/>`;
      const json = service.xmlToJson(xml);
      
      expect(json.TestNode.id).toBe('123');
      expect(json.TestNode.name).toBe('test');
      expect(json.TestNode.active).toBe('true');
    });

    it('should handle nested elements correctly', () => {
      const xml = `
        <Parent>
          <Child id="1">
            <GrandChild value="deep"/>
          </Child>
        </Parent>
      `;
      const json = service.xmlToJson(xml);
      
      expect(json.Parent.Child).toBeDefined();
      expect(json.Parent.Child.id).toBe('1');
      expect(json.Parent.Child.GrandChild.value).toBe('deep');
    });

    it('should convert arrays correctly based on isArray config', () => {
      const xml = `
        <Root>
          <Outcome value="1"/>
          <Outcome value="2"/>
          <Outcome value="3"/>
        </Root>
      `;
      const json = service.xmlToJson(xml);
      
      expect(Array.isArray(json.Root.Outcome)).toBe(true);
      expect(json.Root.Outcome).toHaveLength(3);
      expect(json.Root.Outcome[0].value).toBe('1');
      expect(json.Root.Outcome[1].value).toBe('2');
      expect(json.Root.Outcome[2].value).toBe('3');
    });

    it('should handle text content in elements', () => {
      const xml = `<Message>Hello World</Message>`;
      const json = service.xmlToJson(xml);
      
      expect(json.Message).toBe('Hello World');
    });

    it('should handle empty elements', () => {
      const xml = `<EmptyNode/>`;
      const json = service.xmlToJson(xml);
      
      expect(json.EmptyNode).toBeDefined();
    });
  });

  describe('jsonToXml conversion', () => {
    it('should convert JSON object back to XML', () => {
      const jsonObj = {
        Test: {
          id: '123',
          name: 'test'
        }
      };
      const xml = service.jsonToXml(jsonObj);
      
      expect(xml).toContain('<Test');
      expect(xml).toContain('id="123"');
      expect(xml).toContain('name="test"');
      expect(xml).toContain('/>');
    });

    it('should handle nested JSON objects', () => {
      const jsonObj = {
        Parent: {
          Child: {
            value: 'nested'
          }
        }
      };
      const xml = service.jsonToXml(jsonObj);
      
      expect(xml).toContain('<Parent>');
      expect(xml).toContain('<Child value="nested"');
      expect(xml).toContain('/>');
      expect(xml).toContain('</Parent>');
    });

    it('should convert JSON arrays to repeated elements', () => {
      const jsonObj = {
        Root: {
          Outcome: [
            { value: '1' },
            { value: '2' },
            { value: '3' }
          ]
        }
      };
      const xml = service.jsonToXml(jsonObj);
      
      const matches = xml.match(/<Outcome/g);
      expect(matches).toHaveLength(3);
      expect(xml).toContain('value="1"');
      expect(xml).toContain('value="2"');
      expect(xml).toContain('value="3"');
    });
  });

  describe('Round-trip conversion (XML -> JSON -> XML)', () => {
    it('should preserve structure after round trip for simple XML', () => {
      const originalXml = simpleXml;
      const json = service.xmlToJson(originalXml);
      const regeneratedXml = service.jsonToXml(json);
      
      expect(regeneratedXml).toContain('<DecisionTree>');
      expect(regeneratedXml).toContain('_TEMPLATING_ID="1"');
      expect(regeneratedXml).toContain('<QuestionNode');
      expect(regeneratedXml).toContain('_RU_question="Тестовый вопрос?"');
    });

    it('should preserve complex structure after round trip', () => {
      const originalXml = complexXml;
      const json = service.xmlToJson(originalXml);
      const regeneratedXml = service.jsonToXml(json);
      
      expect(regeneratedXml).toContain('<DecisionTree>');
      expect(regeneratedXml).toContain('<InputVariables>');
      expect(regeneratedXml).toContain('name="X"');
      expect(regeneratedXml).toContain('<BranchAggregationNode');
      expect(regeneratedXml).toContain('operator="AND"');
      expect(regeneratedXml).toContain('<FindActionNode');
    });
  });

  describe('Validation', () => {
    it('should accept valid DecisionTree with minimal structure', () => {
      const minimalXml = `<DecisionTree><ThoughtBranch/></DecisionTree>`;
      const result = service.parseXmlToDecisionTree(minimalXml);
      
      expect(result.DecisionTree.ThoughtBranch).toBeDefined();
    });

    it('should reject XML without DecisionTree root', () => {
      const invalidXml = `<WrongRoot></WrongRoot>`;
      expect(() => service.parseXmlToDecisionTree(invalidXml)).toThrow();
    });

    it('should handle empty string', () => {
      expect(() => service.parseXmlToDecisionTree('')).toThrow();
    });
  });
});