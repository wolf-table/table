import { Rect } from '@wolf-table/table-renderer';
import { stylePrefix } from '../config';
import HElement, { h } from '../element';

function hOverlayer() {
  return h('div', `${stylePrefix}-overlayer-area`);
}

export default class Overlayer {
  _areas: HElement[];
  _headerAreas: HElement[];
  _areaRects: Rect[] = [];

  constructor(target: HElement) {
    this._areas = [hOverlayer(), hOverlayer(), hOverlayer(), hOverlayer()];
    this._headerAreas = [
      hOverlayer(),
      hOverlayer(),
      hOverlayer(),
      hOverlayer(),
    ];
    target.append(...this._areas, ...this._headerAreas);
  }

  area(index: number): HElement;
  area(index: number, rect: Rect): Overlayer;
  area(index: number, rect?: Rect): any {
    if (rect) {
      this._areaRects[index] = rect;
      const { x, y, height, width } = rect;
      this._areas[index].css({ left: x, top: y, width, height });
      return this;
    }
    return this._areas[index];
  }

  headerArea(index: number): HElement;
  headerArea(index: number, rect: Rect): Overlayer;
  headerArea(index: number, rect?: Rect): any {
    if (rect) {
      const { x, y, height, width } = rect;
      this._headerAreas[index].css({ left: x, top: y, width, height });
    }
    return this._headerAreas[index];
  }

  inAreas({ x, y, height, width }: Rect) {
    const x1 = x + width;
    const y1 = y + height;
    for (let it of this._areaRects) {
      if (x >= 0 && x1 <= it.width && y >= 0 && y1 <= it.height) {
        return true;
      }
    }
    return false;
  }
}
