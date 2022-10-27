import Table from '.';
import { Range } from 'table-renderer';
import { DataCellValue } from './data';
import selector from './index.selector';
import editor from './index.editor';
import { bind, unbind } from './event';

export function initEvents(t: Table) {
  const { _canvas } = t;
  _canvas
    .on('mousedown', (evt) => mousedownHandler(t, evt))
    .on('mousemove', (evt) => mousemoveHandler(t, evt))
    .on('keydown', (evt) => keydownHandler(t, evt))
    .on('wheel.prevent', (evt) => wheelHandler(t, evt))
    .on('dblclick.prevent', () => {
      editor.reset(t);
    });
}

function mousedownHandler(t: Table, evt: any) {
  const { _selector, _renderer, _editor } = t;
  const { viewport } = _renderer;
  let cache = { row: 0, col: 0 };
  if (_selector && viewport) {
    const { offsetX, offsetY, ctrlKey, metaKey, shiftKey } = evt;
    const vcell = viewport.cellAt(offsetX, offsetY);
    if (vcell) {
      const { placement, row, col } = vcell;
      if (shiftKey) {
        _selector.unionRange(row, col);
      } else {
        cache = { row, col };
        _selector.placement(placement).addRange(row, col, !(metaKey || ctrlKey));
      }
      selector.reset(t);

      if (placement !== 'all') {
        const { left, top } = t._canvas.rect();
        const moveHandler = (e: any) => {
          let [x1, y1] = [0, 0];
          if (e.x > 0) x1 = e.x - left;
          if (e.y > 0) y1 = e.y - top;
          if (placement === 'row-header') x1 = 1;
          if (placement === 'col-header') y1 = 1;

          const c1 = viewport.cellAt(x1, y1);
          if (c1) {
            const { row, col } = c1;
            if (row != cache.row || col !== cache.col) {
              _selector.unionRange(row, col);
              selector.reset(t);
              cache = { row, col };
            }
          }
        };
        const upHandler = () => {
          unbind(window, 'mousemove', moveHandler);
          unbind(window, 'mouseup', upHandler);
        };
        bind(window, 'mousemove', moveHandler);
        bind(window, 'mouseup', upHandler);
      }
    }
  }

  if (_editor) {
    _editor.finished();
  }
}

function mousemoveHandler(t: Table, evt: any) {
  const { _rowResizer, _colResizer, _renderer } = t;
  const { viewport } = _renderer;
  const { buttons, offsetX, offsetY } = evt;
  // press the mouse left button
  if (viewport && buttons === 0) {
    const { _rowHeader, _colHeader } = t._renderer;
    if (_rowResizer && _rowHeader.width > 0) {
      if (offsetX < _rowHeader.width && offsetY > _colHeader.height) {
        const cell = viewport.cellAt(offsetX, offsetY);
        if (cell) _rowResizer.show(cell);
      } else {
        _rowResizer.hide();
      }
    }
    if (_colResizer && _colHeader.height > 0) {
      if (offsetY < _colHeader.height && offsetX > _rowHeader.width) {
        const cell = viewport.cellAt(offsetX, offsetY);
        if (cell) _colResizer.show(cell);
      } else {
        _colResizer.hide();
      }
    }
  }
}

function wheelHandler(t: Table, evt: any) {
  const { deltaX, deltaY } = evt;
  const { _hScrollbar, _vScrollbar } = t;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (_hScrollbar) {
      _hScrollbar.scrollBy(deltaX);
    }
  } else {
    if (_vScrollbar) {
      _vScrollbar.scrollBy(deltaY);
    }
  }
}

