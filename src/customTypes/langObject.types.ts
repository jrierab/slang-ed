/**
 * langFileObject - object storing lang filename and contents
 */
export interface langFileObject {
    filename: string,
    contents: string
}

/**
 * 
 */
export interface langTopicObject {
    lang : string,
    value: string,
    comment: string,
    approved : boolean,
    foundInSrc : boolean,
    preserve : boolean
}

export interface langNodeObject {
    key : string;
    full_key : string;
    isLeaf : boolean;
    level : number;
    nodes: Array<langNodeObject | langTopicObject>
}

export interface langOptionsObject {
    projectFolder : string,
    i18nFolder : string,
}

/**
 * langTranslationsObject
 */
export interface langTranslationsObject {
    options : langOptionsObject;
    languages : Array<string>;
    root: langNodeObject
}
