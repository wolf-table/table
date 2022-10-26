import Table from '.';
import Editor from './editor';
import selector from './index.selector';
import { cellValueString } from './data';

function init(t: Table) {
  t._editor = new Editor(t._container, t._width, t._height, `13px`, 'Arial');
  const { _editor, _selector } = t;
  _editor.inputChange((text) => {});
  _editor.moveChange((direction, value) => {
    selector.setCellValue(t, value);
    if (direction !== 'none' && _selector) {
      selector.move(t, direction);
      t._canvas.focus();
    }
  });
}

function move(t: Table) {
  const { _editor, _selector } = t;
  if (_editor && _selector) {
    if (_editor.visible && _selector._placement === 'body') {
      const { _focusRect, _focusTarget } = _selector;
      if (_focusRect && _focusTarget) {
        _editor.appendTo(_focusTarget).show(_focusRect);
      } else {
        _editor.show({ x: -100, y: -100, width: 0, height: 0 });
      }
    }
  }
}

function reset(t: Table) {
  const { _selector, _editor } = t;
  if (_selector && _editor) {
    if (_selector._placement === 'body') {
      const { _focusRange, _focusRect, _focusTarget } = _selector;
      if (_focusRange && _focusRect && _focusTarget) {
        _editor.appendTo(_focusTarget).show(_focusRect);
        const cell = t.cell(_focusRange.startRow, _focusRange.startCol);
        if (cell) {
          _editor.value(cellValueString(cell));
        }
      }
    }
  }
}

export default {
  init,
  move,
  reset,
};
