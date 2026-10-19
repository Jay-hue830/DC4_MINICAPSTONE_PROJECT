import { STATUS_LABELS } from '../utils/requestRules'

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
