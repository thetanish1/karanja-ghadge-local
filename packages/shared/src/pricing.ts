export interface PricingInputItem {
  pricePaise: number;
  qty: number;
}

export interface PricingBreakdown {
  itemsTotalPaise: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  totalPaise: number;
}

/**
 * Calculates order totals strictly in integer paise.
 * All fee values must be non-negative integers.
 */
export function calculateOrderTotals(
  items: PricingInputItem[],
  deliveryFeePaise: number = 0,
  platformFeePaise: number = 0
): PricingBreakdown {
  const safeDeliveryFee = Math.max(0, Math.floor(deliveryFeePaise));
  const safePlatformFee = Math.max(0, Math.floor(platformFeePaise));

  const itemsTotalPaise = items.reduce((sum, item) => {
    const qty = Math.max(0, Math.floor(item.qty));
    const price = Math.max(0, Math.floor(item.pricePaise));
    return sum + qty * price;
  }, 0);

  const totalPaise = itemsTotalPaise + safeDeliveryFee + safePlatformFee;

  return {
    itemsTotalPaise,
    deliveryFeePaise: safeDeliveryFee,
    platformFeePaise: safePlatformFee,
    totalPaise,
  };
}

/**
 * Formats integer paise into standard Indian Rupee representation (e.g. ₹150 or ₹150.50).
 */
export function formatPaiseToRupees(paise: number): string {
  const safePaise = Math.round(paise || 0);
  const rupees = safePaise / 100;
  if (safePaise % 100 === 0) {
    return `₹${rupees.toFixed(0)}`;
  }
  return `₹${rupees.toFixed(2)}`;
}

/**
 * Parses user input rupees into integer paise without floating point issues.
 */
export function parseRupeesToPaise(rupees: number | string): number {
  if (typeof rupees === 'string') {
    const cleanStr = rupees.replace(/[^\d.]/g, '');
    const num = parseFloat(cleanStr);
    if (isNaN(num)) return 0;
    return Math.round(num * 100);
  }
  if (typeof rupees === 'number' && !isNaN(rupees)) {
    return Math.round(rupees * 100);
  }
  return 0;
}
