import { Range, expr2expr } from '@wolf-table/table-renderer';
import { Cells, TableData, addStyle, IndexDataCell, cellValueString } from '.';

export type CopyData = { range: Range; cells: Cells; data: TableData };
export type CopyCells = { range: Range; cells: Cells; data: TableData };

export function copy(
  from: CopyCells | null,
  to: CopyCells | null,
  autofill = false
) {
  if (!from || !to) return;
  const position = from.range.position(to.range);
  if (position === 'none') return;
  const { rows, cols } = from.range;
  to.range.each((r, c) => {
    let fr = from.range.startRow;
    let fc = from.range.startCol;
    let pos = undefined;
    let n = undefined;
    let toIndex = [r - to.range.startRow, c - to.range.startCol];
    if (['up', 'left'].includes(position)) {
      toIndex = [to.range.endRow - r, to.range.endCol - c];
    }

    if (position === 'down' || position === 'up') {
      if (rows <= 0 && autofill) {
        pos = position;
        n = toIndex[0] + 1;
        if (position === 'up') n = 0 - n;
      }
    } else {
      if (cols <= 0 && autofill) {
        pos = position;
        n = toIndex[1] + 1;
        if (position === 'left') n = 0 - n;
      }
    }

    let colOffset = toIndex[1] % (cols + 1);
    let rowOffset = toIndex[0] % (rows + 1);

    if (['up', 'left'].includes(position)) {
      fr = from.range.endRow - rowOffset;
      fc = from.range.endCol - colOffset;
    } else {
      fr += rowOffset;
      fc += colOffset;
    }

    copyToDataCell(fr, fc, r, c, from, to, pos, n);
  });
}

function copyToDataCell(
  fr: number,
  fc: number,
  tr: number,
  tc: number,
  from: CopyCells,
  to: CopyCells,
  position?: 'left' | 'right' | 'up' | 'down',
  n?: number
) {
  let fromCell = from.cells.get(fr, fc);
  if (fromCell !== null && fromCell[2] !== undefined && fromCell[2] !== null) {
    let newCell = fromCell[2];
    if (newCell instanceof Object) {
      // clone cell to new cell
      // update new-cell
      newCell = Object.assign({}, newCell);

      // style
      if (newCell.style !== undefined) {
        if (from.cells !== to.cells) {
          const fromStyle = Object.assign({}, from.data.styles[newCell.style]);
          newCell.style = addStyle(to.data, fromStyle);
        }
      }

      if (position !== undefined && n !== undefined) {
        // formula
        if (newCell.formula) {
          newCell.formula = newCell.formula.replace(
            /[a-zA-Z]{1,3}\d+/g,
            (word: string) => {
              // [x, y]
              if (['left', 'top'].includes(position)) {
                return expr2expr(word, n, 0);
              }
              return expr2expr(word, 0, n);
            }
          );
        } else if (newCell.value) {
          newCell.value = getCellValue(newCell.value, n);
        }
      }
    } else {
      if (n !== undefined) newCell = getCellValue(newCell, n);
    }
    to.cells.set(tr, tc, newCell);
  } else {
    to.cells.remove(fr, fc);
  }
}

function subtractValue(a1: IndexDataCell | null, a2: IndexDataCell | null) {
  if (
    a1 &&
    a2 &&
    a1[2] !== null &&
    a1[2] !== undefined &&
    a2[2] !== null &&
    a2[2] !== undefined
  ) {
    const v1 = numberInString(cellValueString(a1[2]));
    const v2 = numberInString(cellValueString(a2[2]));
    if (v1 !== '' && v2 !== '') {
      return parseInt(v2) - parseInt(v1);
    }
  }
  return 1;
}

function numberInString(str: String) {
  let numberStr = '';
  for (let i = str.length - 1; i >= 0; i -= 1) {
    const char = str.at(i);
    if (char && char >= '0' && char <= '9') {
      numberStr += char;
    } else if (numberStr !== '') {
      return numberStr;
    }
  }
  return numberStr;
}

function getCellValue(v: string | number, n: number) {
  if (typeof v === 'string') {
    return v.replace(/([0-9]+$)|(([0-9]+)[^0-9]+$)/g, (word) => {
      return word.replace(/[0-9]+/, (w) => `${parseInt(w) + n}`);
    });
  }
  return v + n;
}
