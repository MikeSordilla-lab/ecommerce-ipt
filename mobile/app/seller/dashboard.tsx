import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch } from "@/api/client";
import type { Order } from "@/api/types";
import { Button, Card, Loading, Money, Muted, Screen, Subtitle, Title } from "@/components/ui";
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
      <Title>Seller Dashboard</Title>
      {message ? <Muted>{message}</Muted> : null}
      {data ? (
        <>
          <Card>
            <Subtitle>Stats</Subtitle>
            <Muted>Products: {data.stats.products}</Muted>
            <Muted>Total orders: {data.stats.total_orders}</Muted>
            <Muted>Pending orders: {data.stats.pending_orders}</Muted>
          </Card>
          <Button title="My Products" onPress={() => router.push("/seller/products")} />
          <Button title="Orders" variant="secondary" onPress={() => router.push("/seller/orders")} />
          <Button title="Sign Out" variant="secondary" onPress={signOut} />
          {data.recent_orders.map((order) => (
            <Card key={order.id}>
              <Subtitle>Order #{order.id}</Subtitle>
              <Money value={order.total} />
              <Muted>{order.status}</Muted>
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}
