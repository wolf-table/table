import HElement, { h } from '../../element';
import { borderWidth, stylePrefix } from '../../config';
import { Rect } from '@wolf-table/table-renderer';
import Editor from '..';
import { MoveDirection } from '../..';
import { cellValueString, DataCell } from '../../data';

export default class TextEditor extends Editor {
  _text: HElement = h('textarea', '');
  _textMeasure: HElement = h('div', 'measure');

  _editing: boolean = false;

  constructor() {
    super(`${stylePrefix}-editor`);
    this._.append(this._text, this._textMeasure);
    this._text
      .on('keydown', (evt) => {
        keydownHandler(this, evt);
      })
      .on('input', ({ target }) => {
        const { value } = target;
        this._editing = true;
        this._value = value;
        this._changer(value);
        resizeSize(this);
      });
  }

  value(v: DataCell) {
    super.value(v);
    this._text.value(cellValueString(v) || '');
    resizeSize(this);
    return this;
  }

  rect(rect: Rect | null) {
    super.rect(rect);
    if (rect) {
      setTimeout(() => {
        const { _value } = this;
        let position = 0;
        if (_value !== null) {
          position = cellValueString(_value).length;
        }
        const el = this._text.element();
        el.focus();
        el.setSelectionRange(position, position);
      }, 0);
    }
    return this;
  }

  hide() {
    super.hide();
    this._editing = false;
    return this;
  }
}

function resizeSize(editor: TextEditor) {
  const { _, _value, _rect, _textMeasure, _target } = editor;
  if (typeof _value !== 'string') return;
  // const txts = _value.split('\n');
  let measureHtml = _value.replace('\n', '<br/>');
  if (_value.endsWith('\n')) measureHtml += 'T';
  _textMeasure.html(measureHtml);

  if (_rect && _target) {
    const padding = parseInt(
      _textMeasure.computedStyle().getPropertyValue('padding')
    );
    const toffset = _target.offset();
    const maxWidth = toffset.width - _rect.x - borderWidth;
    const maxHeight = toffset.height - _rect.y - borderWidth;
    _.css('max-width', `${maxWidth}px`);
    _textMeasure.css('max-width', `${maxWidth - padding * 2}px`);
    const { width, height } = _textMeasure.rect();
    const minWidth = _rect.width - borderWidth;
    if (width > minWidth) {
      _.css({ width: width });
    }
    if (height > _rect.height && height <= maxHeight) {
      _.css({ height: height });
    } else if (height < _rect.height) {
      _.css({ height: _rect.height - borderWidth });
    }
  }
}

function keydownHandler(editor: TextEditor, evt: any) {
  const { code, shiftKey, metaKey, altKey, ctrlKey, target } = evt;
  const moveChanger = (direction: MoveDirection) => {
    editor._moveChanger(direction);
    editor.hide();
  };
  // console.log('code:', code, shiftKey, ctrlKey, isComposing);
  if (code === 'Enter') {
    if (ctrlKey || metaKey || altKey) {
      target.value += '\n';
      editor.value(target.value);
    } else if (shiftKey) {
      // move to up cell
      moveChanger('up');
    } else {
      // move to down cell
      moveChanger('down');
    }
    evt.preventDefault();
  } else if (code === 'Tab' && !ctrlKey && !metaKey && !altKey) {
    if (shiftKey) {
      // move to left cell
      moveChanger('left');
    } else {
      // move to right cell
      moveChanger('right');
    }
    evt.preventDefault();
    // evt.stopPropagation();
  }
}
