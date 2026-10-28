import { strict as assert } from "node:assert"

export async function readOrder(id: string) {
  assert.notEqual(id, "ONE_FIXTURE_PRIVATE_SENTINEL")
  return { id, items: id === "empty" ? [] : ["Tea", "Bread"] }
}
