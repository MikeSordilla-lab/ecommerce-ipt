import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch } from "@/api/client";
import type { Order } from "@/api/types";
import { ActionRow, Button, Card, ChipRow, Hero, Loading, Money, Notice, Screen, SellerBottomNav, StatCard, StatusChip, Subtitle } from "@/components/ui";

type SellerDashboard = {
  stats: { products: number; total_orders: number; pending_orders: number };
  recent_orders: Order[];
};

export default function SellerDashboardScreen() {
  const [data, setData] = useState<SellerDashboard | null>(null);
  const [message, setMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      apiFetch<SellerDashboard>("/api/mobile/seller/dashboard.php")
        .then(setData)
        .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load seller dashboard"));
    }, []),
  );

  if (!data && !message) {
    return <Loading />;
  }

  return (
    <Screen bottomNav={<SellerBottomNav activeRoute="dashboard" />}>
      <Hero title="Seller Dashboard" subtitle="Monitor inventory and order movement." />
      {message ? <Notice tone="danger" message={message} /> : null}
      {data ? (
        <>
          <ActionRow>
            <StatCard label="Products" value={data.stats.products} icon="package-variant" />
            <StatCard label="Orders" value={data.stats.total_orders} icon="receipt" />
            <StatCard label="Pending" value={data.stats.pending_orders} icon="clock-outline" />
          </ActionRow>
          <ActionRow>
            <Button title="Add Product" icon="plus" onPress={() => router.push("/seller/product-form")} />
            <Button title="View Orders" icon="receipt" variant="secondary" onPress={() => router.push("/seller/orders")} />
          </ActionRow>
          <Subtitle>Recent Orders</Subtitle>
          {data.recent_orders.length ? (
            data.recent_orders.map((order) => (
              <Card key={order.id}>
                <Subtitle>Order #{order.id}</Subtitle>
                <Money value={order.total} />
                <ChipRow>
                  <StatusChip tone={order.status === "delivered" ? "success" : "info"}>{order.status}</StatusChip>
                </ChipRow>
              </Card>
            ))
          ) : (
            <Notice tone="info" message="No recent orders yet." />
          )}
        </>
      ) : null}
    </Screen>
  );
}
