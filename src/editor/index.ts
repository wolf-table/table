import HElement, { h } from '../element';
import { borderWidth, stylePrefix } from '../config';
import { Rect } from 'table-render';

type MoveDirection = 'up' | 'down' | 'left' | 'right' | 'none';
type InputChanger = (value: string) => void;
type moveChanger = (direction: MoveDirection, value: string) => void;

export default class Editor {
  _: HElement = h('div', `${stylePrefix}-editor`);
  _text: HElement = h('textarea', '');
  _textMeasure: HElement = h('div', 'measure');

  _rect: Rect | null = null;
  _value: string = '';
  _editing: boolean = false;

  _maxWidth: () => number;
  _maxHeight: () => number;
  _fontSize: string;
  _fontFamily: string;

  _inputChange: InputChanger = () => {};
  _moveChange: moveChanger = () => {};

  constructor(
    target: HElement,
    maxWidth: () => number,
    maxHeight: () => number,
    fontSize: string,
    fontFamily: string
  ) {
    this._maxHeight = maxHeight;
    this._maxWidth = maxWidth;
    this._fontFamily = fontFamily;
    this._fontSize = fontSize;

    target.append(this._);
    this._.append(this._text, this._textMeasure);
    this._text
      .on('keydown', (evt) => {
        keydownHandler(this, evt);
      })
      .on('input', ({ target }) => {
        const { value } = target;
        this._editing = true;
        this._value = value;
        this._inputChange(target.value);
        resizeSize(this);
      });
  }

  appendTo(target: HElement): Editor {
    target.append(this._);
    return this;
  }

  value(): string;
  value(text: string): void;
  value(text?: string) {
    if (text !== undefined) {
      this._value = text;
      this._text.value(text);
      resizeSize(this);
    } else {
      return this._value;
    }
  }

  finished() {
    if (this._editing) {
      this._moveChange('none', this._value);
    }
    this.hide();
  }

  show(rect: Rect | null) {
    if (rect) {
      this._rect = rect;
      const { x, y, width, height } = rect;
      this._.css({
        left: x - borderWidth / 2,
        top: y - borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
      }).show();
      setTimeout(() => {
        const position = this._value.length;
        const el = this._text.element();
        el.focus();
        el.setSelectionRange(position, position);
      }, 0);
    }
  }

  hide() {
    this._editing = false;
    this.value('');
    this._.hide();
  }

  inputChange(value: InputChanger) {
    this._inputChange = value;
  }

  moveChange(value: moveChanger) {
    this._moveChange = value;
  }
}

function resizeSize(editor: Editor) {
  const { _value, _rect, _maxWidth, _maxHeight, _textMeasure } = editor;
  const txts = _value.split('\n');
  let measureHtml = _value.replace('\n', '<br/>');
  if (_value.endsWith('\n')) measureHtml += 'T';
  _textMeasure.html(measureHtml);
  if (_rect) {
    const maxWidth = _maxWidth() - _rect.x;
    const maxHeight = _maxHeight() - _rect.y;
    _textMeasure.css('maxWidth', `${maxWidth}px`);
    const { width, height } = _textMeasure.rect();
    const minWidth = _rect.width - borderWidth;
    if (width > minWidth && width < maxWidth) {
      editor._.css({ width });
    }
    if (height > _rect.height && height < maxHeight) {
      editor._.css({ height });
    } else if (height < _rect.height) {
      editor._.css({ height: _rect.height - borderWidth });
    }
  }
}

function keydownHandler(editor: Editor, evt: any) {
  const { code, shiftKey, metaKey, altKey, ctrlKey, target } = evt;
  const moveChanger = (direction: MoveDirection) => {
    editor._moveChange(direction, editor._value);
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
