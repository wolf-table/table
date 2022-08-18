import { Range, Rect } from 'table-render';
import { stylePrefix, borderWidth } from '../config';
import { rangeUnoinMerges, TableData } from '../data';
import HElement, { h } from '../element';

type Placement = 'all' | 'row-header' | 'col-header' | 'body';
export default class Selector {
  oldRanges: Range[] = [];
  ranges: Range[] = [];
  rowHeaderRanges: Range[] = [];
  colHeaderRanges: Range[] = [];

  startRange: Range | null = null;
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

  placement(value: Placement) {
    this._placement = value;
    return this;
  }

  addRange(row: number, col: number, clear: boolean = true) {
    const range = rangeUnoinMerges(this._data, Range.create(row, col));
    if (clear) this.clearRanges();
    this.ranges.push(range);
    this.startRange = range;

    updateHeaderRanges(this);
    return this;
  }

  unionRange(row: number, col: number) {
    const range = Range.create(row, col);
    const { ranges, startRange } = this;
    if (startRange) {
      const newRange = startRange.union(range);
      ranges.splice(-1, 1, rangeUnoinMerges(this._data, newRange));
      updateHeaderRanges(this);
    }
    return this;
  }

  clearRanges() {
    this.oldRanges = this.ranges;
    this.ranges = [];
    return this;
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

    const last = rangeIndex === this.ranges.length - 1;
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
    if (this._targets && this._targets.length > 0) {
      this._targets.forEach((it, index) => it.remove(...this._targetChildren[index]));
      [this._targetChildren, this._targets].forEach((it) => (it.length = 0));
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
  for (let i = 0; i < s.ranges.length; i += 1) {
    const { startRow, startCol, endRow, endCol } = s.ranges[i];
    if (startRow > 0 || endRow > 0) {
      rowHeaderRanges.push(Range.create(startRow, 0, endRow, 0));
    }
    if (startCol > 0 || endCol > 0) {
      colHeaderRanges.push(Range.create(0, startCol, 0, endCol));
    }
  }

  s.rowHeaderRanges = mergedRanges(
    rowHeaderRanges,
    (a, b) => a.startRow - b.startRow,
    (a, b) => a.intersectsRow(b.startRow, b.endRow)
  );
  s.colHeaderRanges = mergedRanges(
    colHeaderRanges,
    (a, b) => a.startCol - b.startCol,
    (a, b) => a.intersectsCol(b.startCol, b.endCol)
  );
}
