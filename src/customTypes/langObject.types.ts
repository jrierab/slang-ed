/**
 * langFileObject - object storing lang filename and contents
 */
export interface LangFileObject {
    filename: string;
    contents: string;
}

/**
 *
 */
export interface LangTopicObject {
    lang: string;
    value: string;
    comment: string;
    approved: boolean;
    foundInSrc: boolean;
    preserve: boolean;
}

export interface LangNodeObject {
    key: string;
    full_key: string;
    isLeaf: boolean;
    level: number;
    nodes: Array<LangNodeObject | LangTopicObject>;
}

export interface LangOptionsObject {
    projectFolder: string;
    i18nFolder: string;
}

/**
 * langTranslationsObject
 */
export interface LangTranslationsObject {
    options: LangOptionsObject;
    languages: Array<string>;
    root: LangNodeObject;
}
