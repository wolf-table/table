export declare type CSSAttrs = {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    position?: string;
};
export default class HElement {
    _: HTMLElement;
    _data: Map<any, any>;
    constructor(tag: string | Node, className?: string | string[] | Object);
    element(): any;
    data(key: string): any;
    data(key: string, value: any): HElement;
    on(eventName: string, handler: (evt: any) => void): this;
    focus(): this;
    value(): string;
    value(v: string): HElement;
    textContent(v: string): this;
    html(v: string): this;
    attr(key: string): string;
    attr(key: string, value: string): HElement;
    css(key: string): string;
    css(props: CSSAttrs): HElement;
    css(key: string, value: string): HElement;
    rect(): DOMRect;
    offset(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    computedStyle(): CSSStyleDeclaration;
    show(flag?: boolean): this;
    hide(): this;
    scrollx(): number;
    scrollx(value: number): HElement;
    scrolly(): number;
    scrolly(value: number): HElement;
    after(...nodes: (HElement | Node | string)[]): this;
    before(...nodes: (HElement | Node | string)[]): this;
    append(...nodes: (HElement | Node | string)[]): this;
    remove(...nodes: (HElement | Node)[]): void;
    cloneNode(): Node;
    get firstChild(): HElement | null;
}
export declare function h(tag: string | HTMLElement, className?: string | string[] | Object): HElement;
export declare function textWidth(text: string, fontSize: string, fontFamily: string): number;
