import Table from '.';
declare function init(t: Table): void;
declare function move(t: Table): void;
declare function reset(t: Table): void;
declare const _default: {
    init: typeof init;
    move: typeof move;
    reset: typeof reset;
};
export default _default;
