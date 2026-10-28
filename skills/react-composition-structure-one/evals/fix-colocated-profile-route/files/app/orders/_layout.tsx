import { Stack } from "one"

export default function OrdersLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ title: "Orders" }} />
      <Stack.Screen name="[id]" options={{ title: "Order" }} />
    </Stack>
  )
}
