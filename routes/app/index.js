'use strict';

const _               = require('underscore');
const async           = require('async');
const React           = require('react');
const ReactDOMServer  = require('react-dom/server');
const ReactRouter     = require('react-router');
const RouterContext   = require('react-router').RouterContext;
const router          = require('express').Router();
const request         = require('request');
const createStore     = require('redux').createStore;
const combineReducers = require('redux').combineReducers;
const Provider        = require('react-redux').Provider;

const reactRoutes  = require('./react-routes');
const AppComponent = require('../../components/app.jsx');
const CreateModelComponent = require('../../components/model/create.jsx').component;
const componentsReducer    = require('../../components/reducer');

const API_URL = process.env.ROOT_URL + '/api';

// const DATA_TYPES = require('../../server/models/data-types.json');
// const DATA_TYPE_LABELS = _.keys(DATA_TYPES).sort();

module.exports = router;

router.get('/', (req, res, next) => {
  let url = `${API_URL}/models/schemas`;
  request.get(url, (err, response, body) => {
    if (err) return next(err);
    const initialState = {
      models: JSON.parse(body),
      noReact: true
    };
    return res.render('app/index', { initialState });
  });
});

router.get('/create', (req, res, next) => {
  let url = `${API_URL}/models/schemas`;
  request.get(url, (err, response, body) => {
    if (err) return next(err);

    const json = JSON.parse(body);
    const models = _.values(json).sort((a, b) => {
      return a.displayName.localeCompare(b.displayName);
    });

    const state = {
      components: {
        createModelComponent: {
          createMode: true,
          models // TODO: <-- pull this out of the initial state for the component
                 // and figure out how to get it from the models state object
        }
      }
    };

    const store = createStore(combineReducers({
      components: componentsReducer
    }), state);
    const initialState = store.getState();

    ReactRouter.match({
      location: req.url,
      routes: reactRoutes
    }, (err, redirectLocation, props) => {
      const markup = ReactDOMServer.renderToString(
        <Provider store={ store }>
          <RouterContext {...props} />
        </Provider>
      );
      return res.render('app/create', { initialState, markup });
    });
  });
});

router.get('/:model/create', (req, res, next) => {
  const modelName = req.params.model;
  getLoadSchemaParallelFn(modelName)((err, parentModel) => {
    if (err) return next(err);

    const fns = _.map(parentModel.references, (reference) => {
      return getLoadSchemaParallelFn(reference.foreignTable);
    });

    async.parallel(fns, (err, model) => {
      if (err) return next(err);

      for (let i = 0; i < parentModel.references.length; i++) {
        // attach the loaded model to the reference
        // object
        parentModel.references[i].foreignModel = model[i];
      }

      const state = {
        components: {
          createRowComponent: {
            createMode: true,
            columns: parentModel.columns
          }
        }
      };

      const store = createStore(combineReducers({
        components: componentsReducer
      }), state);
      const initialState = store.getState();
      ReactRouter.match({
        location: req.url,
        routes: reactRoutes
      }, (err, redirectLocation, props) => {
        const markup = ReactDOMServer.renderToString(
          <Provider store={ store }>
            <RouterContext {...props} />
          </Provider>
        );
        return res.render('app/row/create', { initialState, markup })
      });


      // return res.render('app/row/create', {
      //   model: parentModel,
      //   createMode: true
      // });
    });
  });
});

