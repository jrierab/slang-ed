/**
 * undoObject - object storing history (undo/redo)
 */
export interface UndoObject {
    key: string;
    contents: string;
}

export interface HistoryInfoObject {
    history: number;
    future: number;
}
