import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Text, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, jsonBody } from "@/api/client";
import type { Product } from "@/api/types";
import { colors } from "@/theme/colors";
import { BadgeChip, Button, Loading, Notice, PrimaryButton } from "@/components/ui";

const MARGIN_MOBILE = 20;

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  useEffect(() => {
    apiFetch<{ product: Product }>(`/api/mobile/product.php?id=${id}`)
      .then((data) => setProduct(data.product))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load product"));
  }, [id]);

  async function addToCart() {
    if (!product) return;
    try {
      await apiFetch("/api/mobile/cart.php", {
        method: "POST",
        body: jsonBody({ product_id: product.id, quantity }),
      });
      setMessage("Added to cart");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add to cart");
    }
  }

  async function toggleWishlist() {
    if (!product || wishlistBusy) return;

    setWishlistBusy(true);
    try {
      const result = await apiFetch<{ wishlisted: boolean; message: string }>(
        "/api/mobile/wishlist.php",
        {
          method: "POST",
          body: jsonBody({ product_id: product.id }),
        }
      );
      setProduct({ ...product, wishlisted: result.wishlisted });
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update wishlist");
    } finally {
      setWishlistBusy(false);
    }
  }

  const isSuccessMessage =
    message === "Added to cart" ||
    message === "Added to wishlist" ||
    message === "Removed from wishlist";

  if (!product && !message) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.heroContainer}>
        {product?.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <IconButton icon="image" size={64} iconColor={colors.outline} />
          </View>
        )}

        <View style={styles.headerOverlay}>
          <TouchableRipple
            style={styles.headerBtn}
            onPress={() => router.back()}
          >
            <IconButton icon="arrow-left" iconColor={colors.onSurface} size={20} />
          </TouchableRipple>
          <TouchableRipple
            style={[styles.headerBtn, product?.wishlisted && styles.headerBtnActive]}
            onPress={toggleWishlist}
            disabled={!product || wishlistBusy}
          >
            <IconButton
              icon={product?.wishlisted ? "heart" : "heart-outline"}
              iconColor={product?.wishlisted ? colors.danger : colors.onSurface}
              size={20}
            />
          </TouchableRipple>
        </View>

        {product && (
          <View style={styles.stockBadgeOverlay}>
            <BadgeChip
              tone={product.stock > 0 ? "success" : "danger"}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </BadgeChip>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {product ? (
          <>
            <View style={styles.metadata}>
              <Text variant="labelMedium" style={styles.brandText}>
                {product.category_name || "Product"}
              </Text>
              <View style={styles.tagContainer}>
                <View style={styles.tag}>
                  <Text variant="labelSmall" style={styles.tagText}>Category</Text>
                </View>
              </View>
            </View>

            <View style={styles.titleSection}>
              <Text variant="headlineLarge" style={styles.productTitle}>
                {product.name}
              </Text>
              <Text variant="headlineMedium" style={styles.productPrice}>
                ₱{Number(product.price).toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.descriptionSection}>
              <Text variant="bodyLarge" style={styles.description}>
                {product.description || "No description available for this product."}
              </Text>
            </View>

            <View style={styles.specsGrid}>
              <View style={styles.specCard}>
                <IconButton icon="store" size={20} iconColor={colors.secondary} style={styles.specIcon} />
                <Text variant="labelMedium" style={styles.specLabel}>Seller</Text>
                <Text variant="labelSmall" style={styles.specValue}>
                  {product.seller_name || "Unknown"}
                </Text>
              </View>
              <View style={styles.specCard}>
                <IconButton icon="cube-outline" size={20} iconColor={colors.secondary} style={styles.specIcon} />
                <Text variant="labelMedium" style={styles.specLabel}>Stock</Text>
                <Text variant="labelSmall" style={styles.specValue}>
                  {product.stock} units
                </Text>
              </View>
            </View>

            {message ? (
              <Notice
                message={message}
                tone={isSuccessMessage ? "success" : "danger"}
                icon={isSuccessMessage ? "check-circle" : "alert-circle"}
              />
            ) : null}
          </>
        ) : (
          <Text variant="bodyMedium" style={styles.errorText}>{message}</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantityPicker}>
          <TouchableRipple
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            style={styles.qtyBtn}
          >
            <IconButton
              icon="minus"
              iconColor={quantity <= 1 ? colors.outline : colors.secondary}
              size={20}
            />
          </TouchableRipple>
          <Text variant="titleMedium" style={styles.qtyValue}>{quantity}</Text>
          <TouchableRipple
            onPress={() => setQuantity(Math.min(product?.stock || 99, quantity + 1))}
            disabled={quantity >= (product?.stock || 99)}
            style={styles.qtyBtn}
          >
            <IconButton
              icon="plus"
              iconColor={quantity >= (product?.stock || 99) ? colors.outline : colors.secondary}
              size={20}
            />
          </TouchableRipple>
        </View>
        <PrimaryButton
          title="Add to Cart"
          icon="cart-plus"
          onPress={addToCart}
          disabled={!product || product.stock <= 0}
          style={styles.addToCartBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    height: 400,
    backgroundColor: colors.surfaceContainerLow,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingHorizontal: MARGIN_MOBILE,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerBtnActive: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  stockBadgeOverlay: {
    position: "absolute",
    bottom: 16,
    right: MARGIN_MOBILE,
  },
  content: {
    flex: 1,
    marginTop: -24,
  },
  contentContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: MARGIN_MOBILE,
    paddingBottom: 120,
    gap: 16,
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: -15 },
    shadowOpacity: 1,
    shadowRadius: 35,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandText: {
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tagContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    color: colors.secondary,
  },
  titleSection: {
    gap: 8,
  },
  productTitle: {
    color: colors.onSurface,
    fontWeight: "300",
  },
  productPrice: {
    color: colors.primaryContainer,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  descriptionSection: {
    gap: 12,
  },
  description: {
    color: colors.onSurfaceVariant,
    fontWeight: "300",
    lineHeight: 24,
  },
  specsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  specCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 4,
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  specIcon: {
    margin: 0,
  },
  specLabel: {
    color: colors.onSurface,
    fontWeight: "400",
  },
  specValue: {
    color: colors.muted,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: MARGIN_MOBILE,
    paddingVertical: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === "android" ? 12 : 28,
    shadowColor: colors.shadowElevated,
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  quantityPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
  },
  qtyBtn: {
    margin: 0,
  },
  qtyValue: {
    minWidth: 40,
    textAlign: "center",
    color: colors.label,
    fontVariant: ["tabular-nums"],
  },
  addToCartBtn: {
    flex: 1,
  },
});
