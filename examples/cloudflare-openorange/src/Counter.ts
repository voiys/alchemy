import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Effect from "effect/Effect";

export default class Counter extends Cloudflare.DurableObject<Counter>()(
  "Counter",
  Effect.gen(function* () {
    return Effect.gen(function* () {
      const state = yield* Cloudflare.DurableObjectState;

      return {
        increment: () =>
          Effect.gen(function* () {
            const count = ((yield* state.storage.get<number>("count")) ?? 0) + 1;
            yield* state.storage.put("count", count);
            return count;
          }),
      };
    });
  }),
) {}
