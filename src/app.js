import {Observable} from 'rx';
import {div, p} from '@cycle/dom';

export default function App () {
  return {
    DOM: Observable.just(
      div('.hello-world', [
        p('bienvebnid a mi worldp desde casa')
      ])
    )
    //Observable.just(div('.hello-world', 'Change me! 1 and 22 next psisidws'))
  };
}
