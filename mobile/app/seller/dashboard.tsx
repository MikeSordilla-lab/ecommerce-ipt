import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { apiFetch } from "@/api/client";
import type { Order, Product } from "@/api/types";
import { ActionRow, Button, Card, Hero, Loading, Money, Muted, Notice, Screen, SellerBottomNav, StatCard, StatusChip, Subtitle } from "@/components/ui";
import { colors } from "@/theme/colors";

type SellerDashboard = {
  stats: {
    products: number;
    total_orders: number;
    pending_orders: number;
    delivered_orders: number;
    total_sales: number;
    low_stock_count: number;
  };
  recent_orders: Order[];
  low_stock_products: Product[];
};

function formatPeso(n: number | null | undefined): string {
  return "₱" + (n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function num(n: number | null | undefined): number {
  return typeof n === "number" ? n : 0;
}

export default function SellerDashboardScreen() {
  const [data, setData] = useState<SellerDashboard | null>(null);
  const [message, setMessage] = useState("");
  const mounted = useRef(true);

  useFocusEffect(
    useCallback(() => {
      mounted.current = true;
      apiFetch<SellerDashboard>("/api/mobile/seller/dashboard.php")
        .then((res) => { if (mounted.current) setData(res); })
        .catch((error) => { if (mounted.current) setMessage(error instanceof Error ? error.message : "Could not load seller dashboard"); });
      return () => { mounted.current = false; };
    }, []),
  );

  if (!data && !message) {
    return <Loading />;
  }

  const s = data?.stats as SellerDashboard["stats"] | undefined;
  const totalSales = num(s?.total_sales);
  const totalOrders = num(s?.total_orders);
  const pendingOrders = num(s?.pending_orders);
  const deliveredOrders = num(s?.delivered_orders);
  const lowStockCount = num(s?.low_stock_count);
  const needsAttention = lowStockCount > 0 || pendingOrders > 0;

  return (
    <Screen bottomNav={<SellerBottomNav activeRoute="dashboard" />}>
      <Hero title="Dashboard" subtitle="Overview of your seller store." />
      {message ? <Notice tone="danger" message={message} /> : null}
      {data ? (
        <>
          <View style={styles.statsRow}>
            <StatCard label="Sales" value={formatPeso(totalSales)} icon="currency-php" />
            <StatCard label="Orders" value={totalOrders} icon="receipt" />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Pending" value={pendingOrders} icon="clock-outline" />
            <StatCard label="Delivered" value={deliveredOrders} icon="check-circle" />
            <StatCard label="Low Stock" value={lowStockCount} icon="alert-circle" />
          </View>

          <ActionRow>
            <Button title="Add Product" icon="plus" onPress={() => router.push("/seller/product-form")} />
            <Button title="View Orders" icon="receipt" variant="secondary" onPress={() => router.push("/seller/orders")} />
            <Button title="Products" icon="package-variant" variant="secondary" onPress={() => router.push("/seller/products")} />
          </ActionRow>

          {needsAttention ? (
            <Card>
              <View style={styles.sectionHeader}>
                <IconButton icon="alert-decagram" size={18} iconColor={colors.warning} style={styles.noMargin} />
                <Text variant="titleSmall" style={styles.sectionTitle}>Needs Attention</Text>
              </View>
              {lowStockCount > 0 && (
                <View style={styles.attentionItem}>
                  <IconButton icon="package-variant-closed" size={16} iconColor={colors.warning} style={styles.noMargin} />
                  <Text variant="bodySmall" style={styles.attentionText}>
                    {lowStockCount} product{lowStockCount > 1 ? "s" : ""} low on stock
                  </Text>
                  <Button title="View" variant="ghost" onPress={() => router.push("/seller/products")} />
                </View>
              )}
              {pendingOrders > 0 && (
                <View style={styles.attentionItem}>
                  <IconButton icon="clock-outline" size={16} iconColor={colors.warning} style={styles.noMargin} />
                  <Text variant="bodySmall" style={styles.attentionText}>
                    {pendingOrders} order{pendingOrders > 1 ? "s" : ""} pending
                  </Text>
                  <Button title="View" variant="ghost" onPress={() => router.push("/seller/orders")} />
                </View>
              )}
            </Card>
          ) : null}

          {data.low_stock_products && data.low_stock_products.length > 0 && (
            <Card>
              <View style={styles.sectionHeader}>
                <IconButton icon="alert" size={18} iconColor={colors.warning} style={styles.noMargin} />
                <Text variant="titleSmall" style={styles.sectionTitle}>Low Stock Products</Text>
              </View>
              {data.low_stock_products.map((product) => (
                <View key={product.id} style={styles.lowStockItem}>
                  <View style={styles.lowStockInfo}>
                    <Text variant="bodyMedium" style={styles.lowStockName} numberOfLines={1}>{product.name}</Text>
                    <Muted>Stock: {product.stock}</Muted>
                  </View>
                  <StatusChip tone="warning">Low</StatusChip>
                </View>
              ))}
            </Card>
          )}

          <Subtitle>Recent Orders</Subtitle>
          {data.recent_orders && data.recent_orders.length ? (
            data.recent_orders.map((order) => (
              <Card key={order.id}>
                <View style={styles.orderHeader}>
                  <Text variant="titleSmall" style={styles.orderId}>Order #{order.id}</Text>
                  <StatusChip tone={order.status === "delivered" ? "success" : order.status === "shipped" ? "info" : "warning"}>{order.status}</StatusChip>
                </View>
                <View style={styles.orderBody}>
                  <Money value={order.total} size="small" />
                  <Muted>{order.username}</Muted>
                </View>
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

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  noMargin: {
    margin: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "600",
  },
  attentionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  attentionText: {
    color: colors.label,
    flex: 1,
  },
  lowStockItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  lowStockInfo: {
    flex: 1,
    marginRight: 8,
  },
  lowStockName: {
    color: colors.text,
  },
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
});
