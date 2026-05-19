import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Checkbox, Divider, IconButton, RadioButton, Text, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, jsonBody } from "@/api/client";
import type { Address, CartItem } from "@/api/types";
import { colors } from "@/theme/colors";
import { Button, DividerLine, Field, Loading, Notice, PrimaryButton } from "@/components/ui";

const MARGIN_MOBILE = 20;

export default function CheckoutScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [cart, saved] = await Promise.all([
      apiFetch<{ items: CartItem[]; subtotal: number }>("/api/mobile/cart.php"),
      apiFetch<{ addresses: Address[] }>("/api/mobile/addresses.php"),
    ]);
    setItems(cart.items);
    setSubtotal(cart.subtotal);
    setAddresses(saved.addresses);
    const defaultAddress = saved.addresses.find((item) => item.is_default) || saved.addresses[0];
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load checkout");
        setLoading(false);
      });
    }, [load]),
  );

  async function placeOrder() {
    setMessage("");
    try {
      const body = selectedAddressId
        ? { address_id: selectedAddressId, notes }
        : { full_name: fullName, phone, address, notes, save_address: true };
      await apiFetch("/api/mobile/orders.php", {
        method: "POST",
        body: jsonBody(body),
      });
      router.replace("/customer/orders");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not place order");
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading />
      </SafeAreaView>
    );
  }

  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableRipple style={styles.backBtn} onPress={() => router.back()}>
          <IconButton icon="arrow-left" iconColor={colors.primaryContainer} size={20} />
        </TouchableRipple>
        <Text variant="titleLarge" style={styles.topBarTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {message ? (
          <Notice
            message={message}
            tone="danger"
            icon="alert-circle"
          />
        ) : null}

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {items.map((item) => (
              <View key={item.cart_item_id} style={styles.summaryItem}>
                <Text variant="bodyMedium" style={styles.itemName} numberOfLines={1}>
                  {item.name} x{item.quantity}
                </Text>
                <Text variant="labelMedium" style={styles.itemPrice}>
                  ${Number(item.subtotal).toFixed(2)}
                </Text>
              </View>
            ))}
            <DividerLine />
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
              <Text variant="labelMedium" style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>
            <DividerLine />
            <View style={styles.summaryRow}>
              <Text variant="titleMedium" style={styles.totalLabel}>Total</Text>
              <Text variant="headlineSmall" style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.paymentBadge}>
            <IconButton icon="cash" size={18} iconColor={colors.secondary} style={styles.paymentIcon} />
            <Text variant="labelMedium" style={styles.paymentText}>Cash on Delivery</Text>
          </View>
        </View>

        {addresses.length > 0 ? (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Saved Addresses</Text>
            <View style={styles.addressList}>
              {addresses.map((item) => (
                <TouchableRipple
                  key={item.id}
                  onPress={() => setSelectedAddressId(item.id)}
                  style={[
                    styles.addressCard,
                    selectedAddressId === item.id && styles.addressCardSelected,
                  ]}
                >
                  <View style={styles.addressContent}>
                    <View style={styles.radioContainer}>
                      {selectedAddressId === item.id ? (
                        <IconButton icon="radiobox-marked" size={20} iconColor={colors.primaryContainer} />
                      ) : (
                        <IconButton icon="radiobox-blank" size={20} iconColor={colors.muted} />
                      )}
                    </View>
                    <View style={styles.addressDetails}>
                      <Text variant="bodyMedium" style={styles.addressName}>{item.full_name}</Text>
                      <Text variant="bodySmall" style={styles.addressText}>{item.address}</Text>
                      <Text variant="labelSmall" style={styles.addressPhone}>{item.phone}</Text>
                    </View>
                  </View>
                </TouchableRipple>
              ))}
            </View>
            <TouchableRipple
              onPress={() => setSelectedAddressId(null)}
              style={styles.newAddressBtn}
            >
              <View style={styles.newAddressContent}>
                <IconButton icon="plus" size={18} iconColor={colors.primaryContainer} />
                <Text variant="labelLarge" style={styles.newAddressText}>Use New Address</Text>
              </View>
            </TouchableRipple>
          </View>
        ) : null}

        {!selectedAddressId ? (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>New Address</Text>
            <View style={styles.formCard}>
              <Field label="Full Name" value={fullName} onChangeText={setFullName} />
              <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Field label="Address" value={address} onChangeText={setAddress} multiline />
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Order Notes</Text>
          <View style={styles.notesCard}>
            <Field label="Optional notes" value={notes} onChangeText={setNotes} multiline />
          </View>
        </View>

        <PrimaryButton
          title="Place COD Order"
          onPress={placeOrder}
          disabled={items.length === 0}
          icon="check"
          fullWidth
          style={styles.placeOrderBtn}
        />
      </ScrollView>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: MARGIN_MOBILE,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.label,
    fontWeight: "400",
  },
  summaryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    color: colors.muted,
    fontWeight: "300",
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    color: colors.label,
    fontVariant: ["tabular-nums"],
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentIcon: {
    margin: 0,
  },
  paymentText: {
    color: colors.secondary,
  },
  addressList: {
    gap: 8,
  },
  addressCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    overflow: "hidden",
  },
  addressCardSelected: {
    borderColor: colors.primaryContainer,
    borderWidth: 2,
  },
  addressContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  radioContainer: {
    margin: 0,
  },
  addressDetails: {
    flex: 1,
    paddingRight: 12,
    paddingVertical: 8,
    gap: 2,
  },
  addressName: {
    color: colors.label,
    fontWeight: "400",
  },
  addressText: {
    color: colors.muted,
    fontWeight: "300",
  },
  addressPhone: {
    color: colors.outline,
    marginTop: 2,
  },
  newAddressBtn: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  newAddressContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  newAddressText: {
    color: colors.primaryContainer,
  },
  formCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
  },
  notesCard: {
    gap: 16,
  },
  placeOrderBtn: {
    marginTop: 8,
  },
});