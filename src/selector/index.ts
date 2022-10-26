import { Range, Rect } from 'table-renderer';
import { stylePrefix, borderWidth } from '../config';
import { rangeUnoinMerges, TableData, row, col } from '../data';
import HElement, { h } from '../element';

type Placement = 'all' | 'row-header' | 'col-header' | 'body';
export default class Selector {
  _ranges: Range[] = [];
  _rowHeaderRanges: Range[] = [];
  _colHeaderRanges: Range[] = [];

  _focus: [number, number] = [0, 0];
  _focusRange: Range | null = null;
  _focusRect: Rect | null = null;
  _focusArea: HElement = h('div', `${stylePrefix}-selector-focus`);
  _focusTarget: HElement | null = null;

  _placement: Placement = 'body';
  _data: TableData;

  _areas: HElement[] = [];
  _rowHeaderAreas: HElement[] = [];
  _colHeaderAreas: HElement[] = [];
  _: HElement | null = null;
  _corner: HElement;

  _targets: HElement[] = [];
  _targetChildren: Node[][] = [];

  constructor(data: TableData) {
    this._corner = h('div', 'corner');
    this._data = data;
  }

  placement(): Placement;
  placement(value: Placement): Selector;
  placement(value?: Placement): any {
    if (value === undefined) return this._placement;
    this._placement = value;
    return this;
  }

  addRange(r: number, c: number, clear: boolean = true) {
    this._focus = [r, c];
    const range = rangeUnoinMerges(this._data, Range.create(r, c));
    if (clear) this.clearRanges();
    this._ranges.push(range);
    this._focusRange = range;

    updateHeaderRanges(this);
    return this;
  }

  unionRange(r: number, c: number) {
    const range = Range.create(r, c);
    const { _ranges, _focusRange } = this;
    if (_focusRange) {
      const newRange = _focusRange.union(range);
      _ranges.splice(-1, 1, rangeUnoinMerges(this._data, newRange));
      updateHeaderRanges(this);
    }
    return this;
  }

  clearRanges() {
    this._ranges.length = 0;
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

  setFocusRectAndTarget(rect: Rect, target: HElement) {
    this._focusRect = rect;
    this._focusArea
      .css({
        left: rect.x + borderWidth,
        top: rect.y + borderWidth,
        width: rect.width - borderWidth * 2,
        height: rect.height - borderWidth * 2,
      })
      .show();
    target.append(this._focusArea);
    this._focusTarget = target;
  }

  addAreaRect(rangeIndex: number, rect: Rect) {
    const { x, y, width, height } = rect;
    this._areas.push(
      h('div', `${stylePrefix}-selector-area`)
        .css({
          left: x + borderWidth,
          top: y + borderWidth,
          width: width - borderWidth * 2,
          height: height - borderWidth * 2,
        })
        .show()
    );

    const last = rangeIndex === this._ranges.length - 1;
    if (last) {
      this._ = h('div', `${stylePrefix}-selector`)
        .css({
          left: x - borderWidth / 2,
          top: y - borderWidth / 2,
          width: width - borderWidth,
          height: height - borderWidth,
        })
        .show();

      if (this._placement === 'body') this._.append(this._corner);
    }
    return this;
  }

  addRowHeaderAreaRect({ x, y, width, height }: Rect) {
    this._rowHeaderAreas.push(
      h('div', `${stylePrefix}-selector-area row-header`).css({ left: x, top: y, width, height }).show()
    );
    return this;
  }

  addColHeaderAreaRect({ x, y, width, height }: Rect) {
    this._colHeaderAreas.push(
      h('div', `${stylePrefix}-selector-area col-header`).css({ left: x, top: y, width, height }).show()
    );
    return this;
  }

  addTarget(target: HElement) {
    let areas: any[];
    areas = [...this._areas, ...this._rowHeaderAreas, ...this._colHeaderAreas];
    if (this._areas.length > 0 && this._) areas.push(this._);
    target.append(...areas);
    this._targetChildren.push(areas);
    this._targets.push(target);

    // clear areas
    this.clearAreas();
    return this;
  }

  clearTargets() {
    const { _targets, _focusTarget } = this;
    if (_focusTarget && this._focusArea) {
      _focusTarget.remove(this._focusArea);
      this._focusTarget = null;
    }
    if (_targets && _targets.length > 0) {
      _targets.forEach((it, index) => it.remove(...this._targetChildren[index]));
      [this._targetChildren, _targets].forEach((it) => (it.length = 0));
      this.clearAreas();
    }
    return this;
  }

  clearAreas() {
    [this._rowHeaderAreas, this._colHeaderAreas, this._areas].forEach((it) => (it.length = 0));
    this._ = null;
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
  for (let i = 0; i < s._ranges.length; i += 1) {
    const { startRow, startCol, endRow, endCol } = s._ranges[i];
    if (startRow > 0 || endRow > 0) {
      rowHeaderRanges.push(Range.create(startRow, 0, endRow, 0));
    }
    if (startCol > 0 || endCol > 0) {
      colHeaderRanges.push(Range.create(0, startCol, 0, endCol));
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
