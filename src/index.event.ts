import Table from '.';
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
    const { _rowHeader, _colHeader } = t;
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
    console.log('copy');
  } else if (code === 'KeyV' && (ctrlKey || metaKey)) {
    console.log('Pasted text: ', navigator.clipboard);
    // const text = await navigator.clipboard.readText();
    navigator.clipboard.read().then((clipboardItems) => {
      if (clipboardItems.length > 0) {
        clipboardItems[0].getType('text/html').then((blob) => {
          blob.text().then((text) => {
            console.log('text', text);
          });
        });
      }
    });
    /*
      for (const type of clipboardItem.types) {
        const blob = await clipboardItem.getType(type);
        console.log(await blob.text());
        console.log(URL.createObjectURL(blob));
      }
      */
    // paste
    console.log('paste');
  }
  if (direction) {
    selector.move(t, direction);
    evt.preventDefault();
  }
}
