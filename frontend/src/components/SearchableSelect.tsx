import { useMemo, useState } from 'react';

type SearchableSelectOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  value: string;
  options: SearchableSelectOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export default function SearchableSelect({ value, options, placeholder, disabled, onChange }: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    if (!searchValue) return options;
    return options.filter((option) => option.label.toLowerCase().includes(searchValue));
  }, [options, search]);

  return (
    <div className="relative">
      <input
        value={isOpen ? search : selectedOption?.label ?? ''}
        onChange={(event) => { setSearch(event.target.value); setIsOpen(true); }}
        onFocus={() => { setSearch(''); setIsOpen(true); }}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 100)}
        disabled={disabled}
        required
        className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400] disabled:cursor-not-allowed disabled:opacity-60"
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
      />
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto border border-slate-200 bg-white shadow-lg" role="listbox">
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onChange(option.value); setSearch(option.label); setIsOpen(false); }}
              className="block w-full px-3 py-2 text-left text-sm text-[#183b70] transition hover:bg-slate-100"
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </button>
          )) : <p className="px-3 py-2 text-sm text-slate-500">No matches found.</p>}
        </div>
      )}
    </div>
  );
}