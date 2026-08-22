export default function DataTable({
  columns,
  data,
  renderActions,
}) {
  return (
    <table
      border="1"
      cellPadding="10"
      cellSpacing="0"
      width="100%"
    >
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>
              {column.label}
            </th>
          ))}

          {renderActions && (
            <th>Actions</th>
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
              align="center"
            >
              No data found
            </td>
          </tr>
        ) : (
          data.map((row) => (
            <tr key={row.id}>
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