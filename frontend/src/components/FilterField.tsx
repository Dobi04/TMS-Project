import type { ReactNode } from 'react';

type FilterFieldProps = {
  label: string;
  children: ReactNode;
};

export default function FilterField({ label, children }: FilterFieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#183b70]">
      {label}
      {children}
    </label>
  );
}
