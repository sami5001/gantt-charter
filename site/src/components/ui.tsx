import type { ReactNode } from 'react';

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="section-label">{children}</h2>;
}

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost';
  busy?: boolean;
  disabled?: boolean;
  title?: string;
  className?: string;
}

export function Btn({ children, onClick, variant = 'secondary', busy, disabled, title, className = '' }: BtnProps) {
  const base =
    'pressable inline-flex items-center justify-center gap-1.5 rounded-md text-[13px] font-medium px-3 py-1.5 ' +
    'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
    'disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-ink-950 text-on-ink hover:bg-ink-900',
    accent: 'bg-accent text-white hover:bg-accent-deep',
    secondary: 'bg-raised text-ink-950 border border-line hover:border-ink-300',
    ghost: 'text-ink-700 hover:text-ink-950 hover:bg-line-soft',
  };
  return (
    <button
      type="button"
      title={title}
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || busy}
    >
      {busy && (
        <span
          aria-hidden
          className="size-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}

export function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-md border border-line bg-raised p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`pressable flex-1 rounded-[5px] px-2 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
              active ? 'bg-ink-950 text-on-ink' : 'text-ink-500 hover:text-ink-950'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[11px] font-medium text-ink-500">{label}</span>
      {children}
    </label>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}

export function Toggle({ checked, onChange, label, hint }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group -mx-2 flex w-[calc(100%+16px)] cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-[7px] text-left transition-colors duration-150 hover:bg-line-soft focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-[13px] leading-tight text-ink-950">{label}</span>
        {hint && <span className="mt-0.5 text-[11px] leading-snug text-ink-400">{hint}</span>}
      </span>
      <span
        aria-hidden
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ease-out ${
          checked ? 'bg-ink-950' : 'bg-ink-300 group-hover:bg-ink-400'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-raised shadow-[0_1px_2px_oklch(0.21_0.02_258/0.25)] transition-transform duration-150 ease-out ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </span>
    </button>
  );
}
