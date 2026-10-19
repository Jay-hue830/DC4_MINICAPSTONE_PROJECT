export const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const NEXT_STATUSES = {
  pending: ['approved', 'rejected'],
  approved: ['in_progress'],
  in_progress: ['completed'],
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

export function canDeleteRequest(user, request) {
  if (user?.role === 'admin') {
    return true
  }

  return user?.role === 'senior_citizen' &&
    request?.status === 'pending' &&
    request.senior_citizen?.user_id === user.id
}

export function canChangeRequestStatus(user, request) {
  return user?.role === 'admin' && (NEXT_STATUSES[request?.status]?.length ?? 0) > 0
}
