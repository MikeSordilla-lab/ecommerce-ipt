import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/api/client";
import type { Category, Product } from "@/api/types";
import { Button, Card, Field, Hero, Loading, Notice, PickerShell, ProductImage, Screen } from "@/components/ui";

export default function SellerProductFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productId = id ? Number(id) : null;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const product = useMemo(() => products.find((item) => item.id === productId), [products, productId]);

  useEffect(() => {
    apiFetch<{ products: Product[]; categories: Category[] }>("/api/mobile/seller/products.php")
      .then((data) => {
        setProducts(data.products);
        setCategories(data.categories);
        const existing = data.products.find((item) => item.id === productId);
        if (existing) {
          setCategoryId(String(existing.category_id));
          setName(existing.name);
          setDescription(existing.description || "");
          setPrice(String(existing.price));
          setStock(String(existing.stock));
          setCurrentImageUrl(existing.image_url || null);
        } else if (data.categories[0]) {
          setCategoryId(String(data.categories[0].id));
        }
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load form"))
      .finally(() => setLoading(false));
  }, [productId]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  }

  async function save() {
    setMessage("");
    const body = new FormData();
    if (productId) body.append("product_id", String(productId));
    body.append("category_id", categoryId);
    body.append("name", name);
    body.append("description", description);
    body.append("price", price);
    body.append("stock", stock);
    body.append("is_active", "1");

    if (image) {
      body.append("image", {
        uri: image.uri,
        name: image.fileName || "product.jpg",
        type: image.mimeType || "image/jpeg",
      } as unknown as Blob);
    }

    try {
      await apiFetch("/api/mobile/seller/products.php", { method: "POST", body });
      router.replace("/seller/products");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save product");
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <Screen>
      <Hero title={product ? "Edit Product" : "Add Product"} subtitle="Keep product details precise and ready for customer browsing." />
      {message ? <Notice tone="danger" message={message} /> : null}
      <Card>
        <ProductImage uri={image?.uri || currentImageUrl} />
        <Button title="Choose Image" variant="secondary" onPress={pickImage} />
        <PickerShell>
          <Picker selectedValue={categoryId} onValueChange={setCategoryId}>
            {categories.map((category) => (
              <Picker.Item key={category.id} label={category.name} value={String(category.id)} />
            ))}
          </Picker>
        </PickerShell>
        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Description" value={description} onChangeText={setDescription} multiline />
        <Field label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <Field label="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" />
        <Button title="Save Product" onPress={save} />
      </Card>
    </Screen>
  );
}
