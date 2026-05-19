import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { apiFetch, jsonBody } from "@/api/client";
import type { Order } from "@/api/types";
import { Button, Card, Loading, Money, Muted, Screen, Subtitle, Title } from "@/components/ui";

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const data = await apiFetch<{ orders: Order[] }>("/api/mobile/admin/orders.php");
    setOrders(data.orders);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load orders");
        setLoading(false);
      });
    }, [load]),
  );

  async function update(orderId: number, status: Order["status"]) {
    await apiFetch("/api/mobile/orders/status.php", {
      method: "PATCH",
      body: jsonBody({ order_id: orderId, status }),
    });
    await load();
  }

  if (loading) return <Loading />;

  return (
    <Screen>
      <Title>Orders</Title>
      {message ? <Muted>{message}</Muted> : null}
      {orders.map((order) => (
        <Card key={order.id}>
          <Subtitle>Order #{order.id}</Subtitle>
          <Money value={order.total} />
          <Muted>{order.username} · {order.payment_status_label}</Muted>
          <Muted>Status: {order.status}</Muted>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button title="Ship" variant="secondary" disabled={order.status !== "pending"} onPress={() => update(order.id, "shipped")} />
            <Button title="Deliver" variant="secondary" disabled={order.status !== "shipped"} onPress={() => update(order.id, "delivered")} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
