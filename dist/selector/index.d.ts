import { Range, Rect } from 'table-renderer';
import { TableData } from '../data';
import HElement from '../element';
declare class SelectArea {
    _: HElement;
    _rect: Rect | null;
    _target: HElement | null;
    constructor(classNameSuffix: string, show?: boolean);
    append(child: HElement): this;
    rect(value: Rect): this;
    target(value: HElement): this;
    show(): this;
    clear(): void;
}
declare type Placement = 'all' | 'row-header' | 'col-header' | 'body';
export default class Selector {
    _placement: Placement;
    _data: TableData;
    _editable: boolean;
    _ranges: Range[];
    _rowHeaderRanges: Range[];
    _colHeaderRanges: Range[];
    _areas: SelectArea[];
    _focus: [number, number];
    _focusRange: Range | null;
    _focusAreas: SelectArea[];
    _copyRange: Range | null | undefined;
    _copyAreas: SelectArea[];
    constructor(data: TableData, editable: boolean);
    placement(value: Placement): this;
    addRange(r: number, c: number, clear?: boolean): this;
    unionRange(r: number, c: number): this;
    move(type: 'up' | 'down' | 'left' | 'right', step?: number): void;
    addArea(index: number, rect: Rect, target: HElement): this;
    addRowHeaderArea(rect: Rect, target: HElement): this;
    addColHeaderArea(rect: Rect, target: HElement): this;
    addFocusArea(rect: Rect, target: HElement): this;
    addCopyArea({ x, y, width, height }: Rect, target: HElement): this;
    showCopy(): void;
    clearCopy(): void;
    clear(): void;
}
export {};
