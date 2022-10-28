import Table from '.';
import { borderWidth } from './config';
import { expr2xy, Rect, Range, Area } from 'table-renderer';
import { rangeUnoinMerges } from './data';

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

function addRange(t: Table, r: number, c: number, clear: boolean) {
  const { _selector } = t;
  if (_selector) {
    _selector.focus(r, c).addRange(rangeUnoinMerges(t._data, Range.create(r, c)), clear);
  }
}

function unionRange(t: Table, r: number, c: number) {
  t._selector?.updateLastRange((focusRange) => {
    return rangeUnoinMerges(t._data, focusRange.union(Range.create(r, c)));
  });
}

function reset(t: Table) {
  const { _selector, _overlayer, _container } = t;
  const { _rowHeader, _colHeader, viewport } = t._renderer;
  if (_selector && viewport) {
    const { _placement } = _selector;
    _selector.clear();

    const x = _rowHeader.width;
    const y = _colHeader.height;
    const width = t._width() - x;
    const height = t._height() - y;

    const addAreas = (
      intersectsFunc: (r: Range, r1: Range) => boolean,
      rectFunc: (area: Area, r: Range, areaIndex: number) => Rect
    ) => {
      viewport.areas.forEach((area, index) => {
        const target = _overlayer.areas[index];
        _selector._ranges.forEach((it, i) => {
          if (intersectsFunc(area.range, it)) {
            _selector.addArea(i, rectFunc(area, it, index), target);
          }
        });
        const { _focusRange, _copyRange } = _selector;
        if (_focusRange) {
          if (intersectsFunc(area.range, _focusRange)) {
            _selector.addFocusArea(rectFunc(area, _focusRange, index), target);
          }
        }
        if (_copyRange) {
          if (intersectsFunc(area.range, _copyRange)) {
            _selector.addCopyArea(rectFunc(area, _copyRange, index), target);
          }
        }
      });
    };

    const addHeaderAreas = (type: 'row' | 'col', areaIndexes: number[]) => {
      areaIndexes.forEach((index) => {
        const area = viewport.headerAreas[index];
        const target = _overlayer.headerAreas[index];
        if (type === 'row') {
          _selector._rowHeaderRanges.forEach((it) => {
            if (area.range.intersectsRow(it.startRow, it.endRow)) {
              _selector.addRowHeaderArea(area.rectRow(it.startRow, it.endRow), target);
            }
          });
        } else {
          _selector._colHeaderRanges.forEach((it) => {
            if (area.range.intersectsCol(it.startCol, it.endCol)) {
              _selector.addColHeaderArea(area.rectCol(it.startCol, it.endCol), target);
            }
          });
        }
      });
    };

    if (_placement === 'all') {
      _selector
        .addArea(0, { x, y, width, height }, _container)
        .addRowHeaderArea({ x: 0, y, width: x, height }, _container)
        .addColHeaderArea({ x, y: 0, width, height: y }, _container);
    } else if (_placement === 'row-header') {
      addAreas(
        (r, r1) => r.intersectsRow(r1.startRow, r1.endRow),
        (area, r1, areaIndex) => {
          const rectr = area.rectRow(r1.startRow, r1.endRow);
          // hide overlap border
          rectr.width += borderWidth;
          if (areaIndex === 0 || areaIndex === 3) rectr.x -= borderWidth;
          return rectr;
        }
      );
      addHeaderAreas('row', [2, 3]);
      [0, 1].forEach((index) => {
        _selector.addColHeaderArea({ x: 0, y: 0, width, height: y }, _overlayer.headerAreas[index]);
      });
    } else if (_placement === 'col-header') {
      addAreas(
        (r, r1) => r.intersectsCol(r1.startCol, r1.endCol),
        (area, r1, areaIndex) => {
          const rect = area.rectCol(r1.startCol, r1.endCol);
          // hide overlap border
          rect.height += borderWidth;
          if (areaIndex === 2 || areaIndex === 3) rect.y -= borderWidth;
          return rect;
        }
      );
      addHeaderAreas('col', [0, 1]);
      [2, 3].forEach((index) => {
        _selector.addRowHeaderArea({ x: 0, y: 0, height, width: x }, _overlayer.headerAreas[index]);
      });
    } else {
      addAreas(
        (r, r1) => r.intersects(r1),
        (area, r1) => area.rect(r1)
      );
      addHeaderAreas('row', [2, 3]);
      addHeaderAreas('col', [0, 1]);
    }
  }
}

function move(t: Table, direction: 'up' | 'down' | 'left' | 'right', step?: number) {
  const { _selector, _data, _vScrollbar, _hScrollbar } = t;
  const { viewport } = t._renderer;
  if (_selector && viewport) {
    let [ofr, ofc] = _selector._focus;

    const { _focusRange } = _selector;
    // next [row, col]
    if (_focusRange) {
      const { startRow, startCol, endRow, endCol } = _focusRange;
      const { rows, cols } = _data;

      let [r, c] = _selector._focus;

      if (step) {
        const getShowRowIndex = (index: number, offset: number) => {
          for (;;) {
            const r = t.row(index);
            if (r && r.hide) index += offset;
            else return index;
          }
        };
        const getShowColIndex = (index: number, offset: number) => {
          for (;;) {
            const r = t.col(index);
            if (r && r.hide) index += offset;
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
        addRange(t, r, c, true);
      }
    }

    // move to start or end
    if (!step) {
      if (direction === 'up') {
        _vScrollbar?.scrollToStart();
      } else if (direction === 'down') {
        _vScrollbar?.scrollToEnd();
      } else if (direction === 'left') {
        _hScrollbar?.scrollToStart();
      } else if (direction === 'right') {
        _hScrollbar?.scrollToEnd();
      }
      reset(t);
      return;
    }

    // it scroll to start when focus-range is before freeze and direction in (down | right)
    if (_data.freeze && (direction === 'down' || direction === 'right')) {
      const [fc1, fr1] = expr2xy(_data.freeze);
      const [srows, scols] = _data.scroll;
      if (ofr + 1 === fr1 && srows > 0) {
        _vScrollbar?.scrollToStart();
        return;
      }
      if (ofc + 1 === fc1 && scols > 0) {
        _hScrollbar?.scrollToStart();
        return;
      }
    }

    // scroll by step
    const [, , , area4] = viewport.areas;
    const [fr, fc] = _selector._focus;
    const { startRow, startCol, endRow, endCol } = area4.range;
    if (viewport.inAreas(fr, fc) && endRow !== fr && endCol !== fc) {
      reset(t);
    } else {
      const { _focusRange } = _selector;
      let [rows, cols] = [Math.abs(fr - ofr), Math.abs(fc - ofc)];
      if (_focusRange) {
        rows += _focusRange.rows;
        cols += _focusRange.cols;
      }
      if (direction === 'up') {
        _vScrollbar?.scrollBy(-t.rowsHeight(fr, fr + rows), true);
      } else if (direction === 'down') {
        _vScrollbar?.scrollBy(t.rowsHeight(startRow, startRow + rows), true);
      } else if (direction === 'left') {
        _hScrollbar?.scrollBy(-t.colsWidth(fc, fc + cols), true);
      } else if (direction === 'right') {
        _hScrollbar?.scrollBy(t.colsWidth(startCol, startCol + cols), true);
      }
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
  setCellValue,
  addRange,
  unionRange,
  reset,
  move,
  showCopy,
  clearCopy,
};
