import { Formatter } from '@wolf-table/table-renderer';
import {
  IndexDataCell,
  DataCell,
  TableData,
  FormulaParser,
  DataCellValue,
} from '.';

export default class Cells {
  _: IndexDataCell[] = [];
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

  get(row: number, col: number): IndexDataCell | null {
    const { _indexes } = this;
    if (_indexes.has(row)) {
      const index = _indexes.get(row).get(col);
      if (index !== undefined) {
        return this._[index];
      }
      return null;
    }
    return null;
  }

  remove(row: number, col: number) {
    const { _indexes } = this;
    if (_indexes.has(row)) {
      const rowIndexes = _indexes.get(row);
      const index = rowIndexes.get(col);
      if (index !== undefined) {
        this._.splice(index, 1);
        rowIndexes.delete(col);
      }
    }
    return this;
  }

  set(row: number, col: number, cell: DataCell) {
    let oldData = this.get(row, col);
    if (oldData === null) {
      if (cell !== null && cell !== undefined) {
        const index = this._.push([row, col, cell]) - 1;
        this.updateIndex(row, col, index);
        this.addFormula(cell, index);
      }
    } else {
      const old = oldData[2];
      const ovalStr = cellValueString(old);
      const nvalStr = cellValueString(cell);
      if (nvalStr === '') {
        // delete
        if (old instanceof Object && Object.keys(old).length > 1) {
          delete old.value;
        } else {
          this.remove(row, col);
        }
        this.resetFormulas();
      } else {
        // update
        if (old instanceof Object) {
          Object.assign(old, cell instanceof Object ? cell : { value: cell });
        } else {
          oldData[2] = cell;
        }
        if (nvalStr !== ovalStr) {
          this.resetFormulas();
        }
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
      if (cell instanceof Object && cell.formula) {
        cell.value = this._formulaParser(cell.formula);
      }
    });
  }
}

export function cellValue(cell: DataCell): DataCellValue {
  return cell instanceof Object ? cell.value : cell;
}

export function cellValueString(cell: DataCell): string {
  const v = cellValue(cell);
  return `${v !== null && v !== undefined ? v : ''}`;
}
