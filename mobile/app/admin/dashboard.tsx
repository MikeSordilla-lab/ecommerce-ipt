import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch } from "@/api/client";
import type { Order } from "@/api/types";
import { ActionRow, AdminBottomNav, Button, Card, ChipRow, Hero, Loading, Money, Notice, Screen, StatCard, StatusChip, Subtitle } from "@/components/ui";

type AdminDashboard = {
  stats: { users: number; products: number; orders: number; pending_sellers: number };
  recent_orders: Order[];
};

export default function AdminDashboardScreen() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [message, setMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      apiFetch<AdminDashboard>("/api/mobile/admin/dashboard.php")
        .then(setData)
        .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load admin dashboard"));
    }, []),
  );

  if (!data && !message) return <Loading />;

  return (
    <Screen bottomNav={<AdminBottomNav activeRoute="dashboard" />}>
      <Hero title="Admin Dashboard" subtitle="Review platform health and fulfillment." />
      {message ? <Notice tone="danger" message={message} /> : null}
      {data ? (
        <>
          <ActionRow>
            <StatCard label="Users" value={data.stats.users} icon="account-group" />
            <StatCard label="Products" value={data.stats.products} icon="package-variant" />
            <StatCard label="Orders" value={data.stats.orders} icon="receipt" />
            <StatCard label="Pending" value={data.stats.pending_sellers} icon="account-clock" />
          </ActionRow>
          <ActionRow>
            <Button title="Review Users" icon="account-group" onPress={() => router.push("/admin/users")} />
            <Button title="Moderate Products" icon="package-variant" variant="secondary" onPress={() => router.push("/admin/products")} />
          </ActionRow>
          <Subtitle>Recent Orders</Subtitle>
          {data.recent_orders.length ? (
            data.recent_orders.map((order) => (
              <Card key={order.id}>
                <Subtitle>Order #{order.id}</Subtitle>
                <Money value={order.total} />
                <ChipRow>
                  <StatusChip>{order.username}</StatusChip>
                  <StatusChip tone={order.status === "delivered" ? "success" : "info"}>{order.status}</StatusChip>
                </ChipRow>
              </Card>
            ))
          ) : (
            <Notice tone="info" message="No recent platform orders." />
          )}
        </>
      ) : null}
    </Screen>
  );
}
