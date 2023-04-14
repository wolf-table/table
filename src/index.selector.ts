import Table, { MoveDirection } from '.';
import { borderWidth } from './config';
import { Rect, Range, Area } from '@wolf-table/table-renderer';
import { DataCell, rangeUnoinMerges, stepColIndex, stepRowIndex } from './data';
import Selector from './selector';
import scrollbar from './index.scrollbar';
import { bindMousemoveAndMouseup } from './event';

function init(t: Table) {
  t._selector = new Selector(!!t._editable).autofillTrigger((evt) => {
    const { _selector } = t;
    if (_selector) {
      bindMousemove(
        t,
        (row, col) => {
          const { currentRange } = _selector;
          if (currentRange) {
            const nRange = currentRange.clone();
            if (!nRange.contains(row, col)) {
              const d = [
                nRange.startRow - row,
                row - nRange.endRow,
                nRange.startCol - col,
                col - nRange.endCol,
              ];
              const index = d.indexOf(Math.max.apply(null, d));
              if (index === 1) {
                nRange.startRow = nRange.endRow + 1;
                nRange.endRow = row;
              } else if (index === 0) {
                nRange.endRow = nRange.startRow - 1;
                nRange.startRow = row;
              } else if (index === 3) {
                nRange.startCol = nRange.endCol + 1;
                nRange.endCol = col;
              } else if (index === 2) {
                nRange.endCol = nRange.startCol - 1;
                nRange.startCol = col;
              }
              _selector.autofillRange(nRange);
            } else {
              _selector.autofillRange(null);
            }
          }
        },
        (s) => s._autofillRange,
        (s) => {
          t.copy(s._autofillRange, true).render();
          _selector.autofillRange(null);
          reset(t);
        }
      );
    }
  });
}

function setCellValue(t: Table, value: DataCell) {
  const { _selector } = t;
  if (_selector) {
    _selector.clearCopy();
    const { _ranges } = _selector;
    // console.log('ranges:', _ranges, value);
    _ranges.forEach((it) => {
      if (it) {
        it.each((r, c) => {
          t.cell(r, c, value);
        });
      }
    });
    t.render();
  }
}

function addRange(t: Table, r: number, c: number, clear: boolean) {
  const { _selector, _data } = t;
  const range = Range.create(r, c);
  const mergedRange = rangeUnoinMerges(_data, range);
  if (_selector) {
    _selector
      .focus(r, c, mergedRange)
      .addRange(_selector._placement === 'body' ? mergedRange : range, clear);
  }
}

function unionRange(t: Table, r: number, c: number) {
  const { _selector, _data } = t;
  if (_selector) {
    _selector.move(r, c).updateLastRange((focusRange) => {
      return rangeUnoinMerges(_data, focusRange.union(Range.create(r, c)));
    });
  }
}

