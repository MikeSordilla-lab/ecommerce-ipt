import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch } from "@/api/client";
import type { Order, OrderItem } from "@/api/types";
import { colors } from "@/theme/colors";

const MARGIN_MOBILE = 20;

type DetailResponse = {
  order: Order;
  items: OrderItem[];
};

function statusColor(status: string) {
  const value = status.toLowerCase();
  if (value === "delivered") return colors.successText;
  if (value === "shipped") return colors.primaryContainer;
  if (value === "cancelled") return colors.error;
  return colors.warning;
}

function StatusStep({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepDot, (active || done) && styles.stepDotActive]}>
        {done ? (
          <IconButton icon="check" iconColor={colors.onPrimaryContainer} size={12} style={styles.noMargin} />
        ) : null}
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

export default function CustomerOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch<DetailResponse>(`/api/mobile/order.php?id=${encodeURIComponent(id ?? "")}`)
      .then((data) => {
        setOrder(data.order);
        setItems(data.items);
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Could not load order")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const currentStatus = order?.status.toLowerCase() ?? "pending";
  const shipped = currentStatus === "shipped" || currentStatus === "delivered";
  const delivered = currentStatus === "delivered";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <IconButton icon="arrow-left" iconColor={colors.primaryContainer} size={20} style={styles.noMargin} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Detail</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primaryContainer} size="large" />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      ) : message || !order ? (
        <View style={styles.emptyState}>
          <IconButton icon="alert-circle" iconColor={colors.error} size={48} style={styles.noMargin} />
          <Text style={styles.emptyTitle}>{message || "Order not found"}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.orderLabel}>Order #{order.id}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View style={[styles.statusPill, { borderColor: statusColor(order.status) }]}>
                <Text style={[styles.statusText, { color: statusColor(order.status) }]}>
                  {order.status}
                </Text>
              </View>
            </View>

            <Text style={styles.total}>${Number(order.total).toFixed(2)}</Text>

            <View style={styles.steps}>
              <StatusStep label="Placed" active={currentStatus === "pending"} done={shipped || delivered} />
              <View style={[styles.stepLine, (shipped || delivered) && styles.stepLineActive]} />
              <StatusStep label="Shipped" active={currentStatus === "shipped"} done={delivered} />
              <View style={[styles.stepLine, delivered && styles.stepLineActive]} />
              <StatusStep label="Delivered" active={delivered} done={delivered} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Method</Text>
              <Text style={styles.rowValue}>{order.payment_label}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Status</Text>
              <Text style={styles.rowValue}>{order.payment_status_label}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Shipping</Text>
            <Text style={styles.addressName}>{order.shipping_address.full_name ?? "Customer"}</Text>
            <Text style={styles.addressText}>{order.shipping_address.phone ?? ""}</Text>
            <Text style={styles.addressText}>{order.shipping_address.address ?? ""}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Items</Text>
            {items.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.product_name}</Text>
                    <Text style={styles.itemMeta}>Qty {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    ${(Number(item.price_at_purchase) * Number(item.quantity)).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MARGIN_MOBILE,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.primaryContainer,
    fontWeight: "700",
    fontSize: 18,
    flex: 1,
    textAlign: "center",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: colors.muted, fontSize: 14 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10, padding: 24 },
  emptyTitle: { color: colors.label, fontSize: 16, textAlign: "center" },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: MARGIN_MOBILE,
    paddingTop: 20,
    paddingBottom: Platform.OS === "android" ? 28 : 42,
    gap: 14,
  },
  summaryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  orderLabel: { color: colors.onSurface, fontSize: 18, fontWeight: "600" },
  orderDate: { color: colors.muted, fontSize: 12, marginTop: 2 },
  statusPill: {
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.surfaceContainerLow,
  },
  statusText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  total: {
    color: colors.primaryContainer,
    fontSize: 26,
    fontWeight: "700",
  },
  steps: { flexDirection: "row", alignItems: "center" },
  step: { alignItems: "center", gap: 6 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  stepLabel: { color: colors.muted, fontSize: 11 },
  stepLabelActive: { color: colors.primaryContainer, fontWeight: "600" },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 8, marginBottom: 20 },
  stepLineActive: { backgroundColor: colors.primaryContainer },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { color: colors.label, fontSize: 14, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  rowLabel: { color: colors.muted, fontSize: 13 },
  rowValue: { color: colors.label, fontSize: 13, fontWeight: "500", textAlign: "right", flex: 1 },
  addressName: { color: colors.onSurface, fontSize: 14, fontWeight: "500" },
  addressText: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 4 },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { color: colors.onSurface, fontSize: 14, fontWeight: "500" },
  itemMeta: { color: colors.muted, fontSize: 12 },
  itemPrice: { color: colors.primaryContainer, fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  noMargin: { margin: 0 },
});
