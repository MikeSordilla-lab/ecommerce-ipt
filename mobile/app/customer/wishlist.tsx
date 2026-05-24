import { router, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Text, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, jsonBody } from "@/api/client";
import type { Product } from "@/api/types";
import { colors } from "@/theme/colors";
import { CustomerBottomNav } from "@/components/ui";

const MARGIN_MOBILE = 20;

type WishlistResponse = {
  items: Product[];
  product_ids: number[];
};

export default function CustomerWishlistScreen() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<WishlistResponse>("/api/mobile/wishlist.php");
      setItems(data.items);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function removeFromWishlist(productId: number) {
    try {
      await apiFetch("/api/mobile/wishlist.php", {
        method: "POST",
        body: jsonBody({ product_id: productId }),
      });
      setItems((current) => current.filter((item) => item.id !== productId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update wishlist");
    }
  }

  async function addToCart(product: Product) {
    try {
      await apiFetch("/api/mobile/cart.php", {
        method: "POST",
        body: jsonBody({ product_id: product.id, quantity: 1 }),
      });
      setMessage("Added to cart");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add to cart");
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/customer/shop")} activeOpacity={0.8}>
          <IconButton icon="arrow-left" iconColor={colors.primaryContainer} size={20} style={styles.noMargin} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primaryContainer} size="large" />
          <Text style={styles.loadingText}>Loading wishlist...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {message ? (
            <View style={[styles.message, message === "Added to cart" ? styles.messageSuccess : styles.messageError]}>
              <Text style={[styles.messageText, { color: message === "Added to cart" ? colors.successText : colors.error }]}>
                {message}
              </Text>
            </View>
          ) : null}

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <IconButton icon="heart-outline" iconColor={colors.outlineVariant} size={52} style={styles.noMargin} />
              </View>
              <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptySubtitle}>Tap the heart on a product to save it here.</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => router.push("/customer/shop")} activeOpacity={0.85}>
                <IconButton icon="storefront" iconColor={colors.onPrimaryContainer} size={18} style={styles.noMargin} />
                <Text style={styles.shopBtnText}>Browse Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.list}>
              {items.map((item) => (
                <TouchableRipple
                  key={item.id}
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: "/customer/product",
                      params: { id: String(item.id) },
                    })
                  }
                  borderless
                >
                  <View style={styles.cardInner}>
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <IconButton icon="image" iconColor={colors.outlineVariant} size={28} style={styles.noMargin} />
                      </View>
                    )}

                    <View style={styles.info}>
                      <View style={styles.titleRow}>
                        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                        <TouchableOpacity
                          style={styles.heartBtn}
                          onPress={() => removeFromWishlist(item.id)}
                          activeOpacity={0.8}
                        >
                          <IconButton icon="heart" iconColor={colors.danger} size={18} style={styles.noMargin} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.category}>{item.category_name ?? "Product"}</Text>
                      <View style={styles.footer}>
                        <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
                        <TouchableOpacity
                          style={[styles.cartBtn, item.stock <= 0 && styles.cartBtnDisabled]}
                          onPress={() => addToCart(item)}
                          disabled={item.stock <= 0}
                          activeOpacity={0.85}
                        >
                          <IconButton icon="cart-plus" iconColor={colors.onPrimaryContainer} size={16} style={styles.noMargin} />
                          <Text style={styles.cartBtnText}>{item.stock <= 0 ? "Out" : "Add"}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableRipple>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <CustomerBottomNav activeRoute="wishlist" />
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
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: colors.muted, fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: MARGIN_MOBILE,
    paddingTop: 18,
    paddingBottom: 90,
    gap: 14,
  },
  message: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: "rgba(21,190,83,0.35)",
  },
  messageError: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
  },
  messageText: { fontSize: 13, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingTop: 54, gap: 10 },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: { color: colors.label, fontSize: 18, fontWeight: "500" },
  emptySubtitle: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 22,
    gap: 6,
    marginTop: 8,
  },
  shopBtnText: { color: colors.onPrimaryContainer, fontSize: 14, fontWeight: "500" },
  list: { gap: 12 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardInner: { flexDirection: "row", padding: 12, gap: 12 },
  image: { width: 88, height: 88, borderRadius: 8 },
  imagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 6 },
  titleRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  name: { flex: 1, color: colors.onSurface, fontSize: 15, fontWeight: "500" },
  heartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dangerSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  category: { color: colors.muted, fontSize: 12 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  price: { color: colors.primaryContainer, fontSize: 16, fontWeight: "700" },
  cartBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 4,
  },
  cartBtnDisabled: { backgroundColor: colors.outlineVariant },
  cartBtnText: { color: colors.onPrimaryContainer, fontSize: 12, fontWeight: "600" },
  noMargin: { margin: 0 },
});
