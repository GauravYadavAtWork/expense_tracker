function FiltersBar({ filters, onChange, onClear, categoryOptions }) {
  return (
    <section className="card">
      <div className="card__header">
        <div>
          <span className="pill">Precision mode</span>
          <h3>Refine what the dashboard shows</h3>
        </div>
        <button type="button" className="button button--ghost" onClick={onClear}>
          Reset filters
        </button>
      </div>

      <div className="filters-bar">
        <label>
          <span>Category</span>
          <select name="category" value={filters.category} onChange={onChange}>
            <option value="">All</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Start date</span>
          <input type="date" name="startDate" value={filters.startDate} onChange={onChange} />
        </label>

        <label>
          <span>End date</span>
          <input type="date" name="endDate" value={filters.endDate} onChange={onChange} />
        </label>

        <label>
          <span>Sort by</span>
          <select name="sortBy" value={filters.sortBy} onChange={onChange}>
            <option value="spentAt">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
            <option value="createdAt">Recently added</option>
          </select>
        </label>

        <label>
          <span>Order</span>
          <select name="order" value={filters.order} onChange={onChange}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>

        <label className="filters-bar__search">
          <span>Search titles locally</span>
          <input
            type="search"
            name="search"
            value={filters.search}
            onChange={onChange}
            placeholder="groceries, uber, rent..."
          />
        </label>
      </div>
    </section>
  );
}

export default FiltersBar;
