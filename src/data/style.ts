import { TableData } from '.';
import { Style } from '@wolf-table/table-renderer';
import { equals } from '../helper';

export function addStyle(t: TableData, value: Partial<Style>): number {
  if (!t.styles) t.styles = [];
  if (value) {
    for (let i = 0; i < t.styles.length; i += 1) {
      const it = t.styles[i];
      if (equals(it, value)) {
        return i;
      }
    }
  }
  return t.styles.push(value) - 1;
}

export function getStyle(
  t: TableData,
  index: number,
  withDefault: boolean = true
): Partial<Style> {
  const style = t.styles[index];
  if (withDefault) {
    return Object.assign({}, t.style, t.styles[index] || {});
  }
  return style;
}

export function clearStyles(t: TableData) {
  t.styles.length = 0;
}
