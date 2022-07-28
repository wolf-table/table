export default class Element {
    _: HTMLElement;
    _data: Map<any, any>;
    constructor(tag: string | HTMLElement, className?: string | string[] | Object);
    data(key: string): any;
    data(key: string, value: any): Element;
    on(eventName: string, handler: (evt: Event) => void): this;
    attr(key: string): string;
    attr(key: string, value: string): Element;
    css(key: string): string;
    css(key: string, value: string): Element;
    rect(): DOMRect;
    show(): this;
    hide(): this;
    scrollx(): number;
    scrollx(value: number): Element;
    scrolly(): number;
    scrolly(value: number): Element;
    after(...nodes: (Element | Node | string)[]): this;
    before(...nodes: (Element | Node | string)[]): this;
    append(...nodes: (Element | Node | string)[]): this;
    remove(...nodes: (Element | Node)[]): void;
}
export declare function h(tag: string | HTMLElement, className?: string | string[] | Object): Element;
