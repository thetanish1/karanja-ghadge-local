# Subscription Model --- Karanjaghadge Local

## 1. Launch policy: free for everyone

The platform will launch with a free pilot.

During the initial phase: - Shop registration is free. - Shop listing is
free. - Product listing is free. - Receiving orders is free. - Platform
commission is 0%. - Shop subscription is disabled. - Featured listings
are disabled or free. - Customer platform fee is ₹0.

Do not collect subscription payments during the pilot. The objective is
to build trust, onboard local shops, attract customers and validate
repeat orders.

## 2. Why start free?

Local shopkeepers may be unfamiliar with the platform and may not want
to pay before seeing results. A free pilot reduces their risk and helps
the platform: - Build a useful local catalogue. - Learn how shops handle
digital orders. - Understand customer demand. - Test delivery and
support. - Collect feedback and demonstrate value.

Free should be a deliberate launch strategy, not an unclear promise of
permanent free service. Explain the pilot terms and give advance notice
before any future paid plan is introduced.

## 3. Proposed future shop plans

These are test concepts, not final prices. Validate willingness to pay
with shopkeepers before enabling them.

  Feature                        Free listing      Growth                  Premium
  ---------------------------- -------------- ----------- ------------------------
  Suggested price                          ₹0   ₹99/month               ₹199/month
  Shop profile                            Yes         Yes                      Yes
  Product catalogue                       Yes         Yes                      Yes
  Receive orders                          Yes         Yes                      Yes
  Basic order history                     Yes         Yes                      Yes
  Basic performance summary           Limited         Yes                      Yes
  Promotional offers tools              Basic         Yes                      Yes
  Featured placement credits               No     Limited                     More
  Priority support                   Standard    Standard   Priority, if available

### Free listing --- ₹0

-   Public shop profile.
-   Basic product catalogue.
-   Receive orders.
-   Update stock and prices.
-   Standard support.

### Growth --- proposed ₹99/month

-   Everything in Free.
-   Basic sales and order analytics.
-   Offer and coupon tools.
-   More promotional controls.

### Premium --- proposed ₹199/month

-   Everything in Growth.
-   Additional promotional placement credits.
-   Enhanced analytics.
-   Priority support if the platform can reliably provide it.

Do not promise features that have not been built.

## 4. Other optional revenue models

Subscriptions should not be the only monetization option.

-   Order commission: a future agreed percentage on completed orders.
-   Featured placement: paid promotion clearly labelled as sponsored.
-   Delivery coordination fee: only when the platform provides a real
    delivery service.
-   Customer membership: a future optional plan after repeat usage is
    proven.

Avoid charging both a subscription and commission without explaining the
value and obtaining shopkeeper agreement.

## 5. When to introduce paid plans

Consider introducing subscriptions only when: - The platform has active
customers. - Shops receive repeat orders through the platform. -
Shopkeepers can see useful order or sales results. - The paid features
provide additional value. - Customer support and fulfillment are
dependable.

A practical review point could be after 2--3 months of pilot operation,
but use actual traction---not the calendar alone---to decide.

## 6. Subscription implementation requirements

Make subscription functionality future-ready but disabled by default.

Admin controls: - Enable/disable subscriptions globally. - Create and
edit plans. - Configure price, billing period and included features. -
Set trial or introductory period if offered. - View active, expired,
cancelled and past-due subscriptions. - Apply manual comp access when
appropriate. - Record plan changes and billing events.

Shopkeeper controls: - View current plan. - Compare available plans. -
See feature limits. - Upgrade, downgrade or cancel when billing is
live. - View invoices and payment history when supported.

Technical requirements: - Store plan and subscription records
separately. - Verify payment gateway webhooks server-side. - Handle
renewals, failures, cancellations and refunds. - Never unlock paid
features based only on a client-side payment-success screen. - Do not
store card or UPI PIN credentials. - Clearly show renewal amount,
billing period and cancellation terms before purchase.

## 7. Free pilot configuration

The application should start with these values:

``` text
SHOP_LISTING_FEE=0
PRODUCT_LISTING_FEE=0
ORDER_COMMISSION_PERCENT=0
SHOP_SUBSCRIPTIONS_ENABLED=false
FEATURED_LISTINGS_ENABLED=false
CUSTOMER_PLATFORM_FEE=0
```

Use database/admin configuration rather than relying only on hard-coded
environment variables for long-term business settings. The above values
describe the required initial behavior.

## 8. Communication to shopkeepers

Suggested message:

> We are launching Karanjaghadge Local to help residents discover and
> order from nearby shops. Shop registration, product listing and
> receiving orders will be free during our initial pilot. We want to
> first help local shops get discovered and understand whether customers
> find the service useful. If paid plans are introduced in the future,
> we will explain the features and pricing in advance. There is no
> subscription charge during the pilot.

## 9. Guiding principle

Do not monetize an empty marketplace. First build a useful network of
shops and customers, prove that orders are being generated, and then
introduce optional paid features that shopkeepers genuinely value.
