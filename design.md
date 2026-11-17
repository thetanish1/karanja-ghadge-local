# AapnaCart — UI Design Direction

## 1. Product Overview

**Product:** AapnaCart  
**Tagline:** Your Town. Your Shops. Your Cart.

AapnaCart is a hyperlocal shopping marketplace that connects customers with nearby independent shops. Customers can discover local grocery stores, vegetable vendors, dairy shops, bakeries and other retailers, browse products, place orders and track delivery.

The first launch is focused on one locality, but the design must be scalable to multiple towns and villages.

## 2. Primary Design Goal

Create a polished, premium mobile app experience inspired by the **design principles of Apple apps**:

- Calm, minimal and intentional layouts.
- Clear visual hierarchy and generous whitespace.
- Excellent typography and readable content.
- Subtle depth, borders, shadows and motion.
- Consistent spacing and alignment.
- Simple navigation with predictable interactions.
- High-quality product imagery.
- Native-feeling controls and touch targets.

**Important:** Use Apple apps as a quality and usability reference only. Do not copy Apple's branding, icons, proprietary UI, exact screens or assets. AapnaCart must have its own recognizable identity.

The result should feel like a thoughtfully designed modern iOS shopping app, not a generic e-commerce template.

## 3. Visual Identity

### Brand personality

- Friendly and local.
- Reliable and convenient.
- Modern but approachable.
- Premium in execution, simple in use.
- Community-oriented.

### Colour palette

Use a restrained palette. Avoid excessive gradients and bright competing colours.

| Purpose | Colour |
|---|---|
| Primary brand green | `#16845B` |
| Deep green | `#106B49` |
| Soft green background | `#EAF5EF` |
| Main background | `#F7F8F6` |
| Surface / cards | `#FFFFFF` |
| Primary text | `#171A18` |
| Secondary text | `#707873` |
| Divider / border | `#E7EBE8` |
| Accent orange | `#F2A34A` |
| Error | `#D94A45` |
| Success | `#21865B` |

Use green for primary actions and important selected states. Use orange sparingly for offers, highlights or small attention cues. Maintain accessible contrast.

### Typography

Use a clean system sans-serif typeface:
- iOS: SF Pro / system font.
- Android and web: use a close system sans-serif fallback.

Typography guidance:
- Large page titles: 28–34 pt, semibold.
- Section titles: 19–22 pt, semibold.
- Card titles: 15–17 pt, medium.
- Body: 14–16 pt, regular.
- Metadata: 12–13 pt, regular.
- Prices: 16–20 pt, semibold.

Use sentence case. Avoid unnecessary uppercase labels, overly bold text and decorative fonts.

## 4. Layout and Component Principles

### Spacing

Use a consistent 4-point spacing system:
- 4 px: very small gaps.
- 8 px: compact spacing.
- 12 px: component spacing.
- 16 px: standard screen padding.
- 20–24 px: section spacing.
- 32 px: major separation.

Use approximately 20 px horizontal screen padding on mobile, adjusting for device width and safe areas.

### Shape and surfaces

- Cards: 16–20 px corner radius.
- Buttons: 14–16 px corner radius.
- Inputs: 12–14 px corner radius.
- Chips: fully rounded.
- Prefer subtle 1 px borders and very soft shadows.
- Avoid excessive glassmorphism, heavy shadows and stacked cards.

### Buttons

Primary button:
- Brand green background.
- White label.
- Semibold text.
- Height around 50–54 px.
- Clear pressed, disabled and loading states.

Secondary button:
- White or transparent surface.
- Subtle border.
- Dark text.

Destructive actions should use a clear error colour and require confirmation when appropriate.

### Icons

- Use simple, consistent line icons.
- Keep stroke weight and visual size consistent.
- Use icons with text labels when meaning may be unclear.
- Do not use emoji as interface icons.
- Do not mix unrelated icon styles.

### Product imagery

