import { router } from "expo-router";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import type { Category, Product } from "@/api/types";
import { colors } from "@/theme/colors";
import { useAuth } from "@/auth/auth-context";
import { CustomerBottomNav } from "@/components/ui";

const MARGIN_MOBILE = 20;

const PRICE_FILTERS = [
  { key: "", label: "Any price" },
  { key: "under1000", label: "Under $1K" },
  { key: "1000to5000", label: "$1K-$5K" },
  { key: "5000to15000", label: "$5K-$15K" },
  { key: "over15000", label: "$15K+" },
] as const;

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <View style={[badge.pill, { backgroundColor: colors.dangerSoft }]}>
        <Text style={[badge.text, { color: colors.danger }]}>Out of Stock</Text>
      </View>
    );
  }
  if (stock < 10) {
    return (
      <View style={[badge.pill, { backgroundColor: colors.warningSoft }]}>
        <Text style={[badge.text, { color: colors.warning }]}>Low Stock</Text>
      </View>
    );
  }
  return (
    <View style={[badge.pill, { backgroundColor: colors.successSoft }]}>
      <Text style={[badge.text, { color: colors.successText }]}>In Stock</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  text: {
    fontSize: 11,
    fontWeight: "500",
  },
});

export default function ShopScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category_id", String(activeCategory));
      if (search.trim()) params.set("search", search.trim());
      if (priceRange) params.set("price_range", priceRange);
      const data = await apiFetch<{ products: Product[]; categories: Category[] }>(
        `/api/mobile/products.php?${params.toString()}`
      );
      setProducts(data.products);
      if (data.categories.length > 0 && categories.length === 0) {
        setCategories(data.categories);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load products", "error");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, priceRange]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string, type: "success" | "error") {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3000);
  }

  async function addToCart(productId: number) {
    try {
      await apiFetch("/api/mobile/cart.php", {
        method: "POST",
        body: jsonBody({ product_id: productId, quantity: 1 }),
      });
      showToast("Added to cart ✓", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not add to cart", "error");
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Top App Bar ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8}>
          {user?.profile_image_url ? (
            <Image source={{ uri: user.profile_image_url }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <IconButton icon="account" iconColor={colors.secondary} size={18} style={styles.noMargin} />
          )}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity style={styles.iconBtnCircle} activeOpacity={0.7}>
          <IconButton icon="magnify" iconColor={colors.primaryContainer} size={20} style={styles.noMargin} />
        </TouchableOpacity>
      </View>

      {/* ── Search Row ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBarWrap}>
          <IconButton icon="magnify" iconColor={colors.muted} size={18} style={styles.noMargin} />
          <TextInput
            placeholder="Search products…"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={load}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <IconButton icon="close-circle" iconColor={colors.muted} size={16} style={styles.noMargin} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          activeOpacity={0.8}
          onPress={() => setShowFilters((value) => !value)}
        >
          <IconButton icon="tune-variant" iconColor={colors.label} size={18} style={styles.noMargin} />
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* ── Category Chips ── */}
      <View style={styles.filterPanel}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
          style={styles.categoryScroll}
        >
          {[{ id: null, name: "All" }, ...categories].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id ?? "all"}
                onPress={() => setActiveCategory(cat.id)}
                style={[styles.chip, isActive && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {showFilters ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.priceRow}
            style={styles.priceScroll}
          >
            {PRICE_FILTERS.map((option) => {
              const isActive = priceRange === option.key;
              return (
                <TouchableOpacity
                  key={option.key || "any"}
                  onPress={() => setPriceRange(option.key)}
                  style={[styles.priceChip, isActive && styles.priceChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.priceChipText, isActive && styles.priceChipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      {/* ── Toast ── */}
      {toast ? (
        <View style={[styles.toast, toastType === "success" ? styles.toastSuccess : styles.toastError]}>
          <IconButton
            icon={toastType === "success" ? "check-circle" : "alert-circle"}
            iconColor={toastType === "success" ? colors.successText : colors.error}
            size={16}
            style={styles.noMargin}
          />
          <Text style={[styles.toastText, { color: toastType === "success" ? colors.successText : colors.error }]}>
            {toast}
          </Text>
        </View>
      ) : null}

      {/* ── Product List ── */}
      <ScrollView
        style={styles.productList}
        contentContainerStyle={styles.productListContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primaryContainer} size="large" />
            <Text style={styles.loadingText}>Loading products…</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyState}>
            <IconButton icon="package-variant-closed" size={56} iconColor={colors.outlineVariant} style={styles.noMargin} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          products.map((product) => (
            <TouchableRipple
              key={product.id}
              style={styles.productCard}
              onPress={() =>
                router.push({
                  pathname: "/customer/product",
                  params: { id: String(product.id) },
                })
              }
              borderless
            >
              <View>
                {/* Image */}
                <View style={styles.productImageWrap}>
                  {product.image_url ? (
                    <Image
                      source={{ uri: product.image_url }}
                      style={styles.productImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <IconButton icon="image" size={36} iconColor={colors.outlineVariant} style={styles.noMargin} />
                    </View>
                  )}
                  <View style={styles.stockBadgeWrap}>
                    <StockBadge stock={product.stock} />
                  </View>
                </View>

                {/* Info */}
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productPrice}>
                      ${Number(product.price).toFixed(2)}
                    </Text>
                  </View>

                  {product.description ? (
                    <Text style={styles.productDesc} numberOfLines={2}>
                      {product.description}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.addToCartBtn,
                      product.stock === 0 && styles.addToCartBtnDisabled,
                    ]}
                    onPress={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                    activeOpacity={0.85}
                  >
                    <IconButton icon="cart-plus" iconColor={colors.onPrimaryContainer} size={18} style={styles.noMargin} />
                    <Text style={styles.addToCartText}>
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableRipple>
          ))
        )}
      </ScrollView>

      <CustomerBottomNav activeRoute="shop" />
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
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  iconBtnCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MARGIN_MOBILE,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBarWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: "300",
    paddingVertical: 0,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    height: 40,
    gap: 2,
  },
  filterBtnActive: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySoft,
  },
  filterBtnText: {
    color: colors.label,
    fontSize: 13,
    fontWeight: "400",
  },

  /* Categories */
  filterPanel: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryScroll: {
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: 54,
  },
  categoryRow: {
    paddingHorizontal: MARGIN_MOBILE,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    minWidth: 72,
    maxWidth: 150,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  chipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "400",
  },
  chipTextActive: {
    color: colors.onPrimaryContainer,
    fontWeight: "600",
  },
  priceScroll: {
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: 48,
  },
  priceRow: {
    paddingHorizontal: MARGIN_MOBILE,
    paddingBottom: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  priceChip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceContainerLowest,
    justifyContent: "center",
  },
  priceChipActive: {
    borderColor: colors.primaryContainer,
    backgroundColor: colors.primaryContainer,
  },
  priceChipText: {
    color: colors.label,
    fontSize: 12,
    fontWeight: "400",
  },
  priceChipTextActive: {
    color: colors.onPrimaryContainer,
    fontWeight: "600",
  },

  /* Toast */
  toast: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: MARGIN_MOBILE,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  toastSuccess: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: "rgba(21,190,83,0.35)",
  },
  toastError: {
    backgroundColor: colors.errorContainer,
    borderWidth: 1,
    borderColor: colors.error,
  },
  toastText: { fontSize: 13, fontWeight: "400" },

  /* Products */
  productList: { flex: 1 },
  productListContent: {
    paddingHorizontal: MARGIN_MOBILE,
    paddingTop: 16,
    paddingBottom: 90,
    gap: 16,
  },
  loadingBox: {
    paddingTop: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: colors.muted, fontSize: 14, fontWeight: "300" },
  emptyState: {
    paddingTop: 60,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { color: colors.label, fontSize: 16, fontWeight: "400" },
  emptySubtitle: { color: colors.muted, fontSize: 13, fontWeight: "300" },
  productCard: {
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
  productImageWrap: {
    height: 180,
    backgroundColor: colors.surfaceContainerHigh,
    position: "relative",
  },
  productImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stockBadgeWrap: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  productInfo: {
    padding: 16,
    gap: 10,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  productName: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: "400",
    flex: 1,
    letterSpacing: -0.15,
  },
  productPrice: {
    color: colors.primaryContainer,
    fontSize: 16,
    fontWeight: "600",
  },
  productDesc: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "300",
    lineHeight: 20,
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
    marginTop: 2,
  },
  addToCartBtnDisabled: {
    backgroundColor: colors.outlineVariant,
  },
  addToCartText: {
    color: colors.onPrimaryContainer,
    fontSize: 13,
    fontWeight: "500",
  },

  noMargin: { margin: 0 },
});
