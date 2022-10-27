import Table from '.';
/**
 * the table content to html
 * @param t Table
 * @param from the range reference, like A1:H22
 */
export declare function toHtml(t: Table, from: string): string;
/**
 * fill the table content from html
 * @param t Table
 * @param html content: <table><tr><td style="color: white;">test</td>..</tr>..</table>
 * @param to [row, col]
 */
export declare function fromHtml(t: Table, html: string, [toStartRow, toStartCol]: [number, number]): [number, number];
