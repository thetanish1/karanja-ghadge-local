# Master Prompt: Build a Hyperlocal Marketplace & Delivery App

Act as a senior product manager, UX designer, software architect, and
full-stack engineer. Build a production-minded MVP for **Karanjaghadge
Local** (working name; keep the brand name configurable). It is an
independent hyperlocal marketplace connecting residents with nearby
shops and services in Karanjaghadge and, later, nearby villages. It may
offer a Blinkit-like convenient shopping experience, but do not copy
Blinkit's branding, UI assets, text, or proprietary design. Create an
original local-first product.

## 1. Product vision

Customers should be able to discover nearby shops, browse products,
place an order from one shop, choose delivery or pickup, pay by UPI or
cash on delivery where enabled, and follow order status. Local
shopkeepers should be able to list their shops and products, manage
availability, receive and accept orders, and coordinate fulfillment.
Admins should manage the marketplace. Delivery partners may be added to
fulfill orders.

**Launch principle:** Start with a small, free pilot. Shop
registration/listing and basic order receiving must be free initially.
Do not charge shops subscription fees or commissions during the pilot
unless the admin explicitly enables a future monetization setting. Make
fees configurable; never hard-code a charge.

## 2. Users and roles

Implement role-based access for: - Customer - Shopkeeper - Delivery
partner - Platform administrator

A user may have more than one role only if explicitly granted. Enforce
authorization on the backend, not only in the UI.

## 3. Customer experience

Build a mobile-first, responsive PWA-style customer experience with: -
Phone-number sign-in / OTP-ready authentication (use a development-safe
mock provider until credentials are configured; never pretend an SMS was
sent). - Location permission request and manual address/pincode/landmark
entry. - Serviceability check based on configurable delivery zones and
shop radius. - Home page with location, search, categories, featured
shops, popular products, offers, and recently viewed items. - Shop
listing with distance, estimated delivery range, minimum order (if
configured), open/closed status, and available fulfillment options. -
Shop detail page with shop information, timings, categories, product
search, and product availability. - Product cards with image, name,
unit/quantity, price, optional MRP/discount, stock status, and
add-to-cart. - Search across shops and products; filters for category,
price, availability, and distance. - Cart restricted to **one shop per
order in the MVP**. If a customer tries adding an item from another
shop, explain that they must place the current order first or clear the
cart. - Checkout with delivery address, delivery/pickup choice, customer
notes, item summary, delivery fee (if configured), and total. - Payment
options: UPI through a compliant payment gateway when configured, and
cash on delivery when enabled. For the pilot, allow "pay directly to
shop" as a configurable option. Do not store UPI PINs, card numbers, or
sensitive payment credentials. - Order confirmation, order history,
reorder, cancellation request subject to order state, and
support/contact. - Live or near-real-time order status updates. If live
maps/tracking are not configured, show honest status updates instead of
fake live tracking. - WhatsApp order notifications using an approved
WhatsApp Business Platform provider/template when configured. Provide an
in-app/phone fallback. Do not scrape WhatsApp or automate personal
accounts. - Clear privacy, terms, refund, cancellation, delivery, and
contact pages.

## 4. Shopkeeper dashboard

Provide a simple mobile-friendly shopkeeper portal: - Shop
onboarding/application with owner contact, shop name, address, map pin,
categories, opening hours, delivery/pickup capability, and required
verification details. - Admin approval before a shop becomes publicly
visible. - Shop profile and business-hours management. - Product CRUD:
name, description, category, images, SKU (optional), unit/variant,
price, MRP (optional), stock/availability, and active/inactive status. -
Bulk product import by CSV if feasible; otherwise keep it for a later
phase. - Incoming order alert and order queue. - Accept/reject order
with reason; confirm stock and preparation time. - Update order to
preparing, ready for pickup, handed to delivery partner, completed, or
cancelled as allowed by the state machine. - Order history, basic sales
summary, and customer contact only for legitimate fulfillment. - Ability
to pause orders or mark shop closed. - No subscription billing in the
initial free pilot. Display a clear "Free pilot" message and do not
imply that shops owe fees.

