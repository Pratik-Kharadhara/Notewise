/**
 * normalizeNotes.ts
 *
 * Coerces backend snake_case note fields into the camelCase shape the UI
 * components expect, while keeping existing camelCase data intact.
 *
 * Backend returns: key_points, quick_revision_sheet, definitions[].definition
 * Frontend uses:  keyPoints,  revisionSheet,          definitions[].meaning
 */

import type { StructuredNotes, DefinitionItem } from '../types/echonote';

export function normalizeNotes(raw: StructuredNotes): Required<
  Pick<StructuredNotes, 'title' | 'summary' | 'keyPoints' | 'definitions' | 'examples' | 'revisionSheet'>
> & StructuredNotes {
  return {
    ...raw,
    // Prefer camelCase; fall back to snake_case
    keyPoints: raw.keyPoints ?? raw.key_points ?? [],
    revisionSheet: raw.revisionSheet ?? raw.quick_revision_sheet ?? [],
    // Normalize each definition so both `.meaning` and `.definition` work
    definitions: (raw.definitions ?? []).map((d: DefinitionItem) => ({
      ...d,
      meaning: d.meaning ?? d.definition ?? '',
    })),
  };
}
