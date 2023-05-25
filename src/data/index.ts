import { Cell, Style, Border, Row, Col } from '@wolf-table/table-renderer';
import Cells, { cellValue, cellValueString } from './cells';
import { scrollx, scrolly, scrollResetRows, scrollResetCols } from './scroll';

import { isMerged, merge, unmerge, rangeUnoinMerges } from './merge';
import { addStyle, clearStyles } from './style';
import { addBorder, clearBorder, clearBorders } from './border';
import { col, colWidth, colsWidth, isLastCol, stepColIndex } from './col';
import { row, rowHeight, rowsHeight, isLastRow, stepRowIndex } from './row';
import { copy } from './copy';

export type DataRow = Row;
export type DataRows = {
  len: number;
  [key: number]: DataRow;
};

export type DataCol = Col;
export type DataCols = {
  len: number;
  [key: number]: DataCol;
};

export type DataCell = Cell;

export type IndexDataCell = [number, number, DataCell];
export type DataCellValue = string | number | null | undefined;

export type TableData = {
  rows: DataRows;
  cols: DataCols;
  rowHeight: number;
  colWidth: number;
  scroll: [number, number, number, number]; // rows, cols, x, y
  style: Style;
  styles: Partial<Style>[];
  borders: Border[];
  merges: string[];
  cells: IndexDataCell[];
  freeze?: string;
};

export type FormulaParser = (formula: string) => string | number;

export function defaultData(): TableData {
  return {
    rows: {
      len: 100,
    },
    cols: {
      len: 26,
    },
    rowHeight: 25,
    colWidth: 100,
    scroll: [0, 0, 0, 0],
    style: {
      color: '#333',
      align: 'left',
      valign: 'middle',
      textwrap: false,
      bold: false,
      italic: false,
      fontFamily: 'Roboto',
      fontSize: 10,
      underline: false,
      strikethrough: false,
    },
    styles: [],
    borders: [],
    merges: [],
    cells: [],
  };
}

export {
  isMerged,
  merge,
  unmerge,
  rangeUnoinMerges,
  addStyle,
  clearStyles,
  addBorder,
  clearBorder,
  clearBorders,
  col,
  colWidth,
  colsWidth,
  isLastCol,
  stepColIndex,
  row,
  rowHeight,
  rowsHeight,
  isLastRow,
  stepRowIndex,
  scrollx,
  scrolly,
  scrollResetRows,
  scrollResetCols,
  Cells,
  cellValue,
  cellValueString,
  copy,
};
