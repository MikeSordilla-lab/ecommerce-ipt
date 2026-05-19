import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import {
  Appbar,
  Card as PaperCard,
  Chip,
  IconButton,
  Searchbar,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, jsonBody } from "@/api/client";
import type { Category, Product } from "@/api/types";
import { colors } from "@/theme/colors";

const NAV_ITEMS = [
  { key: "shop", label: "Shop", icon: "storefront" },
  { key: "cart", label: "Cart", icon: "cart" },
  { key: "orders", label: "Orders", icon: "package" },
  { key: "profile", label: "Profile", icon: "account" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

export default function ShopScreen() {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [navKey, setNavKey] = useState<NavKey>("shop");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const catQuery = activeCategory ? `&category_id=${activeCategory}` : "";
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch<{ products: Product[]; categories: Category[] }>(
        `/api/mobile/products.php?${searchQuery}${catQuery}`,
      );
      setProducts(data.products);
      if (data.categories.length > 0 && categories.length === 0) {
        setCategories(data.categories);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load products");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function addToCart(productId: number) {
    setMessage("");
    try {
      await apiFetch("/api/mobile/cart.php", {
        method: "POST",
        body: jsonBody({ product_id: productId, quantity: 1 }),
      });
      setMessage("Added to cart");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add to cart");
    }
  }

  function handleNav(key: NavKey) {
    setNavKey(key);
    if (key === "shop") return;
    if (key === "cart") router.push("/customer/cart");
    else if (key === "orders") router.push("/customer/orders");
    else if (key === "profile") router.push("/customer/profile" as any);
  }

  function StockBadge({ stock }: { stock: number }) {
    if (stock === 0) {
      return (
        <View style={[styles.badge, { backgroundColor: colors.dangerSoft, borderColor: colors.magentaSoft }]}>
          <Text style={[styles.badgeText, { color: colors.danger }]}>Out of Stock</Text>
        </View>
      );
    }
    if (stock < 10) {
      return (
        <View style={[styles.badge, { backgroundColor: "rgba(155, 104, 41, 0.1)", borderColor: "rgba(155, 104, 41, 0.3)" }]}>
          <Text style={[styles.badgeText, { color: colors.warning }]}>Low Stock</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, { backgroundColor: colors.successSoft, borderColor: "rgba(21, 190, 83, 0.35)" }]}>
        <Text style={[styles.badgeText, { color: colors.successText }]}>In Stock</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Appbar.Header style={[styles.header, { backgroundColor: colors.background }]} elevated={false}>
        <View style={styles.avatar}>
          <IconButton icon="account" iconColor={colors.muted} size={20} />
        </View>
        <Appbar.Content
          title="Shop"
          titleStyle={[styles.headerTitle, { color: colors.primary }]}
        />
        <Appbar.Action icon="magnify" iconColor={colors.primary} onPress={() => {}} />
      </Appbar.Header>

      <View style={styles.searchRow}>
        <Searchbar
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={load}
          style={[styles.searchBar, { backgroundColor: colors.surface }]}
          inputStyle={styles.searchInput}
          iconColor={colors.muted}
        />
        <TouchableRipple
          onPress={() => {}}
          style={[styles.filterBtn, { backgroundColor: colors.surface }]}
        >
          <View style={styles.filterBtnInner}>
            <Text style={styles.filterBtnText}>Filter</Text>
            <IconButton icon="tune-variant" size={16} iconColor={colors.label} style={styles.filterIcon} />
          </View>
        </TouchableRipple>
      </View>

      <View style={styles.categoryScroll}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          <Chip
            selected={activeCategory === null}
            onPress={() => setActiveCategory(null)}
            style={[styles.chip, !activeCategory && styles.chipSelected]}
            textStyle={[styles.chipText, !activeCategory && styles.chipTextSelected]}
            selectedColor={colors.primary}
          >
            All
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              selected={activeCategory === cat.id}
              onPress={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              style={[styles.chip, activeCategory === cat.id && styles.chipSelected]}
              textStyle={[styles.chipText, activeCategory === cat.id && styles.chipTextSelected]}
              selectedColor={colors.primary}
            >
              {cat.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {message ? (
        <View style={[styles.notice, { backgroundColor: message.includes("Added") ? colors.successSoft : colors.surfaceSoft }]}>
          <Text style={{ color: message.includes("Added") ? colors.successText : colors.muted }}>{message}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.productList}
        contentContainerStyle={styles.productListContent}
        showsVerticalScrollIndicator={false}
      >
        {products.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          products.map((product) => (
            <PaperCard key={product.id} style={styles.productCard}>
              <View style={[styles.productImageContainer, { backgroundColor: colors.surfaceSoft }]}>
                {product.image_url ? (
                  <Animated.Image
                    source={{ uri: product.image_url }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>No Image</Text>
                  </View>
                )}
                <View style={styles.stockBadgeContainer}>
                  <StockBadge stock={product.stock} />
                </View>
              </View>
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text variant="titleMedium" style={styles.productName}>
                    {product.name}
                  </Text>
                  <Text variant="titleMedium" style={[styles.productPrice, { color: colors.primary }]}>
                    ${Number(product.price).toFixed(2)}
                  </Text>
                </View>
                <Text
                  variant="bodyMedium"
                  numberOfLines={2}
                  style={styles.productDescription}
                >
                  {product.description}
                </Text>
                <TouchableRipple
                  onPress={() => addToCart(product.id)}
                  style={[styles.addToCartBtn, { backgroundColor: colors.primarySoft }]}
                >
                  <View style={styles.addToCartInner}>
                    <IconButton icon="cart-plus" size={18} iconColor={colors.primaryDeep} style={styles.cartIcon} />
                    <Text style={[styles.addToCartText, { color: colors.primaryDeep }]}>Add to Cart</Text>
                  </View>
                </TouchableRipple>
              </View>
            </PaperCard>
          ))
        )}
      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {NAV_ITEMS.map((item) => {
          const isActive = navKey === item.key;
          return (
            <TouchableRipple
              key={item.key}
              onPress={() => handleNav(item.key)}
              style={styles.navItem}
            >
              <View style={styles.navItemInner}>
                <IconButton
                  icon={item.icon}
                  iconColor={isActive ? colors.primary : colors.muted}
                  size={22}
                  style={isActive ? styles.navIconActive : undefined}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: isActive ? colors.primary : colors.muted },
                    isActive && styles.navLabelActive,
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
    backgroundColor: colors.background,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: 20,
    letterSpacing: -0.26,
  },
  avatar: {
    marginLeft: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  searchInput: {
    fontSize: 16,
    minHeight: 0,
  },
  filterBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  filterBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  filterBtnText: {
    fontSize: 14,
    color: colors.label,
    fontWeight: "400",
  },
  filterIcon: {
    margin: 0,
  },
  categoryScroll: {
    paddingBottom: 16,
  },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    backgroundColor: "#f7fafc",
    borderRadius: 8,
    height: 32,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    fontSize: 14,
    color: "#64748d",
  },
  chipTextSelected: {
    color: colors.primary,
  },
  notice: {
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  productList: {
    flex: 1,
  },
  productListContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    gap: 16,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    elevation: 0,
    shadowColor: "transparent",
  },
  productImageContainer: {
    height: 192,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: colors.muted,
    fontSize: 14,
  },
  stockBadgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "400",
  },
  productInfo: {
    padding: 14,
    gap: 8,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productName: {
    color: colors.text,
    fontWeight: "300",
    letterSpacing: -0.22,
    flex: 1,
    marginRight: 8,
  },
  productPrice: {
    fontWeight: "700",
    fontSize: 18,
  },
  productDescription: {
    color: colors.muted,
    fontWeight: "300",
    lineHeight: 22,
  },
  addToCartBtn: {
    marginTop: 8,
    borderRadius: 6,
    overflow: "hidden",
  },
  addToCartInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
  },
  cartIcon: {
    margin: 0,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: "400",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    borderTopWidth: 1,
    height: 56,
    paddingBottom: Platform.OS === "android" ? 0 : 8,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navItemInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  navIconActive: {
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    marginTop: -2,
  },
  navLabel: {
    fontSize: 12,
    marginTop: -4,
  },
  navLabelActive: {
    fontWeight: "500",
  },
});