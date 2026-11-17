# Cloudflare on OpenOrange

An experiment: does a Worker that Alchemy builds run as is on [OpenOrange](https://github.com/rivet-dev/open-orange), Rivet's open-source runtime for the Cloudflare Workers API? `GET /:name` bumps a Durable Object counter for `:name` and records the visit in a KV namespace.

There is no OpenOrange provider. Alchemy builds the Worker, a hand-written `wrangler.jsonc` describes its two bindings, and `orange dev` runs it on Rivet Actors.

## Run locally

Start at the repository root; run subsequent commands from the example directory.

```sh
pnpm install
cd examples/cloudflare-openorange
pnpm dev
```

Once Alchemy prints the Worker URL, stop it. It has written the bundle to `.alchemy/bundles/`. Then:

```sh
pnpm orange
```

That copies the bundle to `dist/` and runs `orange dev` on port 8787. With the fix from [rivet-dev/open-orange#43](https://github.com/rivet-dev/open-orange/pull/43) (see [Known issue](#known-issue)):

```sh
curl localhost:8787/alice
# {"name":"alice","count":1,"previous":null}
curl localhost:8787/alice
# {"name":"alice","count":2,"previous":"alice"}
curl localhost:8787/bob
# {"name":"bob","count":1,"previous":"alice"}
```

## Known issue

On open-orange 1.0.3 every request returns 500 and the actor logs `DurableObjectState.container is not implemented`. Alchemy's Durable Object wrapper copies `ctx.container`, and OpenOrange throws on that read for a class without a container, where Cloudflare returns `undefined`. Fix: [rivet-dev/open-orange#43](https://github.com/rivet-dev/open-orange/pull/43).
