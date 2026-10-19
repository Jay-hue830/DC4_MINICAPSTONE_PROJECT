import Button from './Button'

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) {
    return null
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <Button
        disabled={meta.current_page === 1}
        onClick={() => onPageChange(meta.current_page - 1)}
        variant="secondary"
      >
        Previous
      </Button>
      <span>
        Page {meta.current_page} of {meta.last_page} ({meta.total} total)
      </span>
      <Button
        disabled={meta.current_page === meta.last_page}
        onClick={() => onPageChange(meta.current_page + 1)}
        variant="secondary"
      >
        Next
      </Button>
    </nav>
  )
}
