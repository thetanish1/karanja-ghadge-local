import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shop_accepted':
      case 'preparing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ready_for_pickup':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivery_assigned':
      case 'picked_up':
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
      case 'completed':
      case 'approved':
      case 'in_stock':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shop_rejected':
      case 'cancelled':
      case 'delivery_failed':
      case 'suspended':
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'customer_cancel_requested':
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getLabel = () => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
      {getLabel()}
    </span>
  );
};
