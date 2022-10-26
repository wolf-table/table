import Table from '.';
import { borderWidth } from './config';
import { expr2xy, Rect, Range, Area } from 'table-renderer';

function setCellValue(t: Table, value: string) {
  const { _selector } = t;
  if (_selector) {
    const { _ranges } = _selector;
    _ranges.forEach((range) => {
      range.each((r, c) => {
        t.cell(r, c, { value });
      });
    });
    t.render();
  }
}

function reset(t: Table) {
  const { _selector, _overlayer, _container } = t;
  const { _rowHeader, _colHeader, viewport } = t._renderer;
  if (_selector && viewport) {
    const { _placement } = _selector;
    _selector.clearTargets();

    const x = _rowHeader.width;
    const y = _colHeader.height;
    const width = t._width() - x;
    const height = t._height() - y;

    const addAreaRects = (
      intersectsFunc: (r: Range, r1: Range) => boolean,
      rectFunc: (area: Area, r: Range, areaIndex: number) => Rect
    ) => {
      viewport.areas.forEach((area, index) => {
        let intersects = false;
        const target = _overlayer.areas[index];
        _selector._ranges.forEach((r, i) => {
          if (intersectsFunc(area.range, r)) {
            intersects = true;
            _selector.addAreaRect(i, rectFunc(area, r, index));
          }
        });
        const { _focusRange } = _selector;
        if (_focusRange) {
          if (intersectsFunc(area.range, _focusRange)) {
            _selector.setFocusRectAndTarget(rectFunc(area, _focusRange, index), target);
          }
        }
        if (intersects) _selector.addTarget(target);
      });
    };

    const addHeaderAreaRects = (type: 'row' | 'col', areaIndexes: number[]) => {
      areaIndexes.forEach((index) => {
        const area = viewport.headerAreas[index];
        let intersects = false;
        (type === 'row' ? _selector._rowHeaderRanges : _selector._colHeaderRanges).forEach((r) => {
          if (type === 'row') {
            if (area.range.intersectsRow(r.startRow, r.endRow)) {
              intersects = true;
              _selector.addRowHeaderAreaRect(area.rectRow(r.startRow, r.endRow));
            }
          } else {
            if (area.range.intersectsCol(r.startCol, r.endCol)) {
              intersects = true;
              _selector.addColHeaderAreaRect(area.rectCol(r.startCol, r.endCol));
            }
          }
        });
        if (intersects) _selector.addTarget(_overlayer.headerAreas[index]);
      });
    };

    if (_placement === 'all') {
      _selector
        .addAreaRect(0, { x, y, width, height })
        .addRowHeaderAreaRect({ x: 0, y, width: x, height })
        .addColHeaderAreaRect({ x, y: 0, width, height: y })
        .addTarget(_container);
    } else if (_placement === 'row-header') {
      addAreaRects(
        (r, r1) => r.intersectsRow(r1.startRow, r1.endRow),
        (area, r1, areaIndex) => {
          const rectr = area.rectRow(r1.startRow, r1.endRow);
          // hide overlap border
          rectr.width += borderWidth;
          if (areaIndex === 0 || areaIndex === 3) rectr.x -= borderWidth;
          return rectr;
        }
      );
      addHeaderAreaRects('row', [2, 3]);
      [0, 1].forEach((index) => {
        _selector
          .addColHeaderAreaRect({ x: 0, y: 0, width, height: y })
          .addTarget(_overlayer.headerAreas[index]);
      });
    } else if (_placement === 'col-header') {
      addAreaRects(
        (r, r1) => r.intersectsCol(r1.startCol, r1.endCol),
        (area, r1, areaIndex) => {
          const rect = area.rectCol(r1.startCol, r1.endCol);
          // hide overlap border
          rect.height += borderWidth;
          if (areaIndex === 2 || areaIndex === 3) rect.y -= borderWidth;
          return rect;
        }
      );
      addHeaderAreaRects('col', [0, 1]);
      [2, 3].forEach((index) => {
        _selector
          .addRowHeaderAreaRect({ x: 0, y: 0, height, width: x })
          .addTarget(_overlayer.headerAreas[index]);
      });
    } else {
      addAreaRects(
        (r, r1) => r.intersects(r1),
        (area, r1) => area.rect(r1)
      );
      addHeaderAreaRects('row', [2, 3]);
      addHeaderAreaRects('col', [0, 1]);
    }
  }
}

function move(t: Table, direction: 'up' | 'down' | 'left' | 'right') {
  const { _selector, _data } = t;
  const { viewport } = t._renderer;
  if (_selector && viewport) {
    let [fr, fc] = _selector._focus;
    _selector.move(direction, 1);
    if (_data.freeze && (direction === 'down' || direction === 'right')) {
      const [fc1, fr1] = expr2xy(_data.freeze);
      const [srows, scols] = _data.scroll;
      if (fr + 1 === fr1 && srows > 0) {
        t._vScrollbar?.scroll(0);
        return;
      }
      if (fc + 1 === fc1 && scols > 0) {
        t._hScrollbar?.scroll(0);
        return;
      }
    }

    const [, , , area4] = viewport.areas;
    [fr, fc] = _selector._focus;
    const { _focusRange } = _selector;
    let [rows, cols] = [1, 1];
    if (_focusRange) {
      rows += _focusRange.rows;
      cols += _focusRange.cols;
    }
    const { startRow, startCol, endRow, endCol } = area4.range;
    if (viewport.inAreas(fr, fc) && endRow !== fr && endCol !== fc) {
      reset(t);
    } else {
      if (direction === 'up') {
        t._vScrollbar?.scrollBy(-t.rowsHeight(fr, fr + rows), true);
      } else if (direction === 'down') {
        t._vScrollbar?.scrollBy(t.rowsHeight(startRow, startRow + rows), true);
      } else if (direction === 'left') {
        t._hScrollbar?.scrollBy(-t.colsWidth(fc, fc + cols), true);
      } else if (direction === 'right') {
        t._hScrollbar?.scrollBy(t.colsWidth(startCol, startCol + cols), true);
      }
    }
  }
}

export default {
  setCellValue,
  reset,
  move,
};
