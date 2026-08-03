export function arrayPackN<T>(array: T[], n: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += n) {
    result.push(array.slice(i, i + n));
  }
  return result;
}
