import React from 'react';
import { Layers } from 'lucide-react';
import type { Cheatsheet } from '../../types/echonote';
import { Card } from '../../components/ui/Card';

export function CheatsheetTab({ cheatsheet }: { cheatsheet: Cheatsheet }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {cheatsheet.sections.map((section, idx) => (
        <Card key={idx} padding="lg" className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{section.heading}</h3>
          </div>
          <ul className="space-y-2.5 text-sm leading-6 text-slate-700">
            {section.bullets.map((bullet, bIdx) => (
              <li key={bIdx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
