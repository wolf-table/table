import { Cell, Style, Border, Row, Col } from '@wolf-table/table-renderer';
import Cells, { cellValue, cellValueString } from './cells';
import { scrollx, scrolly, scrollResetRows, scrollResetCols } from './scroll';
import { isMerged, merge, unmerge, rangeUnoinMerges } from './merge';
import { addStyle, clearStyles } from './style';
import { addBorder, clearBorder, clearBorders } from './border';
import { col, colWidth, colsWidth, isLastCol, stepColIndex } from './col';
import { row, rowHeight, rowsHeight, isLastRow, stepRowIndex } from './row';
import { copy } from './copy';
export declare type DataRow = Row;
export declare type DataRows = {
    len: number;
    [key: number]: DataRow;
};
export declare type DataCol = Col;
export declare type DataCols = {
    len: number;
    [key: number]: DataCol;
};
export declare type DataCell = Cell;
export declare type IndexDataCell = [number, number, DataCell];
export declare type DataCellValue = string | number | null | undefined;
export declare type TableData = {
    rows: DataRows;
    cols: DataCols;
    rowHeight: number;
    colWidth: number;
    scroll: [number, number, number, number];
    style: Style;
    styles: Partial<Style>[];
    borders: Border[];
    merges: string[];
    cells: IndexDataCell[];
    freeze?: string;
};
export declare type FormulaParser = (formula: string) => string | number;
export declare function defaultData(): TableData;
export { isMerged, merge, unmerge, rangeUnoinMerges, addStyle, clearStyles, addBorder, clearBorder, clearBorders, col, colWidth, colsWidth, isLastCol, stepColIndex, row, rowHeight, rowsHeight, isLastRow, stepRowIndex, scrollx, scrolly, scrollResetRows, scrollResetCols, Cells, cellValue, cellValueString, copy, };
