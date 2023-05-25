import { Range } from '@wolf-table/table-renderer';
import { Cells, TableData } from '.';
export declare type CopyData = {
    range: Range;
    cells: Cells;
    data: TableData;
};
export declare type CopyCells = {
    range: Range;
    cells: Cells;
    data: TableData;
};
export declare function copy(from: CopyCells | null, to: CopyCells | null, autofill?: boolean): void;
