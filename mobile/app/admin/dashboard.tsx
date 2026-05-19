import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch } from "@/api/client";
import type { Order } from "@/api/types";
import { ActionRow, Button, Card, ChipRow, Hero, Loading, Money, Notice, Screen, StatCard, StatusChip, Subtitle } from "@/components/ui";
import { useAuth } from "@/auth/auth-context";

type AdminDashboard = {
  stats: { users: number; products: number; orders: number; pending_sellers: number };
  recent_orders: Order[];
};

export default function AdminDashboardScreen() {
  const { signOut } = useAuth();
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
    <Screen>
      <Hero title="Admin Dashboard" subtitle="Review platform health, approvals, products, and orders." />
      {message ? <Notice tone="danger" message={message} /> : null}
      {data ? (
        <>
          <ActionRow>
            <StatCard label="Users" value={data.stats.users} />
            <StatCard label="Products" value={data.stats.products} />
            <StatCard label="Orders" value={data.stats.orders} />
            <StatCard label="Pending sellers" value={data.stats.pending_sellers} />
          </ActionRow>
          <ActionRow>
            <Button title="Users" onPress={() => router.push("/admin/users")} />
            <Button title="Products" variant="secondary" onPress={() => router.push("/admin/products")} />
            <Button title="Orders" variant="secondary" onPress={() => router.push("/admin/orders")} />
            <Button title="Sign Out" variant="secondary" onPress={signOut} />
          </ActionRow>
          {data.recent_orders.map((order) => (
            <Card key={order.id}>
              <Subtitle>Order #{order.id}</Subtitle>
              <Money value={order.total} />
              <ChipRow>
                <StatusChip>{order.username}</StatusChip>
                <StatusChip tone={order.status === "delivered" ? "success" : "info"}>{order.status}</StatusChip>
              </ChipRow>
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}
