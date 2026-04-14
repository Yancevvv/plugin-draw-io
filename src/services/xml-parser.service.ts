import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type { DecisionTreeXml } from '../types/decision-tree';

export class XmlParserService {
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '', 
      parseAttributeValue: false,
      trimValues: true,
      isArray: (tagName, jPath, isLeafNode, isAttribute) => {
        const arrayTags = [
          'DecisionTreeVarDecl', 
          'AdditionalVarDecl', 
          'Outcome', 
          'FindError', 
          'mxCell',
          'node',        
          'edge',
          'ThoughtBranch',
          'CheckRelationship' 
        ];
        return arrayTags.includes(tagName);
      }
    });

    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      format: true,
      indentBy: '  ',
      suppressEmptyNode: true,
      suppressUnpairedNode: false 
    });
  }

  xmlToJson(xmlString: string): Record<string, any> {
    return this.parser.parse(xmlString);
  }

  jsonToXml(jsonObj: Record<string, any>): string {
    return this.builder.build(jsonObj);
  }

  parseXmlToDecisionTree(xmlString: string): DecisionTreeXml {
    const jsonObj = this.parser.parse(xmlString);
    console.log('Parsed JSON:', JSON.stringify(jsonObj, null, 2)); // Для отладки
    return this.validateDecisionTree(jsonObj);
  }

  convertDecisionTreeToXml(decisionTree: DecisionTreeXml): string {
    return this.builder.build(decisionTree);
  }

  private validateDecisionTree(obj: any): DecisionTreeXml {
    if (!obj.DecisionTree) {
      throw new Error('Invalid DecisionTree XML: missing DecisionTree root');
    }
    
    if (!obj.DecisionTree.ThoughtBranch) {
      throw new Error('Invalid DecisionTree XML: missing ThoughtBranch');
    }
    
    return obj as DecisionTreeXml;
  }
}