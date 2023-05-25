export declare function bind(target: any, name: string, callback: (evt: any) => void): void;
export declare function unbind(target: any, name: string, callback: (evt: any) => void): void;
export declare function bindMousemoveAndMouseup(target: any, move: (evt: any) => void, up: (evt: any) => void): void;
declare type Handler = (...args: any) => void;
export declare class EventEmitter {
    _events: Map<any, any>;
    on(type: string, handler: Handler): this;
    off(type: string, handler?: Handler): this;
    emit(type: String, ...args: any): this;
}
export {};
