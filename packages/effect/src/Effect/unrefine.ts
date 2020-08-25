import * as C from "../Cause"
import { identity, pipe } from "../Function"
import * as O from "../Option/core"
import { catchAllCause_ } from "./catchAllCause_"
import { halt } from "./core"
import type { Effect } from "./effect"
import { fail } from "./fail"

/**
 * Takes some fiber failures and converts them into errors.
 */
export function unrefine<E1>(pf: (u: unknown) => O.Option<E1>) {
  return <S, R, E, A>(fa: Effect<S, R, E, A>) => unrefine_(fa, pf)
}

/**
 * Takes some fiber failures and converts them into errors.
 */
export function unrefine_<S, R, E, A, E1>(
  fa: Effect<S, R, E, A>,
  pf: (u: unknown) => O.Option<E1>
) {
  return unrefineWith_(fa, pf, identity)
}

/**
 * Takes some fiber failures and converts them into errors, using the
 * specified function to convert the `E` into an `E1 | E2`.
 */
export function unrefineWith<E1>(pf: (u: unknown) => O.Option<E1>) {
  return <E, E2>(f: (e: E) => E2) => <S, R, A>(fa: Effect<S, R, E, A>) =>
    unrefineWith_(fa, pf, f)
}

/**
 * Takes some fiber failures and converts them into errors, using the
 * specified function to convert the `E` into an `E1 | E2`.
 */
export function unrefineWith_<S, R, E, E1, E2, A>(
  fa: Effect<S, R, E, A>,
  pf: (u: unknown) => O.Option<E1>,
  f: (e: E) => E2
) {
  return catchAllCause_(
    fa,
    (cause): Effect<S, R, E1 | E2, A> =>
      pipe(
        cause,
        C.find(pf),
        O.fold(() => pipe(cause, C.map(f), halt), fail)
      )
  )
}