## 5. Delivery partner experience

Build a minimal delivery interface: - Delivery partner application and
admin approval. - Availability toggle. - Assigned deliveries with
pickup/drop-off details. - Accept/decline assignment with
timeout/configurable rules. - Open navigation in Google Maps using a
destination link. - Status updates: assigned, accepted, arrived at shop,
picked up, on the way, delivered, failed. - Proof of delivery using a
configurable OTP or delivery confirmation (avoid collecting unnecessary
personal data). - Cash collection recording only if COD is enabled, with
reconciliation for the admin. - Delivery history and earnings summary
only if a delivery payout model is enabled.

For the first pilot, the admin may manually assign deliveries. Do not
build complex automated dispatch before order volume validates the need.

## 6. Admin dashboard

Include: - Overview: shops, customers, orders, order value,
cancellations, active deliveries. - Approve/reject/suspend shops and
delivery partners. - Manage categories, service areas, delivery radius,
operating hours, banners, featured shops, and app settings. - View and
manage all orders with an audit trail. - Assign/reassign delivery
partners. - Configure delivery fees, commissions, subscriptions, taxes,
COD availability, and payment methods. All monetization settings must
default to **off / zero** during the free pilot. - Customer/shop support
and complaint handling. - Refund/cancellation management with recorded
reasons. - Export basic reports to CSV. - Audit log for sensitive admin
actions.

## 7. Order workflow and state machine

Design and validate a clear order lifecycle, for example:
`placed -> shop_accepted -> preparing -> ready_for_pickup -> delivery_assigned -> picked_up -> out_for_delivery -> delivered`

Also support valid alternatives: - `shop_rejected` -
`customer_cancel_requested` - `cancelled` - `delivery_failed` -
`refunded` (only when payment/refund integration supports it)

Define which role can perform each transition. Prevent invalid
transitions and duplicate order processing. Keep an immutable
event/history record for important status changes.

## 8. Integrations

### WhatsApp

-   Integrate through the official WhatsApp Business Platform or a
    legitimate provider.
-   Send order placed, accepted, ready, dispatched, delivered, and
    cancellation notifications using approved templates where required.
-   Store provider message IDs and delivery status when available.
-   If credentials are missing, provide a development mock/log and
    clearly mark it as not sent.

### Maps and location

-   Use Google Maps Platform or a configurable map provider for address
    selection, geocoding, shop pins, and navigation links.
-   Keep API keys in environment variables and restrict keys
    appropriately.
-   Ask for location permission only when needed; allow manual address
    entry.
-   Do not expose private customer addresses to unrelated shops or
    users.

### Payments

-   Keep payment provider integration behind a payment adapter.
-   Support UPI through a compliant payment gateway and COD if admin
    enables it.
-   For pilot, allow direct payment to shop or COD if agreed with the
    shop.
-   Verify payment status server-side using provider webhooks; never
    trust client-side success screens.
-   Do not store sensitive payment credentials.

### Notifications

-   In-app notifications and optional email/SMS/WhatsApp adapters.
-   Respect user notification preferences and consent.

## 9. Recommended technical architecture

Use a modular monolith for the MVP; avoid premature microservices.

Preferred stack: - Frontend: React + Vite, TypeScript, responsive
design, PWA capabilities. - Backend: Node.js + Express, TypeScript. -
Database: MongoDB with Mongoose schemas and indexes. - Authentication:
secure session or JWT strategy with refresh-token rotation where
appropriate; OTP provider adapter. - Image storage: object storage
(S3-compatible or equivalent); do not rely on ephemeral server disk in
production. - Maps: Google Maps adapter. - Payments: gateway adapter. -
WhatsApp: official Business Platform/provider adapter. - Deployment:
frontend on a static hosting platform; backend on a suitable Node host;
managed MongoDB. - Validation: schema validation on every API
boundary. - Security: rate limiting, helmet/security headers, CORS
allowlist, input validation, output sanitization, authorization checks,
secure secrets, audit logs, and protection against IDOR. -
Observability: structured logs, error handling, health endpoint, and
basic metrics.

