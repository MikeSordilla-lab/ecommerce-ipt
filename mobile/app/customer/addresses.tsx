import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { IconButton, Text, TextInput, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, jsonBody } from "@/api/client";
import type { Address } from "@/api/types";
import { colors } from "@/theme/colors";
import { CustomerBottomNav } from "@/components/ui";

const MARGIN_MOBILE = 20;

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const data = await apiFetch<{ addresses: Address[] }>("/api/mobile/addresses.php");
    setAddresses(data.addresses);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load addresses");
        setLoading(false);
      });
    }, [load]),
  );

  async function save() {
    await apiFetch("/api/mobile/addresses.php", {
      method: "POST",
      body: jsonBody({ full_name: fullName, phone, address, is_default: addresses.length === 0 }),
    });
    setFullName("");
    setPhone("");
    setAddress("");
    await load();
  }

  async function setDefault(addressId: number) {
    await apiFetch("/api/mobile/addresses.php", {
      method: "PATCH",
      body: jsonBody({ address_id: addressId }),
    });
    await load();
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableRipple style={styles.backBtn} onPress={() => router.back()}>
          <IconButton icon="arrow-left" iconColor={colors.primaryContainer} size={20} style={styles.noMargin} />
        </TouchableRipple>
        <Text style={styles.headerTitle}>Addresses</Text>
        <View style={{ width: 38 }} />
      </View>

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
        {/* Saved addresses */}
        {addresses.map((item) => (
          <View key={item.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressIcon}>
                <IconButton icon="map-marker" iconColor={colors.primaryContainer} size={20} style={styles.noMargin} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>{item.full_name}</Text>
                <Text style={styles.addressDetail}>{item.phone}</Text>
                <Text style={styles.addressDetail}>{item.address}</Text>
              </View>
              {item.is_default && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            {!item.is_default && (
              <TouchableRipple style={styles.setDefaultBtn} onPress={() => setDefault(item.id)}>
                <Text style={styles.setDefaultText}>Set as Default</Text>
              </TouchableRipple>
            )}
          </View>
        ))}

        {/* Add new address form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add New Address</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              mode="outlined"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              outlineColor={colors.border}
              activeOutlineColor={colors.primaryContainer}
              textColor={colors.label}
              style={styles.input}
              contentStyle={styles.inputContent}
              outlineStyle={styles.inputOutline}
              placeholderTextColor={colors.outlineVariant}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              mode="outlined"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              outlineColor={colors.border}
              activeOutlineColor={colors.primaryContainer}
              textColor={colors.label}
              style={styles.input}
              contentStyle={styles.inputContent}
              outlineStyle={styles.inputOutline}
              placeholderTextColor={colors.outlineVariant}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Address</Text>
            <TextInput
              mode="outlined"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter delivery address"
              multiline
              outlineColor={colors.border}
              activeOutlineColor={colors.primaryContainer}
              textColor={colors.label}
              style={styles.input}
              contentStyle={styles.inputContentMultiline}
              outlineStyle={styles.inputOutline}
              placeholderTextColor={colors.outlineVariant}
            />
          </View>

          <TouchableRipple
            style={styles.saveBtn}
            onPress={save}
            disabled={!fullName || !phone || !address}
          >
            <View style={styles.saveBtnInner}>
              <IconButton icon="plus" iconColor={colors.onPrimaryContainer} size={18} style={styles.noMargin} />
              <Text style={styles.saveBtnText}>Save Address</Text>
            </View>
          </TouchableRipple>
        </View>
      </ScrollView>

      <CustomerBottomNav activeRoute="profile" />
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
  errorText: { color: colors.error, fontSize: 13, fontWeight: "400", flex: 1 },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: MARGIN_MOBILE,
    paddingTop: 20,
    paddingBottom: 90,
    gap: 16,
  },

  addressCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  addressHeader: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  addressInfo: { flex: 1, gap: 2 },
  addressName: { color: colors.onSurface, fontSize: 15, fontWeight: "500" },
  addressDetail: { color: colors.muted, fontSize: 13, fontWeight: "300", lineHeight: 18 },
  defaultBadge: {
    backgroundColor: colors.successSoft,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  defaultText: { color: colors.successText, fontSize: 11, fontWeight: "500" },
  setDefaultBtn: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 16,
  },
  setDefaultText: { color: colors.primaryContainer, fontSize: 13, fontWeight: "500" },

  formCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
  },
  formTitle: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "500",
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { color: colors.label, fontSize: 13, fontWeight: "400" },
  input: { backgroundColor: colors.background, borderRadius: 4 },
  inputContent: { minHeight: 48 },
  inputContentMultiline: { minHeight: 80 },
  inputOutline: { borderRadius: 4 },

  saveBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
    marginTop: 4,
  },
  saveBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    gap: 6,
  },
  saveBtnText: { color: colors.onPrimaryContainer, fontSize: 14, fontWeight: "500" },
  noMargin: { margin: 0 },
});
