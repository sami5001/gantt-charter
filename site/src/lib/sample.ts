import type { ProjectState, Task } from './types';
import { DEFAULT_CONFIG, uid } from './types';

/** A research-project sample showing phases, resources, milestones and dependencies. */
export function sampleProject(): ProjectState {
  const t = (name: string, start: string, finish: string, resource: string, phase: string): Task => ({
    id: uid(), name, start, finish, resource, phase,
  });

  const protocol = t('Protocol and study design', '2026-01-05', '2026-02-06', 'Lead researcher', 'Preparation');
  const ethics = t('Ethics application', '2026-01-19', '2026-02-27', 'Lead researcher', 'Preparation');
  const review = t('Systematic literature review', '2026-02-02', '2026-04-03', 'Research assistant', 'Preparation');
  const recruitment = t('Recruitment of participants', '2026-03-09', '2026-05-01', 'Research assistant', 'Fieldwork');
  const waveOne = t('Data collection, wave one', '2026-04-06', '2026-06-26', 'Field team', 'Fieldwork');
  const waveTwo = t('Data collection, wave two', '2026-07-13', '2026-09-25', 'Field team', 'Fieldwork');
  const cleaning = t('Data cleaning and validation', '2026-08-03', '2026-10-16', 'Data analyst', 'Analysis');
  const analysis = t('Statistical analysis', '2026-10-19', '2026-12-11', 'Data analyst', 'Analysis');
  const draft = t('Draft manuscript', '2026-11-30', '2027-01-29', 'Lead researcher', 'Writing');
  const revisions = t('Internal review and revisions', '2027-02-01', '2027-02-26', 'Lead researcher', 'Writing');
  const submission = t('Journal submission package', '2027-03-01', '2027-03-12', 'Lead researcher', 'Writing');

  recruitment.dependsOn = [ethics.id];
  analysis.dependsOn = [cleaning.id];
  draft.dependsOn = [analysis.id];
  submission.dependsOn = [revisions.id];

  return {
    tasks: [
      protocol, ethics, review, recruitment, waveOne, waveTwo,
      cleaning, analysis, draft, revisions, submission,
    ],
    milestones: [
      { id: uid(), name: 'Ethics approval', date: '2026-02-27' },
      { id: uid(), name: 'Fieldwork complete', date: '2026-09-25' },
      { id: uid(), name: 'Submission', date: '2027-03-12' },
    ],
    config: {
      ...DEFAULT_CONFIG,
      title: 'Cohort Study Timeline',
      subtitle: '',
    },
  };
}
