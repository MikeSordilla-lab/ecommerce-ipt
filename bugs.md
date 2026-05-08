there a bug in the customer side the products image is not showing  and also can you add a page pagination and price it in php 
the product imahge is not also showing in the add to cart 

i cannot place order a product if i use mhy saved default address

i want the seller to have the order management function also can you fix the order management bug i cannot update the order status


i want also a landing page the follow the design DESIGN.md 

also i iwant the you to integrate this api to a temp image to the current products but always leave the option for users to upload their own images

Getting Product Images from dummyjson.com

The products API provides images in two formats:

### 1. Product Images Array
Each product includes an `images` array with multiple image URLs:

```
GET https://dummyjson.com/products
```

Response includes:
- **`thumbnail`**: Single thumbnail URL (e.g., `https://cdn.dummyjson.com/product-images/6/thumbnail.png`)
- **`images`**: Array of full-size image URLs (e.g., 5 images per product)

### 2. Get Single Product with Images
```
GET https://dummyjson.com/products/{id}
```

### 3. Generate Placeholder Images
```
GET https://dummyjson.com/image/{width}x{height}/{backgroundColor}/{textColor}?text=Hello
```

Example: `https://cdn.dummyjson.com/image/350x200/333333/eae0d0/?text=Hello+Peter`

### JavaScript Example
```javascript
fetch('https://dummyjson.com/products?limit=5')
  .then(res => res.json())
  .then(data => {
    data.products.forEach(product => {
      console.log('Title:', product.title);
      console.log('Thumbnail:', product.thumbnail);
      console.log('Images:', product.images);
    });
  });

also can you add a profile section to each user type to change their profile information
like profile picture, name, email, etc.
  and password change