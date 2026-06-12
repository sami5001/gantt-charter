import { CaretDownIcon, CaretUpIcon, PlusIcon, TrashSimpleIcon, XIcon } from '@phosphor-icons/react';
import type { Milestone, Task } from '../lib/types';
import { uid } from '../lib/types';
import { parseISO, toISO, addDays } from '../lib/dates';
import { Btn, SectionLabel } from './ui';

interface Props {
  tasks: Task[];
  milestones?: Milestone[];
  onChange: (tasks: Task[]) => void;
}

export function TaskList({ tasks, milestones = [], onChange }: Props) {
  const update = (id: string, patch: Partial<Task>) =>
    onChange(tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const remove = (id: string) =>
    onChange(
      tasks
        .filter((t) => t.id !== id)
        .map((t) =>
          t.dependsOn?.includes(id)
            ? { ...t, dependsOn: t.dependsOn.filter((d) => d !== id) }
            : t
        )
    );

  const move = (index: number, dir: -1 | 1) => {
    const next = [...tasks];
    const [item] = next.splice(index, 1);
    next.splice(index + dir, 0, item);
    onChange(next);
  };

  const add = () => {
    const last = tasks[tasks.length - 1];
    const lastFinish = last ? parseISO(last.finish) : null;
    const start = lastFinish ? toISO(addDays(lastFinish, 1)) : toISO(Date.now());
    onChange([
      ...tasks,
      {
        id: uid(),
        name: '',
        start,
        finish: toISO(addDays(parseISO(start)!, 13)),
        resource: last?.resource,
        phase: last?.phase,
      },
    ]);
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <SectionLabel>Tasks</SectionLabel>
        <span className="font-mono text-[11px] text-ink-400">{tasks.length}</span>
      </div>

      <ul className="flex flex-col">
        {tasks.map((task, i) => {
          const t0 = parseISO(task.start);
          const t1 = parseISO(task.finish);
          const orderError = t0 !== null && t1 !== null && t1 < t0;
          return (
            <li key={task.id} className="group border-t border-line-soft py-2.5 first:border-t-0">
              <div className="flex items-center gap-1">
                <input
                  className="field"
                  placeholder="Task name"
                  value={task.name}
                  onChange={(e) => update(task.id, { name: e.target.value })}
                  aria-label={`Task ${i + 1} name`}
                />
                <div className="flex shrink-0 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100">
                  <button
                    type="button"
                    className="pressable rounded p-1 text-ink-400 hover:text-ink-950 disabled:invisible"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move task up"
                  >
                    <CaretUpIcon size={13} weight="bold" />
                  </button>
                  <button
                    type="button"
                    className="pressable rounded p-1 text-ink-400 hover:text-ink-950 disabled:invisible"
                    onClick={() => move(i, 1)}
                    disabled={i === tasks.length - 1}
                    aria-label="Move task down"
                  >
                    <CaretDownIcon size={13} weight="bold" />
                  </button>
                  <button
                    type="button"
                    className="pressable rounded p-1 text-ink-400 hover:text-accent"
                    onClick={() => remove(task.id)}
                    aria-label={`Delete task ${task.name || i + 1}`}
                  >
                    <TrashSimpleIcon size={13} weight="bold" />
                  </button>
                </div>
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  className={`field ${orderError ? 'field-invalid' : ''}`}
                  value={task.start}
                  onChange={(e) => update(task.id, { start: e.target.value })}
                  aria-label="Start date"
                />
                <input
                  type="date"
                  className={`field ${orderError ? 'field-invalid' : ''}`}
                  value={task.finish}
                  onChange={(e) => update(task.id, { finish: e.target.value })}
                  aria-label="Finish date"
                />
                <input
                  className="field"
                  placeholder="Resource"
                  value={task.resource ?? ''}
                  onChange={(e) => update(task.id, { resource: e.target.value || undefined })}
                  aria-label="Resource"
                />
                <input
                  className="field"
                  placeholder="Phase"
                  value={task.phase ?? ''}
                  onChange={(e) => update(task.id, { phase: e.target.value || undefined })}
                  aria-label="Phase"
                />
              </div>
              {orderError && (
                <p className="mt-1 text-[11px] text-accent-deep">Finish date is before the start date.</p>
              )}
              {tasks.length + milestones.length > 1 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  {(task.dependsOn ?? []).map((depId) => {
                    const depTask = tasks.find((t) => t.id === depId);
                    const depMilestone = depTask ? undefined : milestones.find((m) => m.id === depId);
                    const dep = depTask ?? depMilestone;
                    if (!dep) return null;
                    return (
                      <span
                        key={depId}
                        className="inline-flex max-w-[180px] items-center gap-1 rounded-full border border-line bg-raised py-0.5 pr-1 pl-2 text-[11px] text-ink-700"
                      >
                        <span className="truncate">{depMilestone ? '◆ ' : ''}{dep.name || 'Untitled task'}</span>
                        <button
                          type="button"
                          className="pressable rounded-full p-0.5 text-ink-400 hover:text-accent"
                          aria-label={`Remove dependency on ${dep.name}`}
                          onClick={() =>
                            update(task.id, {
                              dependsOn: task.dependsOn?.filter((d) => d !== depId),
                            })
                          }
                        >
                          <XIcon size={9} weight="bold" />
                        </button>
                      </span>
                    );
                  })}
                  <select
                    className="cursor-pointer rounded-full border border-transparent bg-transparent py-0.5 pl-1 text-[11px] text-ink-400 transition-colors duration-150 hover:text-ink-950 focus-visible:outline-2 focus-visible:outline-accent"
                    value=""
                    aria-label={`Add dependency for ${task.name || `task ${i + 1}`}`}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      update(task.id, { dependsOn: [...(task.dependsOn ?? []), e.target.value] });
                    }}
                  >
                    <option value="">+ depends on</option>
                    {tasks
                      .filter((t) => t.id !== task.id && !(task.dependsOn ?? []).includes(t.id))
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name || 'Untitled task'}
                        </option>
                      ))}
                    {milestones
                      .filter((m) => !(task.dependsOn ?? []).includes(m.id))
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          ◆ {m.name || 'Untitled milestone'}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Btn onClick={add} variant="secondary" className="self-start">
        <PlusIcon size={13} weight="bold" /> Add task
      </Btn>
    </section>
  );
}
