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
    value: string,
    comment: string,
    approved : boolean,
    foundInSrc : boolean,
    preserve : boolean
 }

/**
 * langTranslationsObject
 */
export interface langTranslationsObject {
    projectFolder : string,
    i18nFolder : string,
    languages :  Array<string>,
    i18n: { [key: string] : { [key: string] : langTopicObject } }
}
