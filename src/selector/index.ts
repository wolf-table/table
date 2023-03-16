import { Range, Rect } from '@wolf-table/table-renderer';
import { stylePrefix, borderWidth } from '../config';
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

  offset() {
    if (this._rect && this._target) {
      const offset = this._target.offset();
      const { x, y, width, height } = this._rect;
      return { x: x + offset.x, y: y + offset.y, width, height };
    }
    return null;
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

  target(value: HElement, autoAppend = true) {
    if (autoAppend) value.append(this._);
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
  _editable = false;

  _ranges: Range[] = [];
  _rowHeaderRanges: Range[] = [];
  _colHeaderRanges: Range[] = [];
  _areas: SelectArea[] = [];

  _focus: [number, number] = [0, 0];
  // _focusBodyRange: Range | null = null;
  _focusRange: Range | null = null;
  _focusArea: SelectArea | null = null;

  // for move
  _move: [number, number] = [0, 0];

  _copyRange: Range | null | undefined = null;
  _copyAreas: SelectArea[] = [];

  _autofillRange: Range | null = null;
  _autofillAreas: SelectArea[] = [];
  _autofillTrigger = (evt: any) => {};

  constructor(editable: boolean) {
    this._editable = editable;
  }

  get currentRange() {
    return this._ranges.at(-1);
  }

  placement(value: Placement) {
    this._placement = value;
    return this;
  }

  focus(row: number, col: number, range: Range) {
    this._focus = [row, col];
    this._focusRange = range;
    this._move = [row, col];
    return this;
  }

  move(row: number, col: number) {
    this._move = [row, col];
    return this;
  }

  autofillRange(range: Range | null) {
    this._autofillRange = range;
    return this;
  }

  autofillTrigger(trigger: (evt: any) => void) {
    this._autofillTrigger = trigger;
    return this;
  }

  addRange(range: Range, clear: boolean = true) {
    if (clear) {
      this._ranges.length = 0;
      this.clear();
    }
    this._ranges.push(range);
    updateHeaderRanges(this);
    return this;
  }

  updateLastRange(unionRange: (focusRange: Range) => Range) {
    const { _focusRange } = this;
    if (_focusRange) {
      this._ranges.splice(-1, 1, unionRange(_focusRange));
      updateHeaderRanges(this);
    }
  }

  addAreaOutline(rect: Rect, target: HElement) {
    const outline = new SelectArea(`selector`, true)
      .rect(rect2outlineRect(rect, borderWidth))
      .target(target);
    if (this._placement === 'body') {
      outline.append(
        h('div', 'corner')
          .attr('draggable', 'false')
          .on('mousedown', this._autofillTrigger)
      );
    }
    this._areas.push(outline);
  }

  addArea(rect: Rect, target: HElement) {
    this._areas.push(
      new SelectArea(`selector-area`, true).rect(rect).target(target)
    );
    return this;
  }

  addRowHeaderArea(rect: Rect, target: HElement) {
    this._areas.push(
      new SelectArea(`selector-area row-header`, true).rect(rect).target(target)
    );
    return this;
  }

  addColHeaderArea(rect: Rect, target: HElement) {
    this._areas.push(
      new SelectArea(`selector-area col-header`, true).rect(rect).target(target)
    );
    return this;
  }

  addCopyArea(rect: Rect, target: HElement) {
    this._copyAreas.push(
      new SelectArea(`selector-copy`, true)
        .rect(rect2outlineRect(rect, borderWidth))
        .target(target)
    );
    return this;
  }

  addAutofillArea(rect: Rect, target: HElement) {
    this._autofillAreas.push(
      new SelectArea(`selector-autofill`, true)
        .rect(rect2outlineRect(rect, borderWidth))
        .target(target)
    );
    return this;
  }

  setFocusArea(rect: Rect, target: HElement) {
    this._focusArea = new SelectArea('', true).rect(rect).target(target, false);
    return this;
  }

  showCopy() {
    this._copyRange = this.currentRange;
  }

  clearCopy() {
    this._copyRange = null;
    this._copyAreas.forEach((it) => {
      it.clear();
    });
    this._copyAreas.length = 0;
  }

  clear() {
    [this._areas, this._autofillAreas, this._copyAreas].forEach((it) => {
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
      if (startRow >= 0 || endRow >= 0) {
        rowHeaderRanges.push(Range.create(startRow, 0, endRow, 0));
      }
      if (startCol >= 0 || endCol >= 0) {
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

function rect2outlineRect(rect: Rect, borderWidth: number) {
  return {
    x: rect.x - borderWidth / 2,
    y: rect.y - borderWidth / 2,
    width: rect.width - borderWidth,
    height: rect.height - borderWidth,
  };
}
