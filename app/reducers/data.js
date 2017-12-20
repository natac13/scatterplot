import {
  GET_DATA,
} from 'Constants/';


const initialState = { chartData: undefined };


export default function dataReducer(state = initialState, action) {
  switch (action.type) {
    case GET_DATA:
      return Object.assign({}, state, { chartData: action.payload });
    default:
      return state;
  }
}
