export function bind(target: any, name: string, callback: (evt: any) => void) {
  target.addEventListener(name, callback);
}

export function unbind(target: any, name: string, callback: (evt: any) => void) {
  target.removeEventListener(name, callback);
}
