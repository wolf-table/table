import Table from '.';
import Scrollbar from './scrollbar';
import { scrollx, scrolly } from './data';
import selector from './index.selector';
import editor from './index.editor';

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

export default {
  init,
  resize,
};
