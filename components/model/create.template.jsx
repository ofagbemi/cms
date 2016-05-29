const _     = require('underscore');
const React = require('react');
const classNames = require('classnames');
const capitalize = require('underscore.string/capitalize');
const util       = require('../../shared/util');
const Constants  = require('../../shared/constants');

module.exports = function(params) {
  const {
    columns,
    createMode,
    models,
    references,
    tableDisplayName,

    onAddColumn,
    onColumnDisplayNameChange,
    onColumnTypeChange,
    onTableDisplayNameChange,
    onReferenceTagClick,
    onReferenceTableDisplayNameChange,
    onReferenceForeignTableDisplayNameChange,
    onSubmit
  } = params;

  return (
    <div id="create_model">
      <h2>{ createMode ? 'Create new' : 'Edit' } model</h2>
      <form id="create-form" method="POST" action="/models"
            onSubmit={ onSubmit }>
        <header>
          <p className="caption">
            Your model's name should be a singular noun, like ‘person’, ‘paper’
            or ‘Decepticon’.
          </p>
          <input type="text" name="displayName"
                 className="large display-name"
                 placeholder="Untitled model"
                 onChange={ (e) => onTableDisplayNameChange(e.target.value) }
                 value={ tableDisplayName } />
          <p className={classNames(
            'caption', { hide: !tableDisplayName }
          )}>
            This table will be named
            ‘<span className="table-name">
              { util.getTableName( tableDisplayName ) }
            </span>’
            in the database
          </p>
        </header>

        {/* columns */}
        <div className="columns-wrapper">
          <h2>Columns</h2>
          <p className="caption">
            A <span className="emphasis">column</span> describes a
            model’s raw attributes, like ‘first name’, ‘id number’, etc.
          </p>
          <p className="caption">
            Avoid any column name that’d resolve to the column name ‘id’. For
            example, <span className="emphasis">don’t</span> use ‘ID#’ as a column
            name. Use ‘id number’ instead.
          </p>
          <div className="columns">
            { renderColumns({
                columns,
                onColumnDisplayNameChange,
                onColumnTypeChange }) }
          </div>
          <footer>
            <button type="button"
                    className="add-column"
                    onClick={ onAddColumn }>Add column</button>
          </footer>
        </div>

        {/* references */}
        <div className="references-wrapper">
          <h2>References</h2>
          <p className="caption">
            A <span className="emphasis">reference</span> points to another model.
            For example, a model named ‘Project’ might reference a model named
            ‘Person’. This indicates a relationship between these two models—for
            example, each paper could refer to its multiple authors, and each
            person could reference multiple papers they've written.
          </p>
          <p className="caption">
            Defining a relationship on one model automatically creates the
            corresponding reference on the other model.
          </p>
        </div>

        <div className="references">
          { renderReferenceDetails({
              references,
              models,
              onReferenceTableDisplayNameChange,
              onReferenceForeignTableDisplayNameChange
            })
          }
        </div>
        <p>
          Select each model you want this one to reference by clicking on
          its name.
        </p>
        <div className="reference-tags">
          {(() => {
            if (models.length) {
              return renderReferenceTags({ references, models, onClick: onReferenceTagClick });
            } else {
              return <p className="caption">There aren‘t any models available</p>
            }
          })()}
        </div>
        <footer>
          <button type="submit" className="finish primary">
            { createMode ? 'Create' : 'Save' }
          </button>
        </footer>
      </form>
    </div>
  );
};

function renderReferenceTags({ references, models, onClick }) {
  return models.map((model, index) => {
    return (
      <button key={ index }
        className={
          classNames(
            'tag',
            'reference',
            {
              selected: _.findIndex(references, (m) => model.name === m.table) !== -1
            }
          )
        }
        type="button" name={ model.name }
        onClick={ (event) => onClick({ index, model }) }>
        { model.displayName }
      </button>
    )
  });
}

function renderReferenceDetails(params) {

  const {
    models,
    references,
    onReferenceTableDisplayNameChange,
    onReferenceForeignTableDisplayNameChange
  } = params;

  return references.map((reference, index) => {
    // get the model for the table being referenced
    const model = _.findWhere(models, { name: reference.table });
    return(
      <div key={ index }>
        <h4>
          Creating reference to <span className="emphasis">{ model.displayName }</span>
        </h4>
        <label>
          <p className="caption">
            This is the name of the record in this model. For example, let's say you're
            creating a model called ‘Person’. You might use the name ‘author’ for
            this field.
          </p>
          <p>My name</p>
          <input type="text" name="displayName" onChange={ (e) => {
            const displayName = e.target.value;
            return onReferenceTableDisplayNameChange({ index, displayName })
          } }/>
        </label>
        <label>
          <p className="caption">This is the name of the record in the model being
            referenced. For example, let‘s say
            you‘re <span className="emphasis">referencing</span> a
            model called ‘Course’. You might use the name ‘favorite courses’ for
            this field.
          </p>
          <p className="caption">
            Continuing the example from above, this would indicate a relationship
            between ‘Person’s and ‘Course’s. Here, we want each person to have
            several ‘favorite courses’, so we reference the ‘Course’ table
            from the ‘Person’ table.
          </p>
          <p>
            <span className="emphasis">{ model.displayName }</span>‘s name
          </p>
          <input type="text" name="foreignDisplayName" onChange={ (e) => {
            const foreignDisplayName = e.target.value;
            return onReferenceForeignTableDisplayNameChange({ index, foreignDisplayName });
          } }/>
        </label>
      </div>
    );
  });
}

function renderColumns(params) {
  const {
    columns,
    onColumnDisplayNameChange,
    onColumnTypeChange
  } = params;

  return columns.map((column, index) => {
    return (
      <Column key={ index } column={ column }
        onColumnDisplayNameChange={ (columnDisplayName) => {
          onColumnDisplayNameChange({ index, columnDisplayName });
        } }
        onColumnTypeChange={ (columnType) => {
          onColumnTypeChange({ index, columnType });
        } }/>
    );
  })
}

const Column = React.createClass({
  render() {
    const {
      column,
      onColumnDisplayNameChange,
      onColumnTypeChange
    } = this.props;

    return (
      <div className="column">
        <div className="initial">
          <label>
          <p>Display name</p>
            <input type="text" name="columnDisplayName"
                   className="column-display-name"
                   placeholder="E.g. “department” or “home university”"
                   value={ column.displayName }
                   onChange={ (e) => onColumnDisplayNameChange(e.target.value) }
                   />
            <p className={
              classNames('caption', { 'hide': !column.displayName })
            }>
              This column will be named
              ‘<span className="column-name">
                { util.getColumnName(column.displayName) }
              </span>’
              in the database
            </p>
          </label>
          <label>
            <p>Type</p>
            <select name="type" defaultValue="init"
              onChange={ (e) => onColumnTypeChange(e.target.value) }>
              <option value="init" disabled>Choose a data type</option>
              {
                  Constants.DATA_TYPE_LABELS.map((label, index) => {
                    return (
                      <option key={ index } value={ label.name }>
                        { capitalize(label.displayName) }
                      </option>
                    );
                  })
              }
            </select>
          </label>
        </div>
      </div>
    );
  }
});
