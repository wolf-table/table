import { Range, Rect } from 'table-renderer';
import { stylePrefix, borderWidth } from '../config';
import { rangeUnoinMerges, TableData, row, col } from '../data';
import HElement, { h } from '../element';

class SelectArea {
  _: HElement;
  _rect: Rect | null = null;
  _target: HElement | null = null;

  constructor(classNameSuffix: string, show = false) {
    this._ = h('div', `${stylePrefix}-${classNameSuffix}`);
    if (show) this.show();
  }

  append(child: HElement) {
    this._.append(child);
    return this;
  }

  rect(value: Rect) {
    this._rect = value;
    this._.css({
      left: value.x,
      top: value.y,
      width: value.width,
      height: value.height,
    });
    return this;
  }

  target(value: HElement) {
    value.append(this._);
    this._target = value;
    return this;
  }

  show() {
    this._.show();
    return this;
  }

  clear() {
    const { _target, _ } = this;
    if (_target) {
      _target.remove(_);
      this._target = null;
    }
  }
}

type Placement = 'all' | 'row-header' | 'col-header' | 'body';

export default class Selector {
  _placement: Placement = 'body';
  _data: TableData;
  _editable = false;

  _ranges: Range[] = [];
  _rowHeaderRanges: Range[] = [];
  _colHeaderRanges: Range[] = [];
  _areas: SelectArea[] = [];

  _focus: [number, number] = [0, 0];
  _focusRange: Range | null = null;
  _focusAreas: SelectArea[] = [];

  _copyRange: Range | null | undefined = null;
  _copyAreas: SelectArea[] = [];

  constructor(data: TableData, editable: boolean) {
    this._editable = editable;
    this._data = data;
  }

  placement(value: Placement) {
    this._placement = value;
    return this;
  }

  addRange(r: number, c: number, clear: boolean = true) {
    this._focus = [r, c];
    const range = rangeUnoinMerges(this._data, Range.create(r, c));
    if (clear) {
      this._ranges.length = 0;
      this.clear();
    }
    this._ranges.push(range);
    this._focusRange = range;

    updateHeaderRanges(this);
    return this;
  }

  unionRange(r: number, c: number) {
    const range = Range.create(r, c);
    const { _focusRange } = this;
    if (_focusRange) {
      const newRange = _focusRange.union(range);
      this._ranges.splice(-1, 1, rangeUnoinMerges(this._data, newRange));
      updateHeaderRanges(this);
    }
    return this;
  }

  move(type: 'up' | 'down' | 'left' | 'right', step: number) {
    const { _focusRange } = this;
    if (_focusRange && step > 0) {
      const { startRow, startCol, endRow, endCol } = _focusRange;
      const { _data } = this;
      const { rows, cols } = _data;

      const getShowRowIndex = (index: number, offset: number) => {
        for (;;) {
          const r = row(_data, index);
          if (r && r.hide) index += offset;
          else return index;
        }
      };
      const getShowColIndex = (index: number, offset: number) => {
        for (;;) {
          const r = col(_data, index);
          if (r && r.hide) index += offset;
          else return index;
        }
      };

      let [r, c] = this._focus;
      if (type === 'up') {
        r = getShowRowIndex(startRow - step, -1);
      } else if (type === 'down') {
        r = getShowRowIndex(endRow + step, 1);
      } else if (type === 'left') {
        c = getShowColIndex(startCol - step, -1);
      } else if (type === 'right') {
        c = getShowColIndex(endCol + step, 1);
      }
      if (r >= 0 && r <= rows.len - 1 && c >= 0 && c <= cols.len - 1) {
        this.addRange(r, c, true);
      }
    }
  }

  addArea(index: number, rect: Rect, target: HElement) {
    const { x, y, width, height } = rect;
    this._areas.push(new SelectArea(`selector-area`, true).rect(rect).target(target));

    if (index === this._ranges.length - 1) {
      const outline = new SelectArea(`selector`, true)
        .rect({
          x: x - borderWidth / 2,
          y: y - borderWidth / 2,
          width: width - borderWidth,
          height: height - borderWidth,
        })
        .target(target);
      if (this._placement === 'body') outline.append(h('div', 'corner'));
      this._areas.push(outline);
    }
    return this;
  }

  addRowHeaderArea(rect: Rect, target: HElement) {
    this._areas.push(new SelectArea(`selector-area row-header`, true).rect(rect).target(target));
    return this;
  }

  addColHeaderArea(rect: Rect, target: HElement) {
    this._areas.push(new SelectArea(`selector-area col-header`, true).rect(rect).target(target));
    return this;
  }

  addFocusArea(rect: Rect, target: HElement) {
    this._focusAreas.push(new SelectArea(`selector-focus`, true).rect(rect).target(target));
    return this;
  }

  addCopyArea({ x, y, width, height }: Rect, target: HElement) {
    this._copyAreas.push(
      new SelectArea(`selector-copy`, true)
        .rect({
          x: x - borderWidth / 2,
          y: y - borderWidth / 2,
          width: width - borderWidth,
          height: height - borderWidth,
        })
        .target(target)
    );
    return this;
  }

  showCopy() {
    this._copyRange = this._ranges.at(-1);
  }

  clearCopy() {
    this._copyRange = null;
    this._copyAreas.forEach((it) => {
      it.clear();
    });
    this._copyAreas.length = 0;
  }

  clear() {
    [this._areas, this._focusAreas, this._copyAreas].forEach((it) => {
      it.forEach((it1) => it1.clear());
      it.length = 0;
    });
  }
}

function mergedRanges(
  ranges: Range[],
  sort: (a: Range, b: Range) => number,
  intersects: (a: Range, b: Range) => boolean
) {
  ranges.sort(sort);
  let current = ranges[0];
  const nRanges = [];
  if (ranges.length === 1) nRanges.push(current);
  for (let i = 1; i < ranges.length; i += 1) {
    const r = ranges[i];
    if (intersects(current, r)) {
      current = current.union(r);
    } else {
      nRanges.push(current);
      current = r;
    }
  }
  if (ranges.length > 1) nRanges.push(current);
  return nRanges;
}

function updateHeaderRanges(s: Selector) {
  const rowHeaderRanges = [];
  const colHeaderRanges = [];
  for (let range of s._ranges) {
    if (range) {
      const { startRow, startCol, endRow, endCol } = range;
      if (startRow > 0 || endRow > 0) {
        rowHeaderRanges.push(Range.create(startRow, 0, endRow, 0));
      }
      if (startCol > 0 || endCol > 0) {
        colHeaderRanges.push(Range.create(0, startCol, 0, endCol));
      }
    }
  }

  s._rowHeaderRanges = mergedRanges(
    rowHeaderRanges,
    (a, b) => a.startRow - b.startRow,
    (a, b) => a.intersectsRow(b.startRow, b.endRow)
  );
  s._colHeaderRanges = mergedRanges(
    colHeaderRanges,
    (a, b) => a.startCol - b.startCol,
    (a, b) => a.intersectsCol(b.startCol, b.endCol)
  );
}
