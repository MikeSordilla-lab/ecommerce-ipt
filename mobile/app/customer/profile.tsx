import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Text, TextInput, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/auth/auth-context";
import { apiFetch, jsonBody } from "@/api/client";
import type { Address } from "@/api/types";
import { colors } from "@/theme/colors";
import { CustomerBottomNav } from "@/components/ui";

const MARGIN_MOBILE = 20;

type NavKey = "shop" | "cart" | "orders" | "profile";

function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s === "delivered") return colors.successText;
  if (s === "cancelled") return colors.error;
  if (s === "shipped") return colors.primaryContainer;
  return colors.warning;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/auth/login");
  }, [signOut]);

  const [stats, setStats] = useState({ activeOrders: 0, savedItems: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersResponse, wishlistResponse, addressResponse] = await Promise.all([
        apiFetch<{ orders: any[] }>("/api/mobile/orders.php"),
        apiFetch<{ product_ids: number[] }>("/api/mobile/wishlist.php"),
        apiFetch<{ addresses: Address[] }>("/api/mobile/addresses.php"),
      ]);
      const orders = ordersResponse.orders;
      const activeOrders = orders.filter(
        (o) => !["delivered", "cancelled"].includes(o.status.toLowerCase())
      ).length;
      setStats({ activeOrders, savedItems: wishlistResponse.product_ids.length });
      setRecentOrders(orders.slice(0, 3));
      setDefaultAddress(
        addressResponse.addresses.find((address) => address.is_default) ??
          addressResponse.addresses[0] ??
          null
      );
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  async function updatePassword() {
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Complete all password fields.");
      return;
    }

    setSavingPassword(true);
    try {
      await apiFetch<null>("/api/mobile/profile.php", {
        method: "PATCH",
        body: jsonBody({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated.");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Top App Bar ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8}>
          {user?.profile_image_url ? (
            <Image
              source={{ uri: user.profile_image_url }}
              style={styles.headerAvatarImg}
              contentFit="cover"
            />
          ) : (
            <IconButton
              icon="account"
              iconColor={colors.secondary}
              size={18}
              style={styles.headerAvatarIcon}
            />
          )}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity style={styles.iconBtnCircle} activeOpacity={0.7}>
          <IconButton
            icon="magnify"
            iconColor={colors.primaryContainer}
            size={20}
            style={styles.noMargin}
          />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primaryContainer} size="large" />
            <Text style={styles.loadingText}>Loading profile…</Text>
          </View>
        ) : (
          <>
            {/* ── Identity Card ── */}
            <View style={styles.identityCard}>
              {/* gradient banner */}
              <View style={styles.identityBanner} />

              <View style={styles.identityBody}>
                {/* avatar */}
                <View style={styles.avatarRing}>
                  {user?.profile_image_url ? (
                    <Image
                      source={{ uri: user.profile_image_url }}
                      style={styles.profileAvatarImg}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.profileAvatarPlaceholder}>
                      <IconButton
                        icon="account"
                        iconColor={colors.primaryContainer}
                        size={36}
                        style={styles.noMargin}
                      />
                    </View>
                  )}
                </View>

                <Text style={styles.userName}>
                  {user?.username ?? "User"}
                </Text>
                <Text style={styles.userEmail}>{user?.email ?? ""}</Text>

                <View style={styles.roleBadge}>
                  <IconButton
                    icon="shield-check"
                    iconColor={colors.primary}
                    size={14}
                    style={styles.roleIcon}
                  />
                  <Text style={styles.roleText}>
                    {user?.role?.toUpperCase() ?? "CUSTOMER"}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Bento Stats Grid ── */}
            <View style={styles.statsGrid}>
              <TouchableRipple
                style={styles.statCard}
                onPress={() => router.push("/customer/orders")}
                borderless
              >
                <View style={styles.statCardInner}>
                  <View style={styles.statIconBg}>
                    <IconButton
                      icon="package-variant"
                      iconColor={colors.primaryContainer}
                      size={20}
                      style={styles.noMargin}
                    />
                  </View>
                  <Text style={styles.statValue}>{stats.activeOrders}</Text>
                  <Text style={styles.statLabel}>Active Orders</Text>
                </View>
              </TouchableRipple>

              <TouchableRipple
                style={styles.statCard}
                onPress={() => router.push("/customer/wishlist")}
                borderless
              >
                <View style={styles.statCardInner}>
                  <View style={styles.statIconBg}>
                    <IconButton
                      icon="heart"
                      iconColor={colors.primaryContainer}
                      size={20}
                      style={styles.noMargin}
                    />
                  </View>
                  <Text style={styles.statValue}>{stats.savedItems}</Text>
                  <Text style={styles.statLabel}>Saved Items</Text>
                </View>
              </TouchableRipple>
            </View>

            <View style={styles.profileSectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBg}>
                  <IconButton icon="map-marker" iconColor={colors.primaryContainer} size={18} style={styles.noMargin} />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                  <Text style={styles.sectionSubtitle}>Default shipping details</Text>
                </View>
              </View>
              {defaultAddress ? (
                <View style={styles.addressPreview}>
                  <Text style={styles.addressName}>{defaultAddress.full_name}</Text>
                  <Text style={styles.addressLine}>{defaultAddress.phone}</Text>
                  <Text style={styles.addressLine}>{defaultAddress.address}</Text>
                </View>
              ) : (
                <Text style={styles.emptySectionText}>No address saved yet.</Text>
              )}
              <TouchableRipple style={styles.secondaryActionBtn} onPress={() => router.push("/customer/addresses")}>
                <View style={styles.secondaryActionInner}>
                  <IconButton icon="pencil" iconColor={colors.primaryContainer} size={18} style={styles.noMargin} />
                  <Text style={styles.secondaryActionText}>
                    {defaultAddress ? "Change Address" : "Add Address"}
                  </Text>
                </View>
              </TouchableRipple>
            </View>

            <View style={styles.profileSectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBg}>
                  <IconButton icon="lock" iconColor={colors.primaryContainer} size={18} style={styles.noMargin} />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Change Password</Text>
                  <Text style={styles.sectionSubtitle}>Use at least 8 characters with a letter and number</Text>
                </View>
              </View>

              {passwordMessage ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>{passwordMessage}</Text>
                </View>
              ) : null}
              {passwordError ? (
                <View style={styles.passwordErrorBanner}>
                  <Text style={styles.passwordErrorText}>{passwordError}</Text>
                </View>
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Current Password</Text>
                <TextInput
                  mode="outlined"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primaryContainer}
                  textColor={colors.label}
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  outlineStyle={styles.inputOutline}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>New Password</Text>
                <TextInput
                  mode="outlined"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primaryContainer}
                  textColor={colors.label}
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  outlineStyle={styles.inputOutline}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Confirm Password</Text>
                <TextInput
                  mode="outlined"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primaryContainer}
                  textColor={colors.label}
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  outlineStyle={styles.inputOutline}
                />
              </View>
              <TouchableRipple
                style={[styles.passwordBtn, savingPassword && styles.passwordBtnDisabled]}
                onPress={updatePassword}
                disabled={savingPassword}
              >
                <View style={styles.btnInner}>
                  <IconButton icon="key" iconColor={colors.onPrimaryContainer} size={20} style={styles.noMargin} />
                  <Text style={styles.dashboardBtnText}>
                    {savingPassword ? "Saving..." : "Update Password"}
                  </Text>
                </View>
              </TouchableRipple>
            </View>

            {/* ── Recent Orders ── */}
            {recentOrders.length > 0 && (
              <View style={styles.ordersCard}>
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderCardTitle}>Recent Orders</Text>
                  <TouchableOpacity
                    onPress={() => router.push("/customer/orders")}
                  >
                    <Text style={styles.viewAllLink}>View all</Text>
                  </TouchableOpacity>
                </View>
                {recentOrders.map((order, idx) => (
                  <View key={order.id}>
                    {idx > 0 && <View style={styles.divider} />}
                    <TouchableRipple style={styles.orderRow} borderless>
                      <View style={styles.orderRowInner}>
                        <View style={styles.orderRowLeft}>
                          <View style={styles.orderIconBg}>
                            <IconButton
                              icon="receipt"
                              iconColor={colors.primaryContainer}
                              size={16}
                              style={styles.noMargin}
                            />
                          </View>
                          <View>
                            <Text style={styles.orderId}>#{order.id}</Text>
                            <Text style={styles.orderDate}>
                              {new Date(order.created_at).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.orderRowRight}>
                          <Text
                            style={[
                              styles.orderStatus,
                              { color: getStatusColor(order.status) },
                            ]}
                          >
                            {order.status}
                          </Text>
                          <Text style={styles.orderAmount}>
                            ₱{Number(order.total).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </TouchableRipple>
                  </View>
                ))}
              </View>
            )}

            {/* ── Action Buttons ── */}
            <View style={styles.actionsSection}>
              <TouchableRipple
                style={styles.dashboardBtn}
                onPress={() => router.push("/customer/shop")}
              >
                <View style={styles.btnInner}>
                  <IconButton
                    icon="view-dashboard"
                    iconColor={colors.onPrimaryContainer}
                    size={20}
                    style={styles.noMargin}
                  />
                  <Text style={styles.dashboardBtnText}>Open Dashboard</Text>
                </View>
              </TouchableRipple>

              <TouchableRipple style={styles.signOutBtn} onPress={handleSignOut}>
                <View style={styles.btnInner}>
                  <IconButton
                    icon="logout"
                    iconColor={colors.primaryContainer}
                    size={20}
                    style={styles.noMargin}
                  />
                  <Text style={styles.signOutBtnText}>Sign Out</Text>
                </View>
              </TouchableRipple>
            </View>
          </>
        )}
      </ScrollView>

      <CustomerBottomNav activeRoute="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

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
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  headerAvatarImg: { width: 38, height: 38, borderRadius: 19 },
  headerAvatarIcon: { margin: 0 },
  iconBtnCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: MARGIN_MOBILE,
    paddingTop: 28,
    paddingBottom: 90,
    gap: 20,
  },

  /* Loading */
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "300",
  },

  /* Identity Card */
  identityCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 3,
  },
  identityBanner: {
    height: 72,
    backgroundColor: colors.surfaceContainerHigh,
    opacity: 0.6,
  },
  identityBody: {
    alignItems: "center",
    paddingBottom: 24,
    paddingHorizontal: 16,
    marginTop: -44,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerHigh,
    shadowColor: colors.shadowElevated,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 14,
  },
  profileAvatarImg: { width: "100%", height: "100%" },
  profileAvatarPlaceholder: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    color: colors.onSurface,
    fontSize: 22,
    fontWeight: "300",
    letterSpacing: -0.22,
    textAlign: "center",
    marginBottom: 4,
  },
  userEmail: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "300",
    textAlign: "center",
    marginBottom: 14,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleIcon: { margin: 0, marginLeft: -4 },
  roleText: {
    color: colors.label,
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginRight: 4,
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
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
  statCardInner: {
    padding: 16,
    gap: 8,
  },
  statIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    color: colors.onSurface,
    fontSize: 22,
    fontWeight: "300",
    letterSpacing: -0.22,
    lineHeight: 28,
  },
  statLabel: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },

  profileSectionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeaderText: { flex: 1, gap: 2 },
  sectionTitle: { color: colors.label, fontSize: 15, fontWeight: "600" },
  sectionSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  addressPreview: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 2,
  },
  addressName: { color: colors.onSurface, fontSize: 14, fontWeight: "500" },
  addressLine: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  emptySectionText: { color: colors.muted, fontSize: 13 },
  secondaryActionBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  secondaryActionInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    gap: 6,
  },
  secondaryActionText: {
    color: colors.primaryContainer,
    fontSize: 14,
    fontWeight: "500",
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { color: colors.label, fontSize: 13, fontWeight: "400" },
  input: { backgroundColor: colors.background },
  inputContent: { minHeight: 46 },
  inputOutline: { borderRadius: 6 },
  successBanner: {
    backgroundColor: colors.successSoft,
    borderColor: "rgba(21,190,83,0.35)",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  successText: { color: colors.successText, fontSize: 13, fontWeight: "500" },
  passwordErrorBanner: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  passwordErrorText: { color: colors.error, fontSize: 13, fontWeight: "500" },
  passwordBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 2,
  },
  passwordBtnDisabled: {
    opacity: 0.7,
  },

  /* Orders Card */
  ordersCard: {
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
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  orderCardTitle: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "500",
  },
  viewAllLink: {
    color: colors.primaryContainer,
    fontSize: 13,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  orderRow: { overflow: "hidden" },
  orderRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  orderRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orderIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  orderId: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: "500",
  },
  orderDate: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "300",
    marginTop: 2,
  },
  orderRowRight: { alignItems: "flex-end" },
  orderStatus: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  orderAmount: {
    color: colors.label,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },

  /* Actions */
  actionsSection: { gap: 12 },
  dashboardBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 4,
  },
  signOutBtn: {
    backgroundColor: "transparent",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
  },
  dashboardBtnText: {
    color: colors.onPrimaryContainer,
    fontSize: 14,
    fontWeight: "500",
  },
  signOutBtnText: {
    color: colors.primaryContainer,
    fontSize: 14,
    fontWeight: "400",
  },
  noMargin: { margin: 0 },
});
