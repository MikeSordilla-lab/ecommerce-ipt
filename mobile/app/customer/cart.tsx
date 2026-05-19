import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { apiFetch, jsonBody } from "@/api/client";
import type { CartItem } from "@/api/types";
import { Button, Card, Loading, Money, Muted, ProductImage, Screen, Subtitle, Title } from "@/components/ui";

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch<{ items: CartItem[]; subtotal: number }>("/api/mobile/cart.php");
    setItems(data.items);
    setSubtotal(data.subtotal);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load cart");
        setLoading(false);
      });
    }, [load]),
  );

  async function updateQuantity(item: CartItem, quantity: number) {
    await apiFetch("/api/mobile/cart.php", {
      method: "PATCH",
      body: jsonBody({ cart_item_id: item.cart_item_id, quantity }),
    });
    await load();
  }

  async function remove(item: CartItem) {
    await apiFetch("/api/mobile/cart.php", {
      method: "DELETE",
      body: jsonBody({ cart_item_id: item.cart_item_id }),
    });
    await load();
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <Screen>
      <Title>Cart</Title>
      {message ? <Muted>{message}</Muted> : null}
      {items.length === 0 ? <Muted>Your cart is empty.</Muted> : null}
      {items.map((item) => (
        <Card key={item.cart_item_id}>
          <ProductImage uri={item.image_url} />
          <Subtitle>{item.name}</Subtitle>
          <Money value={item.subtotal} />
          <Muted>Quantity: {item.quantity}</Muted>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button title="-" variant="secondary" disabled={item.quantity <= 1} onPress={() => updateQuantity(item, item.quantity - 1)} />
            <Button title="+" variant="secondary" disabled={item.quantity >= item.stock} onPress={() => updateQuantity(item, item.quantity + 1)} />
            <Button title="Remove" variant="danger" onPress={() => remove(item)} />
          </View>
        </Card>
      ))}
      <Card>
        <Subtitle>Total</Subtitle>
        <Money value={subtotal} />
      </Card>
      <Button title="Checkout" disabled={items.length === 0} onPress={() => router.push("/customer/checkout")} />
      <Button title="Continue Shopping" variant="secondary" onPress={() => router.push("/customer/shop")} />
    </Screen>
  );
}
