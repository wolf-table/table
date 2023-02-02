import { Range, expr2expr } from 'table-renderer';
import {
  Cells,
  TableData,
  addStyle,
  IndexDataCell,
  cellValueString,
  DataCell,
} from '.';

export type CopyData = { range: Range; cells: Cells; data: TableData };
export type CopyCells = { range: Range; cells: Cells; data: TableData };

function calToDataCell(
  fromCell: DataCell,
  from: CopyCells,
  to: CopyCells,
  position: 'left' | 'right' | 'up' | 'down',
  n: number
): DataCell {
  if (fromCell !== null && fromCell !== undefined) {
    if (fromCell instanceof Object) {
      // clone cell to new cell
      // update new-cell
      fromCell = Object.assign({}, fromCell);

      // style
      if (fromCell.style !== undefined) {
        if (from.cells !== to.cells) {
          const fromStyle = Object.assign({}, from.data.styles[fromCell.style]);
          fromCell.style = addStyle(to.data, fromStyle);
        }
      }

      // formula
      if (fromCell.formula) {
        fromCell.formula = fromCell.formula.replace(
          /[a-zA-Z]{1,3}\d+/g,
          (word: string) => {
            // [x, y]
            if (['left', 'top'].includes(position)) {
              return expr2expr(word, n, 0);
            }
            return expr2expr(word, 0, n);
          }
        );
      } else if (fromCell.value) {
        fromCell.value = getCellValue(fromCell.value, n);
      }
    } else {
      fromCell = getCellValue(fromCell, n);
    }
  }
  return fromCell;
}

function autofill1(from: CopyCells | null, to: CopyCells | null) {
  if (!from || !to) return;
  const position = from.range.position(to.range);
  if (position === 'none') return;
  if (position === 'down') {
    const { rows } = from.range;
    if (rows <= 0) {
      to.range.each((r, c) => {
        const fc = from.range.startCol + (c - to.range.startCol);
        const fr = from.range.startRow;
        const indexCell = from.cells.get(fr, fc);
        if (
          indexCell !== null &&
          indexCell[2] !== undefined &&
          indexCell[2] !== null
        ) {
          const nCell = calToDataCell(indexCell[2], from, to, position, 1);
          to.cells.set(r, c, nCell);
        } else {
          to.cells.remove(fr, fc);
        }
      });
    } else {
      to.range.each((r, c) => {
        const fc = from.range.startCol + (c - to.range.startCol);
        const fr = from.range.startRow;
      });
    }
  } else if (position === 'up') {
  } else if (position === 'left') {
  } else if (position === 'right') {
  }
}

export function autofill(
  from: CopyCells | null,
  to1: Range | CopyCells | null
) {
  if (!from || !to1) return;
  const to =
    to1 instanceof Range
      ? { range: to1, cells: from.cells, data: from.data }
      : to1;
  const fromr = from.range;
  const tor = to.range;

  // find the from-range changing rules
  const nCache: number[] = [];
  let position = fromr.position(tor);
  console.log('position:', position, fromr, tor);
  if (position === 'none') return;
  // n-cache
  if (fromr.rows === 1 && ['up', 'down'].includes(position)) {
    fromr.eachCol((index) => {
      const cv = from.cells.get(fromr.startRow, index);
      const cv1 = from.cells.get(fromr.endRow, index);
      nCache.push(subtractValue(cv, cv1));
    });
  }
  if (fromr.cols === 1 && ['left', 'right'].includes(position)) {
    fromr.eachRow((index) => {
      const cv = from.cells.get(index, fromr.startCol);
      const cv1 = from.cells.get(index, fromr.endCol);
      nCache.push(subtractValue(cv, cv1));
    });
  }

  tor.each((r, c) => {
    const toIndex = [r - tor.startRow, c - tor.startCol];
    const fromIndex = [
      toIndex[0] % (fromr.rows + 1),
      toIndex[1] % (fromr.cols + 1),
    ];

    const indexCell = from.cells.get(
      fromr.startRow + fromIndex[0],
      fromr.startCol + fromIndex[1]
    );
    if (
      indexCell !== null &&
      indexCell[2] !== undefined &&
      indexCell[2] !== null
    ) {
      let cell = indexCell[2];
    }
  });
}

// export function copy(
//   from: CopyData | null,
//   to1: Range | CopyData | null,
//   autofill = false
// ) {
//   if (!from || !to1) return;

//   const fromr = from.range;
//   const to =
//     to1 instanceof Range
//       ? { range: to1, cells: from.cells, data: from.data }
//       : to1;
//   const tor = to.range;

//   // console.log('n-cache:', nCache);

//   tor.each((r, c) => {
//     // const ri = r - tor.startRow;
//     // const ci = c - tor.startCol;
//     let n = 1;
//     let index = [r - tor.startRow, c - tor.startCol];
//     if (['left', 'up'].includes(position)) {
//       index = [tor.endRow - r, tor.endCol - c];
//       n = -1;
//     }

//     const fIndex = [index[0] % (fromr.rows + 1), index[1] % (fromr.cols + 1)];
//     let fr = fromr.startRow + fIndex[0];
//     let fc = fromr.startCol + fIndex[1];

//     if (autofill) {
//       if (position === 'up') {
//         fr = fromr.startRow;
//       } else if (position === 'down') {
//         fr = fromr.endRow;
//       } else if (position === 'left') {
//         fc = fromr.startCol;
//       } else if (position === 'right') {
//         fc = fromr.endCol;
//       }
//     }

//     console.log('index:', index, fIndex, fr, fc, nCache);

//     const indexCell = from.cells.get(fr, fc);
//     if (
//       indexCell !== null &&
//       indexCell[2] !== undefined &&
//       indexCell[2] !== null
//     ) {
//       let cell = indexCell[2];
//       if (autofill) {
//         const i = ['left', 'right'].includes(position) ? 1 : 0;
//         const nIndex = fIndex[i];
//         if (nIndex >= 0 && nIndex < nCache.length) n = nCache[nIndex];
//         console.log('index[i]:', index[i], ', n:', n);
//         n = (index[i] + 1) * n;
//         // let [xn, yn] = [0, 0];
//         // if (position === 'up') yn = (index[0] + 1) * n;
//         // else if (position === 'down') yn = index[0] * n;
//         // else if (position === 'left') xn = index[1] * n;
//         // else if (position === 'right') xn = index[1] * n;
//         // console.log('xn:', xn, yn);
//         if (cell instanceof Object) {
//           // clone cell to new cell
//           // update new-cell
//           cell = Object.assign({}, cell);

//           // style
//           if (cell.style !== undefined) {
//             if (from.cells !== to.cells) {
//               const fromStyle = Object.assign({}, from.data.styles[cell.style]);
//               cell.style = addStyle(to.data, fromStyle);
//             }
//           }

//           // formula
//           if (cell.formula) {
//             cell.formula = cell.formula.replace(
//               /[a-zA-Z]{1,3}\d+/g,
//               (word: string) => {
//                 // [x, y]
//                 if (['left', 'top'].includes(position)) {
//                   return expr2expr(word, n, 0);
//                 }
//                 return expr2expr(word, 0, n);
//               }
//             );
//           } else if (cell.value) {
//             cell.value = getCellValue(cell.value, n);
//           }
//         } else {
//           cell = getCellValue(cell, n);
//         }
//       }
//       to.cells.set(r, c, cell);
//     } else {
//       to.cells.remove(r, c);
//     }
//   });
// }

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
