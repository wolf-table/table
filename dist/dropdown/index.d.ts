import HElement from '../element';
import { Rect } from '@wolf-table/table-renderer';
export default class Dropdown {
    _: HElement;
    _visible: boolean;
    _rect: Rect | null;
    _width: number;
    _height: number;
    constructor(cssClass: String, width: number, height: number);
    rect(rect: Rect | null, position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): this;
    show(): this;
    hide(): this;
}
