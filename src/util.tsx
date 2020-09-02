import { flow, remove, concat } from "lodash/fp";

export function replace<T>(array: Array<T>, old: T, updated: T): Array<T> {
  return flow(
    remove(e => e === old),
    concat([updated])
  )(array);
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}
