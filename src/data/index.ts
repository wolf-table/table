import { Range, Cell, CellStyle } from 'table-render';
import { sum } from '../helper';
import Cells from './cells';
import Scroll from './scroll';

export type DataRow = {
  height: number;
  hide?: boolean;
  style?: number;
};
export type DataRows = {
  len: number;
  [key: number]: DataRow;
};

export type DataCol = {
  width: number;
  hide?: boolean;
  style?: number;
};
export type DataCols = {
  len: number;
  [key: number]: DataCol;
};

export type DataCell = Cell;
export type DataIndexCell = [number, number, DataCell]

export type TableData = {
  rows: DataRows;
  cols: DataCols;
  rowHeight: number;
  colWidth: number;
  scroll: [number, number]; // cols, rows
  style: CellStyle;
  styles?: CellStyle[];
  freeze?: string;
  merges?: string[];
  cells?: DataIndexCell[];
};

export type FormulaFunc = (formula: string) => string | number;

// can be merged
export function isMerged({ merges }: TableData, ref: string) {
  if (merges) {
    const range = Range.with(ref);
    for (let i = 0; i < merges.length; i += 1) {
      if (Range.with(merges[i]).equals(range)) {
        return true;
      }
    }
  }
  return false;
}
// merge
export function merge(data: TableData, ref: string) {
  const range = Range.with(ref);
  if (!range.multiple) return;
  data.merges ||= [];
  const { merges } = data;
  if (merges.length <= 0) {
    merges.push(ref);
  } else {
    merges.forEach((it, index) => {
      if (Range.with(it).within(range)) {
        merges.splice(index, 1);
      }
    });
    merges.push(ref);
  }
}
// unmerge
export function unmerge({ merges }: TableData, ref: string) {
  if (merges) {
    for (let i = 0; i < merges.length; i += 1) {
      if (merges[i] === ref) {
        merges.splice(i, 1);
        return;
      }
    }
  }
}

export function rangeUnoinMerges({ merges }: TableData, range: Range) {
  if (merges) {
    for (let i = 0; i < merges.length; i += 1) {
      const r = Range.with(merges[i]);
      if (r.intersects(range)) {
        range = r.union(range);
      }
    }
  }
  return range;
}

export function style({ styles }: TableData, index?: number) {
  if (!index) return undefined;
  return styles?.[index];
}

export function col(data: TableData, index: number) {
  return data.cols[index] || { width: data.colWidth };
}

export function colWidth(data: TableData, index: number): number;
export function colWidth(data: TableData, index: number, value: number): void;
export function colWidth(data: TableData, index: number, value?: number) {
  if (value) {
    if (value !== data.colWidth) {
      const { cols } = data;
      if (cols[index]) cols[index].width = value;
      else cols[index] = { width: value };
    }
  } else {
    const c = col(data, index);
    return c.hide ? 0 : c.width;
  }
}

export function colsWidth(data: TableData): number;
export function colsWidth(data: TableData, min: number, max: number): number;
export function colsWidth(data: TableData, min?: number, max?: number) {
  const { cols } = data;
  if (arguments.length === 1) {
    let total = cols.len * data.colWidth;
    for (let key in cols) {
      if (key !== 'len') {
        const h = colWidth(data, parseInt(key, 10));
        total += h;
        total -= data.colWidth;
      }
    }
    return total;
  }
  return sum(min !== undefined ? min : 0, max !== undefined ? max : cols.len, (i) => colWidth(data, i));
}

export function row(data: TableData, index: number) {
  return data.rows[index] || { height: data.rowHeight };
}

export function rowHeight(data: TableData, index: number): number;
export function rowHeight(data: TableData, index: number, value: number): void;
export function rowHeight(data: TableData, index: number, value?: number) {
  if (value) {
    if (value !== data.rowHeight) {
      const { rows } = data;
      if (rows[index]) rows[index].height = value;
      else rows[index] = { height: value };
    }
  } else {
    const r = row(data, index);
    return r.hide ? 0 : r.height;
  }
}

export function rowsHeight(data: TableData): number;
export function rowsHeight(data: TableData, min: number, max: number): number;
export function rowsHeight(data: TableData, min?: number, max?: number) {
  const { rows } = data;
  if (arguments.length === 1) {
    let total = rows.len * data.rowHeight;
    for (let key in rows) {
      if (key !== 'len') {
        const h = rowHeight(data, parseInt(key, 10));
        total += h;
        total -= data.rowHeight;
      }
    }
    return total;
  }
  return sum(min !== undefined ? min : 0, max !== undefined ? max : rows.len, (i) => rowHeight(data, i));
}

export function cell({ cells }: TableData, rowIndex: number, colIndex: number) {
  return cells ? cells[rowIndex][colIndex] : undefined;
}
/* data cell end */

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
    scroll: [0, 0],
    style: {
      fontName: 'Helvetica',
      fontSize: 10,
      color: '#333',
      bgcolor: '#fff',
      align: 'left',
      valign: 'middle',
      textwrap: false,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
    },
  };
}

export {
  Scroll,
  Cells
}

