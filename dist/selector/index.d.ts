import { Range, Rect } from '@wolf-table/table-renderer';
import HElement from '../element';
declare class SelectArea {
    _: HElement;
    _rect: Rect | null;
    _target: HElement | null;
    constructor(classNameSuffix: string, show?: boolean);
    append(child: HElement): this;
    offset(): {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    rect(value: Rect): this;
    target(value: HElement, autoAppend?: boolean): this;
    show(): this;
    clear(): void;
}
declare type Placement = 'all' | 'row-header' | 'col-header' | 'body';
export default class Selector {
    _placement: Placement;
    _editable: boolean;
    _ranges: Range[];
    _rowHeaderRanges: Range[];
    _colHeaderRanges: Range[];
    _areas: SelectArea[];
    _focus: [number, number];
    _focusRange: Range | null;
    _focusArea: SelectArea | null;
    _move: [number, number];
    _copyRange: Range | null | undefined;
    _copyAreas: SelectArea[];
    _autofillRange: Range | null;
    _autofillAreas: SelectArea[];
    _autofillTrigger: (evt: any) => void;
    constructor(editable: boolean);
    get currentRange(): Range | undefined;
    placement(value: Placement): this;
    focus(row: number, col: number, range: Range): this;
    move(row: number, col: number): this;
    autofillRange(range: Range | null): this;
    autofillTrigger(trigger: (evt: any) => void): this;
    addRange(range: Range, clear?: boolean): this;
    updateLastRange(unionRange: (focusRange: Range) => Range): void;
    addAreaOutline(rect: Rect, target: HElement): void;
    addArea(rect: Rect, target: HElement): this;
    addRowHeaderArea(rect: Rect, target: HElement): this;
    addColHeaderArea(rect: Rect, target: HElement): this;
    addCopyArea(rect: Rect, target: HElement): this;
    addAutofillArea(rect: Rect, target: HElement): this;
    setFocusArea(rect: Rect, target: HElement): this;
    showCopy(): void;
    clearCopy(): void;
    clear(): void;
}
export {};
