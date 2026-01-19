import { buildApp } from "./app";

async function start(): Promise<void> {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 8787);
  await app.listen({ port, host: "127.0.0.1" });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
