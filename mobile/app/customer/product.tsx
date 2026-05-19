import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { apiFetch, jsonBody } from "@/api/client";
import type { Product } from "@/api/types";
import { Button, Card, Loading, Money, Muted, ProductImage, Screen, Subtitle, Title } from "@/components/ui";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");

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
        body: jsonBody({ product_id: product.id, quantity: 1 }),
      });
      setMessage("Added to cart");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add to cart");
    }
  }

  if (!product && !message) {
    return <Loading />;
  }

  return (
    <Screen>
      {product ? (
        <>
          <ProductImage uri={product.image_url} />
          <Title>{product.name}</Title>
          <Card>
            <Money value={product.price} />
            <Muted>{product.description || "No description"}</Muted>
            <Muted>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</Muted>
            <Subtitle>Seller</Subtitle>
            <Muted>{product.seller_name || "Unknown"}</Muted>
          </Card>
          {message ? <Muted>{message}</Muted> : null}
          <Button title="Add to Cart" disabled={product.stock <= 0} onPress={addToCart} />
          <Button title="View Cart" variant="secondary" onPress={() => router.push("/customer/cart")} />
        </>
      ) : (
        <Muted>{message}</Muted>
      )}
    </Screen>
  );
}
