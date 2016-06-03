const React = require('react');
const ColumnTypes = require('./column-types');

module.exports = function(params) {
  const {
    createMode,
    columns,

    onColumnValueChange,
    onColumnFileChange,
    onSubmit
  } = params;

  return (
    <div id="create_row">

      <form onSubmit={ onSubmit }>
        {(() => {
          return columns.map((column, index) => {
            return renderColumn({ column, index, onColumnValueChange, onColumnFileChange });
          });
        })()}
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

function renderColumn(params) {

  const {
    column,
    index,

    onColumnValueChange,
    onColumnFileChange
  } = params;

  let Component = ColumnTypes[column.type];
  if (!Component) return null;

  return <Component key={ index } index={ index } column={ column }
    onColumnValueChange={ onColumnValueChange }
    onColumnFileChange={ onColumnFileChange }/>
}
