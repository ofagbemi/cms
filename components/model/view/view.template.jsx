const React = require('react');

module.exports = function(params) {
  const {
    model,
    rows
  } = params;

  return (
    <div id="view_model">
      <h2>{ model.displayName }</h2>

      <table>
        <thead>
          <tr>
            {
              model.columns.map((column, index) => {
                return (
                  <th key={ index }>{ column.displayName }</th>
                );
              })
            }
          </tr>
        </thead>
        <tbody>
          {
            rows.map((row, rowIndex) => {
              return (
                <tr key={ rowIndex }>
                {
                  model.columns.map((column, index) => {
                    return (
                      <td key={ index }>
                        <a href={ `/${model.name}/${row.id}#${column.name}` }>
                          { row[column.name] }
                        </a>
                      </td>
                    );
                  })
                }
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
};
