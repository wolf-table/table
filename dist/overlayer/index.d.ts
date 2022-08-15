import HElement, { CSSAttrs } from '../element';
export default class Overlayer {
    areas: HElement[];
    headerAreas: HElement[];
    constructor(target: HElement);
    area(index: number): HElement;
    area(index: number, cssAttrs: CSSAttrs): Overlayer;
    headerArea(index: number): HElement;
    headerArea(index: number, cssAttrs: CSSAttrs): Overlayer;
}
