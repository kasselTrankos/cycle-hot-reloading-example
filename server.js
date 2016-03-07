import budo from 'budo';
import {run} from '@cycle/core';
import babelify from 'babelify';
import hotModuleReloading from 'browserify-hmr';
import browserify from 'browserify';
import {ReplaySubject, Observable} from 'rx';
import {html, head, title, makeHTMLDriver,
  body, script, div, input, p} from '@cycle/dom';
import app from './src/app';
import url from 'url';
const  wrapAppResultWithBoilerplate = (appFn, context$, bundle$)=> {
  return  (sources) =>{
    let vtree$ = appFn().DOM;
    let wrappedVTree$ = Observable.combineLatest(vtree$, context$, bundle$,
      wrapHtml
    );
    return {
      DOM: wrappedVTree$
    };
  };
}
const wrapHtml = (vtree, context, clientBundle)=>{

  return (
    html([
      head([title('isomorphic cycle')]),
      body([
        div('.app', [vtree]),
        //script(`window.appContext = ${serialize(context)};`),
        script(clientBundle)
      ])
    ])
  );
}
const main  =()=>{
  const sinks = {
    DOM: Observable.just(false)
      .map(toggled =>
        div([
          input({type: 'checkbox'}), 'Toggle me',
          p(toggled ? 'ON' : 'off')
        ])
      )
  };
  return sinks;
}
/// aplicando programacion reactiva q es la osti..
//primero usamos los componentes de cycle para generar el bundle.
/// quizas mejor en carpeta
let clientBundle$ = (() => {
  let replaySubject = new ReplaySubject(1);
  let bundleString = '';
  let bundleStream = browserify()
    .transform('babelify')
    //.transform({global: true}, 'uglifyify')
    .add('./index.js')
    .bundle();
  bundleStream.on('data', function (data) {
    bundleString += data;
  });
  bundleStream.on('end', function () {
    replaySubject.onNext(bundleString);
    replaySubject.onCompleted();
    console.log('Client bundle successfully compiled.');
  });
  return replaySubject;
})();
const prependHTML5Doctype = (html)=> {
  return `<!doctype html>${html}`;
}
//console.log(wrappedAppFn);

budo('./index.js', {
  serve: 'bundle.js',
  live: '*.{css,html}',
  port: 8000,
  stream: process.stdout,
  defaultIndex: (params, req)=>{
    console.log(req);
  },
  middleware: function (req, res, next) {
    if (url.parse(req.url).pathname === '/') {
      let context$ = Observable.just({route: req.url});
      res.statusCode = 200;
      let wrappedAppFn = wrapAppResultWithBoilerplate(app, context$, clientBundle$);
      let {sources} = run(wrappedAppFn, {
        DOM: makeHTMLDriver(),
        context: () => context$
      });

      let html$ = sources.DOM.map(prependHTML5Doctype);

      html$.subscribe(html => res.end(html));
    } else {
      // fall through to other routes
      next()
    }
  },
  browserify: {
    transform: babelify,
    plugin: hotModuleReloading
  }
});
