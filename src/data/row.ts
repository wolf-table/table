import { TableData } from '.';
import { sum } from '../helper';

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