/**
 * EmptyState con SVG ilustración inline.
 * variant: 'invoices' | 'companies' | 'search' | 'calendar' | 'reports'
 */

const ILLUSTRATIONS = {
  invoices: (
    <svg
      viewBox="0 0 200 160"
      width="180"
      height="144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="40"
        y="30"
        width="100"
        height="120"
        rx="8"
        fill="var(--bg-subtle)"
        stroke="var(--border-default)"
        strokeWidth="1.5"
      />
      <rect x="55" y="50" width="70" height="6" rx="3" fill="var(--border-default)" />
      <rect x="55" y="65" width="50" height="4" rx="2" fill="var(--border-subtle)" />
      <rect x="55" y="80" width="70" height="2" rx="1" fill="var(--border-subtle)" />
      <rect x="55" y="90" width="70" height="2" rx="1" fill="var(--border-subtle)" />
      <rect x="55" y="100" width="50" height="2" rx="1" fill="var(--border-subtle)" />
      <rect x="55" y="115" width="70" height="2" rx="1" fill="var(--border-subtle)" />
      <rect x="55" y="125" width="35" height="6" rx="3" fill="#2563eb" opacity="0.4" />
      <circle cx="155" cy="50" r="22" fill="#2563eb" opacity="0.15" />
      <path
        d="M148 50 l5 5 l9 -10"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="58" cy="22" r="3" fill="#2563eb" opacity="0.3" />
      <circle cx="170" cy="118" r="4" fill="#10b981" opacity="0.4" />
      <circle cx="32" cy="130" r="3" fill="#f59e0b" opacity="0.4" />
    </svg>
  ),
  companies: (
    <svg
      viewBox="0 0 200 160"
      width="180"
      height="144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="35"
        y="50"
        width="60"
        height="100"
        rx="6"
        fill="var(--bg-subtle)"
        stroke="var(--border-default)"
        strokeWidth="1.5"
      />
      <rect
        x="105"
        y="30"
        width="60"
        height="120"
        rx="6"
        fill="var(--bg-subtle)"
        stroke="var(--border-default)"
        strokeWidth="1.5"
      />
      <rect x="48" y="65" width="10" height="10" rx="1" fill="var(--border-default)" />
      <rect x="63" y="65" width="10" height="10" rx="1" fill="var(--border-default)" />
      <rect x="78" y="65" width="10" height="10" rx="1" fill="var(--border-default)" />
      <rect x="48" y="82" width="10" height="10" rx="1" fill="var(--border-default)" />
      <rect x="63" y="82" width="10" height="10" rx="1" fill="var(--border-default)" />
      <rect x="78" y="82" width="10" height="10" rx="1" fill="var(--border-default)" />
      <rect x="48" y="99" width="10" height="10" rx="1" fill="var(--border-default)" />
      <rect x="63" y="99" width="10" height="10" rx="1" fill="#2563eb" opacity="0.5" />
      <rect x="78" y="99" width="10" height="10" rx="1" fill="var(--border-default)" />
      <rect x="60" y="125" width="10" height="25" fill="#2563eb" opacity="0.4" />
      <rect x="118" y="50" width="12" height="12" rx="1" fill="var(--border-default)" />
      <rect x="135" y="50" width="12" height="12" rx="1" fill="#10b981" opacity="0.5" />
      <rect x="118" y="68" width="12" height="12" rx="1" fill="var(--border-default)" />
      <rect x="135" y="68" width="12" height="12" rx="1" fill="var(--border-default)" />
      <rect x="118" y="86" width="12" height="12" rx="1" fill="var(--border-default)" />
      <rect x="135" y="86" width="12" height="12" rx="1" fill="var(--border-default)" />
      <rect x="125" y="115" width="15" height="35" fill="#2563eb" opacity="0.4" />
    </svg>
  ),
  search: (
    <svg
      viewBox="0 0 200 160"
      width="180"
      height="144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="85"
        cy="75"
        r="40"
        stroke="var(--border-default)"
        strokeWidth="3"
        fill="var(--bg-subtle)"
      />
      <line
        x1="115"
        y1="105"
        x2="145"
        y2="135"
        stroke="var(--border-default)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <text
        x="85"
        y="82"
        textAnchor="middle"
        fontSize="34"
        fill="var(--text-muted)"
        fontWeight="700"
      >
        ?
      </text>
      <circle cx="40" cy="40" r="3" fill="#2563eb" opacity="0.3" />
      <circle cx="160" cy="50" r="4" fill="#f59e0b" opacity="0.4" />
      <circle cx="170" cy="120" r="3" fill="#10b981" opacity="0.4" />
    </svg>
  ),
  calendar: (
    <svg
      viewBox="0 0 200 160"
      width="180"
      height="144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="40"
        y="40"
        width="120"
        height="100"
        rx="8"
        fill="var(--bg-subtle)"
        stroke="var(--border-default)"
        strokeWidth="1.5"
      />
      <rect x="40" y="40" width="120" height="22" rx="8" fill="#2563eb" opacity="0.7" />
      <rect x="55" y="32" width="6" height="18" rx="2" fill="#1e3a8a" />
      <rect x="139" y="32" width="6" height="18" rx="2" fill="#1e3a8a" />
      {[0, 1, 2, 3].map(row =>
        [0, 1, 2, 3, 4].map(col => (
          <rect
            key={`${row}-${col}`}
            x={50 + col * 22}
            y={72 + row * 18}
            width="14"
            height="12"
            rx="2"
            fill={row === 1 && col === 2 ? '#dc2626' : 'var(--border-default)'}
            opacity={row === 1 && col === 2 ? 0.7 : 1}
          />
        ))
      )}
    </svg>
  ),
  reports: (
    <svg
      viewBox="0 0 200 160"
      width="180"
      height="144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="50"
        y="30"
        width="100"
        height="120"
        rx="8"
        fill="var(--bg-subtle)"
        stroke="var(--border-default)"
        strokeWidth="1.5"
      />
      <rect x="50" y="30" width="100" height="20" rx="8" fill="#10b981" opacity="0.8" />
      <rect x="65" y="68" width="70" height="4" rx="2" fill="var(--border-default)" />
      <rect x="65" y="80" width="50" height="4" rx="2" fill="var(--border-default)" />
      <rect
        x="65"
        y="100"
        width="70"
        height="30"
        rx="4"
        fill="var(--bg-card)"
        stroke="var(--border-subtle)"
      />
      <rect x="70" y="108" width="20" height="14" rx="2" fill="#2563eb" opacity="0.6" />
      <rect x="95" y="108" width="20" height="14" rx="2" fill="#10b981" opacity="0.6" />
      <rect x="120" y="108" width="11" height="14" rx="2" fill="#f59e0b" opacity="0.6" />
    </svg>
  ),
};

export default function EmptyState({
  variant = 'invoices',
  title,
  description,
  action,
  secondaryAction,
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '48px 28px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ marginBottom: 8 }}>{ILLUSTRATIONS[variant] || ILLUSTRATIONS.invoices}</div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            maxWidth: 340,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {action && (
            <button onClick={action.onClick} className="btn btn-primary btn-sm">
              {action.icon && <action.icon size={14} />} {action.label}
            </button>
          )}
          {secondaryAction && (
            <button onClick={secondaryAction.onClick} className="btn btn-secondary btn-sm">
              {secondaryAction.icon && <secondaryAction.icon size={14} />} {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
