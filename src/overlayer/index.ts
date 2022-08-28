import { Rect } from 'table-render';
import { stylePrefix } from '../config';
import HElement, { h } from '../element';

function hOverlayer() {
  return h('div', `${stylePrefix}-overlayer-area`);
}

export default class Overlayer {
  areas: HElement[];
  headerAreas: HElement[];
  _areaRects: Rect[] = [];

  constructor(target: HElement) {
    this.areas = [hOverlayer(), hOverlayer(), hOverlayer(), hOverlayer()];
    this.headerAreas = [hOverlayer(), hOverlayer(), hOverlayer(), hOverlayer()];
    target.append(...this.areas, ...this.headerAreas);
  }

  area(index: number): HElement;
  area(index: number, rect: Rect): Overlayer;
  area(index: number, rect?: Rect): any {
    if (rect) {
      this._areaRects[index] = rect;
      const { x, y, height, width } = rect;
      this.areas[index].css({ left: x, top: y, width, height });
      return this;
    }
    return this.areas[index];
  }

  headerArea(index: number): HElement;
  headerArea(index: number, rect: Rect): Overlayer;
  headerArea(index: number, rect?: Rect): any {
    if (rect) {
      const { x, y, height, width } = rect;
      this.headerAreas[index].css({ left: x, top: y, width, height });
    }
    return this.headerAreas[index];
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
