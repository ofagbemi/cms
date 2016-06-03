const React = require('react');

module.exports = React.createClass({
  render() {
    const {
      model,
      referenceSearchResults,
      referenceSearchBy,

      onAddReferenceRow,
      onChangeReferenceSearchBy,
      onSearchReferenceRows
    } = this.props;

    return (
      <div className="create-row-modal-content">
        {(() => {
          return model.references.map((reference, index) => {

            return (
              <div key={ index }>
                <header>
                  <label>
                    <p>Search “{ reference.foreignModel.displayName }”</p>
                    <input type="text" className="search" data-icon="search"
                           placeholder="Start typing to search rows to reference"
                           onChange={ (e) => {
                             return onSearchReferenceRows({
                               foreignModel: reference.foreignModel,
                               columnName: referenceSearchBy[index],
                               query: e.target.value,
                               index
                             });
                           } }/>
                  </label>
                  { renderSearchBy({ index, reference, onChangeReferenceSearchBy }) }
                </header>
                <section className="references">

                </section>

                <section className="results-section">
                  <header className="results-header">
                    <h2>Results</h2>
                    <button className="add-references">
                      <span>Add references</span>
                    </button>
                  </header>

                  {/* table header */}
                  <header className="row table-header">
                    <div className="col select-all-col">
                      <input className="select-all" type="checkbox" />
                    </div>
                    { renderColumns({ columns: reference.foreignModel.columns, key: 'displayName' }) }
                  </header>
                  <div className="results">
                    { renderSearchResults({
                        model: reference.foreignModel,
                        referenceSearchResults,
                        index,
                        onAddReferenceRow,
                        reference
                      }) }
                  </div>
                </section>
              </div>
            );
          })
        })()}
      </div>
    );
  }
});

function renderSearchResults({
  model,
  referenceSearchResults,
  index,
  onAddReferenceRow,
  reference }) {

  const searchResults = referenceSearchResults[index];
  if (searchResults &&
      searchResults.results &&
      searchResults.results.length) {
    return (
      <div>
        {
          searchResults.results.map((result, index) => {
            return (
              <label className="row" key={ index }>
                <div className="col select-col">
                  <button className="add-reference"
                    onClick={ (e) => {
                      return onAddReferenceRow({
                        foreignName: reference.foreignName,
                        row: result
                      });
                    } }>
                  <span>Add</span>
                  </button>
                </div>
                { model.columns.map((column, index) => {
                  return (
                    <div className="col" key={ index }>
                      <span>{ result[column.name] }</span>
                    </div>
                  );
                }) }
              </label>
            );
          })
        }
      </div>
    );
  }
}

function renderColumns({ columns, key = 'value' }) {
  return columns.map((column, index) => {
    return (
      <div className="col" key={ index }>
        <span>{ column[key] }</span>
      </div>
    );
  });
}

function renderSearchBy({ index: referenceIndex, reference, onChangeReferenceSearchBy }) {
  const columns = reference.foreignModel.columns;
  if (columns.length) {
    return (
      <label>
        <p>Search by</p>
        <select defaultValue="init" key={ referenceIndex }
          onChange={ (e) => onChangeReferenceSearchBy({
            value: e.target.value,
            index: referenceIndex
          }) }>
          <option value="init">Choose a column to search by</option>
          {
            columns.map((column, index) => {
              return (
                <option key={ index } value={ column.name }>
                    { column.displayName }
                </option>
              );
            })
          }
        </select>
      </label>
    );
  }
}
