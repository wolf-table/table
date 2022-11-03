export function sum(min: number, max: number, getv: (index: number) => number) {
  let total = 0;
  for (let i = min; i < max; i += 1) total += getv(i);
  return total;
}

export function equals(obj1: any, obj2: any) {
  const keys = Object.keys(obj1);
  if (keys.length !== Object.keys(obj2).length) return false;
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const v1 = obj1[k];
    const v2 = obj2[k];
    if (v2 === undefined) return false;
    if (
      typeof v1 === 'string' ||
      typeof v1 === 'number' ||
      typeof v1 === 'boolean'
    ) {
      if (v1 !== v2) return false;
    } else if (Array.isArray(v1)) {
      if (v1.length !== v2.length) return false;
      for (let ai = 0; ai < v1.length; ai += 1) {
        if (!equals(v1[ai], v2[ai])) return false;
      }
    } else if (
      typeof v1 !== 'function' &&
      !Array.isArray(v1) &&
      v1 instanceof Object
    ) {
      if (!equals(v1, v2)) return false;
    }
  }
  return true;
}

/**
 * Point	Pixel
0.75 pt	1 px
1.5 pt	2 px
3 pt	4 px
4.5 pt	6 px
5 pt	6.6666666666667 px
6 pt	8 px
9 pt	12 px
10.5 pt	14 px
12 pt	16 px
13.5 pt	18 px
16.5 pt	22 px
18 pt	24 px
19.5 pt	26 px
21 pt	28 px
24 pt	32 px
28.5 pt	38 px
31.5 pt	42 px
36 pt	48 px
42 pt	56 px
45 pt	60 px
48 pt	64 px
54 pt	72 px
63 pt	84 px
75 pt	100 px
90 pt	120 px
 * @param pt 
 */
export function pt2px(pt: number): number {
  if (pt <= 0.75) return 1;
  else if (pt <= 1.5) return 2;
  else if (pt <= 2.25) return 3;
  else if (pt <= 3) return 4;
  else if (pt <= 3.75) return 5;
  else if (pt <= 4.5) return 6;
  return (96 / 72) * pt;
}

export function throttle(fn: Function, delay: number) {
  let timer: any = null;
  return (...args: any) => {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(null, args);
        timer = null;
      }, delay || 0);
    }
  };
}
