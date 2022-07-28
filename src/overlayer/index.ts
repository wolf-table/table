import { stylePrefix } from '../config';
import HElement, { h, CSSAttrs } from '../element';

function hOverlayer() {
  return h('div', `${stylePrefix}-overlayer-area`);
}

export default class Overlayer {
  areas: HElement[];
  headerAreas: HElement[];

  constructor(target: HElement) {
    this.areas = [hOverlayer(), hOverlayer(), hOverlayer(), hOverlayer()];
    this.headerAreas = [hOverlayer(), hOverlayer(), hOverlayer(), hOverlayer()];
    target.append(...this.areas, ...this.headerAreas);
  }

  area(index: number): HElement;
  area(index: number, cssAttrs: CSSAttrs): Overlayer;
  area(index: number, cssAttrs?: CSSAttrs): any {
    if (cssAttrs) {
      this.areas[index].css(cssAttrs);
      return this;
    }
    return this.areas[index];
  }

  headerArea(index: number): HElement;
  headerArea(index: number, cssAttrs: CSSAttrs): Overlayer;
  headerArea(index: number, cssAttrs?: CSSAttrs): any {
    if (cssAttrs) {
      this.headerAreas[index].css(cssAttrs);
    }
    return this.headerAreas[index];
  }
}
