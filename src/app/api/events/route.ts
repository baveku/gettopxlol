import { realtime } from '@/lib/realtime';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED', onlineVisitors: realtime.getOnlineVisitors() })}\n\n`)
      );

      unsubscribe = realtime.subscribe((data: string) => {
        controller.enqueue(encoder.encode(data));
      });
    },
    cancel() {
      if (unsubscribe) {
        unsubscribe();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
