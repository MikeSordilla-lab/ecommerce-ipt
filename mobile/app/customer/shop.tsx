import { router } from "expo-router";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { Animated, Platform, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Chip,
  IconButton,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, jsonBody } from "@/api/client";
import type { Category, Product } from "@/api/types";
import { colors } from "@/theme/colors";
import { BadgeChip, PrimaryButton } from "@/components/ui";

const MARGIN_MOBILE = 20;
const NAV_ITEMS = [
  { key: "shop", label: "Shop", icon: "storefront" },
  { key: "cart", label: "Cart", icon: "shopping-cart" },
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
    else if (key === "profile") router.push("/customer/profile");
  }

  function StockBadge({ stock }: { stock: number }) {
    if (stock === 0) {
      return <BadgeChip tone="danger">Out of Stock</BadgeChip>;
    }
    if (stock < 10) {
      return <BadgeChip tone="warning">Low Stock</BadgeChip>;
    }
    return <BadgeChip tone="success">In Stock</BadgeChip>;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Appbar.Header style={styles.header} elevated={false}>
        <TouchableRipple style={styles.avatar}>
          <IconButton icon="account" iconColor={colors.secondary} size={20} />
        </TouchableRipple>
        <Appbar.Content
          title="Shop"
          titleStyle={styles.headerTitle}
        />
        <TouchableRipple style={styles.iconBtn}>
          <IconButton icon="magnify" iconColor={colors.primaryContainer} size={20} />
        </TouchableRipple>
      </Appbar.Header>

       <View style={styles.searchRow}>
         <View style={styles.searchBarContainer}>
           <IconButton icon="magnify" iconColor={colors.muted} size={20} style={styles.searchIcon} />
           <View style={styles.searchInputContainer}>
             <TextInput
               placeholder="Search products..."
               value={search}
               onChangeText={setSearch}
               style={styles.searchInput}
               placeholderTextColor={colors.muted}
               autoCapitalize="none"
               returnKeyType="search"
               onSubmitEditing={load}
             />
           </View>
         </View>
         <TouchableRipple style={styles.filterBtn}>
           <View style={styles.filterBtnInner}>
             <Text variant="labelMedium" style={styles.filterBtnText}>Filter</Text>
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
            style={[styles.chip, activeCategory === null && styles.chipSelected]}
            textStyle={[styles.chipText, activeCategory === null && styles.chipTextSelected]}
            showSelectedCheck={false}
            mode={activeCategory === null ? "flat" : "outlined"}
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
              showSelectedCheck={false}
              mode={activeCategory === cat.id ? "flat" : "outlined"}
            >
              {cat.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {message ? (
        <View style={[
          styles.notice,
          message.includes("Added") ? styles.noticeSuccess : styles.noticeMuted
        ]}>
          <Text variant="bodyMedium" style={message.includes("Added") ? styles.successText : styles.mutedText}>
            {message}
          </Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.productList}
        contentContainerStyle={styles.productListContent}
        showsVerticalScrollIndicator={false}
      >
        {products.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <IconButton icon="package-variant" size={48} iconColor={colors.outline} />
            <Text variant="bodyLarge" style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                {product.image_url ? (
                  <Image
                    source={{ uri: product.image_url }}
                    style={styles.productImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <IconButton icon="image" size={32} iconColor={colors.outline} />
                  </View>
                )}
                <View style={styles.stockBadgeContainer}>
                  <StockBadge stock={product.stock} />
                </View>
              </View>
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text variant="titleMedium" style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text variant="titleMedium" style={styles.productPrice}>
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
                <PrimaryButton
                  title="Add to Cart"
                  icon="cart-plus"
                  onPress={() => addToCart(product.id)}
                  fullWidth
                  style={styles.addToCartBtn}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
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
                  iconColor={isActive ? colors.primaryContainer : colors.muted}
                  size={22}
                  style={isActive ? styles.navIconActive : undefined}
                />
                <Text
                  variant="labelSmall"
                  style={[
                    styles.navLabel,
                    { color: isActive ? colors.primaryContainer : colors.muted },
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.primaryContainer,
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: -0.22,
  },
  avatar: {
    marginLeft: 12,
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
    marginRight: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MARGIN_MOBILE,
    paddingVertical: 12,
    gap: 8,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 4,
  },
  searchIcon: {
    margin: 0,
  },
  searchInputContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  searchInput: {
    color: colors.muted,
    fontWeight: "300",
  },
  filterBtn: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceContainerLowest,
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
    color: colors.label,
  },
  filterIcon: {
    margin: 0,
  },
  categoryScroll: {
    paddingBottom: 8,
  },
  categoryRow: {
    paddingHorizontal: MARGIN_MOBILE,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    backgroundColor: "#f7fafc",
    borderRadius: 4,
    height: 32,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: colors.primaryContainer,
  },
  chipText: {
    color: colors.muted,
    fontSize: 14,
  },
  chipTextSelected: {
    color: colors.onPrimaryContainer,
  },
  notice: {
    marginHorizontal: MARGIN_MOBILE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  noticeMuted: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeSuccess: {
    backgroundColor: "rgba(21, 190, 83, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(21, 190, 83, 0.4)",
  },
  mutedText: {
    color: colors.muted,
  },
  successText: {
    color: colors.successText,
  },
  productList: {
    flex: 1,
  },
  productListContent: {
    paddingHorizontal: MARGIN_MOBILE,
    paddingBottom: 80,
    gap: 16,
  },
  productCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 0,
  },
  productImageContainer: {
    height: 180,
    backgroundColor: colors.surfaceContainer,
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
  stockBadgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  productInfo: {
    padding: 16,
    gap: 12,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  productName: {
    color: colors.onSurface,
    fontWeight: "300",
    letterSpacing: -0.22,
    flex: 1,
  },
  productPrice: {
    color: colors.primaryContainer,
    fontWeight: "500",
    fontSize: 18,
  },
  productDescription: {
    color: colors.onSurfaceVariant,
    fontWeight: "300",
    lineHeight: 22,
  },
  addToCartBtn: {
    marginTop: 4,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    color: colors.muted,
    fontWeight: "300",
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
  navIconActive: {
    borderTopWidth: 2,
    borderTopColor: colors.primaryContainer,
    paddingTop: 2,
  },
  navLabel: {
    marginTop: -4,
  },
  navLabelActive: {
    fontWeight: "500",
  },
});