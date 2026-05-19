import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch } from "@/api/client";
import type { Order } from "@/api/types";
import { ActionRow, Button, Card, ChipRow, Hero, Loading, Money, Notice, Screen, StatCard, StatusChip, Subtitle } from "@/components/ui";
import { useAuth } from "@/auth/auth-context";

type SellerDashboard = {
  stats: { products: number; total_orders: number; pending_orders: number };
  recent_orders: Order[];
};

export default function SellerDashboardScreen() {
  const { signOut } = useAuth();
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
    <Screen>
      <Hero title="Seller Dashboard" subtitle="Monitor products, pending orders, and recent activity." />
      {message ? <Notice tone="danger" message={message} /> : null}
      {data ? (
        <>
          <ActionRow>
            <StatCard label="Products" value={data.stats.products} />
            <StatCard label="Orders" value={data.stats.total_orders} />
            <StatCard label="Pending" value={data.stats.pending_orders} />
          </ActionRow>
          <ActionRow>
            <Button title="My Products" onPress={() => router.push("/seller/products")} />
            <Button title="Orders" variant="secondary" onPress={() => router.push("/seller/orders")} />
            <Button title="Sign Out" variant="secondary" onPress={signOut} />
          </ActionRow>
          {data.recent_orders.map((order) => (
            <Card key={order.id}>
              <Subtitle>Order #{order.id}</Subtitle>
              <Money value={order.total} />
              <ChipRow>
                <StatusChip tone={order.status === "delivered" ? "success" : "info"}>{order.status}</StatusChip>
              </ChipRow>
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}
