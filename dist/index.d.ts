import './style.index.less';
import HElement from './element';
import Scrollbar from './scrollbar';
import Resizer from './resizer';
import Selector from './selector';
import Overlayer from './overlayer';
import Editor from './editor';
import TableRenderer, { Style, ColHeader, RowHeader, Rect, Border, Formatter, Gridline } from 'table-renderer';
import { TableData, Cells, FormulaParser, DataCell, DataRow, DataCol, DataCellValue } from './data';
export declare type TableRendererOptions = {
    style?: Partial<Style>;
    headerStyle?: Partial<Style>;
    rowHeader?: Partial<RowHeader>;
    colHeader?: Partial<ColHeader>;
    gridline?: Partial<Gridline>;
    headerGridline?: Partial<Gridline>;
    freeGridline?: Partial<Gridline>;
};
export declare type TableDataOptions = {
    rows?: number;
    cols?: number;
    rowHeight?: number;
    colWidth?: number;
};
export declare type TableOptions = {
    minRowHeight?: number;
    minColWidth?: number;
    scrollable?: boolean;
    resizable?: boolean;
    selectable?: boolean;
    editable?: boolean;
    copyable?: boolean;
    data?: TableDataOptions;
    renderer?: TableRendererOptions;
};
export default class Table {
    _rendererOptions: TableRendererOptions;
    _copyable: boolean;
    _editable: boolean;
    _minRowHeight: number;
    _minColWidth: number;
    _width: () => number;
    _height: () => number;
    _contentRect: Rect;
    _container: HElement;
    _data: TableData;
    _renderer: TableRenderer;
    _cells: Cells;
    _vScrollbar: Scrollbar | null;
    _hScrollbar: Scrollbar | null;
    _rowResizer: Resizer | null;
    _colResizer: Resizer | null;
    _editor: Editor | null;
    _selector: Selector | null;
    _overlayer: Overlayer;
    _canvas: HElement;
    constructor(element: HTMLElement | string, width: () => number, height: () => number, options?: TableOptions);
    contentRect(): Rect;
    resize(): void;
    freeze(ref: string): this;
    isMerged(): boolean;
    isMerged(ref: string): boolean;
    merge(): Table;
    merge(ref: string): Table;
    unmerge(): Table;
    unmerge(ref: string): Table;
    row(index: number): DataRow;
    row(index: number, value: Partial<DataRow>): Table;
    rowHeight(index: number): number;
    rowHeight(index: number, value: number): Table;
    col(index: number): DataCol;
    col(index: number, value: Partial<DataCol>): Table;
    colWidth(index: number): number;
    colWidth(index: number, value: number): Table;
    colsWidth(min: number, max: number): number;
    rowsHeight(min: number, max: number): number;
    formulaParser(v: FormulaParser): this;
    formatter(v: Formatter): this;
    style(index: number, withDefault?: boolean): Partial<Style>;
    addStyle(value: Partial<Style>): number;
    clearStyles(): this;
    addBorder(...value: Border): this;
    clearBorder(value: string): this;
    clearBorders(): this;
    cell(row: number, col: number): DataCell;
    cell(row: number, col: number, value: DataCell): Table;
    cellValue(row: number, col: number): DataCellValue;
    cellValueString(row: number, col: number): string;
    render(): this;
    data(): TableData;
    data(data: Partial<TableData>): Table;
    /**
     * @param html <table><tr><td style="color: white">test</td></tr></table>
     * @param to A1 or B9
     */
    fill(html: string): Table;
    fill(html: string, to: string): Table;
    fill(arrays: DataCellValue[][]): Table;
    fill(arrays: DataCellValue[][], to: string): Table;
    /**
     * @param from A1:H12
     */
    toHtml(from: string): string;
    toArrays(from: string): DataCellValue[][];
    static create(element: HTMLElement | string, width: () => number, height: () => number, options?: TableOptions): Table;
}
declare global {
    interface Window {
        wolf: any;
    }
}
