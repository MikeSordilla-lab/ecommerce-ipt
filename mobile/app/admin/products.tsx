import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { apiFetch, jsonBody } from "@/api/client";
import type { Product } from "@/api/types";
import { Button, Card, Loading, Money, Muted, ProductImage, Screen, Subtitle, Title } from "@/components/ui";

export default function AdminProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const data = await apiFetch<{ products: Product[] }>("/api/mobile/admin/products.php");
    setProducts(data.products);
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

  async function setActive(productId: number, isActive: boolean) {
    await apiFetch("/api/mobile/admin/products.php", {
      method: "PATCH",
      body: jsonBody({ product_id: productId, is_active: isActive ? 1 : 0 }),
    });
    await load();
  }

  async function remove(productId: number) {
    await apiFetch("/api/mobile/admin/products.php", {
      method: "DELETE",
      body: jsonBody({ product_id: productId }),
    });
    await load();
  }

  if (loading) return <Loading />;

  return (
    <Screen>
      <Title>Products</Title>
      {message ? <Muted>{message}</Muted> : null}
      {products.map((product) => (
        <Card key={product.id}>
          <ProductImage uri={product.image_url} />
          <Subtitle>{product.name}</Subtitle>
          <Money value={product.price} />
          <Muted>{product.seller_name || "No seller"} · {product.is_active ? "Active" : "Inactive"}</Muted>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button title={product.is_active ? "Deactivate" : "Activate"} variant="secondary" onPress={() => setActive(product.id, !product.is_active)} />
            <Button title="Delete" variant="danger" onPress={() => remove(product.id)} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
