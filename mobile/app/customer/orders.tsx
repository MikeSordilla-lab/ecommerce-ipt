import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Text, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch } from "@/api/client";
import type { Order } from "@/api/types";
import { colors } from "@/theme/colors";

const MARGIN_MOBILE = 20;

const NAV_ITEMS = [
  { key: "shop", label: "Shop", icon: "storefront" },
  { key: "cart", label: "Cart", icon: "shopping-cart" },
  { key: "orders", label: "Orders", icon: "package" },
  { key: "profile", label: "Profile", icon: "account" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

function handleNavRoute(key: NavKey) {
  if (key === "shop") router.push("/customer/shop");
  else if (key === "cart") router.push("/customer/cart");
  else if (key === "profile") router.push("/customer/profile");
}

type StatusTone = "success" | "info" | "warning" | "danger";

function getOrderTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s === "delivered") return "success";
  if (s === "shipped") return "info";
  if (s === "cancelled") return "danger";
  return "warning";
}

const toneMap: Record<
  StatusTone,
  { bg: string; text: string; border: string }
> = {
  success: {
    bg: colors.successSoft,
    text: colors.successText,
    border: "rgba(21,190,83,0.35)",
  },
  info: {
    bg: colors.surfaceContainerHigh,
    text: colors.primaryContainer,
    border: colors.border,
  },
  warning: {
    bg: colors.warningSoft,
    text: colors.warning,
    border: "rgba(155,104,41,0.3)",
  },
  danger: {
    bg: colors.errorContainer,
    text: colors.error,
    border: colors.error,
  },
};

function StatusPill({ status }: { status: string }) {
  const tone = getOrderTone(status);
  const { bg, text, border } = toneMap[tone];
  return (
    <View
      style={{
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 9999,
        paddingHorizontal: 10,
        paddingVertical: 3,
      }}
    >
      <Text
        style={{
          color: text,
          fontSize: 11,
          fontWeight: "500",
          textTransform: "capitalize",
        }}
      >
        {status}
      </Text>
    </View>
  );
}

