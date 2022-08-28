import { col, row, TableData } from '.';

function scrollTo(
  data: TableData,
  direction: '+' | '-',
  value: number,
  oldValue: [number, number],
  index: number,
  getValue: (index: number) => number
): boolean {
  let newValue = oldValue[index];
  let changed = false;
  if (direction === '+') {
    for (let i = data.scroll[index]; i < data.rows.len; i += 1) {
      if (newValue >= value) break;
      newValue += getValue(i);
      data.scroll[index] = i + 1;
      changed = true;
    }
  } else {
    for (let i = data.scroll[index]; i > 0; i -= 1) {
      if (newValue <= value) break;
      newValue -= getValue(i);
      data.scroll[index] = i - 1;
      changed = true;
    }
  }
  oldValue[index] = newValue;
  return changed;
}

export default class Scroll {
  // [x, y]
  _value: [number, number] = [0, 0];
  _data: () => TableData;

  constructor(data: () => TableData) {
    this._data = data;
  }

  x(): number;
  x(direction: '+' | '-', n: number): boolean;
  x(direction?: '+' | '-', n?: number): any {
    if (direction && n !== undefined) {
      return scrollTo(this._data(), direction, n, this._value, 0, (i) => col(this._data(), i).width);
    }
    return this._value[0];
  }

  y(): number;
  y(direction: '+' | '-', n: number): boolean;
  y(direction?: '+' | '-', n?: number) {
    if (direction && n !== undefined) {
      return scrollTo(this._data(), direction, n, this._value, 1, (i) => row(this._data(), i).height);
    }
    return this._value[1];
  }
}
