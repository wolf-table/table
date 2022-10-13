import './style.index.less';
import TableRenderer, {
  expr2xy,
  stringAt,
  CellStyle,
  ColHeader,
  RowHeader,
  Rect,
  Range,
  Area,
  Border,
  Formatter,
} from 'table-renderer';
import {
  defaultData,
  TableData,
  row,
  col,
  colsWidth,
  rowsHeight,
  rowHeight,
  colWidth,
  merge,
  unmerge,
  isMerged,
  scrollx,
  scrolly,
  Cells,
  FormulaParser,
  DataCell,
  addStyle,
  clearStyles,
  addBorder,
  clearBorder,
  clearBorders,
  DataRow,
  DataCol,
} from './data';
import HElement, { h } from './element';
import Scrollbar from './scrollbar';
import Resizer from './resizer';
import { bind, unbind } from './event';
import Selector from './selector';
import Overlayer from './overlayer';
import { stylePrefix, borderWidth } from './config';
import Editor from './editor';

export type TableOptions = {
  rowHeight?: number;
  colWidth?: number;
  minRowHeight?: number;
  minColWidth?: number;
  rows?: number;
  cols?: number;
  cellStyle?: Partial<CellStyle>;
  rowHeader?: Partial<RowHeader>;
  colHeader?: Partial<ColHeader>;
  scrollable?: boolean;
  resizable?: boolean;
  selectable?: boolean;
  editable?: boolean;
};

export default class Table {
  // for render
  _colHeader: ColHeader = {
    height: 25,
    rows: 1,
    cell(rowIndex, colIndex) {
      return stringAt(colIndex);
    },
  };
  // for render
  _rowHeader: RowHeader = {
    width: 60,
    cols: 1,
    cell(rowIndex, colIndex) {
      return rowIndex + 1;
    },
  };

  _minRowHeight: number = 25;

  _minColWidth: number = 60;

  _width: () => number;

  _height: () => number;

  // cache for rect of content
  _contentRect: Rect = { x: 0, y: 0, width: 0, height: 0 };

  _container: HElement;

  _data: TableData;

  _renderer: TableRenderer;

  _cells = new Cells();

  // scrollbar
  _vScrollbar: Scrollbar | null = null;
  _hScrollbar: Scrollbar | null = null;

  // resizer
  _rowResizer: Resizer | null = null;
  _colResizer: Resizer | null = null;

  // editor
  _editor: Editor | null = null;

  _selector: Selector | null = null;
  _overlayer: Overlayer;

  constructor(
    element: HTMLElement | string,
    width: () => number,
    height: () => number,
    options?: TableOptions
  ) {
    this._width = width;
    this._height = height;
    const container: HTMLElement | null =
      typeof element === 'string' ? document.querySelector(element) : element;
    if (container === null) throw new Error('first argument error');
    this._container = h(container, `${stylePrefix}-container`).css({ height: height(), width: width() });
    this._data = defaultData();

    // update default data
    if (options) {
      const { cols, rows, rowHeight, colWidth, minRowHeight, minColWidth, cellStyle, rowHeader, colHeader } =
        options;
      const { _data } = this;
      if (minRowHeight) this._minRowHeight = minRowHeight;
      if (minColWidth) this._minColWidth = minColWidth;
      if (cols) _data.cols.len = cols;
      if (rows) _data.rows.len = rows;
      if (rowHeight) _data.rowHeight = rowHeight;
      if (colWidth) _data.colWidth = colWidth;
      if (cellStyle) Object.assign(_data.style, cellStyle);
      if (rowHeader) Object.assign(this._rowHeader, rowHeader);
      if (colHeader) Object.assign(this._colHeader, colHeader);
    }

    // resize rect of content
    resizeContentRect(this);

    const canvasElement = document.createElement('canvas');
    // tabIndex for trigger keydown event
    const hcanvas = h(canvasElement).attr('tabIndex', '1');
    this._container.append(canvasElement);
    this._renderer = new TableRenderer(canvasElement, width(), height());

    this._overlayer = new Overlayer(this._container);

    // scroll
    if (options?.scrollable) {
      // init scrollbars
      initScrollbars(this);
    }

    if (options?.resizable) {
      // init resizers
      initResizers(this);
    }

    if (options?.selectable) {
      this._selector = new Selector(this._data);
    }

    if (options?.editable) {
      initEditor(this);
    }

    canvasBindWheel(this, hcanvas);
    canvasBindMousemove(this, hcanvas);
    canvasBindMousedown(this, hcanvas);
    canvasBindDblclick(this, hcanvas);
    canvasBindKeydown(this, hcanvas);
  }

