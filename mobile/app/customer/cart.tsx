import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image } from "expo-image";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Text, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, jsonBody } from "@/api/client";
import type { CartItem } from "@/api/types";
import { colors } from "@/theme/colors";
import { BadgeChip, Button, DividerLine, Notice, PrimaryButton, QuantityStepper } from "@/components/ui";

const MARGIN_MOBILE = 20;

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch<{ items: CartItem[]; subtotal: number }>("/api/mobile/cart.php");
    setItems(data.items);
    setSubtotal(data.subtotal);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load cart");
        setLoading(false);
      });
    }, [load]),
  );

  async function updateQuantity(item: CartItem, quantity: number) {
    await apiFetch("/api/mobile/cart.php", {
      method: "PATCH",
      body: jsonBody({ cart_item_id: item.cart_item_id, quantity }),
    });
    await load();
  }

  async function remove(item: CartItem) {
    await apiFetch("/api/mobile/cart.php", {
      method: "DELETE",
      body: jsonBody({ cart_item_id: item.cart_item_id }),
    });
    await load();
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <IconButton icon="loader" size={32} iconColor={colors.primaryContainer} />
          <Text variant="bodyMedium" style={styles.loadingText}>Loading</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableRipple style={styles.avatar}>
          <IconButton icon="account" iconColor={colors.secondary} size={20} />
        </TouchableRipple>
        <Text variant="titleLarge" style={styles.topBarTitle}>Your Cart</Text>
        <TouchableRipple style={styles.iconBtn}>
          <IconButton icon="magnify" iconColor={colors.primaryContainer} size={20} />
        </TouchableRipple>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {message ? (
          <Notice
            message={message}
            tone={message.includes("Added") ? "success" : "danger"}
            icon={message.includes("Added") ? "check-circle" : "alert-circle"}
          />
        ) : null}

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <IconButton icon="cart-outline" size={64} iconColor={colors.outline} />
            <Text variant="titleLarge" style={styles.emptyTitle}>Your Cart</Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>2 items ready for checkout</Text>
            <View style={styles.emptyCartItems}>
              <Text variant="bodyMedium" style={styles.emptyText}>Your cart is empty</Text>
            </View>
            <PrimaryButton
              title="Start Shopping"
              onPress={() => router.push("/customer/shop")}
              icon="storefront"
              style={styles.continueBtn}
            />
          </View>
        ) : (
          <>
            <Text variant="bodyMedium" style={styles.itemCount}>{items.length} items ready for checkout</Text>

            <View style={styles.itemsList}>
              {items.map((item) => (
                <View key={item.cart_item_id} style={styles.cartItem}>
                  <View style={styles.itemImageContainer}>
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={styles.itemImage} contentFit="cover" />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <IconButton icon="image" size={24} iconColor={colors.outline} />
                      </View>
                    )}
                  </View>
                  <View style={styles.itemDetails}>
                    <View style={styles.itemHeader}>
                      <Text variant="bodyMedium" style={styles.itemName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <TouchableRipple
                        onPress={() => remove(item)}
                        style={styles.removeBtn}
                      >
                        <IconButton icon="close" size={18} iconColor={colors.outlineVariant} />
                      </TouchableRipple>
                    </View>
                    <Text variant="labelSmall" style={styles.itemVariant}>Qty: {item.quantity}</Text>
                    <View style={styles.itemFooter}>
                      <Text variant="titleMedium" style={styles.itemPrice}>
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
              ))}
            </View>

            <View style={styles.orderSummary}>
              <View style={styles.summaryTopAccent} />
              <Text variant="titleMedium" style={styles.summaryTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>Subtotal</Text>
                <Text variant="labelMedium" style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>Estimated Shipping</Text>
                <View style={styles.freeShipping}>
                  <IconButton icon="local-shipping" size={14} iconColor={colors.successText} style={styles.freeIcon} />
                  <Text variant="labelMedium" style={styles.freeText}>Free</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>Estimated Tax</Text>
                <Text variant="labelMedium" style={styles.summaryValue}>${(subtotal * 0.085).toFixed(2)}</Text>
              </View>

              <DividerLine />

              <View style={styles.summaryRow}>
                <Text variant="titleMedium" style={styles.totalLabel}>Total</Text>
                <Text variant="headlineSmall" style={styles.totalValue}>
                  ${(subtotal * 1.085).toFixed(2)}
                </Text>
              </View>

              <PrimaryButton
                title="Proceed to Checkout"
                onPress={() => router.push("/customer/checkout")}
                icon="arrow-forward"
                fullWidth
                style={styles.checkoutBtn}
              />

              <View style={styles.trustBadges}>
                <IconButton icon="lock" size={18} iconColor={colors.muted} style={styles.trustIcon} />
                <IconButton icon="shield-check" size={18} iconColor={colors.muted} style={styles.trustIcon} />
                <IconButton icon="credit-card" size={18} iconColor={colors.muted} style={styles.trustIcon} />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableRipple style={styles.navItem}>
          <View style={styles.navItemInner}>
            <IconButton icon="storefront" iconColor={colors.muted} size={22} />
            <Text variant="labelSmall" style={styles.navLabel}>Shop</Text>
          </View>
        </TouchableRipple>
        <TouchableRipple style={styles.navItem}>
          <View style={styles.navItemInner}>
            <View style={styles.activeNavIcon}>
              <IconButton icon="shopping-cart" iconColor={colors.primaryContainer} size={22} />
              <View style={styles.cartBadge} />
            </View>
            <Text variant="labelSmall" style={[styles.navLabel, styles.navLabelActive]}>Cart</Text>
          </View>
        </TouchableRipple>
        <TouchableRipple style={styles.navItem}>
          <View style={styles.navItemInner}>
            <IconButton icon="package" iconColor={colors.muted} size={22} />
            <Text variant="labelSmall" style={styles.navLabel}>Orders</Text>
          </View>
        </TouchableRipple>
        <TouchableRipple style={styles.navItem}>
          <View style={styles.navItemInner}>
            <IconButton icon="account" iconColor={colors.muted} size={22} />
            <Text variant="labelSmall" style={styles.navLabel}>Profile</Text>
          </View>
        </TouchableRipple>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MARGIN_MOBILE,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBarTitle: {
    color: colors.primaryContainer,
    fontWeight: "600",
    fontSize: 18,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtn: {
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: MARGIN_MOBILE,
    paddingBottom: 100,
    gap: 16,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: colors.muted,
  },
  itemCount: {
    color: colors.muted,
    fontWeight: "300",
  },
  itemsList: {
    gap: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },
  itemImageContainer: {
    width: 96,
    height: 96,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 6,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: {
    color: colors.label,
    fontWeight: "400",
    flex: 1,
    lineHeight: 20,
  },
  removeBtn: {
    margin: -8,
  },
  itemVariant: {
    color: colors.muted,
    marginTop: 2,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  itemPrice: {
    color: colors.primaryContainer,
    fontWeight: "500",
  },
  orderSummary: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 8,
    overflow: "hidden",
  },
  summaryTopAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primaryContainer,
    opacity: 0.2,
  },
  summaryTitle: {
    color: colors.label,
    fontWeight: "400",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    color: colors.muted,
    fontWeight: "300",
  },
  summaryValue: {
    color: colors.label,
    fontVariant: ["tabular-nums"],
  },
  freeShipping: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  freeIcon: {
    margin: 0,
    marginLeft: -8,
  },
  freeText: {
    color: colors.successText,
  },
  totalLabel: {
    color: colors.label,
    fontWeight: "400",
  },
  totalValue: {
    color: colors.primaryContainer,
    fontWeight: "500",
    letterSpacing: -0.22,
  },
  checkoutBtn: {
    marginTop: 16,
  },
  trustBadges: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    opacity: 0.6,
  },
  trustIcon: {
    margin: 0,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    color: colors.label,
    fontWeight: "300",
  },
  emptySubtitle: {
    color: colors.muted,
    fontWeight: "300",
  },
  emptyCartItems: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  emptyText: {
    color: colors.muted,
  },
  continueBtn: {
    marginTop: 8,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 56,
    paddingBottom: Platform.OS === "android" ? 0 : 8,
    shadowColor: colors.shadowSoft,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  navItemInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeNavIcon: {
    position: "relative",
    borderTopWidth: 2,
    borderTopColor: colors.primaryContainer,
    paddingTop: 2,
    borderRadius: 0,
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  navLabel: {
    color: colors.muted,
    marginTop: -4,
  },
  navLabelActive: {
    color: colors.primaryContainer,
    fontWeight: "500",
  },
});