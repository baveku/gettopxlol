type ClientCallback = (data: string) => void;

class RealtimeBroadcaster {
  private clients: Set<ClientCallback> = new Set();
  private onlineVisitors: number = 2010;

  constructor() {
    // Random natural variation in online visitors to simulate real-time traffic pulse
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        const delta = Math.floor(Math.random() * 7) - 3;
        this.onlineVisitors = Math.max(150, this.onlineVisitors + delta);
        this.broadcast({
          type: 'VISITOR_UPDATE',
          onlineVisitors: this.onlineVisitors,
        });
      }, 5000);
    }
  }

  public subscribe(callback: ClientCallback): () => void {
    this.clients.add(callback);
    return () => {
      this.clients.delete(callback);
    };
  }

  public broadcast(payload: Record<string, unknown>): void {
    const formatted = `data: ${JSON.stringify(payload)}\n\n`;
    for (const send of this.clients) {
      try {
        send(formatted);
      } catch (err) {
        console.error('SSE client send error:', err);
      }
    }
  }

  public getOnlineVisitors(): number {
    return this.onlineVisitors;
  }
}

export const realtime = new RealtimeBroadcaster();