  data(): TableData;
  data(data: Partial<TableData>): Table;
  data(data?: any): any {
    if (data) {
      Object.assign(this._data, data);
      this._cells.load(this._data);
      resizeContentRect(this);
      return this;
    } else {
      return this._data;
    }
  }

  contentRect() {
    return this._contentRect;
  }

  resize() {
    this._container.css({ height: this._height(), width: this._width() });
    this.render();
  }

  freeze(ref: string) {
    if (ref) this._data.freeze = ref;
    return this;
  }

  isMerged(): boolean;
  isMerged(ref: string): boolean;
  isMerged(ref?: string) {
    if (ref) return isMerged(this._data, ref);
    else {
      const { _selector } = this;
      if (_selector) {
        return _selector.ranges.every((it) => isMerged(this._data, it.toString()));
      }
    }
    return false;
  }

  merge(): Table;
  // ref: A1 | A1:B10
  merge(ref: string): Table;
  merge(ref?: string) {
    if (ref) merge(this._data, ref);
    else {
      const { _selector } = this;
      if (_selector) {
        _selector.ranges.forEach((it) => merge(this._data, it.toString()));
      }
    }
    return this;
  }

  unmerge(): Table;
  // ref: A1 | A1:B10
  unmerge(ref: string): Table;
  unmerge(ref?: string) {
    if (ref) unmerge(this._data, ref);
    else {
      const { _selector } = this;
      if (_selector) {
        _selector.ranges.forEach((it) => unmerge(this._data, it.toString()));
      }
    }
    return this;
  }

  row(index: number): DataRow;
  row(index: number, value: Partial<DataRow>): Table;
  row(index: number, value?: Partial<DataRow>): any {
    if (value) {
      if (value.height) {
        this.rowHeight(index, value.height);
      }
      row(this._data, index, value);
      return this;
    }
    return row(this._data, index);
  }

  rowHeight(index: number): number;
  rowHeight(index: number, value: number): Table;
  rowHeight(index: number, value?: number): any {
    const oldValue = rowHeight(this._data, index);
    if (value) {
      if (oldValue !== value) {
        rowHeight(this._data, index, value);
        this._contentRect.height += value - oldValue;
      }
      return this;
    }
    return oldValue;
  }

  col(index: number): DataCol;
  col(index: number, value: Partial<DataCol>): Table;
  col(index: number, value?: Partial<DataCol>): any {
    if (value) {
      if (value.width) {
        this.colWidth(index, value.width);
      }
      col(this._data, index, value);
      return this;
    }
    return col(this._data, index);
  }

  colWidth(index: number): number;
  colWidth(index: number, value: number): Table;
  colWidth(index: number, value?: number): any {
    const oldValue = colWidth(this._data, index);
    if (value) {
      if (oldValue !== value) {
        colWidth(this._data, index, value);
        this._contentRect.width += value - oldValue;
      }
      return this;
    }
    return oldValue;
  }

  colsWidth(min: number, max: number) {
    return colsWidth(this._data, min, max);
  }

  rowsHeight(min: number, max: number) {
    return rowsHeight(this._data, min, max);
  }

  formulaParser(v: FormulaParser): Table {
    this._cells.formulaParser(v);
    return this;
  }

  formatter(v: Formatter) {
    this._cells.formatter(v);
    return this;
  }

  addStyle(value: Partial<CellStyle>) {
    return addStyle(this._data, value);
  }

  clearStyles() {
    clearStyles(this._data);
    return this;
  }

  addBorder(value: Border) {
    addBorder(this._data, value);
    return this;
  }

  clearBorder(value: string) {
    clearBorder(this._data, value);
    return this;
  }

  clearBorders() {
    clearBorders(this._data);
    return this;
  }

  cell(row: number, col: number): DataCell;
  cell(row: number, col: number, value: DataCell): Table;
  cell(row: number, col: number, value?: DataCell): any {
    const { _cells } = this;
    if (value) {
      _cells.set(row, col, value);
      return this;
    }
    return _cells.get(row, col);
  }

  render() {
    this._renderer
      .colHeader(this._colHeader)
      .rowHeader(this._rowHeader)
      .scrollRows(this._data.scroll[0])
      .scrollCols(this._data.scroll[1])
      .merges(this._data.merges)
      .freeze(this._data.freeze)
      .styles(this._data.styles)
      .borders(this._data.borders)
      .rows(this._data.rows.len)
      .cols(this._data.cols.len)
      .row((index) => row(this._data, index))
      .col((index) => col(this._data, index))
      .cell((r, c) => {
        return this.cell(r, c);
      })
      .formatter(this._cells._formatter)
      .render();

    // viewport
    const { _renderer, _overlayer } = this;
    const { viewport } = _renderer;
    if (viewport) {
      viewport.areas.forEach((rect, index) => {
        _overlayer.area(index, rect);
      });
      viewport.headerAreas.forEach((rect, index) => {
        _overlayer.headerArea(index, rect);
      });
      resizeScrollbars(this);
    }
    return this;
  }

