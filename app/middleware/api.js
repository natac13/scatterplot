import axios from 'axios';

import {
  GET_DATA,
} from '../constants/';

export const CALL_API = Symbol('Call API');


function actionWith(action, extra) {
  const finalAction = Object.assign({}, action, extra);
  delete finalAction[CALL_API];
  return finalAction;
}


function fetch() {
  const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
  return axios.get(url)
    .then((response) => response.data);
}


// Api Middleware itself
export default ({ dispatch, getState }) => (next) => (action) => {
  const callAPI = action[CALL_API];

  // pass to next middleware if normal action and not a CALL_API action
  if (typeof callAPI === 'undefined') {
    return next(action);
  }
  const { type } = action;
/* ====================================
  =            Source Data            =
=====================================*/

  if (type === GET_DATA) {
    const fetchPromise = fetch();
    return fetchPromise.then((response) => (
      next(actionWith(action, { payload: response }))
    ));
  }

/* =====  End of Security API  ======*/

  return next(action);
};
