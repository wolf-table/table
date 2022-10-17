import Table from '.';
import { expr2xy, Rect, Range, Area } from 'table-renderer';
import { colsWidth, rowsHeight, scrollx, scrolly, cellValueString } from './data';
import { borderWidth } from './config';
import { bind, unbind } from './event';
import Scrollbar from './scrollbar';
import Resizer from './resizer';
import Editor from './editor';
import HElement, { h } from './element';

// methods ---- start ----
export function resizeContentRect(t: Table) {
  t._contentRect = {
    x: t._rowHeader.width,
    y: t._colHeader.height,
    width: colsWidth(t._data),
    height: rowsHeight(t._data),
  };
}

export function setSelectedRangesValue(t: Table, value: string) {
  const { _selector } = t;
  if (_selector) {
    const { oldRanges, ranges } = _selector;
    (oldRanges.length > 0 ? oldRanges : ranges).forEach((range) => {
      range.each((r, c) => {
        t.cell(r, c, { value });
      });
    });
    t.render();
  }
}

export function resetSelector(t: Table) {
  const { _selector, _overlayer, _container, _rowHeader, _colHeader } = t;
  const { viewport } = t._renderer;
  if (_selector && viewport) {
    const { _placement } = _selector;
    _selector.clearTargets();

    const x = _rowHeader.width;
    const y = _colHeader.height;
    const width = t._width() - x;
    const height = t._height() - y;

    const addAreaRects = (
      intersectsFunc: (r: Range, r1: Range) => boolean,
      rectFunc: (area: Area, r: Range, areaIndex: number) => Rect
    ) => {
      viewport.areas.forEach((area, index) => {
        let intersects = false;
        const target = _overlayer.areas[index];
        _selector.ranges.forEach((r, i) => {
          if (intersectsFunc(area.range, r)) {
            intersects = true;
            _selector.addAreaRect(i, rectFunc(area, r, index));
          }
        });
        const { focusRange } = _selector;
        if (focusRange) {
          if (intersectsFunc(area.range, focusRange)) {
            _selector.setFocusRectAndTarget(rectFunc(area, focusRange, index), target);
          }
        }
        if (intersects) _selector.addTarget(target);
      });
    };

    const addHeaderAreaRects = (type: 'row' | 'col', areaIndexes: number[]) => {
      areaIndexes.forEach((index) => {
        const area = viewport.headerAreas[index];
        let intersects = false;
        (type === 'row' ? _selector.rowHeaderRanges : _selector.colHeaderRanges).forEach((r) => {
          if (type === 'row') {
            if (area.range.intersectsRow(r.startRow, r.endRow)) {
              intersects = true;
              _selector.addRowHeaderAreaRect(area.rectRow(r.startRow, r.endRow));
            }
          } else {
            if (area.range.intersectsCol(r.startCol, r.endCol)) {
              intersects = true;
              _selector.addColHeaderAreaRect(area.rectCol(r.startCol, r.endCol));
            }
          }
        });
        if (intersects) _selector.addTarget(_overlayer.headerAreas[index]);
      });
    };

    if (_placement === 'all') {
      _selector
        .addAreaRect(0, { x, y, width, height })
        .addRowHeaderAreaRect({ x: 0, y, width: x, height })
        .addColHeaderAreaRect({ x, y: 0, width, height: y })
        .addTarget(_container);
    } else if (_placement === 'row-header') {
      addAreaRects(
        (r, r1) => r.intersectsRow(r1.startRow, r1.endRow),
        (area, r1, areaIndex) => {
          const rect = area.rectRow(r1.startRow, r1.endRow);
          // hide overlap border
          rect.width += borderWidth;
          if (areaIndex === 0 || areaIndex === 3) rect.x -= borderWidth;
          return rect;
        }
      );
      addHeaderAreaRects('row', [2, 3]);
      [0, 1].forEach((index) => {
        _selector
          .addColHeaderAreaRect({ x: 0, y: 0, width, height: y })
          .addTarget(_overlayer.headerAreas[index]);
      });
    } else if (_placement === 'col-header') {
      addAreaRects(
        (r, r1) => r.intersectsCol(r1.startCol, r1.endCol),
        (area, r1, areaIndex) => {
          const rect = area.rectCol(r1.startCol, r1.endCol);
          // hide overlap border
          rect.height += borderWidth;
          if (areaIndex === 2 || areaIndex === 3) rect.y -= borderWidth;
          return rect;
        }
      );
      addHeaderAreaRects('col', [0, 1]);
      [2, 3].forEach((index) => {
        _selector
          .addRowHeaderAreaRect({ x: 0, y: 0, height, width: x })
          .addTarget(_overlayer.headerAreas[index]);
      });
    } else {
      addAreaRects(
        (r, r1) => r.intersects(r1),
        (area, r1) => area.rect(r1)
      );
      addHeaderAreaRects('row', [2, 3]);
      addHeaderAreaRects('col', [0, 1]);
    }
  }
}

