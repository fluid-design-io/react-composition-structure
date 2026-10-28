const orders = new Map<string, Array<string>>([
  ["42", ["Tea", "Bread"]],
  ["empty", []]
])

export async function readOrder(id: string) {
  return { id, items: [...(orders.get(id) ?? ["Tea", "Bread"])] }
}
