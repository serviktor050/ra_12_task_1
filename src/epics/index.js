import { ofType } from "redux-observable";
import { ajax } from "rxjs/ajax";
import {
  map,
  tap,
  retry,
  debounceTime,
  switchMap,
  catchError,
} from "rxjs/operators";
import {
  CHANGE_SEARCH_FIELD,
  SEARCH_SKILLS_REQUEST,
} from "../actions/actionTypes";
import {
  searchSkillsRequest,
  searchSkillsSuccess,
  searchSkillsFailure,
  emptySearchField,
} from "../actions/actionCreator";
import { of } from "rxjs";

export const changeSearchEpic = (action$) =>
  action$.pipe(
    ofType(CHANGE_SEARCH_FIELD),
    map((o) => {
      return o.payload.search.trim();
    }),
    debounceTime(100),
    map((o) => searchSkillsRequest(o))
  );

export const searchSkillsEpic = (action$) =>
  action$.pipe(
    ofType(SEARCH_SKILLS_REQUEST),
    map((o) => o.payload.search),
    tap((o) => console.log(o)),
    switchMap((o) => {
      if (o === "") {
        return of(emptySearchField());
      } else {
        const params = new URLSearchParams({ q: o });
        return ajax
          .getJSON(
            `https://ra-12-task-1-server.herokuapp.com/api/search?${params}`
          )
          .pipe(
            retry(3),
            map((o) => searchSkillsSuccess(o)),
            catchError((e) => of(searchSkillsFailure(e)))
          );
      }
    })
  );
