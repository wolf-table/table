import { DataIndexCell, DataCell, TableData, FormulaFunc } from '.';

function updateMap(map: Map<Number, Number[]>, key: number, value: number) {
  if (!map.has(key)) {
    map.set(key, []);
  }
  map.get(key)?.push(value);
}

export default class Cells {
  _: DataIndexCell[] = [];
  _indexes = new Map();
  _formulas: number[] = [];
  _formula: FormulaFunc = (v) => v;

  constructor() {}

  formula(v: FormulaFunc) {
    this._formula = v;
    return this;
  }

  load({ cells }: TableData) {
    if (cells) {
      this._ = cells;
      this.resetIndexes();
    }
  }

  cell(row: number, col: number): DataCell {
    const indexCell = this.get(row, col);
    if (indexCell) {
      const [, , cell] = indexCell;
      return cell;
    }
    return null;
  }

  get(row: number, col: number): DataIndexCell | null {
    const { _indexes } = this;
    if (_indexes.has(row)) {
      const index = _indexes.get(row).get(col);
      if (index !== undefined) return this._[index];
      return null;
    }
    return null;
  }

  set(row: number, col: number, cell: DataCell) {
    const old = this.cell(row, col);
    if (old === null || old === undefined) {
      const index = this._.push([row, col, cell]);
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
    const { _, _indexes } = this;
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
      cell.value = this._formula(cell.formula);
      this._formulas.push(index);
    }
  }

  private resetFormulas() {
    this._formulas.forEach((index) => {
      const [, , cell] = this._[index];
      if (cell instanceof Object) {
        cell.value = this._formula(cell.formula);
      }
    });
  }
}
