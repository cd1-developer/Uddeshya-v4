export function findWithIndex(items: any, id: string) {
  const index = items.findIndex((item: any) => item.id === id);
  const value = items[index];
  return { index, value };
}