Keep provider-specific integrations replaceable. Provide `.env.example`
with placeholders only; never commit real secrets.

## 10. Core data models

Design normalized, maintainable schemas for: - User - Address - Shop -
ShopMembership / ShopOwner - Category - Product - Cart (or client-side
cart with server validation) - Order - OrderItem (snapshot product
name/price/unit at purchase time) - Delivery - Payment - Notification -
ServiceArea - Review (optional, later phase) - SubscriptionPlan and
Subscription (future-ready only; disabled during pilot) - AuditLog

Use indexes for shop status/location, product
shop/category/availability, order customer/shop/status/createdAt, and
unique constraints where appropriate. Store money in integer paise, not
floating-point rupees. Store timestamps consistently.

## 11. UX and design direction

Create a polished, original, trustworthy local-commerce interface: -
Mobile-first, fast, accessible, and usable on lower-end Android
phones. - Clear local identity and visible service area. - Prominent
search and category navigation. - Clean product cards, readable prices,
clear stock/availability. - Fast add-to-cart interactions and simple
checkout. - Accessible colors, keyboard support, loading/empty/error
states, and useful validation. - Avoid excessive animations and heavy
assets. - Use original design assets and a configurable brand system.

## 12. MVP scope and phased delivery

### Phase 0 --- validation

-   Interview residents and shopkeepers.
-   Confirm shop participation, service area, delivery method, and
    realistic delivery fee.
-   Run manual orders before investing in automation.

### Phase 1 --- pilot MVP

-   Customer browse/search shops and products.
-   Shopkeeper onboarding and product management.
-   Single-shop cart and order placement.
-   Shop accepts/rejects and updates order status.
-   Admin approves shops and manages orders.
-   WhatsApp notifications through configured provider or honest mock.
-   Manual delivery assignment.
-   COD/direct-to-shop payment option if agreed.
-   Free listings and free order pilot.

### Phase 2 --- convenience features

-   Maps/address autocomplete.
-   UPI gateway and webhook verification.
-   Delivery partner portal.
-   Better notifications and order tracking.
-   Product CSV import, offers, coupons, ratings.

### Phase 3 --- scale and monetization

-   Nearby village expansion.
-   Delivery optimization.
-   Optional shop subscription plans, commissions, promoted listings,
    and customer memberships.
-   Enable monetization only after the platform demonstrates repeat
    orders and value to shops.

## 13. Business rules for the initial free launch

-   Shop listing: free.
-   Product listing: free.
-   Order receiving: free.
-   Commission: 0% by default.
-   Shop subscription: disabled.
-   Paid featured listings: disabled.
-   Customer platform fee: ₹0 by default.
-   Delivery fee: configurable and transparently shown; it may be paid
    to the delivery person/shop and is not automatically platform
    revenue.
-   Do not promise free delivery unless the business can fund it.
-   Provide a future-ready settings panel so fees can be introduced only
    with clear notice and shop agreement.

## 14. Required deliverables

Before coding: 1. Inspect the existing repository and summarize its
current structure, stack, and conventions. 2. Identify existing features
and protect them. Do not replace or break working functionality. 3.
Produce a concise architecture plan, page map, user journeys, data
model, API route list, and phased implementation checklist. 4. List
assumptions and unresolved decisions.

Then implement incrementally: - Build one vertical slice at a time. -
Include migrations/seed data where needed. - Add tests for
authentication, role authorization, order transitions, pricing
calculations, payment webhooks, and shop isolation. - Add loading,
empty, error, and success states. - Run lint, type checks, tests, and
production build after each major phase. - Report changed files,
commands run, test results, remaining risks, and manual setup steps.

**Critical instructions:** Do not fabricate successful integrations. If
credentials or external accounts are missing, build an adapter, mock it
in development, document setup, and clearly identify what remains. Do
not use real customer data in seed files. Do not implement multi-shop
checkout in the MVP. Prioritize a working, secure pilot over a large
unfinished feature set.
