const React = require('react');

module.exports = React.createClass({
  render() {
    const {
      column,
      index,
      onColumnValueChange
    } = this.props;

    return (
      <label className="column">
        <p className="name">{ column.displayName }</p>
        {/*
          column.value || '' lets us get around the fact that
          the column JSON doesn't set the value initially. This was
          deemed a better fix than iterating through each of the columns
          to set the value to '' if it isn't set on every render pass
        */}
        <input type="text" value={ column.value || '' }
          onChange={ (e) => onColumnValueChange( {
            columnValue: e.target.value,
            index
          } ) }/>
      </label>
    );
  }
});