export default function CustomerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      apiFetch<{ orders: Order[] }>("/api/mobile/orders.php")
        .then((data) => setOrders(data.orders))
        .catch((error) =>
          setMessage(
            error instanceof Error ? error.message : "Could not load orders"
          )
        )
        .finally(() => setLoading(false));
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Top Bar ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/customer/shop")}
          activeOpacity={0.8}
        >
          <IconButton
            icon="arrow-left"
            iconColor={colors.primaryContainer}
            size={20}
            style={styles.noMargin}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primaryContainer} size="large" />
          <Text style={styles.loadingText}>Loading orders…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>My Orders</Text>
            <Text style={styles.heroSubtitle}>
              Track payment, fulfillment, and order history
            </Text>
          </View>

          {/* Error */}
          {message ? (
            <View style={styles.errorBanner}>
              <IconButton
                icon="alert-circle"
                iconColor={colors.error}
                size={16}
                style={styles.noMargin}
              />
              <Text style={styles.errorText}>{message}</Text>
            </View>
          ) : null}

          {/* Empty */}
          {orders.length === 0 && !message ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <IconButton
                  icon="package-variant-closed"
                  size={52}
                  iconColor={colors.outlineVariant}
                  style={styles.noMargin}
                />
              </View>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySubtitle}>
                Your order history will appear here
              </Text>
              <TouchableOpacity
                style={styles.shopBtn}
                onPress={() => router.push("/customer/shop")}
                activeOpacity={0.85}
              >
                <IconButton
                  icon="storefront"
                  iconColor={colors.onPrimaryContainer}
                  size={18}
                  style={styles.noMargin}
                />
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map((order) => (
                <TouchableRipple
                  key={order.id}
                  style={styles.orderCard}
                  borderless
                  onPress={() => {}}
                >
                  <View>
                    {/* Card top accent */}
                    <View
                      style={[
                        styles.cardAccent,
                        {
                          backgroundColor:
                            toneMap[getOrderTone(order.status)].text,
                        },
                      ]}
                    />

                    {/* Header row */}
                    <View style={styles.cardHeader}>
                      <View style={styles.orderIconBg}>
                        <IconButton
                          icon="receipt"
                          iconColor={colors.primaryContainer}
                          size={18}
                          style={styles.noMargin}
                        />
                      </View>
                      <View style={styles.cardHeaderText}>
                        <Text style={styles.orderId}>Order #{order.id}</Text>
                        <Text style={styles.orderDate}>
                          {new Date(order.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </Text>
                      </View>
                      <Text style={styles.orderTotal}>
                        ${Number(order.total).toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.cardDivider} />

                    {/* Status + payment row */}
                    <View style={styles.cardFooter}>
                      <View style={styles.chipRow}>
                        <StatusPill status={order.status} />
                        <View style={styles.paymentPill}>
                          <Text style={styles.paymentPillText}>
                            {order.payment_status_label}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.paymentMethodRow}>
                        <IconButton
                          icon="credit-card"
                          size={14}
                          iconColor={colors.muted}
                          style={styles.noMargin}
                        />
                        <Text style={styles.paymentMethodText}>
                          {order.payment_label}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableRipple>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Bottom Nav ── */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === "orders";
          return (
            <TouchableRipple
              key={item.key}
              onPress={() => {
                if (!isActive) handleNavRoute(item.key);
              }}
              style={styles.navItem}
            >
              <View style={styles.navItemInner}>
                <IconButton
                  icon={item.icon}
                  iconColor={isActive ? colors.primaryContainer : colors.muted}
                  size={22}
                  style={[styles.noMargin, isActive && styles.navIconActive]}
                />
                <Text
                  style={[
                    styles.navLabel,
                    isActive ? styles.navLabelActive : styles.navLabelInactive,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableRipple>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MARGIN_MOBILE,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  headerTitle: {
    color: colors.primaryContainer,
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: -0.22,
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

  /* Loading */
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: colors.muted, fontSize: 14, fontWeight: "300" },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: MARGIN_MOBILE,
    paddingTop: 24,
    paddingBottom: 90,
    gap: 16,
  },

  /* Hero */
  hero: { gap: 4, marginBottom: 4 },
  heroTitle: {
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: "300",
    letterSpacing: -0.22,
  },
  heroSubtitle: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "300",
    lineHeight: 20,
  },

  /* Error */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.errorContainer,
    gap: 6,
  },
  errorText: { color: colors.error, fontSize: 13 },

  /* Empty */
  emptyState: { alignItems: "center", paddingTop: 48, gap: 10 },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: { color: colors.label, fontSize: 18, fontWeight: "400" },
  emptySubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "300",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 6,
    marginTop: 8,
  },
  shopBtnText: { color: colors.onPrimaryContainer, fontSize: 14, fontWeight: "500" },

  /* Orders List */
  ordersList: { gap: 12 },
  orderCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
  cardAccent: { height: 3, opacity: 0.6 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  orderIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeaderText: { flex: 1 },
  orderId: { color: colors.onSurface, fontSize: 15, fontWeight: "500" },
  orderDate: { color: colors.muted, fontSize: 12, fontWeight: "300", marginTop: 2 },
  orderTotal: {
    color: colors.primaryContainer,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.18,
  },
  cardDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
  },
  chipRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  paymentPill: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentPillText: { color: colors.secondary, fontSize: 11, fontWeight: "400" },
  paymentMethodRow: { flexDirection: "row", alignItems: "center" },
  paymentMethodText: { color: colors.muted, fontSize: 11, fontWeight: "300" },

  /* Bottom Nav */
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: Platform.OS === "android" ? 0 : 8,
    shadowColor: colors.shadowSoft,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  navItem: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 4 },
  navItemInner: { alignItems: "center", justifyContent: "center" },
  navIconActive: { borderTopWidth: 2, borderTopColor: colors.primaryContainer },
  navLabel: { fontSize: 11, fontWeight: "400", marginTop: -4 },
  navLabelActive: { color: colors.primaryContainer, fontWeight: "600" },
  navLabelInactive: { color: colors.muted },
  noMargin: { margin: 0 },
});
