# AapnaCart – Everything local, delivered fresh

> A modern hyperlocal commerce & delivery platform tailored for **Karanjaghadge** and surrounding towns, built strictly to the Figma design specifications.
> 
> Built with **React 18 + Vite PWA**, **Express**, **MongoDB (Mongoose)**, and **TypeScript** throughout.
> Styled with the exact Figma design system: deep forest green (`#1b5e39`), vibrant warm orange (`#f97316`), sage accents (`#ecf5ee`), and rounded mobile cards.

---

## 🎨 Figma Design Implementation

The UI matches your Figma design pixel-for-pixel:
- **Brand Identity:** **AapnaCart** logo featuring a green shopping bag icon with an orange dot handle accent, paired with the dual-color wordmark (**Aapna** in `#1b5e39` + **Cart** in `#f97316`).
- **Hero Onboarding Banner:** Mint/sage gradient background with decorative ring geometry and the circular masked photo of farm-fresh market produce.
- **Typography & Copy:**
  - `WELCOME TO AAPNACART` (Uppercase forest green tracking tag)
  - `Everything local, delivered fresh.` (Bold sans-serif headline)
  - `Shop from trusted stores around your town and get it at your doorstep.` (Subtitle)
- **Input & Action:**
  - Clean `+91 | Enter 10-digit number` mobile input box.
  - Deep forest green `Continue →` button.
  - `✉ I'm a shopkeeper` quick action.
  - `By continuing, you agree to our Terms & Privacy Policy.` disclaimer.

---

## 📱 Mobile Architecture: Android & Future iOS

Karanjaghadge Local is built mobile-first with dual deployment tracks:

### Track 1: Progressive Web App (PWA) – Zero Cost Pilot ($0 / ₹0)
- **Android:** Open `http://<your-ip>:3000` in Google Chrome on your Android phone and tap **"Install App"** (or use the built-in install banner). Generates a native WebAPK icon on the home screen with standalone viewport, splash screen, and offline cache.
- **iOS:** Open the URL in Safari on iPhone, tap **Share ⎋**, and select **"Add to Home Screen" ➕**. Runs in fullscreen standalone mode with native iOS status-bar styling (`black-translucent`).

### Track 2: Native Android & iOS Wrappers (Capacitor Configured)
The repository includes `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, and `@capacitor/ios` with bundle ID `in.karanjaghadge.local`.

#### To Build Native Android APK:
```bash
# 1. Build the production web bundle
npm run build --workspace=apps/web

# 2. Add Android native platform (first time)
cd apps/web
npx cap add android

# 3. Sync web assets into Android project
npx cap sync android

# 4. Open in Android Studio to build APK or run on connected device
npx cap open android
```

#### To Build Native iOS Project (when ready for iOS release):
```bash
# 1. Build the web bundle
npm run build --workspace=apps/web

# 2. Add iOS native platform (on macOS with Xcode)
cd apps/web
npx cap add ios