- Use clear, realistic product images.
- Keep image aspect ratios consistent within a product list.
- Use clean image backgrounds where possible.
- Avoid stretched, low-quality or unrelated images.
- Provide graceful placeholders for missing images.

## 5. Navigation

Use a simple bottom tab bar for the customer app:

1. **Home** — discover shops and products.
2. **Explore** — browse categories and search.
3. **Orders** — current and previous orders.
4. **Account** — profile, addresses and settings.

The cart should remain easy to access from the home and shop screens. Show a compact cart indicator when it contains items.

Navigation should be consistent across screens. Use clear back navigation and preserve the user's cart when moving between screens.

## 6. Customer App Screens

Design the following screens as one consistent, connected mobile app.

### 6.1 Splash screen

- AapnaCart wordmark and original simple cart/local-shopping symbol.
- Soft, minimal background.
- Short tagline: "Your Town. Your Shops. Your Cart."
- Keep the screen uncluttered.

### 6.2 Onboarding

- Explain the value in no more than three short slides.
- Focus on shopping from nearby local stores.
- Use friendly illustrations or tasteful photography.
- Provide clear Skip and Continue actions.

### 6.3 Login and OTP verification

- Mobile number entry with country code.
- Clear OTP verification screen.
- Explain why the number is needed.
- Large, accessible input fields.
- Clear resend timer and error states.
- Do not ask for unnecessary personal information.

### 6.4 Location selection

- Ask the user to select their town/locality or use device location with permission.
- Allow manual address entry.
- Show selected delivery area clearly.
- Explain when a location is outside the service area.
- Never imply location permission is mandatory if manual selection is available.

### 6.5 Home screen

The home screen is the most important screen.

Suggested hierarchy:
1. Delivery location at the top with a location icon and change action.
2. Greeting or concise welcome message.
3. Prominent search field: "Search shops or products".
4. A restrained promotional banner.
5. Horizontal category shortcuts.
6. "Shops near you" section.
7. "Popular in your area" product section.
8. Optional recently viewed or recommended items.

Shop cards should show:
- Shop name.
- Shop category.
- Distance, if reliably available.
- Open/closed status.
- Delivery or pickup availability, if supported.
- Shop image or logo.

Do not fill the screen with too many banners or promotional elements. Prioritize nearby shops and useful shopping actions.

### 6.6 Explore and search

- Search shops and products from one clear search field.
- Show recent searches and popular categories before typing.
- Show useful suggestions while typing.
- Provide filters such as category, open now and delivery/pickup when supported.
- Include clear empty, loading and no-results states.

### 6.7 Shop listing

Each shop card should feel clean and informative.

Display:
- Shop name and image.
- Category.
- Locality or distance when available.
- Open/closed status.
- Delivery/pickup information.
- A clear action to view the shop.

Do not invent ratings, delivery times or availability.

### 6.8 Shop detail and product catalogue

- Shop name, image, category and operating status.
- Search within this shop.
- Product categories.
- Clean product grid or list.
- Product image, name, unit/quantity, price and availability.
- Add button with clear quantity controls after an item is added.

For the MVP, keep one shop per order. If a customer tries to add products from another shop, explain the restriction clearly and offer to clear or keep the existing cart.

### 6.9 Product detail

- Large product image.
- Product name and price.
- Unit or pack size.
- Short description when available.
- Availability status.
- Quantity selector.
- Clear Add to Cart button.

Do not invent product descriptions, stock or prices.

### 6.10 Cart

- Group items under the selected shop.
- Product thumbnail, name, unit, price and quantity controls.
- Remove item action.
- Subtotal and any applicable delivery fee shown transparently.
- Clear checkout action.
- Empty-cart state with a way to continue shopping.

### 6.11 Checkout

- Delivery address selection.
- Delivery or pickup choice if supported.
- Order summary.
- Item subtotal.
- Delivery fee and other charges shown separately.
- Payment choices: UPI and Cash on Delivery, only when enabled.
- Clear Place Order button.

