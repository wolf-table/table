import { TableData } from '.';
import { Style } from '@wolf-table/table-renderer';
export declare function addStyle(t: TableData, value: Partial<Style>): number;
export declare function getStyle(t: TableData, index: number, withDefault?: boolean): Partial<Style>;
export declare function clearStyles(t: TableData): void;