// =====================================
// const _       = require('underscore');
// const async   = require('async');
// const request = require('request');
// const router  = require('express').Router();
// const path    = require('path');
// const qs      = require('querystring');
//
// const API_URL = process.env.ROOT_URL + '/api';
// const DATA_TYPES = require('../../server/models/data-types.json');
// const DATA_TYPE_LABELS = _.keys(DATA_TYPES).sort();
//
// const ROW_LIMIT = 20;
//
// router.get('/', (req, res, next) => {
//   let url = API_URL + '/models/schemas';
//   request.get(url, (err, response, body) => {
//     if (err) { return next(err); }
//
//     res.render('models/index', {
//       models: JSON.parse(body)
//     });
//   });
// });
//
// router.get('/create', (req, res, next) => {
//   let url = `${API_URL}/models/schemas`;
//   request.get(url, (err, response, body) => {
//     if (err) { return next(err); }
//
//     let json = JSON.parse(body);
//     let models = _.values(json).sort((a, b) => {
//       return a.displayName.localeCompare(b.displayName);
//     });
//
//     res.render('models/create', {
//       models: models,
//       dataTypes: DATA_TYPES,
//       dataTypeLabels: DATA_TYPE_LABELS
//     });
//   });
// });
//
// router.post('/:model', (req, res, next) => {
//   let modelName = req.params.model;
//   let url = `${API_URL}/models/${modelName}`;
//
//   request.post({url: url, form: req.body}, (err, response, body) => {
//     if (err) { return next(err); }
//     return res.json(_.extend(JSON.parse(body), {
//       redirectUrl: `/models/${modelName}`
//     }));
//   });
// });
//
// router.get('/:model/row/:id', (req, res, next) => {
//   let id = req.params.id;
//   let modelName = req.params.model;
//   // row, schema
//   async.parallel({
//     row: (callback) => {
//       let url = `${API_URL}/models/${modelName}/row/${id}`;
//       request.get(url, (err, response, body) => {
//         if (err) { return callback(err); }
//         return callback(null, JSON.parse(body));
//       });
//     },
//     schema: getLoadSchemaParallelFn(modelName)
//   }, (err, data) => {
//     if (err) return next(err);
//
//     const schema = data.schema;
//
//     // after loading the schema, we also need to load each of
//     // the reference table schemas
//     const fns = _.map(schema.references, (reference) => {
//       return getLoadSchemaParallelFn(reference.foreignTable);
//     });
//
//     async.parallel(fns, (err, schemas) => {
//       if (err) return next(err);
//
//       for (let i = 0; i < schema.references.length; i++) {
//         schema.references[i].foreignSchema = schemas[i];
//       }
//       res.render('models/row/edit', data);
//     });
//   });
// });
//
// router.put('/:model/row/:id', (req, res, next) => {
//   let id = req.params.id;
//   let modelName = req.params.model;
//
//
//   let url = `${API_URL}/models/${modelName}/row/${id}`;
//   request.put({url: url, form: req.body}, (err, response, body) => {
//     if (err) { return next(err); }
//     return res.json(_.extend(JSON.parse(body), {
//       redirectUrl: `/models/${modelName}`
//     }));
//   });
// });
//
// router.get('/:model/:page?', (req, res, next) => {
//   let page = req.params.page || 1;
//   let query = qs.stringify({
//     page: page,
//     limit: ROW_LIMIT
//   });
//
//   let modelName = req.params.model;
//
//   // rows, schema
//   async.parallel({
//     rows: (callback) => {
//       let url = `${API_URL}/models/${modelName}?${query}`;
//       request.get(url, (err, response, body) => {
//         if (err) { return callback(err); }
//
//         let rows = JSON.parse(body);
//         return callback(null, rows);
//       });
//     },
//     schema: getLoadSchemaParallelFn(modelName)
//   }, (err, data) => {
//     if (err) { return next(err); }
//     return res.render('models/rows', data);
//   });
// });
//
router.post('/models', (req, res, next) => {
  let url = `${API_URL}/models`;
  request.post({ url: url, form: req.body }, (err, response, body) => {
    if (err) { return next(err); }
    res.json({
      redirectUrl: '/'
    });
  });
});

function getLoadSchemaParallelFn(schema) {
  return (callback) => {
    let url = `${API_URL}/models/schemas/${schema}`;
    request.get(url, (err, response, body) => {
      if (err) { return callback(err); }

      let schema = JSON.parse(body);
      return callback(null, schema);
    });
  };
}
