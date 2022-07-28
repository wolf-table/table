import { Cell, CellStyle } from 'table-render/dist/types';
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
export declare type DataCells = {
    [key: number]: {
        [key: number]: Cell;
    };
};
export declare type TableData = {
    rows: DataRows;
    cols: DataCols;
    rowHeight: number;
    colWidth: number;
    style: CellStyle;
    styles?: CellStyle[];
    freeze?: string;
    scroll?: string;
    merges?: string[];
    cells?: DataCells;
};
export declare function style({ styles }: TableData, index?: number): CellStyle | undefined;
export declare function col({ cols, colWidth }: TableData, index: number): DataCol;
export declare function colsWidth(data: TableData): number;
export declare function row({ rows, rowHeight }: TableData, index: number): DataRow;
export declare function rowsHeight(data: TableData): number;
export declare function cell({ cells }: TableData, rowIndex: number, colIndex: number): Cell | undefined;
export declare function defaultData(): TableData;
