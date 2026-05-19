import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { apiFetch, jsonBody } from "@/api/client";
import type { Category, Product } from "@/api/types";
import { Button, Card, Field, Loading, Money, Muted, ProductImage, Screen, Subtitle, Title } from "@/components/ui";

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const data = await apiFetch<{ products: Product[]; categories: Category[] }>(`/api/mobile/products.php${query}`);
    setProducts(data.products);
    setCategories(data.categories);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((error) => {
      setMessage(error instanceof Error ? error.message : "Could not load products");
      setLoading(false);
    });
  }, []);

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

  if (loading) {
    return <Loading />;
  }

  return (
    <Screen>
      <Title>Shop</Title>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Field label="Search" value={search} onChangeText={setSearch} />
        </View>
        <View style={{ justifyContent: "flex-end" }}>
          <Button title="Go" onPress={() => load()} />
        </View>
      </View>
      <Muted>{categories.length} categories available</Muted>
      {message ? <Muted>{message}</Muted> : null}
      <Button title="Cart" variant="secondary" onPress={() => router.push("/customer/cart")} />
      <Button title="Orders" variant="secondary" onPress={() => router.push("/customer/orders")} />
      {products.map((product) => (
        <Card key={product.id}>
          <ProductImage uri={product.image_url} />
          <Subtitle>{product.name}</Subtitle>
          <Muted>{product.category_name || "Product"}</Muted>
          <Money value={product.price} />
          <Muted>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</Muted>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button title="View" variant="secondary" onPress={() => router.push(`/customer/product?id=${product.id}`)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Add" disabled={product.stock <= 0} onPress={() => addToCart(product.id)} />
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