Never hide fees or show a payment method as available unless the backend supports it.

### 6.12 Order confirmation and tracking

- Clear order success state.
- Order number.
- Shop name and order summary.
- Order progress steps, such as:
  1. Order placed.
  2. Shop accepted.
  3. Preparing.
  4. Ready for pickup / Out for delivery.
  5. Delivered.

Only show states that are supported by the actual order workflow. Do not promise a fixed delivery time.

### 6.13 Orders

- Active orders first.
- Previous orders below.
- Status labels and order date.
- View details action.
- Reorder action only if products are still available.

### 6.14 Account

- Customer profile.
- Saved addresses.
- Order history.
- Help and support.
- Terms and privacy.
- Sign out.

Keep account settings simple and easy to scan.

## 7. Shopkeeper App / Dashboard

Create a separate shopkeeper experience using the same design system, optimized for quick daily tasks.

Screens:
1. Shopkeeper login.
2. Shop profile setup.
3. Dashboard with new, active and completed orders.
4. Incoming order details with Accept and Reject actions.
5. Product catalogue management.
6. Add/edit product form with image, name, price, unit and availability.
7. Shop open/closed toggle.
8. Order status update.
9. Basic sales and order summary.

Make the most common actions reachable in one or two taps. Use clear status labels and confirmation for important actions.

## 8. Interaction and Motion

Use subtle, purposeful animations:
- Smooth screen transitions.
- Gentle button press feedback.
- Short add-to-cart confirmation.
- Animated quantity changes.
- Subtle loading skeletons.
- Clear success and error feedback.

Motion should be quick and restrained. Avoid bouncy, distracting or long animations. Respect reduced-motion preferences where supported.

Every visible interactive element must have a meaningful action and a visible state.

## 9. Accessibility and Responsive Behaviour

- Maintain readable text and accessible colour contrast.
- Use touch targets around 44 × 44 pt or larger.
- Do not communicate status using colour alone.
- Provide labels for icon-only controls.
- Support dynamic text sizing where possible.
- Design for small Android phones and larger iPhones.
- Respect device safe areas.
- Avoid clipped text, overlapping controls and horizontal overflow.

## 10. Required UI States

For important screens, design:
- Default state.
- Loading state.
- Empty state.
- Error state.
- Disabled state.
- Success state.

Examples:
- No shops available in selected area.
- Shop currently closed.
- Product out of stock.
- Empty cart.
- Order rejected or cancelled.
- Network unavailable.
- Location permission denied.

Use helpful, human language rather than technical error messages.

## 11. Design Consistency Rules

- Reuse the same colours, typography, spacing and component shapes.
- Keep headers, search fields, buttons and product cards consistent.
- Use a consistent bottom navigation bar.
- Keep price formatting consistent in Indian Rupees (₹).
- Use realistic Indian shop and product examples.
- Avoid clutter, excessive gradients, oversized headings and too many card styles.
- Do not make every section a separate floating card.
- Use whitespace to create hierarchy.
- Do not use fake ratings, fake reviews, fake stock counts or unsupported delivery promises.

## 12. Instructions for Google Stitch

Generate the screens in small, coherent batches while preserving one shared visual design system.

Recommended generation order:
1. Splash, onboarding, login and location selection.
2. Home and explore.
3. Shop listing and shop detail.
4. Product detail and cart.
5. Checkout, order confirmation and tracking.
6. Orders and account.
7. Shopkeeper dashboard and management screens.

For every batch:
- Follow this `design.md` as the source of truth.
- Maintain the same AapnaCart visual identity.
- Reuse the same components and design tokens.
- Keep screens realistic and implementation-friendly.
- Prefer clear layouts over decorative effects.
- Make the screens feel like parts of one real product, not unrelated mockups.

**Final quality bar:** The app should feel as refined, calm and intuitive as a well-made Apple app, while retaining a distinctive AapnaCart identity rooted in local Indian shopping.
