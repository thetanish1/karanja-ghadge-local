# Karanjaghadge Local – Micro-Monolithic Architecture

## Overview
**Karanjaghadge Local (AapnaCart)** is engineered as a **Modular Monolith (Micro-Monolith)**. It combines the developer velocity, simple single-repo deployment, and transactional integrity of a monolith with the strict domain decoupling, independent module boundaries, and pluggable interfaces of microservices.

```
                                  +---------------------------------------+
                                  |       AapnaCart PWA (Vite + React)     |
                                  |  (Customer, Shopkeeper, Delivery, Admin)|
                                  +-------------------+-------------------+
                                                      |
                                             REST / JSON APIs
                                                      |
+-----------------------------------------------------v----------------------------------------------------+
|                                    MODULAR MONOLITH CORE (Node / Express)                                |
|                                                                                                          |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+          |
|  |    Auth Module     |  |    Shops Module    |  |  Products Module   |  |    Cart Module     |          |
|  | - OTP auth         |  | - Apply & Onboard  |  | - Product CRUD     |  | - 1-shop validation|          |
|  | - JWT rotation     |  | - Verification hold|  | - Stock & pricing  |  | - Integrity checks |          |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+          |
|                                                                                                          |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+          |
|  |   Orders Module    |  |  Delivery Module   |  |    Admin Module    |  |  Settings Module   |          |
|  | - State machine    |  | - Manual assign    |  | - Shop approvals   |  | - Config key/values|          |
|  | - OrderEvent log   |  | - Delivery OTP     |  | - Audit logging    |  | - Fees (default 0) |          |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+          |
+-----------------------------------------------------+----------------------------------------------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
         +---------------v---------------+                         +---------------v---------------+
         |     DATA PERSISTENCE LAYER    |                         |     ADAPTER / IO LAYER        |
         |      (MongoDB 8.0+ Engine)    |                         |  (Pluggable External Drivers) |
         | - 16 Domain Collections       |                         | - MockEmailAdapter            |
         | - Integer Paise Currency      |                         | - MockWhatsAppAdapter         |
         | - 2dsphere Geo Indices        |                         | - MockSMSAdapter              |
         | - Immutable Event Audit Trails|                         | - PaymentAdapter (COD / Direct|
         +-------------------------------+                         +-------------------------------+
```

---

## 1. Core Architectural Pillars

### A. Independent Service Boundaries
Every business capability lives in its own dedicated module under `apps/api/src/modules/`:
- **Auth**: Manages user authentication, OTP generation, token lifecycle, and role assignments.
- **Shops**: Merchant onboarding, opening/closing hours, storefront photos, and verification states.
- **Products**: Merchant catalog, pack sizes, inventory states, and pricing.
- **Cart**: Server-side enforced single-shop basket validation and price freshness checks.
- **Orders**: Deterministic state machine, idempotency protection, and append-only order history.
- **Delivery**: Driver assignment, dispatch queues, and handover verification.
- **Admin**: Shop approval pipeline, platform overview metrics, and system configuration.
- **Settings**: System configurations where all platform fees default to zero for the pilot.

### B. Shared Contracts (`packages/shared`)
The `packages/shared` workspace defines types, data transfer objects (DTOs), and validation rules shared between frontends and backend. It contains zero database drivers or HTTP logic, ensuring clear contracts.

### C. Adapter Pattern for External Dependencies
No core business logic directly calls external third-party SDKs. Instead, everything sits behind an abstract interface:
- `IEmailAdapter` (`apps/api/src/adapters/email/mock-email.adapter.ts`): Honest email dispatch notifications for shopkeeper verification.
- `ISMSAdapter` (`apps/api/src/adapters/sms/mock-sms.adapter.ts`): Honest OTP mock logger without fake carrier delivery claims.
- `IWhatsAppAdapter` (`apps/api/src/adapters/whatsapp/mock-whatsapp.adapter.ts`): Honest WhatsApp template logger.
- `IPaymentAdapter` (`apps/api/src/adapters/payment/payment.adapter.ts`): Server-side recording of COD and pay-direct-to-shop methods.

When migrating to live external APIs (e.g. AWS SES, Gupshup, Razorpay), only the adapter implementation is swapped. Zero changes to domain business logic are needed.

---

## 2. Shopkeeper Onboarding & Verification Flow

1. **Merchant Application**:
   - The shopkeeper provides shop name, owner name, contact phone, contact email, Karanja address, category, daily opening/closing hours, and storefront photos.
   - Sent via `POST /api/v1/shops/apply`.
2. **Instant Status Transition**:
   - The shop is stored in MongoDB with `status: 'pending'`.
   - The user is granted the `shopkeeper` role.
   - An audit log event `SHOP_APPLICATION_SUBMITTED` is immutably recorded.
3. **Honest Email Dispatch**:
   - `emailAdapter.sendEmail()` delivers a formatted verification confirmation to the merchant's email address.
4. **Verifying Stage Screen (`ShopVerificationScreen`)**:
   - The UI presents the live "Under Verification" roadmap (Application Submitted -> Email Dispatched -> Admin Review -> Catalog Live).
   - The merchant can check live verification status or enter the Demo Shopkeeper Portal for immediate preview.
5. **Admin Approval Pipeline (`ShopApprovalsPage`)**:
   - The Karanja admin reviews the pending shop with owner details, email, address, timings, and photos.
   - Approving the shop sets `status: 'approved'`, making it immediately visible to customers on the marketplace.

---

## 3. Ready for Future Microservices Split
Because modules are strictly decoupled and communicate through defined contracts and adapters, any module (such as Orders or Catalog) can be lifted out of the monolith and into an independent container/service in the future with zero database redesign.
