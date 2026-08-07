export default function SearchBar({
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="search-bar">
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}