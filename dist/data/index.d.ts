import { Range, Cell, CellStyle } from 'table-render';
import Cells from './cells';
import Scroll from './scroll';
export declare type DataRow = {
    height: number;
    hide?: boolean;
    style?: number;
};
export declare type DataRows = {
    len: number;
    [key: number]: DataRow;
};
export declare type DataCol = {
    width: number;
    hide?: boolean;
    style?: number;
};
export declare type DataCols = {
    len: number;
    [key: number]: DataCol;
};
export declare type DataCell = Cell;
export declare type DataIndexCell = [number, number, DataCell];
export declare type TableData = {
    rows: DataRows;
    cols: DataCols;
    rowHeight: number;
    colWidth: number;
    scroll: [number, number];
    style: CellStyle;
    styles?: Partial<CellStyle>[];
    freeze?: string;
    merges?: string[];
    cells?: DataIndexCell[];
};
export declare type FormulaFunc = (formula: string) => string | number;
export declare function isMerged({ merges }: TableData, ref: string): boolean;
export declare function merge(data: TableData, ref: string): void;
export declare function unmerge({ merges }: TableData, ref: string): void;
export declare function rangeUnoinMerges({ merges }: TableData, range: Range): Range;
export declare function addStyle(t: TableData, value: Partial<CellStyle>): number;
export declare function col(data: TableData, index: number): DataCol;
export declare function colWidth(data: TableData, index: number): number;
export declare function colWidth(data: TableData, index: number, value: number): void;
export declare function colsWidth(data: TableData): number;
export declare function colsWidth(data: TableData, min: number, max: number): number;
export declare function row(data: TableData, index: number): DataRow;
export declare function rowHeight(data: TableData, index: number): number;
export declare function rowHeight(data: TableData, index: number, value: number): void;
export declare function rowsHeight(data: TableData): number;
export declare function rowsHeight(data: TableData, min: number, max: number): number;
export declare function cell({ cells }: TableData, rowIndex: number, colIndex: number): Cell;
export declare function defaultData(): TableData;
export { Scroll, Cells };
