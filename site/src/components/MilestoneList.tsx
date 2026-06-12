import { PlusIcon, TrashSimpleIcon } from '@phosphor-icons/react';
import type { Milestone } from '../lib/types';
import { uid } from '../lib/types';
import { toISO } from '../lib/dates';
import { Btn, SectionLabel } from './ui';

interface Props {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
}

export function MilestoneList({ milestones, onChange }: Props) {
  const update = (id: string, patch: Partial<Milestone>) =>
    onChange(milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  return (
    <section className="flex flex-col gap-2">
      <SectionLabel>Milestones</SectionLabel>
      <ul className="flex flex-col gap-1.5">
        {milestones.map((m, i) => (
          <li key={m.id} className="group flex items-center gap-1.5">
            <input
              className="field"
              placeholder="Milestone name"
              value={m.name}
              onChange={(e) => update(m.id, { name: e.target.value })}
              aria-label={`Milestone ${i + 1} name`}
            />
            <input
              type="date"
              className="field max-w-[150px]"
              value={m.date}
              onChange={(e) => update(m.id, { date: e.target.value })}
              aria-label="Milestone date"
            />
            <button
              type="button"
              className="pressable shrink-0 rounded p-1 text-ink-400 opacity-0 transition-opacity duration-150 hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
              onClick={() => onChange(milestones.filter((x) => x.id !== m.id))}
              aria-label={`Delete milestone ${m.name || i + 1}`}
            >
              <TrashSimpleIcon size={13} weight="bold" />
            </button>
          </li>
        ))}
      </ul>
      <Btn
        onClick={() => onChange([...milestones, { id: uid(), name: '', date: toISO(Date.now()) }])}
        variant="secondary"
        className="self-start"
      >
        <PlusIcon size={13} weight="bold" /> Add milestone
      </Btn>
    </section>
  );
}
