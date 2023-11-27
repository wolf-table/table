import { Rect } from '@wolf-table/table-renderer';
import Editor from '..';
import HElement from '../../element';
declare type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
declare type OptionsFunc = (q: string) => Promise<(string | string[])[]>;
export default class SelectEditor extends Editor {
    _searchInput: HElement;
    _content: HElement;
    _width: number;
    _height: number;
    _position: Position;
    _options: OptionsFunc | null;
    constructor();
    query(q: string): Promise<void>;
    options(v: OptionsFunc): this;
    position(v: Position): this;
    rect(rect: Rect | null): this;
    show(): this;
}
export {};
