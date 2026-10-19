export const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const NEXT_STATUSES = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['in_progress', 'completed', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  rejected: [],
  completed: [],
  cancelled: [],
}

export function canEditRequest(user, request) {
  if (!user || !request) {
    return false
  }

  return user.role === 'admin'
    ? ['pending', 'approved'].includes(request.status)
    : request.status === 'pending'
}

export function canDeleteRequest(user) {
  return user?.role === 'admin'
}

export function canChangeRequestStatus(user, request) {
  return user?.role === 'admin' && (NEXT_STATUSES[request?.status]?.length ?? 0) > 0
}
