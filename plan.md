E-Commerce Application Rubrics

1. Transaction Management (25 pts)
Criteria	Description
Product Browsing	Users can view products with categories, search, and filters
Cart Functionality	Users can add, update quantity, and remove items from cart
Cart Persistence	Cart data is retained (session/local storage/database)
Checkout Process	Users can place orders with complete order summary
Payment Method (COD)	System supports Cash on Delivery as the primary payment option
Checkout Confirmation	Users confirm order with COD selected before placing order
Order Recording	Orders are properly saved with payment method = COD
Order Status Handling	Payment status shown (e.g., “To Pay on Delivery”, “Pending”)
Validation	Prevents checkout with incomplete delivery details
User Feedback	Displays confirmation after successful order placement
2. Delivery Management (20 pts)
Criteria	Description
Order Processing	Orders move through statuses (Pending → Shipped → Delivered)
Shipping Information	Users can input and save valid delivery details
Order Tracking	Users can view order status updates
Admin/Seller Control	Admin/Seller can update delivery status
Data Accuracy	Delivery information correctly linked to each order
3. User Roles and Access Control (20 pts)
Criteria	Description
Role Implementation	Admin, Seller, and Customer roles exist and function correctly
Authentication System	Functional login/logout connected to database
Authorization	Role-based access restrictions enforced (RBAC)
Session Management	Sessions or tokens (e.g., JWT) properly handled
Security Practices	Password hashing and basic security measures implemented
4. Inventory Management (20 pts)
Criteria	Description
Product Management (CRUD)	Admin/Seller can Create, Read, Update, Delete products
Stock Tracking	Product quantities update automatically after purchase
Stock Validation	Prevents ordering beyond available stock
Availability Display	Shows stock status (e.g., “In Stock”, “Out of Stock”)
Real-Time Updates	Changes reflect immediately in UI/system
5. Deployment & Hosting (10 pts)
Criteria	Description
Web Deployment	System is hosted and accessible via browser
Mobile Compatibility	Mobile app or responsive design works correctly
API Hosting	Backend (PHP API) is deployed and functional
System Reliability	Stable performance with minimal downtime
6. UI/UX Design & Responsiveness (5 pts)
Criteria	Description
Layout Design	Clean, consistent, and visually appealing interface
Navigation	Easy-to-use menus and user flow
Responsiveness	Works across different screen sizes
Usability	User-friendly interactions and clear feedback
7. Code Quality & Organization (5 pts)
Criteria	Description
Code Structure	Organized files and logical folder structure
Readability	Proper naming conventions and formatting
Reusability	Components/modules reused effectively
Documentation	Basic comments/documentation included
8. Error Handling & Validation (5 pts)
Criteria	Description
Input Validation	Validates user inputs (forms, checkout, login)
Error Handling	Prevents crashes and handles errors gracefully
User Feedback	Displays meaningful error/success messages
Edge Cases	Handles empty data, invalid requests, etc.
