// Minimal Edge-safe stub for @supabase/realtime-js to prevent
// Edge runtime bundling warnings. Realtime is not used in middleware.

type UnknownArgs = unknown[];

export class RealtimeClient {
  constructor(..._args: UnknownArgs) {}
  connect() {}
  disconnect() {}
}

export class RealtimeChannel {}

export default RealtimeClient;

