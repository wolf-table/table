import Table from '.';
import Scrollbar from './scrollbar';
import { scrollx, scrolly } from './data';
import selector from './index.selector';
import editor from './index.editor';
import { Range } from 'table-renderer';

function init(t: Table) {
  // scrollbar
  t._vScrollbar = new Scrollbar('vertical', t._container).change((direction, value) => {
    if (scrolly(t._data, direction, value)) {
      t.render();
      selector.reset(t);
      editor.move(t);
    }
  });

  t._hScrollbar = new Scrollbar('horizontal', t._container).change((direction, value) => {
    console.log('direction:', direction, value);
    if (scrollx(t._data, direction, value)) {
      t.render();
      selector.reset(t);
      editor.move(t);
    }
  });
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

function auto(t: Table, range: Range) {
  const { _selector, _vScrollbar, _hScrollbar } = t;
  const { viewport } = t._renderer;
  if (viewport && _selector) {
    const [, area2, , area4] = viewport.areas;
    const range4 = area4.range;
    const range2 = area2.range;
    console.log('range:', range, ', range4:', range4, t._data.scroll);
    if (range.endRow >= range4.endRow) {
      // move down
      const start = range4.startRow;
      let offset = range.endRow - range4.endRow;
      if (offset <= 0) offset = 1;
      _vScrollbar?.scrollBy(t.rowsHeight(start, start + offset));
    }
    if (range.endCol >= range4.endCol) {
      // move right
      const start = range4.startCol;
      let offset = range.endCol - range4.endCol;
      if (offset <= 0) offset = 1;
      console.log('start:', start, offset);
      _hScrollbar?.scrollBy(t.colsWidth(start, start + offset));
    }
    if (range.endRow < range4.startRow && range.startRow > range2.endRow) {
      // move up
      _vScrollbar?.scrollBy(-t.rowsHeight(range.endRow, range4.startRow));
    }
    // console.log('range: ', range, range4.startCol, range2.endCol);
    if (range.endCol < range4.startCol && range.startCol > range2.endCol) {
      // move left
      _hScrollbar?.scrollBy(-t.colsWidth(range.endCol, range4.startCol));
    }
  }
}

export default {
  init,
  resize,
  auto,
};
