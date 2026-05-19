import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch, jsonBody } from "@/api/client";
import type { Product } from "@/api/types";
import { Button, Card, ChipRow, Hero, Loading, Money, Notice, ProductImage, Screen, StatusChip, Subtitle } from "@/components/ui";

export default function SellerProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const data = await apiFetch<{ products: Product[] }>("/api/mobile/seller/products.php");
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

  async function remove(productId: number) {
    await apiFetch("/api/mobile/seller/products.php", {
      method: "DELETE",
      body: jsonBody({ product_id: productId }),
    });
    await load();
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <Screen>
      <Hero title="My Products" subtitle="Create, edit, and deactivate seller inventory." />
      {message ? <Notice tone="danger" message={message} /> : null}
      <Button title="Add Product" onPress={() => router.push("/seller/product-form")} />
      {products.map((product) => (
        <Card key={product.id}>
          <ProductImage uri={product.image_url} />
          <Subtitle>{product.name}</Subtitle>
          <Money value={product.price} />
          <ChipRow>
            <StatusChip tone={product.is_active ? "success" : "danger"}>{product.is_active ? "Active" : "Inactive"}</StatusChip>
            <StatusChip tone="info">{product.stock} stock</StatusChip>
          </ChipRow>
          <Button title="Edit" variant="secondary" onPress={() => router.push(`/seller/product-form?id=${product.id}`)} />
          <Button title="Delete/Deactivate" variant="danger" onPress={() => remove(product.id)} />
        </Card>
      ))}
    </Screen>
  );
}
