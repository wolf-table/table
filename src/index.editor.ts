import Table from '.';
import Editor from './editor';
import selector from './index.selector';
import { cellValueString } from './data';

function init(t: Table) {
  t._editor = new Editor(t._container, t._width, t._height, `13px`, 'Arial');
  const { _editor, _selector } = t;
  _editor.inputChange((text) => {});
  _editor.moveChange((direction, value) => {
    if (direction !== 'none' && _selector) {
      selector.move(t, direction);
      t._canvas.focus();
    }
    selector.setCellValue(t, value);
  });
}

function move(t: Table) {
  const { _editor, _selector } = t;
  if (_editor && _selector) {
    if (_editor.visible && _selector._placement === 'body') {
      const { focusRect, focusTarget } = _selector;
      if (focusRect && focusTarget) {
        _editor.appendTo(focusTarget).show(focusRect);
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
      const { focusRange, focusRect, focusTarget } = _selector;
      if (focusRange && focusRect && focusTarget) {
        _editor.appendTo(focusTarget).show(focusRect);
        const cell = t.cell(focusRange.startRow, focusRange.startCol);
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
