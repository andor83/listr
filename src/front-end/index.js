// import react and components
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Listr from './components/listr';
 
const  store = createStore();

const App = () => (
  <Provider store={store}> 
	<MuiThemeProvider>
		<Listr />
	</MuiThemeProvider>
  </Provider>
);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);