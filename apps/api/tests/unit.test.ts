import { describe, it, expect } from 'vitest';
import {
  calculateOrderTotals,
  formatPaiseToRupees,
  parseRupeesToPaise,
  validateOrderTransition,
  getAvailableTransitions,
  DEFAULT_SETTINGS,
  DEFAULT_SERVICE_AREA,
} from '@karanjaghadge/shared';

describe('Unit: Pure Pricing Engine (Paise Arithmetic)', () => {
  it('calculates order totals in integer paise correctly', () => {
    const items = [
      { pricePaise: 21000, qty: 2 }, // 42000 paise (₹420)
      { pricePaise: 3500, qty: 3 },  // 10500 paise (₹105)
    ];

    const result = calculateOrderTotals(items, 0, 0);
    expect(result.itemsTotalPaise).toBe(52500); // ₹525
    expect(result.deliveryFeePaise).toBe(0);
    expect(result.platformFeePaise).toBe(0);
    expect(result.totalPaise).toBe(52500);
  });

  it('safely incorporates configurable non-zero delivery & platform fees in paise', () => {
    const items = [{ pricePaise: 10000, qty: 1 }]; // ₹100
    const result = calculateOrderTotals(items, 2500, 500); // +₹25 delivery, +₹5 platform
    expect(result.itemsTotalPaise).toBe(10000);
    expect(result.deliveryFeePaise).toBe(2500);
    expect(result.platformFeePaise).toBe(500);
    expect(result.totalPaise).toBe(13000);
  });

  it('verifies pilot defaults: all fees must be zero', () => {
    expect(DEFAULT_SETTINGS.DELIVERY_FEE_PAISE).toBe(0);
    expect(DEFAULT_SETTINGS.PLATFORM_FEE_PAISE).toBe(0);
    expect(DEFAULT_SETTINGS.COMMISSION_PERCENT).toBe(0);
  });

  it('formats paise to Indian rupees without floating point artifacts', () => {
    expect(formatPaiseToRupees(0)).toBe('₹0');
    expect(formatPaiseToRupees(15000)).toBe('₹150');
    expect(formatPaiseToRupees(15050)).toBe('₹150.50');
    expect(formatPaiseToRupees(99)).toBe('₹0.99');
  });

  it('parses rupees safely to integer paise', () => {
    expect(parseRupeesToPaise('₹150')).toBe(15000);
    expect(parseRupeesToPaise('150.50')).toBe(15050);
    expect(parseRupeesToPaise(49.99)).toBe(4999);
    expect(parseRupeesToPaise(0)).toBe(0);
  });
});

describe('Unit: Pure Order State Machine', () => {
  it('allows shopkeeper to accept placed order', () => {
    const res = validateOrderTransition('placed', 'shop_accepted', 'shopkeeper', 'delivery');
    expect(res.allowed).toBe(true);
    expect(res.noop).toBe(false);
  });

  it('allows shopkeeper to reject placed order', () => {
    const res = validateOrderTransition('placed', 'shop_rejected', 'shopkeeper', 'delivery');
    expect(res.allowed).toBe(true);
  });

  it('allows customer cancellation only before preparation starts', () => {
    // Valid from placed
    const fromPlaced = validateOrderTransition('placed', 'customer_cancel_requested', 'customer', 'delivery');
    expect(fromPlaced.allowed).toBe(true);

    // Valid from shop_accepted
    const fromAccepted = validateOrderTransition('shop_accepted', 'customer_cancel_requested', 'customer', 'delivery');
    expect(fromAccepted.allowed).toBe(true);

    // Forbidden once preparing starts
    const fromPreparing = validateOrderTransition('preparing', 'customer_cancel_requested', 'customer', 'delivery');
    expect(fromPreparing.allowed).toBe(false);
    expect(fromPreparing.reason).toContain('Cancellation is not permitted once the shop has begun preparing');

    // Forbidden when out for delivery
    const fromOut = validateOrderTransition('out_for_delivery', 'customer_cancel_requested', 'customer', 'delivery');
    expect(fromOut.allowed).toBe(false);
  });

  it('pickup order transitions directly from ready_for_pickup to completed', () => {
    const pickupRes = validateOrderTransition('ready_for_pickup', 'completed', 'shopkeeper', 'pickup');
    expect(pickupRes.allowed).toBe(true);

    // Delivery order cannot skip to completed directly
    const deliveryRes = validateOrderTransition('ready_for_pickup', 'completed', 'shopkeeper', 'delivery');
    expect(deliveryRes.allowed).toBe(false);
  });

  it('delivery order follows strict sequence: ready_for_pickup -> delivery_assigned -> picked_up -> out_for_delivery -> delivered -> completed', () => {
    expect(validateOrderTransition('ready_for_pickup', 'delivery_assigned', 'admin', 'delivery').allowed).toBe(true);
    expect(validateOrderTransition('delivery_assigned', 'picked_up', 'delivery_partner', 'delivery').allowed).toBe(true);
    expect(validateOrderTransition('picked_up', 'out_for_delivery', 'delivery_partner', 'delivery').allowed).toBe(true);
    expect(validateOrderTransition('out_for_delivery', 'delivered', 'delivery_partner', 'delivery').allowed).toBe(true);
    expect(validateOrderTransition('delivered', 'completed', 'admin', 'delivery').allowed).toBe(true);
  });

  it('handles idempotency gracefully (same state is a no-op)', () => {
    const res = validateOrderTransition('preparing', 'preparing', 'shopkeeper', 'delivery');
    expect(res.allowed).toBe(true);
    expect(res.noop).toBe(true);
  });

  it('lists available next transitions for an actor', () => {
    const shopkeeperNext = getAvailableTransitions('placed', 'shopkeeper', 'delivery');
    expect(shopkeeperNext).toContain('shop_accepted');
    expect(shopkeeperNext).toContain('shop_rejected');

    const customerNext = getAvailableTransitions('placed', 'customer', 'delivery');
    expect(customerNext).toContain('customer_cancel_requested');
  });
});

describe('Unit: Service Area & Location Constraints', () => {
  it('verifies default pilot service area values for Karanjaghadge', () => {
    expect(DEFAULT_SERVICE_AREA.name).toBe('Karanjaghadge Town & Surroundings');
    expect(DEFAULT_SERVICE_AREA.latitude).toBeCloseTo(21.1714, 2);
    expect(DEFAULT_SERVICE_AREA.longitude).toBeCloseTo(78.5484, 2);
    expect(DEFAULT_SERVICE_AREA.radiusKm).toBe(7.0);
  });
});
