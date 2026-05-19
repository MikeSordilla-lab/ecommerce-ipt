import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Text, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, jsonBody } from "@/api/client";
import type { CartItem } from "@/api/types";
import { colors } from "@/theme/colors";

const MARGIN_MOBILE = 20;

const NAV_ITEMS = [
  { key: "shop", label: "Shop", icon: "storefront" },
  { key: "cart", label: "Cart", icon: "shopping-cart" },
  { key: "orders", label: "Orders", icon: "package" },
  { key: "profile", label: "Profile", icon: "account" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  min = 1,
  max = 99,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
}) {
  return (
    <View style={stepper.wrap}>
      <TouchableOpacity
        style={[stepper.btn, value <= min && stepper.btnDisabled]}
        onPress={onDecrease}
        disabled={value <= min}
        activeOpacity={0.8}
      >
        <Text style={stepper.symbol}>−</Text>
      </TouchableOpacity>
      <Text style={stepper.value}>{value}</Text>
      <TouchableOpacity
        style={[stepper.btn, value >= max && stepper.btnDisabled]}
        onPress={onIncrease}
        disabled={value >= max}
        activeOpacity={0.8}
      >
        <Text style={stepper.symbol}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const stepper = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  btn: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
  },
  btnDisabled: { opacity: 0.35 },
  symbol: { fontSize: 18, color: colors.primaryContainer, fontWeight: "400" },
  value: {
    width: 32,
    textAlign: "center",
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: "500",
  },
});

