import { TableData } from '.';
import { sum } from '../helper';

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
