import { DataCol, TableData } from '.';
import { sum } from '../helper';

export function col(data: TableData, index: number): DataCol;
export function col(
  data: TableData,
  index: number,
  value: Partial<DataCol>
): DataCol;
export function col(
  data: TableData,
  index: number,
  value?: Partial<DataCol>
): any {
  const oldValue = data.cols[index] || { width: data.colWidth };
  if (value) {
    return (data.cols[index] = Object.assign(oldValue, value));
  } else {
    return oldValue;
  }
}

export function colWidth(data: TableData, index: number): number;
export function colWidth(data: TableData, index: number, value: number): void;
export function colWidth(data: TableData, index: number, value?: number) {
  if (value) {
    const { cols } = data;
    if (cols[index]) cols[index].width = value;
    else cols[index] = { width: value };
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
        if (h > 0) {
          total += h;
          total -= data.colWidth;
        }
      }
    }
    return total;
  }
  return sum(
    min !== undefined ? min : 0,
    max !== undefined ? max : cols.len,
    (i) => colWidth(data, i)
  );
}

export function isLastCol(data: TableData, index: number) {
  return data.cols.len - 1 === index;
}

export function stepColIndex(data: TableData, index: number, step: number) {
  for (;;) {
    const r = col(data, index);
    if (r.hide) index += step;
    else return index;
  }
}
