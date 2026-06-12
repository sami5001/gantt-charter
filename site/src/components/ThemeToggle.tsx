import { useEffect, useState } from 'react';
import { CircleHalfIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';

type Pref = 'auto' | 'light' | 'dark';
const KEY = 'gc-theme';
const ORDER: Pref[] = ['auto', 'light', 'dark'];

function readPref(): Pref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

function apply(pref: Pref) {
  const dark =
    pref === 'dark' || (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

/** Cycles auto, light, dark. The icon shows the current preference. */
export default function ThemeToggle() {
  const [pref, setPref] = useState<Pref>('auto');

  useEffect(() => {
    setPref(readPref());
  }, []);

  useEffect(() => {
    apply(pref);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply(pref);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
  const cycle = () => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // private browsing: theme still applies for this page view
    }
    setPref(next);
  };

  const Icon = pref === 'auto' ? CircleHalfIcon : pref === 'light' ? SunIcon : MoonIcon;
  const label = pref === 'auto' ? 'Theme: auto (follows your system)' : `Theme: ${pref}`;

  return (
    <button
      type="button"
      onClick={cycle}
      title={`${label}. Click for ${next}.`}
      aria-label={`${label}. Switch to ${next}.`}
      className="pressable rounded-md p-1.5 text-ink-500 transition-colors duration-150 hover:text-ink-950"
    >
      <Icon size={18} weight="regular" />
    </button>
  );
}
