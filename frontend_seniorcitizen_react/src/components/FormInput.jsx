export default function FormInput({
  label,
  name,
  error,
  as = 'input',
  children,
  className = '',
  ...rest
}) {
  const Tag = as
  const errorId = `${name}-error`
  const inputProps = {
    id: name,
    name,
    className: `input ${error ? 'input-error' : ''} ${className}`.trim(),
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    ...rest,
  }

  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {as === 'input' ? <input {...inputProps} /> : <Tag {...inputProps}>{children}</Tag>}
      {error && (
        <small id={errorId} className="error-text">
          {error}
        </small>
      )}
    </div>
  )
}
