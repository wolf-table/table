import Table from '.';
import selector from './index.selector';
import { DataCell } from './data';
import Editor from './editor';

function get(t: Table, cell: DataCell) {
  let type = 'text';
  if (cell instanceof Object && cell.type) type = cell.type;
  const { _editors } = t;
  const editor: Editor = _editors.get(type);
  editor.changer((value) => {
    if (value !== null) {
      selector.setCellValue(t, value);
    }
  });
  editor.moveChanger((direction) => {
    const { _selector } = t;
    if (direction !== 'none' && _selector) {
      selector.move(t, true, direction, 1);
      t._canvas.focus();
    }
  });
  return editor;
}

function move(t: Table) {
  const { _editor, _selector, _renderer } = t;
  // console.log('_editor', _editor, _selector);
  if (_editor && _selector) {
    const { _focusArea, _focus } = _selector;
    if (_editor.visible && _focusArea) {
      const { _rect, _target } = _focusArea;
      const { viewport } = _renderer;
      if (_rect && _target && viewport && viewport.inAreas(..._focus)) {
        _editor.rect(_rect).target(_target).show();
      } else {
        _editor.rect({ x: -100, y: -100, width: 0, height: 0 }).hide();
      }
    }
  }
}

function reset(t: Table) {
  const { _selector } = t;
  if (_selector) {
    const { _focusRange, _focusArea } = _selector;
    if (_focusRange && _focusArea) {
      const { _rect, _target } = _focusArea;
      const { startRow, startCol } = _focusRange;
      const cell = t.cell(startRow, startCol);
      const editor = get(t, cell);
      t._editor = editor;
      if (editor && _rect && _target) {
        // console.log('row:', startRow, ', col:', startCol, ', rect:', _rect);
        if (cell) {
          editor.value(cell);
        }
        editor.cellIndex(startRow, startCol).rect(_rect).target(_target).show();
      }
    }
  }
}

export default {
  move,
  reset,
};
