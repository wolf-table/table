import { DataRow, TableData } from '.';
export declare function row(data: TableData, index: number): DataRow;
export declare function row(data: TableData, index: number, value: Partial<DataRow>): DataRow;
export declare function rowHeight(data: TableData, index: number): number;
export declare function rowHeight(data: TableData, index: number, value: number): void;
export declare function rowsHeight(data: TableData): number;
export declare function rowsHeight(data: TableData, min: number, max: number): number;