function handleNavRoute(key: NavKey) {
  if (key === "shop") router.push("/customer/shop");
  else if (key === "orders") router.push("/customer/orders");
  else if (key === "profile") router.push("/customer/profile");
}

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoMessageType, setPromoMessageType] = useState<"success" | "error">("error");
  const [promoDiscount, setPromoDiscount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ items: CartItem[]; subtotal: number }>(
        "/api/mobile/cart.php"
      );
      setItems(data.items);
      setSubtotal(data.subtotal);
      setPromoCode("");
      setPromoDiscount(0);
      setPromoMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load cart");
        setLoading(false);
      });
    }, [load])
  );

  const applyPromoCode = useCallback(async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoMessage("");
    try {
      const discountCodes: Record<string, number> = {
        SAVE10: 10,
        WELCOME20: 20,
        FREESHIP: 0,
      };
      const key = promoCode.toUpperCase();
      if (key in discountCodes) {
        const pct = discountCodes[key];
        setPromoDiscount(pct);
        setPromoMessage(`Applied ${key}! ${pct > 0 ? `${pct}% off` : "Free shipping"}`);
        setPromoMessageType("success");
      } else {
        setPromoMessage("Invalid promo code");
        setPromoMessageType("error");
      }
    } catch {
      setPromoMessage("Could not apply promo code");
      setPromoMessageType("error");
    } finally {
      setPromoLoading(false);
    }
  }, [promoCode]);

  async function updateQuantity(item: CartItem, quantity: number) {
    await apiFetch("/api/mobile/cart.php", {
      method: "PATCH",
      body: jsonBody({ cart_item_id: item.cart_item_id, quantity }),
    });
    await load();
  }

  async function removeItem(item: CartItem) {
    await apiFetch("/api/mobile/cart.php", {
      method: "DELETE",
      body: jsonBody({ cart_item_id: item.cart_item_id }),
    });
    await load();
  }

  const discountAmt = subtotal * (promoDiscount / 100);
  const taxable = subtotal - discountAmt;
  const tax = taxable * 0.085;
  const total = taxable + tax;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primaryContainer} size="large" />
          <Text style={styles.loadingText}>Loading cart…</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <IconButton icon="arrow-left" iconColor={colors.primaryContainer} size={20} style={styles.noMargin} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={styles.cartBadgeWrap}>
          {items.length > 0 && (
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{items.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Error Banner ── */}
      {message ? (
        <View style={styles.errorBanner}>
          <IconButton icon="alert-circle" iconColor={colors.error} size={16} style={styles.noMargin} />
          <Text style={styles.errorText}>{message}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          /* ── Empty State ── */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <IconButton icon="cart-outline" size={52} iconColor={colors.outlineVariant} style={styles.noMargin} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add items from the shop to get started
            </Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => router.push("/customer/shop")}
              activeOpacity={0.85}
            >
              <IconButton icon="storefront" iconColor={colors.onPrimaryContainer} size={18} style={styles.noMargin} />
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── Item Count ── */}
            <Text style={styles.itemCountText}>
              {items.length} {items.length === 1 ? "item" : "items"} ready for checkout
            </Text>

            {/* ── Cart Items ── */}
            <View style={styles.itemsCard}>
              {items.map((item, idx) => (
                <View key={item.cart_item_id}>
                  {idx > 0 && <View style={styles.itemDivider} />}
                  <View style={styles.cartItem}>
                    {/* Image */}
                    <View style={styles.itemImgWrap}>
                      {item.image_url ? (
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.itemImg}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.imgPlaceholder}>
                          <IconButton icon="image" size={24} iconColor={colors.outlineVariant} style={styles.noMargin} />
                        </View>
                      )}
                    </View>

                    {/* Details */}
                    <View style={styles.itemDetails}>
                      <View style={styles.itemTop}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeItem(item)}
                          style={styles.removeBtn}
                          activeOpacity={0.7}
                        >
                          <IconButton icon="close" size={16} iconColor={colors.outlineVariant} style={styles.noMargin} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.itemBottom}>
                        <Text style={styles.itemPrice}>
                          ${Number(item.subtotal).toFixed(2)}
                        </Text>
                        <QuantityStepper
                          value={item.quantity}
                          onDecrease={() => updateQuantity(item, item.quantity - 1)}
                          onIncrease={() => updateQuantity(item, item.quantity + 1)}
                          min={1}
                          max={item.stock}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* ── Promo Code ── */}
            <View style={styles.promoCard}>
              <Text style={styles.promoTitle}>Promo Code</Text>
              <View style={styles.promoRow}>
                <TextInput
                  placeholder="Enter code…"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  style={styles.promoInput}
                  placeholderTextColor={colors.muted}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[
                    styles.promoApplyBtn,
                    (!promoCode.trim() || promoLoading) && styles.promoApplyBtnDisabled,
                  ]}
                  onPress={applyPromoCode}
                  disabled={!promoCode.trim() || promoLoading}
                  activeOpacity={0.85}
                >
                  {promoLoading ? (
                    <ActivityIndicator color={colors.onPrimaryContainer} size="small" />
                  ) : (
                    <Text style={styles.promoApplyText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
              {promoMessage ? (
                <Text
                  style={[
                    styles.promoMsg,
                    promoMessageType === "success"
                      ? styles.promoMsgSuccess
                      : styles.promoMsgError,
                  ]}
                >
                  {promoMessage}
                </Text>
              ) : null}
            </View>

            {/* ── Order Summary ── */}
            <View style={styles.summaryCard}>
              {/* accent top line */}
              <View style={styles.summaryAccent} />
              <Text style={styles.summaryTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>

              {promoDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount ({promoDiscount}%)</Text>
                  <Text style={[styles.summaryValue, { color: colors.successText }]}>
                    −${discountAmt.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated Shipping</Text>
                <View style={styles.freeRow}>
                  <IconButton icon="truck-fast" size={14} iconColor={colors.successText} style={styles.noMargin} />
                  <Text style={styles.freeText}>Free</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated Tax (8.5%)</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>

              <View style={styles.totalDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>

              {/* Checkout button */}
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => router.push("/customer/checkout")}
                activeOpacity={0.88}
              >
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                <IconButton icon="arrow-right" iconColor={colors.onPrimaryContainer} size={18} style={styles.noMargin} />
              </TouchableOpacity>

              {/* Trust badges */}
              <View style={styles.trustRow}>
                <IconButton icon="lock" size={16} iconColor={colors.outlineVariant} style={styles.noMargin} />
                <Text style={styles.trustText}>Secure checkout</Text>
                <IconButton icon="shield-check" size={16} iconColor={colors.outlineVariant} style={styles.noMargin} />
                <Text style={styles.trustText}>Buyer protected</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === "cart";
          return (
            <TouchableRipple
              key={item.key}
              onPress={() => {
                if (item.key !== "cart") handleNavRoute(item.key);
              }}
              style={styles.navItem}
            >
              <View style={styles.navItemInner}>
                {item.key === "cart" && items.length > 0 ? (
                  <View style={styles.navCartWrap}>
                    <IconButton
                      icon={item.icon}
                      iconColor={colors.primaryContainer}
                      size={22}
                      style={[styles.noMargin, styles.navIconActive]}
                    />
                    <View style={styles.navDot} />
                  </View>
                ) : (
                  <IconButton
                    icon={item.icon}
                    iconColor={isActive ? colors.primaryContainer : colors.muted}
                    size={22}
                    style={[styles.noMargin, isActive && styles.navIconActive]}
                  />
                )}
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
  cartBadgeWrap: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  cartCountBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  cartCountText: { color: colors.onPrimaryContainer, fontSize: 11, fontWeight: "600" },

  /* Error */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: MARGIN_MOBILE,
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.errorContainer,
    gap: 6,
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: "400" },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: MARGIN_MOBILE,
    paddingTop: 20,
    paddingBottom: 90,
    gap: 16,
  },

  /* Loading */
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: colors.muted, fontSize: 14, fontWeight: "300" },

  /* Empty state */
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
    fontSize: 14,
    fontWeight: "300",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  shopNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 6,
    marginTop: 8,
  },
  shopNowText: { color: colors.onPrimaryContainer, fontSize: 14, fontWeight: "500" },

  /* Item count */
  itemCountText: { color: colors.muted, fontSize: 13, fontWeight: "300" },

  /* Items card */
  itemsCard: {
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
  itemDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 12 },
  cartItem: {
    flexDirection: "row",
    padding: 14,
    gap: 12,
  },
  itemImgWrap: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: "hidden",
  },
  itemImg: { width: "100%", height: "100%" },
  imgPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  itemDetails: { flex: 1, justifyContent: "space-between" },
  itemTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemName: { color: colors.label, fontSize: 14, fontWeight: "400", flex: 1, lineHeight: 20 },
  removeBtn: { marginLeft: 4 },
  itemBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  itemPrice: { color: colors.primaryContainer, fontSize: 16, fontWeight: "600" },

  /* Promo */
  promoCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
  promoTitle: { color: colors.label, fontSize: 14, fontWeight: "500" },
  promoRow: { flexDirection: "row", gap: 8 },
  promoInput: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: "300",
    letterSpacing: 1,
  },
  promoApplyBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  promoApplyBtnDisabled: { opacity: 0.45 },
  promoApplyText: { color: colors.onPrimaryContainer, fontSize: 13, fontWeight: "500" },
  promoMsg: { fontSize: 12, fontWeight: "400" },
  promoMsgSuccess: { color: colors.successText },
  promoMsgError: { color: colors.error },

  /* Summary */
  summaryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    overflow: "hidden",
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
  summaryAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primaryContainer,
    opacity: 0.4,
  },
  summaryTitle: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 14,
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: { color: colors.muted, fontSize: 13, fontWeight: "300" },
  summaryValue: { color: colors.label, fontSize: 13, fontWeight: "400" },
  freeRow: { flexDirection: "row", alignItems: "center" },
  freeText: { color: colors.successText, fontSize: 13, fontWeight: "500" },
  totalDivider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  totalLabel: { color: colors.onSurface, fontSize: 16, fontWeight: "500" },
  totalValue: { color: colors.primaryContainer, fontSize: 22, fontWeight: "600", letterSpacing: -0.22 },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryContainer,
    borderRadius: 10,
    paddingVertical: 14,
    gap: 6,
    marginTop: 16,
  },
  checkoutText: { color: colors.onPrimaryContainer, fontSize: 15, fontWeight: "600" },
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    opacity: 0.6,
    gap: 4,
  },
  trustText: { color: colors.muted, fontSize: 11, fontWeight: "300" },

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
  navCartWrap: { position: "relative" },
  navDot: {
    position: "absolute",
    top: 4,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  navIconActive: { borderTopWidth: 2, borderTopColor: colors.primaryContainer },
  navLabel: { fontSize: 11, fontWeight: "400", marginTop: -4 },
  navLabelActive: { color: colors.primaryContainer, fontWeight: "600" },
  navLabelInactive: { color: colors.muted },
  noMargin: { margin: 0 },
});