import React from 'react';
import { Button } from './Button';

interface SupportTierCardProps {
  id: number;
  title: string;
  amount: number;
  type: 'monthly' | 'one_time';
  description?: string;
  onSelect: (tierId: number) => void;
}

export const SupportTierCard: React.FC<SupportTierCardProps> = ({
  id,
  title,
  amount,
  type,
  description,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-semibold text-gray-700">
            {type === 'monthly' ? '₹/month' : 'One-time'}
          </span>
        </div>

        <p className="text-3xl font-bold text-red-500 mb-2">₹{amount.toLocaleString()}</p>

        {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}

        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={() => onSelect(id)}
        >
          Support
        </Button>
      </div>
    </div>
  );
};
