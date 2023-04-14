import Table, { MoveDirection } from '.';
import Scrollbar from './scrollbar';
import { scrollx, scrolly } from './data';
import selector from './index.selector';
import editor from './index.editor';
import { Range } from '@wolf-table/table-renderer';

function init(t: Table) {
  // scrollbar
  t._vScrollbar = new Scrollbar('vertical', t._container).change(
    (direction, value) => {
      if (scrolly(t._data, direction, value)) {
        t.render();
        selector.reset(t);
        editor.move(t);
      }
    }
  );

  t._hScrollbar = new Scrollbar('horizontal', t._container).change(
    (direction, value) => {
      if (scrollx(t._data, direction, value)) {
        t.render();
        selector.reset(t);
        editor.move(t);
      }
    }
  );
}

function resize(t: Table) {
  const { x, y, height, width } = t._contentRect;
  if (t._vScrollbar) {
    t._vScrollbar.resize(t._height(), height + y);
  }
  if (t._hScrollbar) {
    t._hScrollbar.resize(t._width(), width + x);
  }
}

/**
 *
 * @param t
 * @param range current selected area
 * @param oldRange it's needed when the selected area get bigger or smaller (click-mousemove and shift-(Arrow*)-keyborard)
 * @returns
 */
function autoMove(
  t: Table,
  range: Range | null | undefined,
  oldRange?: Range | null
) {
  if (!range) return;
  const { _selector, _vScrollbar, _hScrollbar, _data } = t;
  const { viewport } = t._renderer;
  if (viewport && _selector) {
    const [, area2, , area4] = viewport.areas;
    const range4 = area4.range;
    const range2 = area2.range;
    if (_vScrollbar) {
      const totalHeight = (start: number, maxStart: number, maxEnd: number) => {
        const max = t.rowsHeight(maxStart, maxEnd + 1);
        let value = 0;
        for (let i = start; value < max; i += 1) {
          value += t.rowHeight(i);
        }
        return value;
      };
      if (oldRange) {
        // move by step
        if (range.endRow === oldRange.endRow) {
          // up
          if (range.startRow < oldRange.startRow) {
            // up+
            if (
              range.startRow > range2.endRow &&
              range.startRow < range4.startRow
            ) {
              _vScrollbar.scrollBy(
                -t.rowsHeight(range.startRow, range4.startRow)
              );
            }
          } else if (range.startRow > oldRange.startRow) {
            // up-
            if (range.startRow >= range4.endRow) {
              _vScrollbar.scrollBy(
                totalHeight(range4.startRow, range4.endRow, range.startRow)
              );
            }
          }
        } else if (range.startRow === oldRange.startRow) {
          // down
          if (range.endRow > oldRange.endRow) {
            // down+
            if (range.endRow >= range4.endRow) {
              _vScrollbar.scrollBy(
                totalHeight(range4.startRow, range4.endRow, range.endRow)
              );
            }
          } else if (range.endRow < oldRange.endRow) {
            // down-
            if (range.endRow < range4.startRow) {
              _vScrollbar.scrollBy(
                -t.rowsHeight(range.endRow, range4.startRow)
              );
            }
          }
        }
      } else {
        // to-end
        if (range.endRow === _data.rows.len - 1) {
          _vScrollbar.scrollToEnd();
        } else if (range.startRow === 0) {
          _vScrollbar.scrollToStart();
        } else if (range.endRow >= range4.endRow) {
          _vScrollbar.scrollBy(
            totalHeight(range4.startRow, range4.endRow, range.endRow)
          );
        } else if (
          range.startRow > range2.endRow &&
          range.startRow < range4.startRow
        ) {
          _vScrollbar.scrollBy(-t.rowsHeight(range.startRow, range4.startRow));
        }
      }
    }
    if (_hScrollbar) {
      const totalWidth = (start: number, maxStart: number, maxEnd: number) => {
        const max = t.colsWidth(maxStart, maxEnd + 1);
        let value = 0;
        for (let i = start; value < max; i += 1) {
          value += t.colWidth(i);
        }
        return value;
      };
      if (oldRange) {
        // to-end
        // move by step
        if (range.endCol === oldRange.endCol) {
          // left
          if (range.startCol < oldRange.startCol) {
            // left+
            if (
              range.startCol > range2.endCol &&
              range.startCol < range4.startCol
            ) {
              _hScrollbar.scrollBy(
                -t.colsWidth(range.startCol, range4.startCol)
              );
            }
          } else if (range.startCol > oldRange.startCol) {
            // left-
            if (range.startCol >= range4.endCol) {
              _hScrollbar.scrollBy(
                totalWidth(range4.startCol, range4.endCol, range.startCol)
              );
            }
          }
        } else if (range.startCol === oldRange.startCol) {
          // right
          if (range.endCol > oldRange.endCol) {
            // right+
            if (range.endCol >= range4.endCol) {
              _hScrollbar.scrollBy(
                totalWidth(range4.startCol, range4.endCol, range.endCol)
              );
            }
          } else if (range.endCol < oldRange.endCol) {
            // right-
            if (range.endCol < range4.startCol) {
              _hScrollbar.scrollBy(-t.colsWidth(range.endCol, range4.startCol));
            }
          }
        }
      } else {
        if (range.endCol === _data.cols.len - 1) {
          _hScrollbar.scrollToEnd();
        } else if (range.startCol === 0) {
          _hScrollbar.scrollToStart();
        } else if (range.endCol >= range4.endCol) {
          _hScrollbar.scrollBy(
            totalWidth(range4.startCol, range4.endCol, range.endCol)
          );
        } else if (
          range.startCol > range2.endCol &&
          range.startCol < range4.startCol
        ) {
          _hScrollbar.scrollBy(-t.colsWidth(range.startCol, range4.startCol));
        }
      }
    }
  }
}

export default {
  init,
  resize,
  autoMove,
};
