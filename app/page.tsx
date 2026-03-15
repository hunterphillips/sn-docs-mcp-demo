'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { QUESTIONS } from '@/lib/questions';

const C = {
  bg: '#F5F7F9',
  white: '#FFFFFF',
  border: '#DDE5ED',
  borderFaint: '#E8EFF5',
  text: '#111820',
  textSub: '#5E7280',
  textMuted: '#96A8B5',
  accent: '#B8601A',
  sidebar: '#14232C',
  sidebarText: '#B8CDD8',
  sidebarSub: '#6A8799',
  sidebarBorder: 'rgba(255,255,255,0.07)',
  navActive: 'rgba(184,96,26,0.22)',
  navActiveBorder: 'rgba(184,96,26,0.42)',
  navActiveText: '#F5C89A',
  teal: '#059669',
  tealFaint: 'rgba(5,150,105,0.05)',
} as const;

const FONT = 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)';

type Mode = 'base' | 'mcp';
type PanelState = { text: string; loading: boolean; error: string | null };
const EMPTY: PanelState = { text: '', loading: false, error: null };

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [base, setBase] = useState<PanelState>(EMPTY);
  const [mcp, setMcp] = useState<PanelState>(EMPTY);
  const abortRef = useRef<AbortController | null>(null);

  function ask(questionId: string) {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setActiveId(questionId);
    setBase({ text: '', loading: true, error: null });
    setMcp({ text: '', loading: true, error: null });

    streamMode('base', question.prompt, controller.signal, setBase);
    streamMode('mcp', question.prompt, controller.signal, setMcp);
  }

  const isLoading = base.loading || mcp.loading;
  const activeQuestion = QUESTIONS.find((q) => q.id === activeId);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: FONT,
        overflow: 'hidden',
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: '232px',
          flexShrink: 0,
          backgroundColor: C.sidebar,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Branding */}
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: `1px solid ${C.sidebarBorder}`,
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#EEF4F8',
              letterSpacing: '-0.01em',
            }}
          >
            SN Docs MCP
          </div>
          <div
            style={{ fontSize: '11px', color: C.sidebarSub, marginTop: '3px' }}
          >
            Compare AI responses
          </div>
        </div>

        {/* Question list */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          <p
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: C.sidebarSub,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              padding: '0 10px',
              margin: '0 0 8px',
            }}
          >
            Select a topic
          </p>
          {QUESTIONS.map((q) => {
            const active = activeId === q.id;
            return (
              <button
                key={q.id}
                onClick={() => ask(q.id)}
                disabled={isLoading && !active}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 10px',
                  borderRadius: '5px',
                  border: `1px solid ${active ? C.navActiveBorder : 'transparent'}`,
                  backgroundColor: active ? C.navActive : 'transparent',
                  color: active ? C.navActiveText : C.sidebarText,
                  fontSize: '13px',
                  fontWeight: active ? 500 : 400,
                  lineHeight: '1.4',
                  letterSpacing: '-0.01em',
                  cursor: isLoading && !active ? 'not-allowed' : 'pointer',
                  opacity: isLoading && !active ? 0.4 : 1,
                  transition: 'background-color 0.1s ease, color 0.1s ease',
                  fontFamily: FONT,
                  marginBottom: '2px',
                }}
              >
                {q.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          backgroundColor: C.bg,
        }}
      >
        {/* Question bar */}
        <div
          style={{
            backgroundColor: C.white,
            borderBottom: `1px solid ${C.border}`,
            padding: '14px 28px',
            flexShrink: 0,
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: activeQuestion ? '14px' : '13px',
              fontWeight: activeQuestion ? 500 : 400,
              color: activeQuestion ? C.text : C.textMuted,
              letterSpacing: activeQuestion ? '-0.02em' : '0',
              lineHeight: '1.45',
            }}
          >
            {activeQuestion
              ? activeQuestion.prompt
              : 'Select a topic from the sidebar to compare responses'}
          </p>
        </div>

        {/* Panel label row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            flexShrink: 0,
            backgroundColor: C.white,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              padding: '10px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRight: `1px solid ${C.border}`,
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: C.textMuted,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: C.textSub,
                letterSpacing: '0.01em',
              }}
            >
              Claude
            </span>
            {base.loading && (
              <span
                className="animate-pulse"
                style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  color: C.textMuted,
                }}
              >
                thinking…
              </span>
            )}
          </div>
          <div
            style={{
              padding: '10px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: C.tealFaint,
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: C.teal,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: C.textSub,
                letterSpacing: '0.01em',
              }}
            >
              Claude + MCP
            </span>
            {mcp.loading && (
              <span
                className="animate-pulse"
                style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  color: C.textMuted,
                }}
              >
                searching…
              </span>
            )}
          </div>
        </div>

        {/* Response panels */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            minHeight: 0,
          }}
        >
          <Panel mode="base" state={base} empty={!activeId} />
          <Panel mode="mcp" state={mcp} empty={!activeId} />
        </div>
      </div>
    </div>
  );
}

