const _ = require('underscore');
const DATA_TYPES = exports.DATA_TYPES = {
  "string": {
    "type": "STRING"
  },
  "text": {
    "type": "TEXT"
  },
  "integer": {
    "type": "INTEGER"
  },
  "double": {
    "type": "DOUBLE"
  },
  "date": {
    "type": "DATE"
  },
  "boolean": {
    "type": "BOOLEAN"
  },
  "email": {
    "type": "STRING",
    "validate": {
      "isEmail": true
    }
  },
  "url": {
    "type": "STRING",
    "typeArgs": [1024],
    "validate": {
      "isUrl": true
    }
  },
  "file": {
    "type": "STRING",
    "typeArgs": [1024],
    "validate": {
      "is": ["^([\/]uploads)"],
      "notContains": [["..", "./", "~", "!"]]
    }
  }
}

const keys = _.keys(DATA_TYPES).sort();
const DATA_TYPE_LABELS = exports.DATA_TYPE_LABELS = _.map(keys, (key) => {
  const name = key;
  return {
    name,
    displayName: DATA_TYPES[key].displayName || name
  };
});

const HCI_ROOT_URL = exports.HCI_ROOT_URL = 'http://hci.stanford.edu';
const HCI_UPLOADS_URL = exports.HCI_UPLOADS_URL = 'http://hci.st/uploads';
