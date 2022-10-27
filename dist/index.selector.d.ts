import Table from '.';
declare function setCellValue(t: Table, value: string): void;
declare function reset(t: Table): void;
declare function move(t: Table, direction: 'up' | 'down' | 'left' | 'right', step?: number): void;
declare function showCopy(t: Table): void;
declare function clearCopy(t: Table): void;
declare const _default: {
    setCellValue: typeof setCellValue;
    reset: typeof reset;
    move: typeof move;
    showCopy: typeof showCopy;
    clearCopy: typeof clearCopy;
};
export default _default;
