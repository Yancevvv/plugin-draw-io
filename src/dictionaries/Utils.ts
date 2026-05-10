import { EditorUi, EnumItem, ClassItem, PropertyItem, RelationshipItem } from './types.js';
import { getTextByLocale } from '../utils/locale.js';

// Получение списка enum из словаря на полотне
export function getEnums(editorUi: EditorUi): EnumItem[] {
    const graph = editorUi.editor.graph;
    const cells = graph.getModel().cells;

    const enums: EnumItem[] = [];

    Object.keys(cells).forEach(function (key: string) {
        const cellValue = cells[key].value;

        if (typeof cellValue === "string" && cellValue.startsWith('<font color="#000000"><b>Enum</b></font>')) {
            let parsedValue = cellValue.replace('<font color="#000000"><b>Enum</b></font><br>', '');
            const values = parsedValue.split('<br>');

            values.forEach((element: string) => {
                if (!element) return;
                
                const nameStart = element.indexOf('<font color="#ff66b3">');
                const nameEnd = element.indexOf('</font>');
                let nameEnum = '';
                if (nameStart !== -1 && nameEnd !== -1) {
                    nameEnum = element.slice(nameStart + 22, nameEnd);
                    element = element.slice(nameEnd + 7);
                }

                const valuesStart = element.indexOf('<font color="#ff6666">');
                const valuesEnd = element.indexOf('</font>');
                let valuesEnum: string[] = [];
                if (valuesStart !== -1 && valuesEnd !== -1) {
                    const valuesStr = element.slice(valuesStart + 22, valuesEnd);
                    valuesEnum = valuesStr.split(', ');
                    element = element.slice(valuesEnd + 7);
                }

                const linearStart = element.indexOf('<font color="#123123">');
                const linearEnd = element.indexOf('</font>');
                let isLinear = 'false';
                if (linearStart !== -1 && linearEnd !== -1) {
                    isLinear = element.slice(linearStart + 22, linearEnd);
                    element = element.slice(linearEnd + 7);
                }
                
                let nameRDF = "";
                if (isLinear === 'true') {
                    const rdfStart = element.indexOf('<font color="#fff123">');
                    const rdfEnd = element.indexOf('</font>');
                    if (rdfStart !== -1 && rdfEnd !== -1) {
                        nameRDF = element.slice(rdfStart + 22, rdfEnd);
                    }
                }

                enums.push({
                    nameEnum: nameEnum,
                    values: valuesEnum,
                    isLinear: isLinear,
                    nameRDF: nameRDF,
                });
            });
        }
    });
    return enums;
}

// Получение списка классов из словаря на полотне
export function getClasses(editorUi: EditorUi): ClassItem[] {
    const graph = editorUi.editor.graph;
    const cells = graph.getModel().cells;

    const classes: ClassItem[] = [];

    Object.keys(cells).forEach(function (key: string) {
        const cellValue = cells[key].value;

        if (cellValue && typeof cellValue === "object" && cellValue !== null) {
            const label = (cellValue as any).getAttribute?.('label');
            
            if (label && label.startsWith('<font color="#000000"><b>Classes</b></font>')) {
                let cellLabel = label;
                cellLabel = cellLabel.replace('<font color="#000000"><b>Classes</b></font><br>', '');
                const values = cellLabel.split('<br>');

                values.forEach((element: string, index: number) => {
                    if (!element) return;
                    
                    const nameStart = element.indexOf('<font color="#ff66b3">');
                    const nameEnd = element.indexOf('</font>');
                    let nameClass = '';
                    if (nameStart !== -1 && nameEnd !== -1) {
                        nameClass = element.slice(nameStart + 22, nameEnd);
                        element = element.slice(nameEnd + 7);
                    }

                    let classExtend = "";
                    const extendStart = element.indexOf('(<font color="#ff66b3">');
                    if (extendStart !== -1) {
                        const extendEnd = element.indexOf('</font>)');
                        if (extendEnd !== -1) {
                            classExtend = element.slice(extendStart + 23, extendEnd);
                        }
                    }

                    const expression = (cellValue as any).getAttribute?.('expression_' + index) || null;

                    classes.push({
                        name: nameClass,
                        extend: classExtend,
                        expression: expression,
                    });
                });
            }
        }
    });
    return classes;
}

