export function validateRequest(form, { isEdit = false, original = null } = {}) {
  const errors = {}

  if (!form.title?.trim()) {
    errors.title = 'Title is required.'
  } else if (form.title.trim().length > 150) {
    errors.title = 'Title must be 150 characters or fewer.'
  }

  if (!form.assistance_type_id) {
    errors.assistance_type_id = 'Please choose an assistance type.'
  }

  if (!form.date_needed) {
    errors.date_needed = 'Date needed is required.'
  } else if (
    (!isEdit || form.date_needed !== original?.date_needed) &&
    form.date_needed < new Date().toISOString().slice(0, 10)
  ) {
    errors.date_needed = 'Date needed cannot be in the past.'
  }

  const description = form.description?.trim() ?? ''
  if (!description) {
    errors.description = 'Please describe the help you need.'
  } else if (description.length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer.'
  }

  return errors
}
