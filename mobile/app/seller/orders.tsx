import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { apiFetch, jsonBody } from "@/api/client";
import type { Order } from "@/api/types";
import { ActionRow, Button, Card, ChipRow, FilterChip, Hero, Loading, Money, Muted, Notice, Screen, SellerBottomNav, StatusChip } from "@/components/ui";
import { colors } from "@/theme/colors";

type TabKey = "all" | "pending" | "shipped" | "delivered" | "paid";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "paid", label: "Paid" },
];

export default function SellerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<TabKey>("all");

  const load = useCallback(async () => {
    const data = await apiFetch<{ orders: Order[] }>("/api/mobile/seller/orders.php");
    setOrders(data.orders || []);
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

  function fmtDate(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  function fmtShort(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }

  function viewDetails(order: Order) {
    Alert.alert(
      `Order #${order.id}`,
      [
        `Customer: ${order.username || "—"}`,
        `Total: ₱${(order.total || 0).toFixed(2)}`,
        `Status: ${order.status || "pending"}`,
        `Payment: ${order.payment_status_label || "—"}`,
        `Method: ${order.payment_label || "—"}`,
        `Date: ${fmtDate(order.created_at)}`,
        order.shipping_address?.address ? `\nShip to:\n${order.shipping_address.full_name || ""}\n${order.shipping_address.address || ""}` : "",
        order.notes ? `\nNotes: ${order.notes}` : "",
      ].filter(Boolean).join("\n"),
    );
  }

  const filtered = useMemo(() => {
    let list = orders || [];
    switch (tab) {
      case "pending":
        list = list.filter((o) => o.status === "pending");
        break;
      case "shipped":
        list = list.filter((o) => o.status === "shipped");
        break;
      case "delivered":
        list = list.filter((o) => o.status === "delivered");
        break;
      case "paid":
        list = list.filter((o) => o.payment_status_label === "Paid");
        break;
    }
    return list;
  }, [orders, tab]);

  if (loading) return <Loading />;

  return (
    <Screen bottomNav={<SellerBottomNav activeRoute="orders" />}>
      <Hero title="Orders" subtitle="Manage and fulfill orders." />
      {message ? <Notice tone="danger" message={message} /> : null}

      <ChipRow>
        {TABS.map((t) => (
          <FilterChip key={t.key} selected={tab === t.key} onPress={() => setTab(t.key)}>
            {t.label}
          </FilterChip>
        ))}
      </ChipRow>

      {filtered.length ? (
        filtered.map((order) => {
          const isDelivered = order.status === "delivered";
          return (
            <Card key={order.id}>
              <View style={styles.orderHeader}>
                <Text variant="titleSmall" style={styles.orderId}>Order #{order.id}</Text>
                <StatusChip tone={order.status === "delivered" ? "success" : order.status === "shipped" ? "info" : "warning"}>
                  {(order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)}
                </StatusChip>
              </View>
              <View style={styles.orderBody}>
                <Money value={order.total} size="small" />
                <Muted>{order.username}</Muted>
              </View>
              <View style={styles.orderMeta}>
                <View style={styles.orderMetaItem}>
                  <Text variant="labelSmall" style={styles.metaLabel}>Payment</Text>
                  <StatusChip>{order.payment_status_label}</StatusChip>
                </View>
                <View style={styles.orderMetaItem}>
                  <Text variant="labelSmall" style={styles.metaLabel}>Date</Text>
                  <Muted>{fmtShort(order.created_at)}</Muted>
                </View>
              </View>
              <ActionRow>
                <Button title="View Details" icon="information" variant="secondary" onPress={() => viewDetails(order)} />
                {!isDelivered && (
                  <>
                    <Button title="Ship" icon="truck" variant="secondary" disabled={order.status !== "pending"} onPress={() => update(order.id, "shipped")} />
                    <Button title="Deliver" icon="check-circle" variant="secondary" disabled={order.status !== "shipped"} onPress={() => update(order.id, "delivered")} />
                  </>
                )}
              </ActionRow>
            </Card>
          );
        })
      ) : (
        <Notice tone="info" message={tab !== "all" ? `No ${tab} orders.` : "No seller orders yet."} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    color: colors.text,
    fontWeight: "500",
  },
  orderBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  orderMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaLabel: {
    color: colors.muted,
  },
});
