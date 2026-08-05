export default function FormField({ label, ...inputProps }) {
  return (
    <label>
      <span>{label}</span>
      <input {...inputProps} />
    </label>
  );
}
