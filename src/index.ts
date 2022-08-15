import './style.index.less';
import TableRender, {
  stringAt,
  CellStyle,
  ColHeader,
  RowHeader,
  Rect,
  Range,
  Area,
  Border,
} from 'table-render';
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
  Scroll,
  Cells,
  FormulaFunc,
  DataCell,
  addStyle,
  clearStyles,
  addBorder,
  clearBorder,
  clearBorders,
} from './data';
import HElement, { h } from './element';
import Scrollbar from './scrollbar';
import Resizer from './resizer';
import { bind, unbind } from './event';
import Selector from './selector';
import Overlayer from './overlayer';
import { stylePrefix, borderWidth } from './config';

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

  _container: HElement;

  _data: TableData;

  _render: TableRender;

  _cells = new Cells();

  // scrollbar
  _vScrollbar: Scrollbar | null = null;
  _hScrollbar: Scrollbar | null = null;

  // resizer
  _rowResizer: Resizer | null = null;
  _colResizer: Resizer | null = null;

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

    const canvasElement = document.createElement('canvas');
    const hcanvas = h(canvasElement);
    this._container.append(canvasElement);
    this._render = new TableRender(canvasElement, width(), height());

    this._overlayer = new Overlayer(this._container);

    // scroll
    if (options?.scrollable) {
      // init scrollbars
      tableInitScrollbars(this);
    }

    if (options?.resizable) {
      // init resizers
      tableInitResizers(this);
    }

    if (options?.selectable) {
      this._selector = new Selector(this._data);
    }

    // canvas bind wheel
    tableCanvasBindWheel(this, hcanvas);
    // canvas bind mousemove
    tableCanvasBindMousemove(this, hcanvas);
    // canvas bind mousedown
    tableCanvasBindMousedown(this, hcanvas);
  }

  data(): TableData;
  data(data: Partial<TableData>): Table;
  data(data?: any): any {
    if (data) {
      Object.assign(this._data, data);
      this._cells.load(this._data);
      return this;
    } else {
      return this._data;
    }
  }

  resize() {
    this._container.css({ height: this._height(), width: this._width() });
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

  rowHeight(index: number, value: number) {
    rowHeight(this._data, index, value);
    return this;
  }

  colWidth(index: number, value: number) {
    colWidth(this._data, index, value);
    return this;
  }

  colsWidth(min: number, max: number) {
    return colsWidth(this._data, min, max);
  }

  rowsHeight(min: number, max: number) {
    return rowsHeight(this._data, min, max);
  }

  formula(v: FormulaFunc): Table {
    this._cells.formula(v);
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
    // console.log('scroll:', this._data.scroll);
    this._render
      .colHeader(this._colHeader)
      .rowHeader(this._rowHeader)
      .scrollRows(this._data.scroll[1])
      .scrollCols(this._data.scroll[0])
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
      .render();

    // viewport
    const { _render, _overlayer } = this;
    const { viewport } = _render;
    if (viewport) {
      viewport.areas.forEach(({ x, y, width, height }, index) => {
        _overlayer.area(index, { left: x, top: y, width, height });
      });
      viewport.headerAreas.forEach(({ x, y, width, height }, index) => {
        _overlayer.headerArea(index, { left: x, top: y, width, height });
      });
      tableResizeScrollbars(this);
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

function tableResetSelector(t: Table) {
  const { _selector, _overlayer, _container, _rowHeader, _colHeader } = t;
  const { viewport } = t._render;
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
        _selector.ranges.forEach((r, i) => {
          if (intersectsFunc(area.range, r)) {
            intersects = true;
            _selector.addAreaRect(i, rectFunc(area, r, index));
          }
        });
        if (intersects) _selector.addTarget(_overlayer.areas[index]);
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

function tableInitScrollbars(t: Table) {
  const scroll = new Scroll(() => t._data);
  // scrollbar
  t._vScrollbar = new Scrollbar('vertical', t._container).change((direction, value) => {
    if (scroll.y(direction, value)) {
      t.render();
      tableResetSelector(t);
    }
  });

  t._hScrollbar = new Scrollbar('horizontal', t._container).change((direction, value) => {
    if (scroll.x(direction, value)) {
      t.render();
      tableResetSelector(t);
    }
  });
}

function tableResizeScrollbars(t: Table) {
  if (t._vScrollbar) {
    t._vScrollbar.resize(t._height(), rowsHeight(t._data));
  }
  if (t._hScrollbar) {
    t._hScrollbar.resize(t._width() - 15, colsWidth(t._data));
  }
}

function tableInitResizers(t: Table) {
  t._rowResizer = new Resizer(
    'row',
    t._container,
    t._minRowHeight,
    () => t._width(),
    (value, { row, height }) => {
      t.rowHeight(row, height + value).render();
      tableResetSelector(t);
    }
  );
  t._colResizer = new Resizer(
    'col',
    t._container,
    t._minColWidth,
    () => t._height(),
    (value, { col, width }) => {
      t.colWidth(col, width + value).render();
      tableResetSelector(t);
    }
  );
}

function tableCanvasBindMousedown(t: Table, hcanvas: HElement) {
  hcanvas.on('mousedown', (evt) => {
    const { _selector, _render, _data } = t;
    const { viewport } = _render;
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
        tableResetSelector(t);

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
                tableResetSelector(t);
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
  });
}

function tableCanvasBindMousemove(t: Table, hcanvas: HElement) {
  hcanvas.on('mousemove', (evt) => {
    const { _rowResizer, _colResizer, _render } = t;
    const { viewport } = _render;
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
        // console.log('col-resizer:');
        if (offsetY < _colHeader.height && offsetX > _rowHeader.width) {
          const cell = viewport.cellAt(offsetX, offsetY);
          // console.log('cell::', cell);
          if (cell) _colResizer.show(cell);
        } else {
          _colResizer.hide();
        }
      }
    }
  });
}

function tableCanvasBindWheel(t: Table, hcanvas: HElement) {
  hcanvas.on('wheel.prevent', (evt) => {
    const { deltaX, deltaY } = evt;
    const { _hScrollbar, _vScrollbar } = t;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (_hScrollbar) {
        const nvalue = _hScrollbar.value + deltaX;
        if (_hScrollbar.test(nvalue)) {
          _hScrollbar.scroll(nvalue);
        }
      }
    } else {
      if (_vScrollbar) {
        const nvalue = _vScrollbar.value + deltaY;
        if (_vScrollbar.test(nvalue)) {
          _vScrollbar.scroll(nvalue);
        }
      }
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