function keydownHandler(t: Table, evt: any) {
  const { ctrlKey, shiftKey, metaKey, altKey, code } = evt;
  console.log('code:', code, evt);
  let direction = null;
  if (code === 'Enter' && !ctrlKey && !metaKey && !altKey) {
    if (shiftKey) {
      direction = 'up';
    } else {
      direction = 'down';
    }
  } else if (code === 'Tab' && !ctrlKey && !metaKey && !altKey) {
    if (shiftKey) {
      direction = 'left';
    } else {
      direction = 'right';
    }
  } else if (code.startsWith('Arrow')) {
    direction = code.substring(5).toLowerCase();
  } else if (
    !ctrlKey &&
    !metaKey &&
    !altKey &&
    (code.startsWith('Key') ||
      code.startsWith('Digit') ||
      [
        'Minus',
        'Equal',
        'Space',
        'BracketLeft',
        'BracketRight',
        'Backslash',
        'Semicolon',
        'Quote',
        'Comma',
        'Period',
        'Slash',
      ].includes(code))
  ) {
    // editor
    editor.reset(t);
    evt.preventDefault();
  } else if (code === 'KeyC' && (ctrlKey || metaKey)) {
    // copy
    const { _selector } = t;
    if (t._copyable && _selector) {
      const items: any = {};
      const range = _selector._ranges[0];
      if (range) {
        selector.showCopy(t);
        ['text/plain', 'text/html'].forEach((type) => {
          const from = range.toString();
          const text = type === 'text/html' ? t.toHtml(from) : toClipboardTextFrom(t, from);
          items[type] = new Blob([text], { type });
        });
        navigator.clipboard.write([new ClipboardItem(items)]).then(
          () => console.log('clipboard has writed success'),
          (e) => console.log('clipboard has wirted failure: ', e)
        );
      }
    }
  } else if (code === 'KeyV' && (ctrlKey || metaKey)) {
    if (t._editable) {
      navigator.clipboard.read().then((clipboardItems) => {
        if (clipboardItems.length > 0) {
          const item = clipboardItems[0];
          let onlyCopyText = shiftKey;
          if (!onlyCopyText) {
            onlyCopyText = !getClipboardText(item, 'text/html', (text) => {
              t.fill(text).render();
              // console.log('t._data:', t._data);
            });
          }
          if (onlyCopyText) {
            getClipboardText(item, 'text/plain', (text) => {
              t.fill(toArraysFromClipboardText(text)).render();
            });
          }
        }
      });
    }
  } else if (code === 'Escape') {
    selector.clearCopy(t);
  }
  if (direction) {
    selector.move(t, direction);
    evt.preventDefault();
  }
}

function toClipboardTextFrom(t: Table, from: string) {
  const fromRange = Range.with(from);
  let text = '';
  fromRange.eachRow((r) => {
    fromRange.eachCol((c) => {
      let vstr = t.cellValueString(r, c);
      if (vstr.includes('\n')) vstr = `"${vstr}"`;
      text += `${vstr}\t`;
    });
    text += '\n';
  });
  return text;
}

function toArraysFromClipboardText(text: string) {
  const arrays: DataCellValue[][] = [];
  let [rIndex, cIndex] = [0, 0];
  let str = '';
  let doubleQuotedTimesInStr = 0;

  const addStr = () => {
    arrays[rIndex] ||= [];
    arrays[rIndex][cIndex] = str;
    str = '';
  };

  for (let char of text) {
    // console.log('char:', char);
    if (char === '\t') {
      addStr();
      cIndex += 1;
      doubleQuotedTimesInStr = 0;
      continue;
    }
    if (char === '\n' && doubleQuotedTimesInStr !== 1) {
      addStr();
      rIndex += 1;
      cIndex = 0;
      continue;
    }
    if (char !== '"') {
      if (char !== '\r') str += char;
    } else {
      doubleQuotedTimesInStr += 1;
    }
  }
  if (cIndex > 0) {
    addStr();
  }
  if (arrays.length <= 0) arrays.push([text]);
  return arrays;
}

function getClipboardText(item: ClipboardItem, type: string, cb = (text: string) => {}) {
  if (item.types.includes(type)) {
    item.getType(type).then((blob) => {
      blob.text().then((text) => {
        console.log(`[${type}]: ${text}`);
        cb(text);
      });
    });
    return true;
  }
  return false;
}
