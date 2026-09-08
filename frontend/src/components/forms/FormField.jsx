export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error = "",
  autoComplete,
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label htmlFor={name} className="form-field-label">
        {label} {required && <span className="required-asterisk">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`form-field-input ${error ? "input-error" : ""}`}
      />

      {error && (
        <span id={errorId} className="form-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}