# 3. Sync and open in Xcode
npx cap sync ios
npx cap open ios
```

---

## 🔑 Demo & Pilot Personas (One-Click Testing)

The app comes pre-seeded with 4 real-world personas and a test OTP `123456`:

| Persona | Phone Number | Default Role | Capabilities in App |
| :--- | :--- | :--- | :--- |
| **Priya Sharma** | `9876543210` | Customer | Browse shops, single-shop cart, place order (COD / Pay direct), live status tracking, delivery OTP |
| **Ramesh Ghadge** | `9876543211` | Shopkeeper | Incoming order queue, accept/reject, mark preparing, ready for pickup, product CRUD, store pause toggle |
| **Sunil Wankhede** | `9876543212` | Delivery Rider | View assigned tasks, Google Maps direct navigation links, verify customer OTP & record COD collection |
| **Platform Admin** | `9876543213` | Admin | KPI metrics, approve/suspend shops, global order queue, manual delivery assignment, fee controls (0 default) |

*You can switch between these personas instantly using the test persona dropdown in the top navigation bar!*

---

## 🏪 Seeded Karanjaghadge Shops & Catalogue

The pilot database is seeded with 5 authentic local businesses:
1. **Mahaveer Kirana & General Stores** (Main Bazaar Road) – Sharbati Atta (₹210), Toor Dal (₹155), Sunflower Oil (₹140), Tata Salt (₹28)
2. **Ghadge Farm Fresh Vegetables** (Near Old Bus Stand) – Red Onions (₹35/kg), Potatoes (₹30/kg), Country Tomatoes (₹25/kg)
3. **Shri Krishna Dairy & Sweets** (Station Road Chowk) – Pure Cow Milk (₹60/L), Malai Paneer (₹110/250g), Desi Ghee (₹340/500g)
4. **Gurukrupa Bakery & Namkeen** (Opp. SBI) – Fresh Pav Ladi (₹25), Elaichi Toast Rusk (₹45)
5. **Sanjeevani Medical & General Store** (Opp. Primary Health Center) – Paracetamol 650mg (₹32), Dettol (₹90)

---

## ⚙️ Architecture & Hard Rules Enforced

1. **Pure Order State Machine (`packages/shared/src/state-machine.ts`)**:
   - `placed -> shop_accepted -> preparing -> ready_for_pickup -> delivery_assigned -> picked_up -> out_for_delivery -> delivered -> completed`
   - Customer cancellation is permitted strictly **before** `preparing` starts.
   - Pickup orders bypass delivery steps directly from `ready_for_pickup` to `completed`.
   - Idempotent: repeated transitions or double submissions return clean `noop` responses without side-effects.
2. **Single-Shop Cart Constraint (`apps/api/src/modules/cart/cart.routes.ts`)**:
   - Each order is placed with one merchant. Adding items from another shop triggers a 409 error and a friendly user dialog to either clear the cart or keep existing items.
3. **Pure Integer Paise Arithmetic (`packages/shared/src/pricing.ts`)**:
   - Zero floating-point rupee errors. All monetary figures are stored in integer paise (`₹120.50` = `12050`).
4. **Zero-Fee Pilot Rule (`DEFAULT_SETTINGS`)**:
   - All commission, customer platform fees, and delivery fees default strictly to `0`.
5. **Honest Mock Adapters**:
   - `smsAdapter`: Logs OTP code directly to console, never pretends real SMS was delivered.
   - `whatsAppAdapter`: Logs template parameters and records mock notification marked "not sent".
6. **Security & IDOR Protection**:
   - `requireShopAccess` middleware ensures Shopkeeper A cannot view or modify Shopkeeper B's products or orders.
   - Refresh token rotation with RFC 7519 `jti` nonces.

---

## 🚀 Running the Project

### Prerequisites
- Node.js v18+ (v24.15.0 supported)
- MongoDB (Running locally on `127.0.0.1:27017` or via fallback)

### Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (32 unit & integration tests)
npx vitest run

# 3. Seed database
npx tsx apps/api/src/db/seed.ts

# 4. Start Backend API (Port 5000)
npm run dev:api

# 5. Start Frontend PWA (Port 3000)
npm run dev:web
```

---

## 🧪 Automated Test Suite (32 Tests Passing)

Run tests anytime with:
```bash
npx vitest run
```

Tests verify:
- **Unit (13 tests):** Integer paise arithmetic, rupee formatting, pilot fee defaults, pure state machine transition rules, cancellation barriers, service area constants.
- **Integration (19 tests):** OTP generation & honest mock logging, attempt limits, JWT verification, refresh token rotation with reuse rejection, role authorization guards, shop isolation (IDOR defense), single-shop cart enforcement (HTTP 409), idempotent order creation with OrderItem snapshots.

---

## 📄 Legal & Compliance Pages Built In
- `Terms of Service`
- `Privacy Policy`
- `Cancellation & Refund Policy`
- `Delivery Terms & Pilot Coverage`
- `Support & Karanja Community Contact`
