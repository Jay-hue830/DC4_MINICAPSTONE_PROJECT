export default function StatCard({ label, value, tone = 'default' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-value">{value ?? 0}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
