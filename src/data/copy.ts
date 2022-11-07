import { Cells, TableData, addStyle } from '.';
import { Range, expr2expr } from 'table-renderer';

export type CopyData = { range: Range; cells: Cells; data: TableData };

export function copy(
  from: CopyData | null,
  to1: Range | CopyData | null,
  autofill = false
) {
  if (!from || !to1) return;

  const fromr = from.range;
  const to =
    to1 instanceof Range
      ? { range: to1, cells: from.cells, data: from.data }
      : to1;
  const tor = to.range;

  let position = 'none';
  if (autofill) {
    const position = fromr.position(tor);
    if (position === 'none') return;
  }

  tor.each((r, c) => {
    const ri = r - tor.startRow;
    const ci = c - tor.startCol;

    const fromRow = fromr.startRow + (ri % (fromr.rows + 1));
    const fromCol = fromr.startCol + (ci % (fromr.cols + 1));

    const indexCell = from.cells.get(fromRow, fromCol);
    if (
      indexCell !== null &&
      indexCell[2] !== undefined &&
      indexCell[2] !== null
    ) {
      let cell = indexCell[2];
      if (autofill) {
        const getCellValue = (v: string | number) => {
          if (typeof v === 'string') {
            return v.replace(/([0-9]+$)|(([0-9]+)[^0-9]+$)/g, (word) => {
              return word.replace(
                /[0-9]+/,
                (w) => `${parseInt(w) + ri + ci + 1}`
              );
            });
          }
          return v + ri + ci + 1;
        };
        if (cell instanceof Object) {
          // clone cell to new cell
          // update new-cell
          cell = Object.assign({}, cell);

          // style
          if (cell.style !== undefined) {
            if (from.cells !== to.cells) {
              const fromStyle = Object.assign({}, from.data.styles[cell.style]);
              cell.style = addStyle(to.data, fromStyle);
            }
          }

          // formula
          if (cell.formula) {
            cell.formula = cell.formula.replace(
              /[a-zA-Z]{1,3}\d+/g,
              (word: string) => {
                // [x, y]
                let n = [0, 0];
                if (position === 'up') n[1] = -(ri + 1);
                else if (position === 'down') n[1] = ri + 1;
                else if (position === 'left') n[0] = -(ci + 1);
                else if (position === 'right') n[0] = ci + 1;
                return expr2expr(word, n[0], n[1]);
              }
            );
          } else if (cell.value) {
            cell.value = getCellValue(cell.value);
          }
        } else {
          cell = getCellValue(cell);
        }
        /*
        } else if (typeof cell === 'string') {
          cell = getCellValue(cell);
          // cell.replace(/([0-9]+$)|(([0-9]+)[^0-9]+$)/g, (word) => {
            // return word.replace(/[0-9]+/, (w) => `${parseInt(w) + 1}`);
          // });
        } else if (typeof cell === 'number') {
          cell += 1;
        }
        */
      }
      to.cells.set(r, c, cell);
    } else {
      to.cells.remove(r, c);
    }
  });
}
