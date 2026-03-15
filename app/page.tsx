'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { QUESTIONS } from '@/lib/questions';

const C = {
  bg: '#F0F5F8',
  white: '#FFFFFF',
  border: '#DDE5ED',
  text: '#111820',
  textSub: '#5E7280',
  textMuted: '#96A8B5',
  accent: '#B8601A',
  // sidebar
  sidebar: '#14232C',
  sidebarBorder: 'rgba(255,255,255,0.07)',
  sidebarSub: 'rgba(255,255,255,0.3)',
  navText: 'rgba(255,255,255,0.55)',
  navDot: 'rgba(255,255,255,0.2)',
  navActiveBg: 'rgba(184,96,26,0.22)',
  navActiveText: '#F5C89A',
  navActiveDot: '#B8601A',
  // badges
  baseBadgeBg: '#F1F5F9',
  baseBadgeText: '#64748B',
  mcpBadgeBg: '#ECFDF5',
  mcpBadgeText: '#059669',
} as const;

const FONT = 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)';

type Mode = 'base' | 'mcp';
type PanelState = { text: string; loading: boolean; error: string | null };
const EMPTY: PanelState = { text: '', loading: false, error: null };

function useMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const update = () => setMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakpoint]);
  return mobile;
}

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [base, setBase] = useState<PanelState>(EMPTY);
  const [mcp, setMcp] = useState<PanelState>(EMPTY);
  const isMobile = useMobile();
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

  // ── Shared topic button renderer ──────────────────────────
  function TopicButton({ q }: { q: (typeof QUESTIONS)[number] }) {
    const active = activeId === q.id;
    return (
      <button
        key={q.id}
        onClick={() => ask(q.id)}
        disabled={isLoading && !active}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: isMobile ? '8px 14px' : '8px 10px',
          borderRadius: '6px',
          border: isMobile
            ? `1px solid ${active ? 'rgba(184,96,26,0.4)' : 'rgba(255,255,255,0.12)'}`
            : 'none',
          backgroundColor: active ? C.navActiveBg : 'transparent',
          color: active ? C.navActiveText : C.navText,
          fontSize: isMobile ? '13px' : '12.5px',
          fontWeight: active ? 500 : 400,
          lineHeight: '1.4',
          whiteSpace: 'nowrap',
          cursor: isLoading && !active ? 'not-allowed' : 'pointer',
          opacity: isLoading && !active ? 0.4 : 1,
          transition: 'background-color 0.1s ease, color 0.1s ease',
          fontFamily: FONT,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: active ? C.navActiveDot : C.navDot,
            flexShrink: 0,
            transition: 'background-color 0.1s ease',
          }}
        />
        {q.label}
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100vh',
        fontFamily: FONT,
        overflow: 'hidden',
      }}
    >
      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <aside
          style={{
            width: '220px',
            flexShrink: 0,
            backgroundColor: C.sidebar,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${C.sidebarBorder}` }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#EEF4F8', letterSpacing: '-0.01em' }}>
              SN MCP Demo
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
              Compare AI responses
            </div>
          </div>
          <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: C.sidebarSub, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', margin: '0 0 6px' }}>
              Topics
            </p>
            {QUESTIONS.map((q) => (
              <TopicButton key={q.id} q={q} />
            ))}
          </nav>
        </aside>
      )}

      {/* ── Mobile header ── */}
      {isMobile && (
        <div style={{ backgroundColor: C.sidebar, flexShrink: 0 }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${C.sidebarBorder}` }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#EEF4F8', letterSpacing: '-0.01em' }}>
              SN MCP Demo
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginLeft: '10px' }}>
              Compare AI responses
            </span>
          </div>
          <div style={{ overflowX: 'auto', padding: '10px 12px', display: 'flex', gap: '6px' }}>
            {QUESTIONS.map((q) => (
              <TopicButton key={q.id} q={q} />
            ))}
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          backgroundColor: C.bg,
          overflowY: 'auto',
          padding: isMobile ? '16px' : '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '16px' : '20px',
        }}
      >
        {!activeId && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <p style={{ fontSize: '14px', color: C.textMuted }}>
              {isMobile ? 'Select a topic above' : 'Select a topic from the sidebar'}
            </p>
          </div>
        )}

        {activeQuestion && (
          <div style={{ backgroundColor: C.white, borderRadius: '8px', border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '16px 20px', flexShrink: 0 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.accent, marginBottom: '6px' }}>
              Selected Topic
            </div>
            <p style={{ margin: 0, fontSize: isMobile ? '15px' : '16px', fontWeight: 500, color: C.text, letterSpacing: '-0.02em', lineHeight: '1.4' }}>
              {activeQuestion.prompt}
            </p>
          </div>
        )}

        {activeId && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '16px' : '20px',
              alignItems: 'start',
            }}
          >
            <ResponseCard mode="base" state={base} />
            <ResponseCard mode="mcp" state={mcp} />
          </div>
        )}
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

function ResponseCard({ mode, state }: { mode: Mode; state: PanelState }) {
  const isMcp = mode === 'mcp';

  return (
    <div
      style={{
        backgroundColor: C.white,
        borderRadius: '8px',
        border: `1px solid ${C.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>
          {isMcp ? 'Claude + MCP' : 'Claude'}
        </span>
        <span
          style={{
            padding: '3px 7px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            backgroundColor: isMcp ? C.mcpBadgeBg : C.baseBadgeBg,
            color: isMcp ? C.mcpBadgeText : C.baseBadgeText,
          }}
        >
          {isMcp ? 'Docs-Enhanced' : 'Base Model'}
        </span>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            color: state.loading
              ? C.textMuted
              : isMcp
                ? C.mcpBadgeText
                : C.textMuted,
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: state.loading
                ? C.textMuted
                : isMcp
                  ? C.mcpBadgeText
                  : '#CBD5E1',
            }}
          />
          {state.loading ? (isMcp ? 'searching…' : 'thinking…') : ''}
        </div>
      </div>

      {/* Card body */}
      <div
        style={{
          padding: '20px',
          fontSize: '13.5px',
          lineHeight: '1.72',
          color: C.text,
        }}
      >
        {state.error && (
          <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>
            {state.error}
          </p>
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
                    fontSize: '13.5px',
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
                    fontSize: '13.5px',
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
              backgroundColor: isMcp ? C.mcpBadgeText : C.textMuted,
              borderRadius: '1px',
              verticalAlign: 'middle',
              marginLeft: '2px',
            }}
          />
        )}
      </div>
    </div>
  );
}
