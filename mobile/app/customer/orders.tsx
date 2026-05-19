import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch } from "@/api/client";
import type { Order } from "@/api/types";
import { Card, ChipRow, Hero, Loading, Money, Muted, Notice, Screen, StatusChip, Subtitle } from "@/components/ui";

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
      <Hero title="My Orders" subtitle="Track payment labels, fulfillment, and order dates." />
      {message ? <Notice tone="danger" message={message} /> : null}
      {orders.length === 0 ? <Notice message="No orders yet." /> : null}
      {orders.map((order) => (
        <Card key={order.id}>
          <Subtitle>Order #{order.id}</Subtitle>
          <Money value={order.total} />
          <ChipRow>
            <StatusChip tone={order.status === "delivered" ? "success" : "info"}>{order.status}</StatusChip>
            <StatusChip>{order.payment_status_label}</StatusChip>
          </ChipRow>
          <Muted>{new Date(order.created_at).toLocaleDateString()}</Muted>
        </Card>
      ))}
    </Screen>
  );
}