function reset(t: Table) {
  const { _selector, _overlayer } = t;
  const { _rowHeader, _colHeader, viewport } = t._renderer;
  if (_selector && viewport) {
    const { _placement } = _selector;
    _selector.clear();

    const x = _rowHeader.width;
    const y = _colHeader.height;

    const rangeInBody = (old: Range, range: Range) => {
      const newRange = old.clone();
      if (_placement === 'all' || _placement === 'row-header') {
        newRange.endCol = range.endCol;
        if (old.startCol < range.startCol) {
          newRange.startCol = range.startCol;
        }
      }
      if (_placement === 'all' || _placement === 'col-header') {
        newRange.endRow = range.endRow;
        if (old.startRow < range.startRow) {
          newRange.startRow = range.startRow;
        }
      }
      return newRange;
    };

    const getIntersects = ({ range }: Area, it: Range): boolean => {
      if (_placement === 'body') {
        return range.intersects(it);
      } else if (_placement === 'col-header') {
        return range.intersectsCol(it.startCol, it.endCol);
      } else if (_placement === 'row-header') {
        return range.intersectsRow(it.startRow, it.endRow);
      }
      return true;
    };

    const getRect = (area: Area, it: Range, index: number): Rect => {
      let rect = area.rect(it);
      if (_placement === 'col-header') {
        rect = area.rectCol(it.startCol, it.endCol);
        // hide overlap border
        rect.height += borderWidth;
        if (index === 2 || index === 3) rect.y -= borderWidth;
      } else if (_placement === 'row-header') {
        rect = area.rectRow(it.startRow, it.endRow);
        // hide overlap border
        rect.width += borderWidth;
        if (index === 0 || index === 3) rect.x -= borderWidth;
      }
      return rect;
    };

    viewport.areas.forEach((area, index) => {
      const target = _overlayer._areas[index];
      const { _ranges, _focusRange, _copyRange, _autofillRange } = _selector;
      _ranges.forEach((it, i) => {
        let intersects = getIntersects(area, it);
        let rect = getRect(area, it, index);
        if (intersects) {
          if (i === _ranges.length - 1) {
            if (_placement !== 'all' || area.range.intersects(it)) {
              _selector.addAreaOutline(rect, target);
            }
            if (_focusRange) {
              if (area.range.intersects(_focusRange)) {
                _selector.setFocusArea(area.rect(_focusRange), target);
              }
              const nit = rangeInBody(it, area.range);
              const dRanges = nit.difference(_focusRange);
              if (dRanges.length > 0) {
                dRanges.forEach((it1) => {
                  intersects = getIntersects(area, it1);
                  if (intersects) {
                    _selector.addArea(area.rect(it1), target);
                  }
                });
              } else if (_placement !== 'body' || !it.equals(_focusRange)) {
                _selector.addArea(getRect(area, nit, index), target);
              }
            }
          } else {
            _selector.addArea(rect, target);
          }
        }
      });
      if (_copyRange) {
        if (area.range.intersects(_copyRange)) {
          _selector.addCopyArea(area.rect(_copyRange), target);
        }
      }
      if (_autofillRange) {
        if (area.range.intersects(_autofillRange)) {
          _selector.addAutofillArea(area.rect(_autofillRange), target);
        }
      }
    });

    // header-areas
    viewport.headerAreas.forEach((area, index) => {
      const target = _overlayer._headerAreas[index];
      const { width, height } = area;
      if (index <= 1) {
        // col-header
        if (_placement === 'row-header' || _placement === 'all') {
          _selector.addColHeaderArea({ x: 0, y: 0, width, height: y }, target);
        } else {
          _selector._colHeaderRanges.forEach((it) => {
            if (area.range.intersectsCol(it.startCol, it.endCol)) {
              _selector.addColHeaderArea(
                area.rectCol(it.startCol, it.endCol),
                target
              );
            }
          });
        }
      } else {
        // row-header
        if (_placement === 'col-header' || _placement === 'all') {
          _selector.addRowHeaderArea({ x: 0, y: 0, width: x, height }, target);
        } else {
          _selector._rowHeaderRanges.forEach((it) => {
            if (area.range.intersectsRow(it.startRow, it.endRow)) {
              _selector.addRowHeaderArea(
                area.rectRow(it.startRow, it.endRow),
                target
              );
            }
          });
        }
      }
    });
  }
}

function moveAutofill(t: Table, direction: MoveDirection) {
  const { _selector, _data } = t;
  if (_selector) {
    const range = _selector._autofillRange;
    if (range) {
      if (direction === 'up') {
        range.startRow = stepRowIndex(_data, range.startRow - 1, -1);
      } else if (direction === 'down') {
        range.endRow = stepRowIndex(_data, range.endRow + 1, 1);
      } else if (direction === 'left') {
        range.startCol = stepColIndex(_data, range.startCol - 1, -1);
      } else if (direction === 'right') {
        range.endCol = stepColIndex(_data, range.endCol + 1, 1);
      }
      scrollbar.autoMove(t, range);
      reset(t);
      return true;
    }
  }
  return false;
}

