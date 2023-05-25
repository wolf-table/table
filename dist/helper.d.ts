export declare function sum(min: number, max: number, getv: (index: number) => number): number;
export declare function equals(obj1: any, obj2: any): boolean;
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
export declare function pt2px(pt: number): number;
export declare function throttle(fn: Function, delay: number): (...args: any) => void;
