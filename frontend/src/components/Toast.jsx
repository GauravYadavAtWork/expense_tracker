function Toast({ tone = "success", message, onDismiss }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`toast toast--${tone}`}>
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message">
        x
      </button>
    </div>
  );
}

export default Toast;
