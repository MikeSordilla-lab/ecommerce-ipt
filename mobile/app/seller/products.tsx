import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { apiFetch, jsonBody } from "@/api/client";
import type { Product } from "@/api/types";
import { ActionRow, BadgeChip, Button, Card, ChipRow, FilterChip, Hero, Loading, Money, Notice, ProductImage, Screen, SearchBar, SellerBottomNav, StatusChip } from "@/components/ui";
import { colors } from "@/theme/colors";

type FilterKey = "all" | "active" | "inactive" | "low_stock";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "low_stock", label: "Low Stock" },
];

export default function SellerProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const load = useCallback(async () => {
    const data = await apiFetch<{ products: Product[] }>("/api/mobile/seller/products.php");
    setProducts(data.products || []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load products");
        setLoading(false);
      });
    }, [load]),
  );

  async function remove(productId: number) {
    await apiFetch("/api/mobile/seller/products.php", {
      method: "DELETE",
      body: jsonBody({ product_id: productId }),
    });
    await load();
  }

  const filtered = useMemo(() => {
    let list = products || [];
    const q = (search || "").toLowerCase().trim();
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.category_name || "").toLowerCase().includes(q));
    }
    switch (filter) {
      case "active":
        list = list.filter((p) => p.is_active);
        break;
      case "inactive":
        list = list.filter((p) => !p.is_active);
        break;
      case "low_stock":
        list = list.filter((p) => p.stock <= 5 && p.is_active);
        break;
    }
    return list;
  }, [products, search, filter]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Screen bottomNav={<SellerBottomNav activeRoute="products" />}>
      <Hero title="Products" subtitle="Manage your inventory." />
      {message ? <Notice tone="danger" message={message} /> : null}

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />

      <ChipRow>
        {FILTERS.map((f) => (
          <FilterChip key={f.key} selected={filter === f.key} onPress={() => setFilter(f.key)}>
            {f.label}
          </FilterChip>
        ))}
      </ChipRow>

      <Button title="Add Product" icon="plus" onPress={() => router.push("/seller/product-form")} />

      {filtered.length ? (
        filtered.map((product) => (
          <Card key={product.id}>
            <View style={styles.productRow}>
              <ProductImage uri={product.image_url} size="small" style={styles.productThumb} />
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text variant="titleSmall" style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  {product.is_active && product.stock <= 5 ? (
                    <BadgeChip tone="warning">Low</BadgeChip>
                  ) : null}
                </View>
                <Money value={product.price} size="small" />
                <ChipRow>
                  <StatusChip tone={product.is_active ? "success" : "danger"}>{product.is_active ? "Active" : "Inactive"}</StatusChip>
                  <StatusChip tone={product.stock <= 5 ? "warning" : "neutral"}>{product.stock} left</StatusChip>
                  {product.category_name ? <StatusChip>{product.category_name}</StatusChip> : null}
                </ChipRow>
              </View>
            </View>
            <ActionRow>
              <Button title="Edit" icon="pencil" variant="secondary" onPress={() => router.push(`/seller/product-form?id=${product.id}`)} />
              <Button title={product.is_active ? "Deactivate" : "Activate"} icon={product.is_active ? "delete-outline" : "check"} variant={product.is_active ? "danger" : "secondary"} onPress={() => remove(product.id)} />
            </ActionRow>
          </Card>
        ))
      ) : (
        <Notice tone="info" message={search || filter !== "all" ? "No products match your search or filter." : "No products yet. Add your first product to start selling."} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  productRow: {
    flexDirection: "row",
    gap: 10,
  },
  productThumb: {
    borderRadius: 6,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  productName: {
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
});
