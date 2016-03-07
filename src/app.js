import {Observable} from 'rx';
import {div, p} from '@cycle/dom';

export default function App () {
  return {
    DOM: (
      div('.hola', [
        p('bienvebnidp')
      ])
    )
    //Observable.just(div('.hello-world', 'Change me! 1 and 22 next psisidws'))
  };
}
