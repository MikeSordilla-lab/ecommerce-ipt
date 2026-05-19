import { router } from "expo-router";
import { Image } from "expo-image";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Text, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/auth/auth-context";
import { apiFetch } from "@/api/client";
import { colors } from "@/theme/colors";

const MARGIN_MOBILE = 20;

const NAV_ITEMS = [
  { key: "shop", label: "Shop", icon: "storefront" },
  { key: "cart", label: "Cart", icon: "shopping-cart" },
  { key: "orders", label: "Orders", icon: "package" },
  { key: "profile", label: "Profile", icon: "account" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    activeOrders: 0,
    savedItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user orders to get count
      const ordersResponse = await apiFetch<{ orders: any[] }>("/api/mobile/orders.php");
      const orders = ordersResponse.orders;
      
      // Calculate active orders (not delivered/cancelled)
      const activeOrders = orders.filter(
        order => !['delivered', 'cancelled'].includes(order.status.toLowerCase())
      ).length;
      
      // For now, we'll set saved items to 0 as there's no wishlist API yet
      // In a real app, this would come from a wishlist/favorites endpoint
      setStats({
        activeOrders,
        savedItems: 0, // Placeholder
      });
      
      // Set recent orders (last 3)
      setRecentOrders(orders.slice(0, 3));
    } catch (error) {
      console.error("Failed to load profile stats:", error);
      // Keep default values if API fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableRipple style={styles.avatar}>
          {user?.profile_image_url ? (
            <Image source={{ uri: user.profile_image_url }} style={styles.headerAvatarImage} contentFit="cover" />
          ) : (
            <IconButton icon="account" iconColor={colors.secondary} size={20} />
          )}
        </TouchableRipple>
        <Text variant="titleLarge" style={styles.headerTitle}>Shop</Text>
        <TouchableRipple style={styles.iconBtn}>
          <IconButton icon="magnify" iconColor={colors.primaryContainer} size={20} />
        </TouchableRipple>
      </View>

       <ScrollView
         style={styles.content}
         contentContainerStyle={styles.contentContainer}
         showsVerticalScrollIndicator={false}
       >
         {loading ? (
           <View style={styles.loading}>
             <IconButton icon="loader" size={32} iconColor={colors.primaryContainer} />
             <Text variant="bodyMedium" style={styles.loadingText}>Loading profile...</Text>
           </View>
         ) : (
           <>
             <View style={styles.identityCard}>
               <View style={styles.identityGradient} />
               <View style={styles.identityContent}>
                 <View style={styles.profileAvatarContainer}>
                   {user?.profile_image_url ? (
                     <Image
                       source={{ uri: user.profile_image_url }}
                       style={styles.profileAvatarImage}
                       contentFit="cover"
                     />
                   ) : (
                     <View style={styles.profileAvatarPlaceholder}>
                       <IconButton icon="account" iconColor={colors.primaryContainer} size={36} />
                     </View>
                   )}
                 </View>
                 <Text variant="headlineSmall" style={styles.userName}>{user?.username ?? "User"}</Text>
                 <Text variant="bodyMedium" style={styles.userEmail}>{user?.email ?? ""}</Text>
                 <View style={styles.roleBadge}>
                   <IconButton icon="verified-user" iconColor={colors.primary} size={16} style={styles.roleIcon} />
                   <Text variant="labelSmall" style={styles.roleText}>
                     {user?.role?.toUpperCase() ?? "CUSTOMER"}
                   </Text>
                 </View>
               </View>
             </View>

             <View style={styles.statsGrid}>
               <TouchableRipple style={styles.statCard}>
                 <View style={styles.statCardInner}>
                   <View style={styles.statIconContainer}>
                     <IconButton icon="inventory-2" iconColor={colors.primaryContainer} size={22} />
                   </View>
                   <View>
                     <Text variant="headlineSmall" style={styles.statValue}>{stats.activeOrders}</Text>
                     <Text variant="labelSmall" style={styles.statLabel}>Active Orders</Text>
                   </View>
                 </View>
               </TouchableRipple>
               <TouchableRipple style={styles.statCard}>
                 <View style={styles.statCardInner}>
                   <View style={styles.statIconContainer}>
                     <IconButton icon="heart" iconColor={colors.primaryContainer} size={22} />
                   </View>
                   <View>
                     <Text variant="headlineSmall" style={styles.statValue}>{stats.savedItems}</Text>
                     <Text variant="labelSmall" style={styles.statLabel}>Saved Items</Text>
                   </View>
                 </View>
               </TouchableRipple>
             </View>

             {recentOrders.length > 0 && (
               <View style={styles.ordersSection}>
                 <Text variant="titleMedium" style={styles.ordersTitle}>Recent Orders</Text>
                 <View style={styles.ordersList}>
                   {recentOrders.map((order) => (
                     <TouchableRipple key={order.id} style={styles.orderItem}>
                       <View style={styles.orderItemContent}>
                         <Text variant="bodyMedium" style={styles.orderId}>#{order.id}</Text>
                         <Text variant="labelSmall" style={styles.orderDate}>
                           {new Date(order.created_at).toLocaleDateString()}
                         </Text>
                         <Text variant="labelSmall" style={styles.orderStatus}>
                           {order.status}
                         </Text>
                       </View>
                       <IconButton icon="chevron-right" size={18} iconColor={colors.muted} />
                     </TouchableRipple>
                   ))}
                 </View>
               </View>
             )}

             <View style={styles.actionsSection}>
               <TouchableRipple style={styles.dashboardBtn} onPress={() => router.push("/customer/dashboard")}>
                 <View style={styles.dashboardBtnInner}>
                   <IconButton icon="view-dashboard" iconColor={colors.onPrimaryContainer} size={20} style={styles.actionIcon} />
                   <Text variant="labelMedium" style={styles.dashboardBtnText}>Open Dashboard</Text>
                 </View>
               </TouchableRipple>
               <TouchableRipple style={styles.signOutBtn} onPress={handleSignOut}>
                 <View style={styles.signOutBtnInner}>
                   <IconButton icon="logout" iconColor={colors.primaryContainer} size={20} style={styles.actionIcon} />
                   <Text variant="labelMedium" style={styles.signOutBtnText}>Sign Out</Text>
                 </View>
               </TouchableRipple>
             </View>
           </>
         )}
       </ScrollView>

      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === "profile";
          return (
            <TouchableRipple
              key={item.key}
              onPress={() => handleNav(item.key)}
              style={styles.navItem}
            >
              <View style={styles.navItemInner}>
                {isActive ? (
                  <View style={styles.activeNavIcon}>
                    <IconButton icon={item.icon} iconColor={colors.primaryContainer} size={22} />
                  </View>
                ) : (
                  <IconButton icon={item.icon} iconColor={colors.muted} size={22} />
                )}
                <Text
                  variant="labelSmall"
                  style={[
                    styles.navLabel,
                    isActive ? styles.navLabelActive : { color: colors.muted },
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  headerAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  iconBtn: {
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: MARGIN_MOBILE,
    paddingBottom: 80,
    gap: 40,
  },
  identityCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 0,
    position: "relative",
  },
  identityGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: colors.surfaceContainerHigh,
    opacity: 0.5,
  },
  identityContent: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 16,
    position: "relative",
    zIndex: 1,
  },
  profileAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.surfaceContainerLowest,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: colors.shadowElevated,
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 1,
    shadowRadius: 45,
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%",
  },
  profileAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    color: colors.onSurface,
    fontWeight: "300",
    textAlign: "center",
    marginBottom: 4,
  },
  userEmail: {
    color: colors.secondary,
    fontWeight: "300",
    textAlign: "center",
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleIcon: {
    margin: 0,
    marginLeft: -4,
  },
  roleText: {
    color: colors.label,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginRight: 4,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 35,
  },
  statCardInner: {
    flexDirection: "column",
    gap: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    color: colors.onSurface,
    fontWeight: "300",
  },
  statLabel: {
    color: colors.secondary,
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
  ordersSection: {
    marginTop: 24,
  },
  ordersTitle: {
    color: colors.label,
    fontWeight: "400",
    fontSize: 16,
    marginBottom: 12,
  },
  ordersList: {
    gap: 8,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  orderItemContent: {
    flex: 1,
  },
  orderId: {
    color: colors.onSurface,
    fontWeight: "500",
  },
  orderDate: {
    color: colors.muted,
    fontSize: 12,
  },
  orderStatus: {
    color: colors.successText,
    fontSize: 12,
    fontWeight: "500",
  },
  actionsSection: {
    flexDirection: "column",
    gap: 16,
    marginTop: "auto",
  },
  dashboardBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 35,
  },
  dashboardBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  dashboardBtnText: {
    color: colors.onPrimaryContainer,
  },
  actionIcon: {
    margin: 0,
  },
  signOutBtn: {
    backgroundColor: "transparent",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  signOutBtnText: {
    color: colors.primaryContainer,
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
    borderTopWidth: 2,
    borderTopColor: colors.primaryContainer,
    paddingTop: 2,
    borderRadius: 0,
  },
  navLabel: {
    marginTop: -4,
  },
  navLabelActive: {
    color: colors.primaryContainer,
    fontWeight: "500",
  },
});