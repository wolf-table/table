import Table from '.';
import { Range } from '@wolf-table/table-renderer';
import { DataCellValue } from './data';
import selector from './index.selector';
import editor from './index.editor';
import scrollbar from './index.scrollbar';

export function initEvents(t: Table) {
  const { _canvas } = t;
  _canvas
    .on('mousedown', (evt) => mousedownHandler(t, evt))
    .on('mousemove', (evt) => mousemoveHandler(t, evt))
    .on('keydown', (evt) => keydownHandler(t, evt))
    .on('wheel.prevent', (evt) => wheelHandler(t, evt))
    .on('contextmenu.prevent', (evt) => contextmenuHandler(t, evt))
    .on('dblclick.prevent', () => {
      editor.reset(t);
    });
}

function mousedownHandler(t: Table, evt: any) {
  // console.log('evt:', evt);
  const { _selector, _renderer, _editor, _emitter } = t;
  const { viewport } = _renderer;

  if (_editor) {
    _editor.changed();
  }

  // let cache = { row: 0, col: 0 };
  if (_selector && viewport) {
    const { offsetX, offsetY, ctrlKey, metaKey, shiftKey } = evt;
    const vcell = viewport.cellAt(offsetX, offsetY);
    if (vcell) {
      _emitter.emit('click', vcell, evt);
      const { placement, row, col } = vcell;
      if (shiftKey) {
        selector.unionRange(t, row, col);
      } else {
        // cache = { row, col };
        _selector.placement(placement);
        selector.addRange(t, row, col, !(metaKey || ctrlKey));
        if (placement === 'body') {
          scrollbar.autoMove(t, _selector.currentRange);
        }
      }
      selector.reset(t);

      selector.bindMousemove(
        t,
        (row, col) => {
          selector.unionRange(t, row, col);
        },
        (s) => s.currentRange
      );
    }
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

function contextmenuHandler(t: Table, evt: any) {
  const { _renderer, _editor, _emitter } = t;
  const { viewport } = _renderer;

  if (_editor) {
    _editor.changed();
  }

  if (viewport) {
    const { offsetX, offsetY } = evt;
    const vcell = viewport.cellAt(offsetX, offsetY);
    _emitter.emit('contextmenu', vcell, evt);
  }
}

function keydownHandler(t: Table, evt: any) {
  const { ctrlKey, shiftKey, metaKey, altKey, code } = evt;
  // console.log('code:', code, evt);
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
      const range = _selector.currentRange;
      if (range) {
        selector.showCopy(t);
        ['text/plain', 'text/html'].forEach((type) => {
          const from = range.toString();
          const text =
            type === 'text/html'
              ? t.toHtml(from)
              : toClipboardTextFrom(t, from);
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
    selector.move(
      t,
      !(code.startsWith('Arrow') && shiftKey),
      direction,
      metaKey || ctrlKey ? undefined : 1
    );
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

function getClipboardText(
  item: ClipboardItem,
  type: string,
  cb = (text: string) => {}
) {
  if (item.types.includes(type)) {
    item.getType(type).then((blob) => {
      blob.text().then((text) => {
        // console.log(`[${type}]: ${text}`);
        cb(text);
      });
    });
    return true;
  }
  return false;
}
