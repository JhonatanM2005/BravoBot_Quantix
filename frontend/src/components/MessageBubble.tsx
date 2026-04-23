import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SourcesList from './SourcesList'

export interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  fuentes?: string[]
  categoria?: string
  intent?: string
}

// ── Category badge colours ──────────────────────────────────────────────────
const CATEGORIA_MAP: Record<string, { label: string; color: string }> = {
  admisiones: { label: 'Admisiones', color: '#0299D8' },
  programas: { label: 'Programas', color: '#4E3D98' },
  costos: { label: 'Costos', color: '#F29A01' },
  bienestar: { label: 'Bienestar', color: '#00B87C' },
  becas: { label: 'Becas', color: '#2E7D32' },
  institucional: { label: 'Institucional', color: '#5D4037' },
  noticias: { label: 'Noticias', color: '#D8473A' },
  general: { label: 'General', color: '#4E4E4E' },
}

// ── Intent badge (only shown for special modes) ────────────────────────────
const INTENT_MAP: Record<string, { label: string; color: string }> = {
  comparison: { label: '⚖️ Comparación', color: '#6A1B9A' },
  recommendation: { label: '✨ Recomendación', color: '#00695C' },
  conversational: { label: '💬 Conversacional', color: '#1565C0' },
  followup: { label: '↩️ Seguimiento', color: '#546E7A' },
}

function CategoriaBadge({ categoria }: { categoria: string }) {
  const meta = CATEGORIA_MAP[categoria.toLowerCase()] ?? {
    label: categoria,
    color: '#4E4E4E',
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.label}
    </span>
  )
}

function IntentBadge({ intent }: { intent: string }) {
  const meta = INTENT_MAP[intent]
  if (!meta) return null
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.label}
    </span>
  )
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-heading font-bold shadow-md overflow-hidden ${isUser
            ? 'bg-gradient-to-br from-pb-navy to-pb-navy-dark text-white'
            : 'bg-white border border-pb-aqua/20'
          }`}
      >
        {isUser ? 'Tú' : <img src="/Logo_1.png" alt="BravoBot" className="w-full h-full object-cover" />}
      </div>

      {/* Content column */}
      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>

        {/* Badges row (bot only) */}
        {!isUser && (message.categoria || message.intent) && (
          <div className="flex flex-wrap gap-1">
            {message.intent && <IntentBadge intent={message.intent} />}
            {message.categoria && <CategoriaBadge categoria={message.categoria} />}
          </div>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
              ? 'bg-gradient-to-br from-pb-navy to-pb-navy-dark text-white rounded-br-sm shadow-md'
              : 'bg-white text-pb-navy rounded-bl-sm shadow-sm border border-gray-100'
            }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap font-body">{message.content}</span>
          ) : (
            <div className="bot-prose font-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className="min-w-full border-collapse text-xs">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-pb-navy/10">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-200 px-3 py-1.5 text-left font-semibold text-pb-navy">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-200 px-3 py-1.5">{children}</td>
                  ),
                  tr: ({ children }) => (
                    <tr className="even:bg-gray-50">{children}</tr>
                  ),
                  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-pb-aqua hover:underline">
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources (bot only) */}
        {!isUser && message.fuentes && message.fuentes.length > 0 && (
          <div className="px-1">
            <SourcesList fuentes={message.fuentes} />
          </div>
        )}
      </div>
    </div>
  )
}
