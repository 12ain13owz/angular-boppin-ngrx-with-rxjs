import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  NEVER,
  Observable,
  Subject,
  Subscription,
  catchError,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

export interface AppState {
  limit: number;
  offset: number;
  pokemons: any[];
}

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private state = new BehaviorSubject<AppState>({
    limit: 10,
    offset: 0,
    pokemons: [],
  });

  private increaseLimitAction = new Subject<number>();
  private decreaseLimitAction = new Subject<number>();
  private increaseOffsetAction = new Subject<number>();
  private decreaseOffsetAction = new Subject<number>();

  private loadPokemonAction = new Subject<void>();
  private loadedPokemonSuccessAction = new Subject<any[]>();
  private loadedPokemonErrorAction = new Subject<any>();

  limit$ = this.createSelector((state) => state.limit);
  offset$ = this.createSelector((state) => state.offset);
  pokemons$ = this.createSelector((state) => state.pokemons);

  constructor(private http: HttpClient) {
    this.createEffect(
      this.loadPokemonAction.pipe(
        withLatestFrom(this.limit$, this.offset$),
        switchMap(([_, limit, offset]) => {
          return this.http
            .get<any>(
              `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
            )
            .pipe(
              catchError((error) => {
                this.loadedPokemonErrorAction.next(error);
                return NEVER;
              })
            );
        }),
        tap((response) => {
          this.loadedPokemonSuccessAction.next(response.results);
        })
      )
    );

    this.createEffect(
      this.loadedPokemonErrorAction.pipe(
        tap((error) => {
          console.error(error);
        })
      )
    );

    this.createReducer(this.loadedPokemonSuccessAction, (state, pokemons) => {
      state.pokemons = pokemons;
      return state;
    });

    this.createReducer(this.increaseLimitAction, (state, limit) => {
      state.limit += limit;
      return state;
    });

    this.createReducer(this.decreaseLimitAction, (state, limit) => {
      state.limit -= limit;
      return state;
    });

    this.createReducer(this.increaseOffsetAction, (state, limit) => {
      state.offset += limit;
      return state;
    });

    this.createReducer(this.decreaseOffsetAction, (state, limit) => {
      state.offset -= limit;
      return state;
    });
  }

  increaseLimit(limit: number) {
    this.increaseLimitAction.next(limit);
  }

  decreaseLimit(limit: number) {
    this.decreaseLimitAction.next(limit);
  }

  increaseOffset(limit: number) {
    this.increaseOffsetAction.next(limit);
  }

  decreaseOffset(limit: number) {
    this.decreaseOffsetAction.next(limit);
  }

  loadPokemmon() {
    this.loadPokemonAction.next();
  }

  private createSelector<T>(selector: (state: AppState) => T): Observable<T> {
    return this.state.pipe(
      map(selector),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private createReducer<T>(
    action$: Observable<T>,
    accumulator: (state: AppState, action: T) => AppState
  ) {
    action$.subscribe((action) => {
      const state = { ...this.state.value };
      const newState = accumulator(state, action);
      this.state.next(newState);
    });
  }

  private createEffect<T>(effect$: Observable<T>): Subscription {
    return effect$.subscribe();
  }
}
