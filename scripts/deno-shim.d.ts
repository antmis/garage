// Typecheck-only stand-in for the Deno globals the Edge Function uses, so `npm run typecheck:functions` works
// without Deno installed. The real runtime is Supabase's Deno edge runtime.
declare namespace Deno {
  export const env: { get(name: string): string | undefined }
  export function serve(handler: (req: Request) => Response | Promise<Response>): void
}
