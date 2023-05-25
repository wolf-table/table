import { Rect } from '@wolf-table/table-renderer';
import Editor from '..';
import HElement from '../../element';
declare type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
declare type ItemsFunc = (q: string) => Promise<(string | string[])[]>;
export default class SelectEditor extends Editor {
    _searchInput: HElement;
    _content: HElement;
    _width: number;
    _height: number;
    _position: Position;
    _items: ItemsFunc | null;
    constructor();
    query(q: string): Promise<void>;
    items(v: ItemsFunc): this;
    position(v: Position): this;
    rect(rect: Rect | null): this;
    show(): this;
}
export {};
