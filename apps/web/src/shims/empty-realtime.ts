// Minimal Edge-safe stub for @supabase/realtime-js to prevent
// Edge runtime bundling warnings. Realtime is not used in middleware.

type UnknownArgs = unknown[];

export class RealtimeClient {
  constructor(..._args: UnknownArgs) {}
  connect() {}
  disconnect() {}
  // Supabase client may call this to update the JWT for realtime; no-op in Edge.
  setAuth(_token?: string) {}
  // Defensive no-ops for potential calls
  removeAllChannels() {}
  getChannels() { return []; }
}

export class RealtimeChannel {}

export default RealtimeClient;

