import { useEffect, useRef, useState } from 'react';
import {
  ButterflyIcon,
  CheckIcon,
  LinkSimpleIcon,
  LinkedinLogoIcon,
  ShareNetworkIcon,
  XLogoIcon,
} from '@phosphor-icons/react';

const SITE_URL = 'https://sami5001.github.io/gantt-charter/';
const SHARE_TEXT = 'Gantt Charter: free print-quality Gantt charts in the browser. CSV import, vector PDF/SVG/PNG export, nothing uploaded.';

const TARGETS = [
  {
    label: 'Share on X',
    icon: XLogoIcon,
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`,
  },
  {
    label: 'Share on LinkedIn',
    icon: LinkedinLogoIcon,
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`,
  },
  {
    label: 'Share on Bluesky',
    icon: ButterflyIcon,
    href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${SHARE_TEXT} ${SITE_URL}`)}`,
  },
];

export default function ShareMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1200);
    } catch {
      window.prompt('Copy this link:', SITE_URL);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: 'Gantt Charter', text: SHARE_TEXT, url: SITE_URL });
      setOpen(false);
    } catch {
      // user dismissed the share sheet
    }
  };

  const itemClass =
    'flex w-full items-center gap-2.5 rounded-[5px] px-2.5 py-1.5 text-[13px] text-ink-950 transition-colors duration-100 hover:bg-line-soft focus-visible:outline-2 focus-visible:outline-accent';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Share this site"
        title="Share this site"
        className={`pressable rounded-md p-1.5 transition-colors duration-150 ${
          open ? 'text-ink-950' : 'text-ink-500 hover:text-ink-950'
        }`}
      >
        <ShareNetworkIcon size={18} weight="regular" />
      </button>
      {open && (
        <div
          role="menu"
          className="menu-pop absolute right-0 top-full z-20 mt-1.5 w-52 rounded-lg border border-line bg-raised p-1 shadow-sheet"
        >
          {canNativeShare && (
            <button type="button" role="menuitem" className={itemClass} onClick={() => void nativeShare()}>
              <ShareNetworkIcon size={15} className="shrink-0 text-ink-500" /> Share via device
            </button>
          )}
          {TARGETS.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              role="menuitem"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <Icon size={15} className="shrink-0 text-ink-500" /> {label}
            </a>
          ))}
          <button type="button" role="menuitem" className={itemClass} onClick={() => void copyLink()}>
            {copied ? (
              <CheckIcon size={15} className="shrink-0 text-accent" />
            ) : (
              <LinkSimpleIcon size={15} className="shrink-0 text-ink-500" />
            )}
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}
