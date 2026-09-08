export default function DataTable({
  columns,
  data,
  renderActions,
}) {
  return (
    <table className="app-data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.label}
            </th>
          ))}

          {renderActions && (
            <th scope="col">Actions</th>
          )}
        </tr>
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={
                columns.length +
                (renderActions ? 1 : 0)
              }
              className="empty-table-cell"
              style={{ textAlign: "center", padding: "28px", color: "#64748b" }}
            >
              No data found
            </td>
          </tr>
        ) : (
          data.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}

              {renderActions && (
                <td>
                  {renderActions(row)}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}