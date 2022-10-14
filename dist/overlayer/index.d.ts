import { Rect } from 'table-renderer';
import HElement from '../element';
export default class Overlayer {
    areas: HElement[];
    headerAreas: HElement[];
    areaRects: Rect[];
    constructor(target: HElement);
    area(index: number): HElement;
    area(index: number, rect: Rect): Overlayer;
    headerArea(index: number): HElement;
    headerArea(index: number, rect: Rect): Overlayer;
    inAreas({ x, y, height, width }: Rect): boolean;
}
