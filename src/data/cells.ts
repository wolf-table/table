import { Formatter } from 'table-renderer';
import { DataIndexCell, DataCell, TableData, FormulaParser } from '.';

export default class Cells {
  _: DataIndexCell[] = [];
  _indexes = new Map();
  _formulas: number[] = [];
  _formulaParser: FormulaParser = (v) => v;
  _formatter: Formatter = (v) => v;

  constructor() {}

  formulaParser(v: FormulaParser) {
    this._formulaParser = v;
    return this;
  }

  formatter(v: Formatter) {
    this._formatter = v;
    return this;
  }

  load({ cells }: TableData) {
    if (cells) {
      this._ = cells;
      this.resetIndexes();
    }
  }

  get(row: number, col: number): DataCell | null {
    const { _indexes } = this;
    if (_indexes.has(row)) {
      const index = _indexes.get(row).get(col);
      if (index !== undefined) {
        return this._[index][2];
      }
      return null;
    }
    return null;
  }

  set(row: number, col: number, cell: DataCell) {
    const old = this.get(row, col);
    if (old === null || old === undefined) {
      const index = this._.push([row, col, cell]) - 1;
      this.updateIndex(row, col, index);
      this.addFormula(cell, index);
    } else {
      const updateValue = cell instanceof Object && old instanceof Object && cell.value !== old.value;
      Object.assign(old, cell);
      if (updateValue) {
        this.resetFormulas();
      }
    }
  }

  private resetIndexes() {
    const { _ } = this;
    for (let i = 0; i < _.length; i += 1) {
      const [r, c, cell] = _[i];
      this.updateIndex(r, c, i);
      this.addFormula(cell, i);
    }
  }

  private updateIndex(row: number, col: number, index: number) {
    const { _indexes } = this;
    if (!_indexes.has(row)) {
      _indexes.set(row, new Map());
    }
    _indexes.get(row).set(col, index);
  }

  private addFormula(cell: DataCell, index: number) {
    if (cell instanceof Object && cell.formula) {
      cell.value = this._formulaParser(cell.formula);
      this._formulas.push(index);
    }
  }

  private resetFormulas() {
    this._formulas.forEach((index) => {
      const [, , cell] = this._[index];
      if (cell instanceof Object) {
        cell.value = this._formulaParser(cell.formula);
      }
    });
  }
}

export function cellValue(cell: DataCell) {
  return cell instanceof Object ? cell.value : cell;
}

export function cellValueString(cell: DataCell) {
  const v = cellValue(cell);
  return `${v !== null && v !== undefined ? v : ''}`;
}
