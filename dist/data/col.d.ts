import { DataCol, TableData } from '.';
export declare function col(data: TableData, index: number): DataCol;
export declare function col(data: TableData, index: number, value: Partial<DataCol>): DataCol;
export declare function colWidth(data: TableData, index: number): number;
export declare function colWidth(data: TableData, index: number, value: number): void;
export declare function colsWidth(data: TableData): number;
export declare function colsWidth(data: TableData, min: number, max: number): number;
export declare function isLastCol(data: TableData, index: number): boolean;
export declare function stepColIndex(data: TableData, index: number, step: number): number;
