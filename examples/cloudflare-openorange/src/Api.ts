import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Effect from "effect/Effect";
import { HttpServerRequest } from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import Counter from "./Counter.ts";
import { Visits } from "./KV.ts";

export default class Api extends Cloudflare.Worker<Api>()(
  "Api",
  { main: import.meta.url },
  Effect.gen(function* () {
    const counters = yield* Counter;
    const visits = yield* Cloudflare.KV.ReadWriteNamespace(Visits);

    return {
      // /:name — bump the Counter object for :name and record the visit in Visits
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;
        const name = new URL(request.url, "http://localhost").pathname.slice(1) || "lobby";
        const count = yield* counters.getByName(name).increment();
        const previous = yield* visits.get("last");
        yield* visits.put("last", name);
        return yield* HttpServerResponse.json({ name, count, previous });
      }).pipe(
        Effect.catchTag("NamespaceError", (error) =>
          Effect.succeed(HttpServerResponse.text(error.message, { status: 500 })),
        ),
      ),
    };
  }).pipe(Effect.provide(Cloudflare.KV.ReadWriteNamespaceBinding)),
) {}
