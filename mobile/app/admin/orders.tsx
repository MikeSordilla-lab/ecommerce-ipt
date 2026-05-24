import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch, jsonBody } from "@/api/client";
import type { Order } from "@/api/types";
import { ActionRow, AdminBottomNav, Button, Card, ChipRow, Hero, Loading, Money, Muted, Notice, Screen, StatusChip, Subtitle } from "@/components/ui";

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
    <Screen bottomNav={<AdminBottomNav activeRoute="orders" />}>
      <Hero title="Orders" subtitle="Move platform orders through fulfillment states." />
      {message ? <Notice tone="danger" message={message} /> : null}
      {orders.length ? (
        orders.map((order) => (
          <Card key={order.id}>
            <Subtitle>Order #{order.id}</Subtitle>
            <Money value={order.total} />
            <Muted>{order.username}</Muted>
            <ChipRow>
              <StatusChip>{order.payment_status_label}</StatusChip>
              <StatusChip tone={order.status === "delivered" ? "success" : "info"}>{order.status}</StatusChip>
            </ChipRow>
            <ActionRow>
              <Button title="Ship" icon="truck" variant="secondary" disabled={order.status !== "pending"} onPress={() => update(order.id, "shipped")} />
              <Button title="Deliver" icon="check-circle" variant="secondary" disabled={order.status !== "shipped"} onPress={() => update(order.id, "delivered")} />
            </ActionRow>
          </Card>
        ))
      ) : (
        <Notice tone="info" message="No platform orders found." />
      )}
    </Screen>
  );
}
