// Minimal runtime declarations solely for checking the self-contained Edge Function with tsc.
declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (request: Request) => Promise<Response>): void };
interface ImportMeta { main?: boolean }