function move(
  t: Table,
  reselect: boolean,
  direction: MoveDirection,
  step?: number
) {
  if (moveAutofill(t, direction)) return;
  const { _selector, _data } = t;
  const { viewport } = t._renderer;
  if (_selector && viewport) {
    const { _focusRange } = _selector;
    if (_focusRange) {
      let { startRow, startCol, endRow, endCol } = _focusRange;
      const { rows, cols } = _data;

      let [r, c] = _selector._move;
      if (!reselect) {
        startRow = endRow = r;
        startCol = endCol = c;
      }

      const oldCurrentRange = _selector.currentRange?.clone();

      if (step) {
        if (direction === 'up') {
          r = stepRowIndex(_data, startRow - step, -1);
        } else if (direction === 'down') {
          r = stepRowIndex(_data, endRow + step, 1);
        } else if (direction === 'left') {
          c = stepColIndex(_data, startCol - step, -1);
        } else if (direction === 'right') {
          c = stepColIndex(_data, endCol + step, 1);
        }
      } else {
        if (direction === 'up') {
          r = 0;
        } else if (direction === 'down') {
          r = rows.len - 1;
        } else if (direction === 'left') {
          c = 0;
        } else if (direction === 'right') {
          c = cols.len - 1;
        }
      }
      if (r >= 0 && r <= rows.len - 1 && c >= 0 && c <= cols.len - 1) {
        if (reselect) {
          addRange(t, r, c, true);
        } else {
          unionRange(t, r, c);
          _selector._move = [r, c];
        }
      }
      _selector.placement('body');
      scrollbar.autoMove(
        t,
        _selector.currentRange,
        reselect ? undefined : oldCurrentRange
      );
      reset(t);
    }
  }
}

// bind mouse select
function bindMousemove(
  t: Table,
  moveChange: (row: number, col: number) => void,
  changedRange: (s: Selector) => Range | null | undefined,
  upAfter = (s: Selector) => {}
) {
  const { _selector, _renderer } = t;
  if (!_selector) return;
  const { _placement } = _selector;
  const cache = { row: 0, col: 0 };
  if (_placement !== 'all') {
    const { left, top } = t._canvas.rect();
    let cachexy = [0, 0];
    let timer: any = null;
    const clearTimer = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const moveHandler = (e: any) => {
      let [x1, y1] = [0, 0];
      if (e.x > 0) x1 = e.x - left;
      if (e.y > 0) y1 = e.y - top;
      if (_placement === 'row-header') x1 = 1;
      if (_placement === 'col-header') y1 = 1;

      const oldCurrentRange = _selector.currentRange?.clone();

      const { target } = e;
      if (target.tagName === 'CANVAS') {
        const c1 = _renderer.viewport?.cellAt(x1, y1);
        if (c1) {
          let { row, col } = c1;
          if (row != cache.row || col !== cache.col) {
            moveChange(row, col);
            if (_placement === 'body') {
              scrollbar.autoMove(t, changedRange(_selector), oldCurrentRange);
            }
            reset(t);
            cache.row = row;
            cache.col = col;
          }
        }
        clearTimer();
      } else {
        if (timer === null) {
          const deltax = e.x - cachexy[0];
          const deltay = e.y - cachexy[1];
          if (deltax >= 0 && deltay >= 0) {
            timer = setInterval(() => {
              const cRange = changedRange(_selector);
              if (cRange) {
                const { endRow, endCol } = cRange;
                if (deltax > deltay) {
                  move(t, false, 'right', 1);
                  if (t.isLastRow(endRow)) {
                    clearTimer();
                  }
                } else {
                  move(t, false, 'down', 1);
                  if (t.isLastCol(endCol)) {
                    clearTimer();
                  }
                }
              }
            }, 120);
          }
        }
      }
      cachexy = [e.x, e.y];
    };
    bindMousemoveAndMouseup(window, moveHandler, () => {
      clearTimer();
      upAfter(_selector);
    });
  }
}

function showCopy(t: Table) {
  if (t._selector) {
    t._selector.showCopy();
    reset(t);
  }
}

function clearCopy(t: Table) {
  if (t._selector) {
    t._selector.clearCopy();
    reset(t);
  }
}

export default {
  init,
  setCellValue,
  addRange,
  unionRange,
  reset,
  move,
  bindMousemove,
  showCopy,
  clearCopy,
};
