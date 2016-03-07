import {run} from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';

import app from './src/app';


const drivers = {
  DOM: makeDOMDriver('.app')
};

const {sinks, sources} = run(app, drivers);

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => {
    console.log(sinks, ' jjjj');
    sinks.dispose();
    sources.dispose();
  });
}
