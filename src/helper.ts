export function sum(min: number, max: number, getv: (index: number) => number) {
  let total = 0;
  for (let i = min; i < max; i += 1) total += getv(i);
  return total;
}
