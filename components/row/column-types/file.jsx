const React = require('react');
const Constants = require('../../../shared/constants');
const util      = require('../../../shared/util');

module.exports = React.createClass({
  render() {
    const {
      column,
      index,
      onColumnValueChange,
      onColumnFileChange
    } = this.props;

    return (
      <div className="column">
        <p className="name">{ column.displayName }</p>
        <div className="row">
          {
            (() => {
              if (column.value) {
                return (
                  <a target="_blank" href="{ util.hciRootUrl( column.value ) }">
                    { column.value }
                  </a>
                )
              }
            })()
          }
        </div>
        <div className="row">
          <input type="file"
            onChange={ (e) => {
              onColumnFileChange({ columnFiles: e.target.files, index });
            }  }
            ref={ (ref) => this.fileInput = ref } />
        </div>

        <div className="row">
          <label className="default-directory">
            <div>
              <input type="checkbox" />
              <span>Use default directory</span>
            </div>
          </label>
          <label>
            <div className="directory-wrapper">
              <span className="hci-uploads-url">{ util.hciUploadsUrl('/') }</span>
              <input type="text" disabled className="directory"
                     placeholder="path/to/directory"
                     value={ column.defaultDirectory }
                     />
            </div>
          </label>
        </div>
      </div>
    );
  }
});
