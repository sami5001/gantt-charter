import { GithubLogoIcon } from '@phosphor-icons/react';
import ShareMenu from './ShareMenu';
import ThemeToggle from './ThemeToggle';

export const REPO_URL = 'https://github.com/sami5001/gantt-charter';

/** Share, GitHub and theme controls shared by the app and the static pages. */
export default function HeaderActions() {
  return (
    <div className="flex items-center gap-0.5">
      <ShareMenu />
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="pressable rounded-md p-1.5 text-ink-500 transition-colors duration-150 hover:text-ink-950"
        aria-label="View source on GitHub"
        title="View source on GitHub"
      >
        <GithubLogoIcon size={18} weight="regular" />
      </a>
      <ThemeToggle />
    </div>
  );
}
