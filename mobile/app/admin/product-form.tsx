import { AdminBottomNav } from "@/components/ui";
import { ProductFormScreen } from "@/components/ProductFormScreen";

export default function AdminProductFormScreen() {
  return (
    <ProductFormScreen
      endpoint="/api/mobile/admin/products.php"
      listRoute="/admin/products"
      title="Edit Product"
      subtitle="Update catalog details, status, stock, price, and image."
      bottomNav={<AdminBottomNav activeRoute="products" />}
    />
  );
}
