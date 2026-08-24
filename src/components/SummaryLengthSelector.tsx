'use client';

import React from 'react';
import { SummaryLength } from '@/types';

interface SummaryLengthSelectorProps {
  selected: SummaryLength;
  onChange: (value: SummaryLength) => void;
}

export default function SummaryLengthSelector({ selected, onChange }: SummaryLengthSelectorProps) {
  const options: { value: SummaryLength; label: string }[] = [
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'long', label: 'Long' }
  ];

  const getPillOffset = () => {
    switch (selected) {
      case 'short':
        return 'translate3d(0%, 0, 0)';
      case 'medium':
        return 'translate3d(100%, 0, 0)';
      case 'long':
        return 'translate3d(200%, 0, 0)';
    }
  };

  return (
    <div className="w-full">
      <div className="relative flex rounded-xl bg-neutral-100 p-[3px] border border-neutral-200/80 overflow-hidden select-none">
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            transform: getPillOffset(),
          }}
          className="absolute top-[3px] bottom-[3px] left-[3px] w-[calc(33.33%-4px)] rounded-lg transition-transform duration-300 ease-out shadow-xs"
        />

        {options.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`relative z-10 flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 outline-none cursor-pointer
                ${isActive 
                  ? 'text-neutral-900' 
                  : 'text-neutral-500 hover:text-neutral-900'
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      
      <div className="mt-3.5 text-center min-h-[36px] flex items-center justify-center">
        <p className="text-[11px] font-semibold text-neutral-500 leading-relaxed max-w-xs transition-all duration-300">
          {selected === 'short' && (
            <span>Generates a highly concise, 2-3 sentence overview highlighting the absolute core takeaways.</span>
          )}
          {selected === 'medium' && (
            <span>Generates a balanced 2-3 paragraph summary detailing main context and conclusions.</span>
          )}
          {selected === 'long' && (
            <span>Generates an extensive summary covering secondary arguments and structure.</span>
          )}
        </p>
      </div>
    </div>
  );
}
