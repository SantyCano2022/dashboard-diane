/**
 * Skeleton loader primitives + ready-made layouts.
 *
 * Uso:
 *   <Skeleton width={120} height={20} />
 *   <SkeletonText lines={3} />
 *   <SkeletonCard />
 *   <DashboardSkeleton />   // layout completo de dashboard
 */

export function Skeleton({ width = '100%', height = 16, radius = 6, style, className }) {
  return (
    <div
      className={`skeleton-shimmer ${className || ''}`}
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, var(--bg-subtle, #f1f5f9) 0%, var(--border-subtle, #e2e8f0) 50%, var(--bg-subtle, #f1f5f9) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonText({ lines = 3, lastLineWidth = '70%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? lastLineWidth : '100%'} height={12} />
      ))}
    </div>
  );
}

export function SkeletonCard({ height = 140 }) {
  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <Skeleton width={40} height={40} radius={10} />
        <Skeleton width={48} height={20} radius={999} />
      </div>
      <Skeleton width="60%" height={10} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={28} />
      <div style={{ height: height - 100 }} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <Skeleton width="100%" height={32} radius={8} style={{ marginBottom: 24 }} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 24,
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <Skeleton width={220} height={28} style={{ marginBottom: 8 }} />
          <Skeleton width={180} height={14} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Skeleton width={140} height={34} radius={8} />
          <Skeleton width={120} height={34} radius={8} />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <Skeleton width={200} height={20} style={{ marginBottom: 18 }} />
        <Skeleton width="100%" height={280} radius={12} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        <div className="glass-card" style={{ padding: 24 }}>
          <Skeleton width={180} height={20} style={{ marginBottom: 18 }} />
          <Skeleton width="100%" height={240} radius={12} />
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <Skeleton width={180} height={20} style={{ marginBottom: 18 }} />
          <Skeleton width="100%" height={240} radius={12} />
        </div>
      </div>

      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }) {
  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 12,
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${100 / cols}%`} height={12} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 12,
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width={`${100 / cols}%`} height={14} />
          ))}
        </div>
      ))}
      <style>{`@keyframes skeletonShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
