const React = require('react');
const classNames  = require('classnames');
const ColumnTypes = require('./column-types');
const Modal       = require('react-modal');
const CreateRowModalContent = require('./modal-content.jsx');

module.exports = function(params) {
  const {
    createMode,
    columns,
    model,
    isEditingReferences,
    referenceSearchResults,
    referenceSearchBy,

    onAddReferenceRow,
    onChangeReferenceSearchBy,
    onShowEditReferences,
    onHideEditReferences,
    onSearchReferenceRows,
    onColumnValueChange,
    onColumnFileChange,
    onSubmit
  } = params;

  return (
    <div id="create_row">
      <form onSubmit={ onSubmit }>
        <h3>Columns</h3>
        <div className="columns">
          {(() => {
            return columns.map((column, index) => {
              return renderColumn({ column, index, onColumnValueChange, onColumnFileChange });
            });
          })()}
        </div>

        <h3>References</h3>
        <div className="references">
          <button type="button" className="edit-references"
                  onClick={ onShowEditReferences }>Edit References</button>
          <Modal
            className="modal-content"
            overlayClassName={ classNames('modal', { show: isEditingReferences }) }
            onRequestClose={ onHideEditReferences }
            isOpen={ isEditingReferences }>

            <CreateRowModalContent model={ model }
              onSearchReferenceRows={ onSearchReferenceRows }
              referenceSearchResults={ referenceSearchResults }
              referenceSearchBy={ referenceSearchBy }
              onChangeReferenceSearchBy={ onChangeReferenceSearchBy }
              onAddReferenceRow={ onAddReferenceRow }
              />
          </Modal>

        </div>
        <footer>
          {/* TODO: make this button work */}
          <button type="button">Cancel</button>
          <button type="submit" className="primary">{ createMode ? 'Create' : 'Save' }</button>
        </footer>
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
