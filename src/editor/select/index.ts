import { Rect } from '@wolf-table/table-renderer';
import Editor from '..';
import { stylePrefix } from '../../config';
import HElement, { h } from '../../element';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type OptionsFunc = (q: string) => Promise<(string | string[])[]>;

export default class SelectEditor extends Editor {
  _searchInput: HElement;
  _content: HElement;
  _width: number = 300;
  _height: number = 320;
  _position: Position = 'bottom-right';
  _options: OptionsFunc | null = null;

  constructor() {
    super(`${stylePrefix}-select`);
    this._searchInput = h('input').on('input', ({ target }) =>
      this.query(target.value)
    );
    this._content = h('ul', `${stylePrefix}-select-content`);
    this._.append(
      h('div', `${stylePrefix}-select-input`).append(this._searchInput),
      this._content
    );
  }

  async query(q: string) {
    if (this._options === null) return;
    this._content.html('');
    await this._options(q).then((data: any) => {
      if (data && Array.isArray(data)) {
        this._content.append(
          ...data.map((it) => {
            let li: HElement = h('li', 'item').on('click', () => {
              this._changer(
                Array.isArray(it) ? { key: it[0], value: it[1] } : it
              );
              this.hide();
            });
            if (typeof it === 'string') {
              li.append(it);
            } else if (Array.isArray(it)) {
              const [key, text, label] = it;
              li.append(text, it.length > 2 ? h('label').append(label) : '');
            }
            return li;
          })
        );
      }
    });
  }

  options(v: OptionsFunc) {
    this._options = v;
    return this;
  }

  position(v: Position) {
    this._position = v;
    return this;
  }

  rect(rect: Rect | null) {
    if (rect) {
      const { _position } = this;
      this._rect = rect;
      this._visible = true;
      const { x, y, width, height } = rect;
      let left = x,
        top = y + height;
      if (_position === 'top-right' || _position === 'bottom-right') {
        left += width - this._width;
      }
      if (_position === 'top-right' || _position === 'top-left') {
        top -= this._height;
      }
      this._.css({
        left,
        top,
        width: this._width,
        height: this._height,
      });
    }
    return this;
  }

  show() {
    this.query('');
    super.show();
    return this;
  }
}
