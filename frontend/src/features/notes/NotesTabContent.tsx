import React from 'react';
import { BookOpen, CheckCircle2, Lightbulb, Quote } from 'lucide-react';
import type { StructuredNotes } from '../../types/echonote';
import { Card } from '../../components/ui/Card';

export function NotesTabContent({ notes }: { notes: StructuredNotes }) {
  return (
    <div className="space-y-6">
      {/* Executive summary */}
      <Card highlighted padding="lg">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">
          <BookOpen className="w-4 h-4" />
          Lecture Summary
        </div>
        <p className="text-base leading-7 text-slate-700">{notes.summary}</p>
      </Card>

      {/* Key Points */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          Key Exam Points
        </h3>
        <ul className="space-y-3">
          {notes.keyPoints.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm leading-6 text-slate-700"
            >
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                {idx + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Definitions */}
      {notes.definitions.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Key Definitions &amp; Terms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.definitions.map((def, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                <p className="text-sm font-bold text-indigo-700">{def.term}</p>
                <p className="text-sm leading-6 text-slate-600 mt-2">{def.meaning}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Examples */}
      {notes.examples.length > 0 && (
        <Card padding="lg" className="bg-amber-50/40 border-amber-200/80">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            Worked Examples &amp; Classroom Illustrations
          </h3>
          <div className="space-y-3">
            {notes.examples.map((ex, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-amber-100 text-sm leading-6 text-slate-700"
              >
                <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                <span>{ex}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
