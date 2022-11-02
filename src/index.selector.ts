import Table, { MoveDirection } from '.';
import { borderWidth } from './config';
import { expr2xy, Rect, Range, Area } from 'table-renderer';
import { rangeUnoinMerges } from './data';
import Selector from './selector';
import scrollbar from './index.scrollbar';

function init(t: Table) {
  t._selector = new Selector(!!t._editable);
}

function setCellValue(t: Table, value: string) {
  const { _selector } = t;
  if (_selector) {
    _selector.clearCopy();
    const { _ranges } = _selector;
    _ranges.forEach((it) => {
      if (it) {
        it.each((r, c) => {
          t.cell(r, c, { value });
        });
      }
    });
    t.render();
  }
}

function addRange({ _selector, _data }: Table, r: number, c: number, clear: boolean) {
  const range = Range.create(r, c);
  const mergedRange = rangeUnoinMerges(_data, range);
  if (_selector) {
    _selector.focus(r, c, mergedRange).addRange(_selector._placement === 'body' ? mergedRange : range, clear);
  }
}

function unionRange({ _selector, _data }: Table, r: number, c: number) {
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
      const { _ranges, _focusRange, _copyRange } = _selector;
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
              _selector.addColHeaderArea(area.rectCol(it.startCol, it.endCol), target);
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
              _selector.addRowHeaderArea(area.rectRow(it.startRow, it.endRow), target);
            }
          });
        }
      }
    });
  }
}

function move(t: Table, reselect: boolean, direction: MoveDirection, step?: number) {
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

      if (step) {
        const getShowRowIndex = (index: number, offset: number) => {
          for (;;) {
            const r = t.row(index);
            if (r.hide) index += offset;
            else return index;
          }
        };
        const getShowColIndex = (index: number, offset: number) => {
          for (;;) {
            const r = t.col(index);
            if (r.hide) index += offset;
            else return index;
          }
        };

        if (direction === 'up') {
          r = getShowRowIndex(startRow - step, -1);
        } else if (direction === 'down') {
          r = getShowRowIndex(endRow + step, 1);
        } else if (direction === 'left') {
          c = getShowColIndex(startCol - step, -1);
        } else if (direction === 'right') {
          c = getShowColIndex(endCol + step, 1);
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
      scrollbar.auto(t, _selector._ranges[0], direction, step === undefined);
      reset(t);
    }
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
  showCopy,
  clearCopy,
};
