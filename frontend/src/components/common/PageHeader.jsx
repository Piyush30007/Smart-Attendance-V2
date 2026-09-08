export default function PageHeader({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  buttonIcon,
}) {
  const hasAction = Boolean(buttonText && onButtonClick);

  return (
    <div className="page-header">
      <div className="page-header-text">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>

      {hasAction && (
        <button
          type="button"
          className="btn-page-header-action"
          onClick={onButtonClick}
        >
          {buttonIcon && <span className="btn-icon" aria-hidden="true">{buttonIcon}</span>}
          <span>{buttonText}</span>
        </button>
      )}
    </div>
  );
}