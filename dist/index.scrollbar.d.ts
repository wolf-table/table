import Table from '.';
import { Range } from '@wolf-table/table-renderer';
declare function init(t: Table): void;
declare function resize(t: Table): void;
/**
 *
 * @param t
 * @param range current selected area
 * @param oldRange it's needed when the selected area get bigger or smaller (click-mousemove and shift-(Arrow*)-keyborard)
 * @returns
 */
declare function autoMove(t: Table, range: Range | null | undefined, oldRange?: Range | null): void;
declare const _default: {
    init: typeof init;
    resize: typeof resize;
    autoMove: typeof autoMove;
};
export default _default;
