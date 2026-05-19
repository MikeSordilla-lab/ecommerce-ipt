import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch } from "@/api/client";
import type { Order } from "@/api/types";
import { Card, Loading, Money, Muted, Screen, Subtitle, Title } from "@/components/ui";

export default function CustomerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      apiFetch<{ orders: Order[] }>("/api/mobile/orders.php")
        .then((data) => setOrders(data.orders))
        .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load orders"))
        .finally(() => setLoading(false));
    }, []),
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <Screen>
      <Title>My Orders</Title>
      {message ? <Muted>{message}</Muted> : null}
      {orders.length === 0 ? <Muted>No orders yet.</Muted> : null}
      {orders.map((order) => (
        <Card key={order.id}>
          <Subtitle>Order #{order.id}</Subtitle>
          <Money value={order.total} />
          <Muted>Status: {order.status}</Muted>
          <Muted>{order.payment_status_label}</Muted>
          <Muted>{new Date(order.created_at).toLocaleDateString()}</Muted>
        </Card>
      ))}
    </Screen>
  );
}
