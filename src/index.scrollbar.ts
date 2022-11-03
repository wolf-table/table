import Table, { MoveDirection } from '.';
import Scrollbar from './scrollbar';
import { scrollx, scrolly } from './data';
import selector from './index.selector';
import editor from './index.editor';
import { Range } from 'table-renderer';

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

function auto(t: Table, range: Range, direction: MoveDirection, toEnd = false) {
  const { _selector, _vScrollbar, _hScrollbar, _data } = t;
  const { viewport } = t._renderer;
  if (viewport && _selector) {
    const [, area2, , area4] = viewport.areas;
    const range4 = area4.range;
    const range2 = area2.range;
    if (_vScrollbar) {
      if (direction === 'up') {
        // move up
        if (
          range.startRow <= range4.startRow &&
          range.startRow > range2.endRow
        ) {
          _vScrollbar.scrollBy(-t.rowsHeight(range.startRow, range4.startRow));
        } else if (toEnd) {
          _vScrollbar.scrollToStart();
        }
      } else if (direction === 'down') {
        // move down
        if (toEnd) {
          _vScrollbar.scrollToEnd();
        } else if (range.endRow >= range4.endRow) {
          const start = range4.startRow;
          let offset = range.endRow - range4.endRow;
          if (offset <= 0) offset = 1;
          _vScrollbar.scrollBy(t.rowsHeight(start, start + offset));
        } else if (range.endRow === range2.endRow + 1) {
          _vScrollbar.scrollToStart();
        }
      }
    }
    if (_hScrollbar) {
      if (direction === 'left') {
        // move left
        if (
          range.startCol <= range4.startCol &&
          range.startCol > range2.endCol
        ) {
          _hScrollbar.scrollBy(-t.colsWidth(range.startCol, range4.startCol));
        } else if (toEnd) {
          _hScrollbar.scrollToStart();
        }
      } else if (direction === 'right') {
        // move right
        if (toEnd) {
          _hScrollbar.scrollToEnd();
        } else if (range.endCol >= range4.endCol) {
          const start = range4.startCol;
          let offset = range.endCol - range4.endCol;
          if (offset <= 0) offset = 1;
          _hScrollbar.scrollBy(t.colsWidth(start, start + offset));
        } else if (range.endCol === range2.endCol + 1) {
          _hScrollbar.scrollToStart();
        }
      }
    }
  }
}

export default {
  init,
  resize,
  auto,
};
