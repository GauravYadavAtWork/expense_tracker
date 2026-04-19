import { formatCurrency } from "../utils/formatters";

function MetricCard({ label, value, tone = "default", detail }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">
        {typeof value === "number" ? formatCurrency(value) : value}
      </strong>
      {detail ? <span className="metric-card__detail">{detail}</span> : null}
    </article>
  );
}

export default MetricCard;
