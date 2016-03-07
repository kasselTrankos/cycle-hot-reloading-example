import budo from 'budo';
import babelify from 'babelify';
import hotModuleReloading from 'browserify-hmr';
import browserify from 'browserify';
import {ReplaySubject} from 'rx';

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
/*

budo('./index.js', {
  serve: 'bundle.js',
  live: '*.{css,html}',
  port: 8000,
  stream: process.stdout,
  browserify: {
    transform: babelify,
    plugin: hotModuleReloading
  }
});
*/
