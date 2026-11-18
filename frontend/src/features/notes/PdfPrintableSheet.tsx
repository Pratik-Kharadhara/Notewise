import React from 'react';
import type { Recording } from '../../types/echonote';
import { formatDurationLabel } from '../../utils/audioValidation';

/**
 * Clean, exam-friendly printable container captured by html2canvas + jsPDF.
 * Uses explicit hex colors so html2canvas never encounters unsupported Tailwind v4 oklch() colors.
 */
export const PdfPrintableSheet = React.forwardRef<
  HTMLDivElement,
  { recording: Recording }
>(({ recording }, ref) => {
  const notes = recording.notes;
  if (!notes) return null;

  return (
    <div
      ref={ref}
      style={{
        width: '794px',
        padding: '40px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#4f46e5',
            marginBottom: '6px',
          }}
        >
          Notewise Study Sheet · {recording.subjectLabel}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
          {notes.title}
        </h1>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
          {recording.lecturer} · Duration: {formatDurationLabel(recording.durationSeconds)}
        </p>
      </div>

      {/* Summary */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#4338ca', margin: '0 0 6px 0' }}>
          Lecture Summary
        </h2>
        <p style={{ fontSize: '13px', lineHeight: 1.6, margin: 0, color: '#334155' }}>
          {notes.summary}
        </p>
      </div>

      {/* Key Points */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px 0', color: '#0f172a' }}>
          Key Exam Points
        </h2>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', lineHeight: 1.65, color: '#334155' }}>
          {(notes.keyPoints ?? notes.key_points ?? []).map((pt, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>
              {pt}
            </li>
          ))}
        </ul>
      </div>

      {/* Definitions */}
      {notes.definitions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px 0', color: '#0f172a' }}>
            Key Definitions
          </h2>
          {notes.definitions.map((d, i) => (
            <div
              key={i}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '8px',
              }}
            >
              <strong style={{ fontSize: '13px', color: '#4338ca' }}>{d.term}: </strong>
              <span style={{ fontSize: '13px', color: '#334155' }}>{d.meaning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Examples */}
      {notes.examples.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px 0', color: '#0f172a' }}>
            Worked Examples
          </h2>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', lineHeight: 1.65, color: '#334155' }}>
            {notes.examples.map((ex, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>
                {ex}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Revision Sheet */}
      {(notes.revisionSheet ?? notes.quick_revision_sheet ?? []).length > 0 && (
        <div
          style={{
            backgroundColor: '#eef2ff',
            border: '1px solid #c7d2fe',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#3730a3', margin: '0 0 8px 0' }}>
            Exam Revision Sheet
          </h2>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', lineHeight: 1.65, color: '#1e293b' }}>
            {(notes.revisionSheet ?? notes.quick_revision_sheet ?? []).map((item, i) => (
              <li key={i} style={{ marginBottom: '5px' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

PdfPrintableSheet.displayName = 'PdfPrintableSheet';
