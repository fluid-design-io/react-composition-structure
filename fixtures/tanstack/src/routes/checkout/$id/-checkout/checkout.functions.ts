import { createServerFn } from "@tanstack/react-start"
import { findCart } from "./checkout.server"

export const getCart = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(({ data: id }) => findCart(id))
