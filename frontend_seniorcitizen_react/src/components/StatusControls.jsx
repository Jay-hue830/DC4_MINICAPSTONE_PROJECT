import { useState } from 'react'
import Alert from './Alert'
import Button from './Button'
import FormInput from './FormInput'
import Modal from './Modal'
import { updateRequestStatus } from '../services/requestService'
import { NEXT_STATUSES, STATUS_LABELS } from '../utils/requestRules'

const ACTION_LABELS = {
  approved: 'Approve',
  rejected: 'Reject',
  in_progress: 'Start In Progress',
  completed: 'Mark Completed',
}

export default function StatusControls({ request, onChanged, onError }) {
  const [target, setTarget] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const options = NEXT_STATUSES[request.status] ?? []

  const close = () => {
    if (saving) {
      return
    }

    setTarget(null)
    setRemarks('')
    setError('')
  }

  const confirm = async () => {
    if (!target) {
      return
    }

    if (target === 'rejected' && !remarks.trim()) {
      setError('A reason is required when rejecting a request.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await updateRequestStatus(request.id, {
        status: target,
        ...(remarks.trim() ? { admin_remarks: remarks.trim() } : {}),
      })
      const updatedRequest = response.data.data ?? response.data

      onChanged(
        `Request marked as ${STATUS_LABELS[target].toLowerCase()}.`,
        updatedRequest,
      )
      setTarget(null)
      setRemarks('')
    } catch (requestError) {
      const message =
        requestError.response?.data?.errors?.admin_remarks?.[0] ??
        requestError.response?.data?.errors?.status?.[0] ??
        requestError.response?.data?.message ??
        'Status update failed.'
      onError(message)
      setTarget(null)
      setRemarks('')
    } finally {
      setSaving(false)
    }
  }

  if (options.length === 0) {
    return (
      <p className="empty" style={{ padding: 8 }}>
        No further status changes are available.
      </p>
    )
  }

  return (
    <>
      <div className="actions">
        {options.map((status) => (
          <Button
            key={status}
            variant={status === 'rejected' ? 'danger' : 'primary'}
            onClick={() => {
              setError('')
              setTarget(status)
            }}
          >
            {ACTION_LABELS[status]}
          </Button>
        ))}
      </div>

      {target && (
        <Modal
          title={`${ACTION_LABELS[target]}?`}
          onClose={close}
          footer={
            <>
              <Button variant="secondary" disabled={saving} onClick={close}>
                Cancel
              </Button>
              <Button
                variant={target === 'rejected' ? 'danger' : 'primary'}
                loading={saving}
                onClick={confirm}
              >
                Confirm
              </Button>
            </>
          }
        >
          {error && <Alert type="error">{error}</Alert>}
          <p>
            Change status from <strong>{STATUS_LABELS[request.status]}</strong>{' '}
            to <strong>{STATUS_LABELS[target]}</strong>?
          </p>
          <FormInput
            as="textarea"
            label={target === 'rejected' ? 'Reason for rejection' : 'Remarks (optional)'}
            name="admin_remarks"
            rows={3}
            value={remarks}
            onChange={(event) => {
              setRemarks(event.target.value)
              setError('')
            }}
            maxLength={1000}
            required={target === 'rejected'}
          />
        </Modal>
      )}
    </>
  )
}