  static create(
    element: HTMLElement | string,
    width: () => number,
    height: () => number,
    options?: TableOptions
  ): Table {
    return new Table(element, width, height, options);
  }
}

// methods ---- start ----

function resizeContentRect(t: Table) {
  t._contentRect = {
    x: t._rowHeader.width,
    y: t._colHeader.height,
    width: colsWidth(t._data),
    height: rowsHeight(t._data),
  };
}

function setSelectedRangesValue(t: Table, value: string) {
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

function resetSelector(t: Table) {
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

function tableMoveSelector(t: Table, direction: 'up' | 'down' | 'left' | 'right') {
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

function initScrollbars(t: Table) {
  // scrollbar
  t._vScrollbar = new Scrollbar('vertical', t._container).change((direction, value) => {
    if (scrolly(t._data, direction, value)) {
      t.render();
      resetSelector(t);
      showEditor(t, false);
    }
  });

  t._hScrollbar = new Scrollbar('horizontal', t._container).change((direction, value) => {
    if (scrollx(t._data, direction, value)) {
      t.render();
      resetSelector(t);
      showEditor(t, false);
    }
  });
}

// invoke it after rendered
function resizeScrollbars(t: Table) {
  const { x, y, height, width } = t._contentRect;
  if (t._vScrollbar) {
    t._vScrollbar.resize(t._height(), height + y);
  }
  if (t._hScrollbar) {
    t._hScrollbar.resize(t._width(), width + x);
  }
}

function initResizers(t: Table) {
  t._rowResizer = new Resizer(
    'row',
    t._container,
    t._minRowHeight,
    () => t._width(),
    (value, { row, height }) => {
      t.rowHeight(row, height + value).render();
      resetSelector(t);
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
    }
  );
}

function initEditor(t: Table) {
  t._editor = new Editor(t._container, t._width, t._height, `13px`, 'Arial');
  const { _editor, _selector } = t;
  _editor.inputChange((text) => {});
  _editor.moveChange((direction, value) => {
    if (direction !== 'none' && _selector) {
      tableMoveSelector(t, direction);
    }
    setSelectedRangesValue(t, value);
  });
}

function showEditor(t: Table, resetValue = true) {
  const { _selector, _editor } = t;
  if (_selector && _editor) {
    if (_selector && _selector._placement === 'body') {
      const { focusRange, focusRect, focusTarget } = _selector;
      if (focusRange && focusRect && focusTarget) {
        _editor.appendTo(focusTarget).show(focusRect);
        if (resetValue) {
          const cell = t.cell(focusRange.startRow, focusRange.startCol);
          if (cell) {
            const text = cell instanceof Object ? cell.value : cell;
            _editor.value(text + '');
          }
        }
      } else {
        _editor.hide();
      }
    } else {
      _editor.hide();
    }
  }
}

function canvasBindMousedown(t: Table, hcanvas: HElement) {
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

function canvasBindMousemove(t: Table, hcanvas: HElement) {
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

function canvasBindWheel(t: Table, hcanvas: HElement) {
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

function canvasBindDblclick(t: Table, hcanvas: HElement) {
  hcanvas.on('dblclick.prevent', () => {
    showEditor(t);
  });
}

function canvasBindKeydown(t: Table, hcanvas: HElement) {
  hcanvas.on('keydown', (evt) => {
    const { ctrlKey, shiftKey, metaKey, altKey, code } = evt;
    // console.log('code:', code);
    let direction = null;
    if (code === 'Enter' && !ctrlKey && !metaKey && !altKey) {
      if (shiftKey) {
        direction = 'up';
      } else {
        direction = 'down';
      }
      evt.preventDefault();
    } else if (code === 'Tab' && !ctrlKey && !metaKey && !altKey) {
      if (shiftKey) {
        direction = 'left';
      } else {
        direction = 'right';
      }
      evt.preventDefault();
    } else if (code.startsWith('Arrow')) {
      direction = code.substring(5).toLowerCase();
      evt.preventDefault();
    } else if (
      code.startsWith('Key') ||
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
      ].includes(code)
    ) {
      // editor
      showEditor(t);
    }
    if (direction) {
      tableMoveSelector(t, direction);
    }
  });
}

// methods ---- end ------

declare global {
  interface Window {
    wolf: any;
  }
}

if (window) {
  window.wolf ||= {};
  window.wolf.table = Table.create;
}
