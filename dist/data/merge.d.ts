import { Range } from '@wolf-table/table-renderer';
import { TableData } from '.';
export declare function isMerged({ merges }: TableData, ref: string): boolean;
export declare function merge(data: TableData, ref: string): void;
export declare function unmerge({ merges }: TableData, ref: string): void;
export declare function rangeUnoinMerges({ merges }: TableData, range: Range): Range;
