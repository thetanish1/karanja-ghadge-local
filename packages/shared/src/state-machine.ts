import { OrderStatus, UserRole, FulfilmentType } from './types.js';

export interface TransitionRule {
  from: OrderStatus;
  to: OrderStatus;
  allowedRoles: Array<UserRole | 'system'>;
  fulfilmentTypes?: FulfilmentType[];
  description: string;
}

export const ORDER_TRANSITIONS: TransitionRule[] = [
  // Placed -> shop accepts / rejects / cancel request
  {
    from: 'placed',
    to: 'shop_accepted',
    allowedRoles: ['shopkeeper', 'admin'],
    description: 'Shopkeeper confirms order and stock',
  },
  {
    from: 'placed',
    to: 'shop_rejected',
    allowedRoles: ['shopkeeper', 'admin'],
    description: 'Shopkeeper rejects order with reason',
  },
  {
    from: 'placed',
    to: 'customer_cancel_requested',
    allowedRoles: ['customer', 'admin'],
    description: 'Customer requests cancellation before shop begins preparation',
  },

  // Shop accepted -> preparing / cancel request
  {
    from: 'shop_accepted',
    to: 'preparing',
    allowedRoles: ['shopkeeper', 'admin'],
    description: 'Shop begins preparing order items',
  },
  {
    from: 'shop_accepted',
    to: 'customer_cancel_requested',
    allowedRoles: ['customer', 'admin'],
    description: 'Customer requests cancellation before preparation starts',
  },

  // Customer cancel requested -> cancelled
  {
    from: 'customer_cancel_requested',
    to: 'cancelled',
    allowedRoles: ['shopkeeper', 'admin', 'system'],
    description: 'Order confirmed cancelled',
  },

  // Preparing -> ready_for_pickup (Note: cancellation is forbidden once preparing starts)
  {
    from: 'preparing',
    to: 'ready_for_pickup',
    allowedRoles: ['shopkeeper', 'admin'],
    description: 'Order packed and ready at shop counter',
  },

  // Ready for pickup -> completed (FOR PICKUP ORDERS ONLY)
  {
    from: 'ready_for_pickup',
    to: 'completed',
    allowedRoles: ['shopkeeper', 'admin'],
    fulfilmentTypes: ['pickup'],
    description: 'Customer picked up order at shop counter',
  },

  // Ready for pickup -> delivery_assigned (FOR DELIVERY ORDERS)
  {
    from: 'ready_for_pickup',
    to: 'delivery_assigned',
    allowedRoles: ['admin', 'shopkeeper'],
    fulfilmentTypes: ['delivery'],
    description: 'Manual delivery handler assigned to order',
  },

  // Delivery assigned -> picked up
  {
    from: 'delivery_assigned',
    to: 'picked_up',
    allowedRoles: ['delivery_partner', 'admin'],
    fulfilmentTypes: ['delivery'],
    description: 'Delivery handler collected order from shop',
  },

  // Picked up -> out for delivery
  {
    from: 'picked_up',
    to: 'out_for_delivery',
    allowedRoles: ['delivery_partner', 'admin'],
    fulfilmentTypes: ['delivery'],
    description: 'Delivery handler is en route to customer',
  },

  // Out for delivery -> delivered / delivery failed
  {
    from: 'out_for_delivery',
    to: 'delivered',
    allowedRoles: ['delivery_partner', 'admin'],
    fulfilmentTypes: ['delivery'],
    description: 'Order delivered to customer destination',
  },
  {
    from: 'out_for_delivery',
    to: 'delivery_failed',
    allowedRoles: ['delivery_partner', 'admin'],
    fulfilmentTypes: ['delivery'],
    description: 'Delivery could not be completed (e.g. customer unreachable)',
  },

  // Delivered -> completed
  {
    from: 'delivered',
    to: 'completed',
    allowedRoles: ['admin', 'system', 'customer'],
    fulfilmentTypes: ['delivery'],
    description: 'Order fulfilled and settled',
  },

  // Admin override safety transitions
  {
    from: 'delivery_failed',
    to: 'delivery_assigned',
    allowedRoles: ['admin'],
    fulfilmentTypes: ['delivery'],
    description: 'Admin re-assigns delivery partner after failed attempt',
  },
  {
    from: 'delivery_failed',
    to: 'cancelled',
    allowedRoles: ['admin'],
    description: 'Admin cancels undeliverable order',
  },
];

export interface TransitionCheckResult {
  allowed: boolean;
  noop: boolean;
  reason?: string;
}

/**
 * Pure transition engine: enforces valid order transitions based on current state,
 * target state, actor role, and fulfilment type.
 */
export function validateOrderTransition(
  currentState: OrderStatus,
  targetState: OrderStatus,
  actorRole: UserRole | 'system',
  fulfilmentType: FulfilmentType
): TransitionCheckResult {
  // Idempotency: same state transition is an ignored no-op
  if (currentState === targetState) {
    return { allowed: true, noop: true };
  }

  // Strict rule: Customer cannot cancel after preparation has started
  if (
    targetState === 'customer_cancel_requested' &&
    ['preparing', 'ready_for_pickup', 'delivery_assigned', 'picked_up', 'out_for_delivery', 'delivered', 'completed'].includes(currentState)
  ) {
    return {
      allowed: false,
      noop: false,
      reason: 'Cancellation is not permitted once the shop has begun preparing the order.',
    };
  }

  // Find matching rule
  const matchedRule = ORDER_TRANSITIONS.find(
    (rule) =>
      rule.from === currentState &&
      rule.to === targetState &&
      rule.allowedRoles.includes(actorRole) &&
      (!rule.fulfilmentTypes || rule.fulfilmentTypes.includes(fulfilmentType))
  );

  if (!matchedRule) {
    return {
      allowed: false,
      noop: false,
      reason: `Invalid transition from "${currentState}" to "${targetState}" for role "${actorRole}" with fulfilment "${fulfilmentType}".`,
    };
  }

  return { allowed: true, noop: false };
}

/**
 * Get list of valid next target states for an actor and current order.
 */
export function getAvailableTransitions(
  currentState: OrderStatus,
  actorRole: UserRole | 'system',
  fulfilmentType: FulfilmentType
): OrderStatus[] {
  return ORDER_TRANSITIONS.filter(
    (rule) =>
      rule.from === currentState &&
      rule.allowedRoles.includes(actorRole) &&
      (!rule.fulfilmentTypes || rule.fulfilmentTypes.includes(fulfilmentType))
  ).map((rule) => rule.to);
}
