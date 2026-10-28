import { OrdersProvider } from "./orders.context"
import { OrdersFrame, OrdersHeader, OrdersList, OrdersScroll } from "./orders.display"
import { OrdersEmpty, OrdersReady } from "./orders.states"
import { OrdersFooter } from "./orders.actions"

export const Orders = Object.assign(OrdersProvider, {
  Frame: OrdersFrame,
  Header: OrdersHeader,
  Scroll: OrdersScroll,
  List: OrdersList,
  Empty: OrdersEmpty,
  Ready: OrdersReady,
  Footer: OrdersFooter
})
