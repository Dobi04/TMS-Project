import type { ReactNode } from 'react';

type FilterBarProps = {
  children: ReactNode;
  onClear: () => void;
};

export default function FilterBar({ children, onClear }: FilterBarProps) {
  return (
    <div className="mt-6 grid gap-4 border border-slate-200 bg-[#f5f7fa] p-4 sm:grid-cols-2 lg:grid-cols-5">
      {children}
      <button type="button" onClick={onClear} className="justify-self-start border border-[#183b70] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#183b70] transition hover:bg-[#183b70] hover:text-white sm:col-span-2 lg:col-span-5">
        Clear filters
      </button>
    </div>
  );
}
