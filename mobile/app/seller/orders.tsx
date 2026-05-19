import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch, jsonBody } from "@/api/client";
import type { Order } from "@/api/types";
import { ActionRow, Button, Card, ChipRow, Hero, Loading, Money, Muted, Notice, Screen, StatusChip, Subtitle } from "@/components/ui";

export default function SellerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const data = await apiFetch<{ orders: Order[] }>("/api/mobile/seller/orders.php");
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
      <Hero title="Seller Orders" subtitle="Advance pending orders from shipping to delivery." />
      {message ? <Notice tone="danger" message={message} /> : null}
      {orders.map((order) => (
        <Card key={order.id}>
          <Subtitle>Order #{order.id}</Subtitle>
          <Money value={order.total} />
          <Muted>Customer: {order.username}</Muted>
          <ChipRow>
            <StatusChip tone={order.status === "delivered" ? "success" : "info"}>{order.status}</StatusChip>
          </ChipRow>
          <ActionRow>
            <Button title="Ship" variant="secondary" disabled={order.status !== "pending"} onPress={() => update(order.id, "shipped")} />
            <Button title="Deliver" variant="secondary" disabled={order.status !== "shipped"} onPress={() => update(order.id, "delivered")} />
          </ActionRow>
        </Card>
      ))}
    </Screen>
  );
}
