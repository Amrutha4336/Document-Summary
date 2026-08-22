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
      <div className="relative flex rounded-xl bg-white/30 p-[3px] border-2 border-[#111814] overflow-hidden select-none">
        <div
          style={{
            background: 'linear-gradient(135deg, #F9F586 0%, #A1FFCE 100%)',
            border: '1.5px solid #111814',
            transform: getPillOffset(),
          }}
          className="absolute top-[2px] bottom-[2px] left-[2px] w-[calc(33.33%-2.5px)] rounded-lg transition-transform duration-300 ease-out shadow-sm"
        />

        {options.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`relative z-10 flex-1 py-2.5 text-center text-xs font-black uppercase tracking-widest transition-all duration-300 outline-none
                ${isActive 
                  ? 'text-[#111814]' 
                  : 'text-[#111814]/65 hover:text-[#111814]'
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      
      <div className="mt-3.5 text-center min-h-[36px] flex items-center justify-center">
        <p className="text-[11px] font-bold text-[#111814]/85 leading-relaxed max-w-xs transition-all duration-300">
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
