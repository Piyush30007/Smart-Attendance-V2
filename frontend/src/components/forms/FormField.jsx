export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
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
      />
    </div>
  );
}