import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { apiFetch, jsonBody } from "@/api/client";
import type { Product } from "@/api/types";
import { ActionRow, Button, Card, ChipRow, Hero, Loading, Money, Muted, Notice, ProductImage, Screen, StatusChip, Subtitle } from "@/components/ui";

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
          <Hero title={product.name} subtitle={product.category_name || "Product details"} />
          <Card>
            <Money value={product.price} />
            <ChipRow>
              <StatusChip tone={product.stock > 0 ? "success" : "danger"}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </StatusChip>
            </ChipRow>
            <Muted>{product.description || "No description"}</Muted>
            <Subtitle>Seller</Subtitle>
            <Muted>{product.seller_name || "Unknown"}</Muted>
          </Card>
          {message ? <Notice tone={message === "Added to cart" ? "success" : "muted"} message={message} /> : null}
          <ActionRow>
            <Button title="Add to Cart" disabled={product.stock <= 0} onPress={addToCart} />
            <Button title="View Cart" variant="secondary" onPress={() => router.push("/customer/cart")} />
          </ActionRow>
        </>
      ) : (
        <Muted>{message}</Muted>
      )}
    </Screen>
  );
}
