export default function PageHeader({
  title,
  buttonText,
  onButtonClick,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
      }}
    >
      <h1>{title}</h1>

      <button onClick={onButtonClick}>
        {buttonText}
      </button>
    </div>
  );
}