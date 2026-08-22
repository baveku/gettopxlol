type ClientCallback = (data: string) => void;

class RealtimeBroadcaster {
  private clients: Set<ClientCallback> = new Set();

  public subscribe(callback: ClientCallback): () => void {
    this.clients.add(callback);
    // Broadcast live connected count
    this.broadcast({
      type: 'VISITOR_UPDATE',
      onlineVisitors: this.getOnlineVisitors(),
    });

    return () => {
      this.clients.delete(callback);
      this.broadcast({
        type: 'VISITOR_UPDATE',
        onlineVisitors: this.getOnlineVisitors(),
      });
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
    return Math.max(1, this.clients.size);
  }
}

export const realtime = new RealtimeBroadcaster();
