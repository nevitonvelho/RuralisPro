"use client";

import React from "react";

interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  placeholder?: string;
  value: number;
  onChange: (value: number) => void;
}

export function InputGroup({
  label,
  icon,
  placeholder,
  value,
  onChange,
}: InputGroupProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
        {icon}
        {label}
      </label>

      <input
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl py-3 px-4 outline-none transition-all font-medium"
      />
    </div>
  );
}
