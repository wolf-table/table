import Table from '.';
import Editor from './editor';
import selector from './index.selector';
import { cellValueString } from './data';

function init(t: Table) {
  t._editor = new Editor(t._container, t._width, t._height, `13px`, 'Lato');
  const { _editor, _selector } = t;
  // _editor.inputChange((text) => {});
  _editor.moveChange((direction, value) => {
    selector.setCellValue(t, value);
    if (direction !== 'none' && _selector) {
      selector.move(t, true, direction, 1);
      t._canvas.focus();
    }
  });
}

function move(t: Table) {
  const { _editor, _selector } = t;
  if (_editor && _selector) {
    const { _focusArea } = _selector;
    if (_editor.visible && _focusArea) {
      const { _rect, _target } = _focusArea;
      if (_rect && _target) {
        _editor.rect(_rect).target(_target);
      } else {
        _editor.rect({ x: -100, y: -100, width: 0, height: 0 });
      }
    }
  }
}

function reset(t: Table) {
  const { _selector, _editor } = t;
  if (_selector && _editor) {
    const { _focusRange, _focusArea } = _selector;
    if (_focusRange && _focusArea) {
      const { _rect, _target } = _focusArea;
      if (_rect && _target) {
        _editor.rect(_rect).target(_target);
      }
      const cell = t.cell(_focusRange.startRow, _focusRange.startCol);
      if (cell) {
        _editor.value(cellValueString(cell));
      }
    }
  }
}

export default {
  init,
  move,
  reset,
};