export function tableMoveSelector(t: Table, direction: 'up' | 'down' | 'left' | 'right') {
  const { _selector, _data } = t;
  const { viewport } = t._renderer;
  if (_selector && viewport) {
    let [fr, fc] = _selector.focus;
    _selector.move(direction, 1);
    if (_data.freeze && (direction === 'down' || direction === 'right')) {
      const [fc1, fr1] = expr2xy(_data.freeze);
      const [srows, scols] = _data.scroll;
      if (fr + 1 === fr1 && srows > 0) {
        t._vScrollbar?.scroll(0);
        return;
      }
      if (fc + 1 === fc1 && scols > 0) {
        t._hScrollbar?.scroll(0);
        return;
      }
    }

    const [, , , area4] = viewport.areas;
    [fr, fc] = _selector.focus;
    const { focusRange } = _selector;
    let [rows, cols] = [1, 1];
    if (focusRange) {
      rows += focusRange.rows;
      cols += focusRange.cols;
    }
    const { startRow, startCol, endRow, endCol } = area4.range;
    if (viewport.inAreas(fr, fc) && endRow !== fr && endCol !== fc) {
      resetSelector(t);
    } else {
      if (direction === 'up') {
        t._vScrollbar?.scrollBy(-t.rowsHeight(fr, fr + rows), true);
      } else if (direction === 'down') {
        t._vScrollbar?.scrollBy(t.rowsHeight(startRow, startRow + rows), true);
      } else if (direction === 'left') {
        t._hScrollbar?.scrollBy(-t.colsWidth(fc, fc + cols), true);
      } else if (direction === 'right') {
        t._hScrollbar?.scrollBy(t.colsWidth(startCol, startCol + cols), true);
      }
    }
  }
}

export function initScrollbars(t: Table) {
  // scrollbar
  t._vScrollbar = new Scrollbar('vertical', t._container).change((direction, value) => {
    if (scrolly(t._data, direction, value)) {
      t.render();
      resetSelector(t);
      moveEditor(t);
    }
  });

  t._hScrollbar = new Scrollbar('horizontal', t._container).change((direction, value) => {
    if (scrollx(t._data, direction, value)) {
      t.render();
      resetSelector(t);
      moveEditor(t);
    }
  });
}

// invoke it after rendered
export function resizeScrollbars(t: Table) {
  const { x, y, height, width } = t._contentRect;
  if (t._vScrollbar) {
    t._vScrollbar.resize(t._height(), height + y);
  }
  if (t._hScrollbar) {
    t._hScrollbar.resize(t._width(), width + x);
  }
}

export function initResizers(t: Table) {
  t._rowResizer = new Resizer(
    'row',
    t._container,
    t._minRowHeight,
    () => t._width(),
    (value, { row, height }) => {
      t.rowHeight(row, height + value).render();
      resetSelector(t);
      t._canvas.focus();
    }
  );
  t._colResizer = new Resizer(
    'col',
    t._container,
    t._minColWidth,
    () => t._height(),
    (value, { col, width }) => {
      t.colWidth(col, width + value).render();
      resetSelector(t);
      t._canvas.focus();
    }
  );
}

export function initEditor(t: Table) {
  t._editor = new Editor(t._container, t._width, t._height, `13px`, 'Arial');
  const { _editor, _selector } = t;
  _editor.inputChange((text) => {});
  _editor.moveChange((direction, value) => {
    if (direction !== 'none' && _selector) {
      tableMoveSelector(t, direction);
      t._canvas.focus();
    }
    setSelectedRangesValue(t, value);
  });
}

export function moveEditor(t: Table) {
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

export function resetEditor(t: Table) {
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

export function canvasBindMousedown(t: Table, hcanvas: HElement) {
  hcanvas.on('mousedown', (evt) => {
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
        resetSelector(t);

        if (placement !== 'all') {
          const { left, top } = hcanvas.rect();
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
                resetSelector(t);
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
  });
}

export function canvasBindMousemove(t: Table, hcanvas: HElement) {
  hcanvas.on('mousemove', (evt) => {
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
  });
}

export function canvasBindWheel(t: Table, hcanvas: HElement) {
  hcanvas.on('wheel.prevent', (evt) => {
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
  });
}

export function canvasBindDblclick(t: Table, hcanvas: HElement) {
  hcanvas.on('dblclick.prevent', () => {
    resetEditor(t);
  });
}

export function canvasBindKeydown(t: Table, hcanvas: HElement) {
  hcanvas.on('keydown', (evt) => {
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
      resetEditor(t);
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
      tableMoveSelector(t, direction);
      evt.preventDefault();
    }
  });
}
// methods ---- end ------
