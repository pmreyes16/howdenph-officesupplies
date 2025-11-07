/**
 * Returns true if the item is considered low stock.
 * An item is low stock if its quantity is less than or equal to its minstock.
 */
export function isLowStock(item: { quantity: number; minstock: number }): boolean {
  return item.quantity <= item.minstock;
}