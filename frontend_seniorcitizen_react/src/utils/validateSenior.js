export function validateSenior(form) {
  const errors = {}

  if (!form.first_name?.trim()) {
    errors.first_name = 'First name is required.'
  }

  if (!String(form.user_id ?? '').trim()) {
    errors.user_id = 'An associated user ID is required.'
  } else if (!/^[1-9]\d*$/.test(String(form.user_id))) {
    errors.user_id = 'Enter a valid existing user ID.'
  }

  if (!form.last_name?.trim()) {
    errors.last_name = 'Last name is required.'
  }

  if (!form.birth_date) {
    errors.birth_date = 'Birth date is required.'
  } else {
    const [year, month, day] = form.birth_date.split('-').map(Number)
    const birth = new Date(year, month - 1, day)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDifference = today.getMonth() - birth.getMonth()

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    if (
      Number.isNaN(birth.getTime()) ||
      birth.getFullYear() !== year ||
      birth.getMonth() !== month - 1 ||
      birth.getDate() !== day
    ) {
      errors.birth_date = 'Enter a valid birth date.'
    } else if (birth > today) {
      errors.birth_date = 'Birth date cannot be in the future.'
    } else if (age < 60) {
      errors.birth_date = 'A senior citizen must be at least 60 years old.'
    }
  }

  if (!form.sex) {
    errors.sex = 'Please select a sex.'
  } else if (!['male', 'female'].includes(form.sex)) {
    errors.sex = 'Select male or female.'
  }

  if (!form.address?.trim()) {
    errors.address = 'Address is required.'
  }

  if (!form.barangay?.trim()) {
    errors.barangay = 'Barangay is required.'
  }

  if (!form.contact_number) {
    errors.contact_number = 'Contact number is required.'
  } else if (!/^(09|\+639)\d{9}$/.test(form.contact_number)) {
    errors.contact_number = 'Use a valid PH mobile number, e.g. 09171234567.'
  }

  return errors
}