// Получение списка свойств из словаря на полотне
export function getProperties(editorUi: EditorUi): PropertyItem[] {
    const graph = editorUi.editor.graph;
    const cells = graph.getModel().cells;

    const properties: PropertyItem[] = [];

    Object.keys(cells).forEach(function (key: string) {
        const cellValue = cells[key].value;

        if (typeof cellValue === "string" && cellValue.startsWith('<b><font color="#000000">Class and Object properties</font></b>')) {
            let parsedValue = cellValue.replace('<b><font color="#000000">Class and Object properties</font></b><br>', '');
            const values = parsedValue.split('<br>');

            values.forEach((element: string) => {
                if (!element) return;
                
                const nameStart = element.indexOf('<font color="#');
                const nameEnd = element.indexOf('</font>');
                let nameProperty = '';
                if (nameStart !== -1 && nameEnd !== -1) {
                    nameProperty = element.slice(nameStart + 22, nameEnd);
                    element = element.slice(nameEnd + 7);
                }

                let classes: string[] = [];
                const classStart = element.indexOf('(<font color="#fc49a4">');
                if (classStart !== -1) {
                    const classEnd = element.indexOf('</font>');
                    if (classEnd !== -1) {
                        const valuesStr = element.slice(classStart + 23, classEnd);
                        classes = valuesStr.split(', ');
                        const closePos = element.indexOf('</font>)');
                        if (closePos !== -1) {
                            element = element.slice(closePos + 8);
                        }
                    }
                }

                const typeStart = element.indexOf('<font color="#000000">');
                const typeEnd = element.indexOf('</font>');
                let type = '';
                if (typeStart !== -1 && typeEnd !== -1) {
                    type = element.slice(typeStart + 22, typeEnd);
                    element = element.slice(typeEnd + 7);
                }

                let range = "";
                if (type === "Integer" || type === "Double") {
                    const rangeStart = element.indexOf('<font color="#000000">: ');
                    if (rangeStart !== -1) {
                        const rangeEnd = element.indexOf('</font>');
                        if (rangeEnd !== -1) {
                            range = element.slice(rangeStart + 24, rangeEnd);
                            element = element.slice(rangeEnd + 7);
                        }
                    }
                }
                
                const staticLabelIndex = element.indexOf('<font color="#19c3c0">isStatic:</font>');
                if (staticLabelIndex !== -1) {
                    element = element.slice(staticLabelIndex + 38);
                }
                
                const isStaticStart = element.indexOf('<font color="#000000">');
                const isStaticEnd = element.indexOf('</font>');
                let isStatic = 'false';
                if (isStaticStart !== -1 && isStaticEnd !== -1) {
                    isStatic = element.slice(isStaticStart + 22, isStaticEnd);
                }

                properties.push({
                    name: nameProperty,
                    type: type,
                    range: range,
                    isStatic: isStatic,
                    classes: classes,
                });
            });
        }
    });
    return properties;
}

