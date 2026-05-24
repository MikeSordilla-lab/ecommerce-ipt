import { ProductFormScreen } from "@/components/ProductFormScreen";
import { SellerBottomNav } from "@/components/ui";

export default function SellerProductFormScreen() {
  return (
    <ProductFormScreen
      endpoint="/api/mobile/seller/products.php"
      listRoute="/seller/products"
      title="Add Product"
      subtitle="Keep product details precise and ready for customer browsing."
      bottomNav={<SellerBottomNav activeRoute="products" />}
      createEnabled
    />
  );
}