async function streamMode(
  mode: Mode,
  prompt: string,
  signal: AbortSignal,
  setState: (fn: (prev: PanelState) => PanelState) => void,
) {
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, mode }),
      signal,
    });

    if (!res.ok) {
      const msg =
        res.status === 429
          ? 'Rate limit reached. Please wait.'
          : `Error ${res.status}`;
      setState((p) => ({ ...p, loading: false, error: msg }));
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setState((p) => ({
        ...p,
        text: p.text + decoder.decode(value, { stream: true }),
      }));
    }

    setState((p) => ({ ...p, loading: false }));
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    setState((p) => ({
      ...p,
      loading: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }));
  }
}

function Panel({
  mode,
  state,
  empty,
}: {
  mode: Mode;
  state: PanelState;
  empty: boolean;
}) {
  const isMcp = mode === 'mcp';

  return (
    <div
      style={{
        backgroundColor: C.white,
        borderRight: !isMcp ? `1px solid ${C.border}` : 'none',
        overflowY: 'auto',
        padding: '24px 28px 40px',
      }}
    >
      {empty && !state.loading && (
        <p style={{ fontSize: '13px', color: C.textMuted }}>—</p>
      )}

      {state.error && (
        <p style={{ fontSize: '13px', color: '#DC2626' }}>{state.error}</p>
      )}

      {state.text && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1
                style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: C.text,
                  marginTop: 0,
                  marginBottom: '14px',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.3',
                }}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: C.text,
                  marginTop: '22px',
                  marginBottom: '8px',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.35',
                }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: C.textSub,
                  marginTop: '18px',
                  marginBottom: '6px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.72',
                  color: C.text,
                  marginBottom: '12px',
                }}
              >
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul
                style={{
                  paddingLeft: '18px',
                  marginBottom: '12px',
                  listStyleType: 'disc',
                }}
              >
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol style={{ paddingLeft: '18px', marginBottom: '12px' }}>
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li
                style={{
                  fontSize: '14px',
                  lineHeight: '1.65',
                  color: C.text,
                  marginBottom: '5px',
                }}
              >
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong style={{ fontWeight: 600, color: C.text }}>
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em style={{ color: C.textSub }}>{children}</em>
            ),
            code: ({ children }) => (
              <code
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono, monospace)',
                  backgroundColor: '#EEF3F8',
                  color: C.text,
                  padding: '1px 5px',
                  borderRadius: '3px',
                }}
              >
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono, monospace)',
                  backgroundColor: '#F4F8FB',
                  border: `1px solid ${C.border}`,
                  borderRadius: '6px',
                  padding: '14px 16px',
                  marginBottom: '14px',
                  overflowX: 'auto',
                  lineHeight: '1.6',
                }}
              >
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote
                style={{
                  borderLeft: `3px solid ${C.border}`,
                  paddingLeft: '14px',
                  marginBottom: '12px',
                  color: C.textSub,
                  fontStyle: 'italic',
                }}
              >
                {children}
              </blockquote>
            ),
          }}
        >
          {state.text}
        </ReactMarkdown>
      )}

      {state.loading && !state.text && (
        <span
          className="animate-pulse"
          style={{
            display: 'inline-block',
            width: '8px',
            height: '16px',
            backgroundColor: C.textMuted,
            borderRadius: '1px',
          }}
        />
      )}
      {state.loading && state.text && (
        <span
          className="animate-pulse"
          style={{
            display: 'inline-block',
            width: '2px',
            height: '15px',
            backgroundColor: isMcp ? C.teal : C.textMuted,
            borderRadius: '1px',
            verticalAlign: 'middle',
            marginLeft: '2px',
          }}
        />
      )}
    </div>
  );
}