// Получение списка отношений из словаря на полотне
export function getRelationships(editorUi: EditorUi): RelationshipItem[] {
    const graph = editorUi.editor.graph;
    const cells = graph.getModel().cells;

    const relationships: RelationshipItem[] = [];

    Object.keys(cells).forEach(function (key: string) {
        const cellValue = cells[key].value;

        if (cellValue && typeof cellValue === "object" && cellValue !== null) {
            const label = (cellValue as any).getAttribute?.('label');
            
            if (label && label.startsWith('<b><font color="#000000">Relationships between objects</font></b>')) {
                let cellLabel = label;
                cellLabel = cellLabel.replace('<b><font color="#000000">Relationships between objects</font></b><br>', '');
                const values = cellLabel.split('<br>');

                values.forEach((element: string, index: number) => {
                    if (!element) return;
                    
                    const nameStart = element.indexOf('<font color="#00cccc">');
                    const nameEnd = element.indexOf('</font>');
                    let nameRelationship = '';
                    if (nameStart !== -1 && nameEnd !== -1) {
                        nameRelationship = element.slice(nameStart + 22, nameEnd);
                        element = element.slice(nameEnd + 7);
                    }

                    let extendRelationship = "";
                    const extendStart = element.indexOf('(<font color="#00cccc">');
                    if (extendStart !== -1) {
                        const extendEnd = element.indexOf('</font>)');
                        if (extendEnd !== -1) {
                            extendRelationship = element.slice(extendStart + 23, extendEnd);
                            element = element.slice(extendEnd + 8);
                        }
                    }

                    const classesLabelIndex = element.indexOf('classes:</font>');
                    if (classesLabelIndex !== -1) {
                        element = element.slice(classesLabelIndex + 15);
                    }
                    
                    const valuesStart = element.indexOf('<font color="#ff66b3">');
                    const valuesEnd = element.indexOf('</font>');
                    let classes: string[] = [];
                    if (valuesStart !== -1 && valuesEnd !== -1) {
                        const valuesStr = element.slice(valuesStart + 22, valuesEnd);
                        classes = valuesStr.split(', ');
                        element = element.slice(valuesEnd + 7);
                    }

                    let scale = "";
                    const scaleLabelIndex = element.indexOf('<font color="#6666FF">scale:</font>');
                    if (scaleLabelIndex !== -1) {
                        element = element.slice(scaleLabelIndex + 13);
                        const scaleStart = element.indexOf('<font color="#000000">');
                        const scaleEnd = element.indexOf('</font>');
                        if (scaleStart !== -1 && scaleEnd !== -1) {
                            scale = element.slice(scaleStart + 22, scaleEnd);
                            scale = scale.toLowerCase();
                            if (scale === "partially linear") {
                                scale = "partial";
                            }
                            element = element.slice(scaleEnd + 7);
                        }
                    }

                    const betweenLabelIndex = element.indexOf('classes:</font>');
                    if (betweenLabelIndex !== -1) {
                        element = element.slice(betweenLabelIndex + 15);
                    }
                    
                    const isBetweenStart = element.indexOf('<font color="#000000">');
                    const isBetweenEnd = element.indexOf('</font>');
                    let isBetween = 'false';
                    if (isBetweenStart !== -1 && isBetweenEnd !== -1) {
                        isBetween = element.slice(isBetweenStart + 22, isBetweenEnd);
                        element = element.slice(isBetweenEnd + 7);
                    }
                    
                    let type = "";
                    if (isBetween === "true") {
                        const typeLabelIndex = element.indexOf('type:</font>');
                        if (typeLabelIndex !== -1) {
                            element = element.slice(typeLabelIndex + 12);
                            const typeStart = element.indexOf('<font color="#000000">');
                            const typeEnd = element.indexOf('</font>');
                            if (typeStart !== -1 && typeEnd !== -1) {
                                type = element.slice(typeStart + 22, typeEnd);
                                type = type.toLowerCase().replace(/\s/g, "");
                            }
                        }
                    }

                    const namesRels = (cellValue as any).getAttribute?.('namesRels_' + index) || null;
                    const binFlags = (cellValue as any).getAttribute?.('binFlags_' + index) || null;
                    
                    let decFlags = 0;
                    if (binFlags) {
                        const reversedBinFlags = binFlags.split('').reverse().join('');
                        decFlags = parseInt(reversedBinFlags, 2);
                        if (isNaN(decFlags)) decFlags = 0;
                    }

                    relationships.push({
                        name: nameRelationship,
                        extend: extendRelationship,
                        classes: classes,
                        scale: scale,
                        isBetween: isBetween,
                        type: type,
                        namesRels: namesRels,
                        binFlags: binFlags,
                        decFlags: decFlags,
                    });
                });
            }
        }
    });
    return relationships;
}