import './style.index.less';
import TableRender from 'table-render';
import { CellStyle, ColHeader, RowHeader } from 'table-render/dist/types';
import { TableData } from './data';
import Element from './element';
import Scrollbar from './scrollbar';
export declare type TableOptions = {
    rowHeight?: number;
    colWidth?: number;
    rows?: number;
    cols?: number;
    cellStyle?: Partial<CellStyle>;
    scrollable?: boolean;
    resizable?: boolean;
};
export default class Table {
    _colHeader: ColHeader | undefined;
    _rowHeader: RowHeader | undefined;
    _width: () => number;
    _height: () => number;
    _container: Element;
    _data: TableData;
    _render: TableRender;
    _vScrollbar: Scrollbar | null;
    _hScrollbar: Scrollbar | null;
    constructor(element: HTMLElement | string, width: () => number, height: () => number, options?: TableOptions);
    colHeader(v: ColHeader): this;
    rowHeader(v: RowHeader): this;
    data(): TableData;
    data(data: TableData): Table;
    render(): void;
}
export declare function createTable(element: HTMLElement | string, width: () => number, height: () => number, options?: TableOptions): Table;
