'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { QUESTIONS } from '@/lib/questions';

const C = {
  // Base (warm neutral)
  bg: '#FAFAF8',
  white: '#FFFFFF',
  border: '#E6DFD5',
  text: '#1C1410',
  textSub: '#504234',
  textMuted: '#9C8070',
  // Teal accent
  accent: '#0D9488',
  // Sidebar (light)
  sidebar: '#FFFFFF',
  sidebarBorder: '#ECE5DC',
  navText: '#7C6454',
  navHover: '#F5EFE6',
  navActiveText: '#0D9488',
  navActiveBg: 'rgba(13,148,136,0.07)',
  // Base card header
  baseHeadBg: '#F8F4EE',
  baseBadgeBg: '#E5DDD0',
  baseBadgeText: '#5E4E3C',
  // Docs card header (teal)
  mcpHeadBg: '#EAFAF6',
  mcpHeadBorder: '#96E4CE',
  mcpBadgeBg: '#96E4CE',
  mcpBadgeText: '#065F46',
  mcpLabelText: '#0D9488',
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

  function TopicButton({ q }: { q: (typeof QUESTIONS)[number] }) {
    const active = activeId === q.id;
    return (
      <button
        onClick={() => ask(q.id)}
        disabled={isLoading && !active}
        style={{
          display: 'block',
          width: isMobile ? 'auto' : '100%',
          textAlign: 'left',
          padding: isMobile ? '7px 14px' : '7px 10px 7px 16px',
          borderRadius: '5px',
          border: isMobile
            ? `1px solid ${active ? 'rgba(13,148,136,0.3)' : 'rgba(0,0,0,0.08)'}`
            : 'none',
          backgroundColor: active ? C.navActiveBg : 'transparent',
          color: active ? C.navActiveText : C.navText,
          fontSize: '13.5px',
          fontWeight: active ? 600 : 400,
          lineHeight: '1.4',
          whiteSpace: isMobile ? 'nowrap' : 'normal',
          cursor: isLoading && !active ? 'not-allowed' : 'pointer',
          opacity: isLoading && !active ? 0.4 : 1,
          transition: 'background-color 0.1s, color 0.1s',
          fontFamily: FONT,
          flexShrink: 0,
        }}
      >
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
            width: '300px',
            flexShrink: 0,
            backgroundColor: C.sidebar,
            borderRight: `1px solid ${C.sidebarBorder}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '22px 20px 18px 24px',
              borderBottom: `1px solid ${C.sidebarBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: C.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="5"
                  height="5"
                  rx="1.2"
                  fill="white"
                  opacity="0.95"
                />
                <rect
                  x="8"
                  y="1"
                  width="5"
                  height="5"
                  rx="1.2"
                  fill="white"
                  opacity="0.95"
                />
                <rect
                  x="1"
                  y="8"
                  width="5"
                  height="5"
                  rx="1.2"
                  fill="white"
                  opacity="0.95"
                />
                <rect
                  x="8"
                  y="8"
                  width="5"
                  height="5"
                  rx="1.2"
                  fill="white"
                  opacity="0.42"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: C.text,
                letterSpacing: '-0.01em',
              }}
            >
              SN Docs MCP
            </span>
          </div>

          <nav
            style={{
              flex: 1,
              padding: '16px 10px 16px 8px',
              overflowY: 'auto',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: C.textMuted,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0 8px 0 16px',
                margin: '0 0 4px',
                fontFamily: FONT,
              }}
            >
              Questions
            </p>
            {QUESTIONS.map((q) => (
              <TopicButton key={q.id} q={q} />
            ))}
          </nav>

          <div
            style={{
              padding: '12px 20px 18px 24px',
              borderTop: `1px solid ${C.sidebarBorder}`,
              fontSize: '11.5px',
              color: C.textMuted,
              lineHeight: '1.55',
            }}
          >
            Select a question to compare responses with and without docs.
          </div>
        </aside>
      )}

      {/* ── Mobile header ── */}
      {isMobile && (
        <div
          style={{
            backgroundColor: C.sidebar,
            borderBottom: `1px solid ${C.sidebarBorder}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: '14px 20px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '5px',
                backgroundColor: C.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="5"
                  height="5"
                  rx="1.2"
                  fill="white"
                  opacity="0.95"
                />
                <rect
                  x="8"
                  y="1"
                  width="5"
                  height="5"
                  rx="1.2"
                  fill="white"
                  opacity="0.95"
                />
                <rect
                  x="1"
                  y="8"
                  width="5"
                  height="5"
                  rx="1.2"
                  fill="white"
                  opacity="0.95"
                />
                <rect
                  x="8"
                  y="8"
                  width="5"
                  height="5"
                  rx="1.2"
                  fill="white"
                  opacity="0.42"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: C.text,
                letterSpacing: '-0.01em',
              }}
            >
              SN Docs MCP
            </span>
          </div>
          <div
            style={{
              overflowX: 'auto',
              padding: '0 12px 12px',
              display: 'flex',
              gap: '6px',
            }}
          >
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
          padding: isMobile ? '20px 16px' : '32px 40px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!activeId && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
            }}
          >
            <p
              style={{ fontSize: '14px', color: C.textMuted, fontFamily: FONT }}
            >
              {isMobile
                ? 'Select a topic above'
                : 'Select a topic from the sidebar'}
            </p>
          </div>
        )}

        {activeQuestion && (
          <div
            style={{
              backgroundColor: C.white,
              borderRadius: '10px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              padding: isMobile ? '16px 20px' : '20px 24px',
              marginBottom: isMobile ? '16px' : '20px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: C.accent,
                marginBottom: '10px',
                fontFamily: FONT,
              }}
            >
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: C.accent,
                  opacity: 0.55,
                  display: 'inline-block',
                }}
              />
              {activeQuestion.label}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 600,
                color: C.text,
                letterSpacing: '-0.02em',
                lineHeight: '1.4',
                fontFamily: FONT,
              }}
            >
              {activeQuestion.prompt}
            </p>
          </div>
        )}

        {activeId && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
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
  const FONT = 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)';

  return (
    <div
      style={{
        backgroundColor: C.white,
        borderRadius: '10px',
        border: `1px solid ${C.border}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '12px 18px',
          borderBottom: `1px solid ${isMcp ? C.mcpHeadBorder : C.border}`,
          backgroundColor: isMcp ? C.mcpHeadBg : C.baseHeadBg,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '2px 7px',
            borderRadius: '4px',
            backgroundColor: isMcp ? C.mcpBadgeBg : C.baseBadgeBg,
            color: isMcp ? C.mcpBadgeText : C.baseBadgeText,
            fontFamily: FONT,
          }}
        >
          {isMcp ? 'With Docs' : 'Base Model'}
        </span>
        <span
          style={{
            fontSize: '12px',
            color: isMcp ? C.mcpLabelText : C.textMuted,
            fontFamily: FONT,
          }}
        >
          {isMcp ? 'Claude + MCP' : 'Claude'}
        </span>
        {state.loading && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '11px',
              color: isMcp ? C.mcpLabelText : C.textMuted,
              fontFamily: FONT,
              opacity: 0.8,
            }}
          >
            {isMcp ? 'searching…' : 'thinking…'}
          </span>
        )}
      </div>

      {/* Card body */}
      <div
        style={{
          padding: '20px 18px',
          fontSize: '14.5px',
          lineHeight: '1.72',
          color: C.textSub,
          fontFamily: FONT,
        }}
      >
        {state.error && (
          <p
            style={{
              fontSize: '13px',
              color: '#DC2626',
              margin: 0,
              fontFamily: FONT,
            }}
          >
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
                    letterSpacing: '-0.025em',
                    lineHeight: '1.3',
                    fontFamily: FONT,
                  }}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  style={{
                    fontSize: '14.5px',
                    fontWeight: 600,
                    color: C.text,
                    marginTop: '22px',
                    marginBottom: '8px',
                    letterSpacing: '-0.015em',
                    fontFamily: FONT,
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
                    color: C.textMuted,
                    marginTop: '18px',
                    marginBottom: '6px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    fontFamily: FONT,
                  }}
                >
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p
                  style={{
                    fontSize: '14.5px',
                    lineHeight: '1.72',
                    color: C.textSub,
                    marginBottom: '12px',
                    fontFamily: FONT,
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
                    fontSize: '14.5px',
                    lineHeight: '1.65',
                    color: C.textSub,
                    marginBottom: '5px',
                    fontFamily: FONT,
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
                <em style={{ color: C.textMuted }}>{children}</em>
              ),
              code: ({ children }) => (
                <code
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono, monospace)',
                    backgroundColor: '#F0EBE3',
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
                    backgroundColor: '#F5F0E8',
                    border: `1px solid ${C.border}`,
                    borderRadius: '7px',
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
                    color: C.textMuted,
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
              backgroundColor: isMcp ? C.accent : C.textMuted,
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
