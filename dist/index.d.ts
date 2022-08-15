import './style.index.less';
import TableRender, { CellStyle, ColHeader, RowHeader } from 'table-render';
import { TableData, Cells, FormulaFunc, DataCell } from './data';
import HElement from './element';
import Scrollbar from './scrollbar';
import Resizer from './resizer';
import Selector from './selector';
import Overlayer from './overlayer';
export declare type TableOptions = {
    rowHeight?: number;
    colWidth?: number;
    minRowHeight?: number;
    minColWidth?: number;
    rows?: number;
    cols?: number;
    cellStyle?: Partial<CellStyle>;
    rowHeader?: Partial<RowHeader>;
    colHeader?: Partial<ColHeader>;
    scrollable?: boolean;
    resizable?: boolean;
    selectable?: boolean;
};
export default class Table {
    _colHeader: ColHeader;
    _rowHeader: RowHeader;
    _minRowHeight: number;
    _minColWidth: number;
    _width: () => number;
    _height: () => number;
    _container: HElement;
    _data: TableData;
    _render: TableRender;
    _cells: Cells;
    _vScrollbar: Scrollbar | null;
    _hScrollbar: Scrollbar | null;
    _rowResizer: Resizer | null;
    _colResizer: Resizer | null;
    _selector: Selector | null;
    _overlayer: Overlayer;
    constructor(element: HTMLElement | string, width: () => number, height: () => number, options?: TableOptions);
    data(): TableData;
    data(data: Partial<TableData>): Table;
    resize(): void;
    freeze(ref: string): this;
    isMerged(): boolean;
    isMerged(ref: string): boolean;
    merge(): Table;
    merge(ref: string): Table;
    unmerge(): Table;
    unmerge(ref: string): Table;
    rowHeight(index: number, value: number): this;
    colWidth(index: number, value: number): this;
    colsWidth(min: number, max: number): number;
    rowsHeight(min: number, max: number): number;
    formula(v: FormulaFunc): Table;
    addStyle(value: Partial<CellStyle>): number;
    cell(row: number, col: number): DataCell;
    cell(row: number, col: number, value: DataCell): Table;
    render(): this;
    static create(element: HTMLElement | string, width: () => number, height: () => number, options?: TableOptions): Table;
}
declare global {
    interface Window {
        wolf: any;
    }
}
