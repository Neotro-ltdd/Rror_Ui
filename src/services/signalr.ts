import * as signalR from '@microsoft/signalr';
import type { RorrLog } from '../types/rorr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private listeners: Array<(log: RorrLog) => void> = [];

  public startConnection(onConnected?: () => void) {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/telemetry', {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.on('ReceiveLog', (log: RorrLog) => {
      this.listeners.forEach((callback) => callback(log));
    });

    const connectWithRetry = () => {
      if (!this.connection) return;
      if (this.connection.state === signalR.HubConnectionState.Connected) return;

      this.connection
        .start()
        .then(() => {
          if (onConnected) onConnected();
        })
        .catch(() => {
          // Retry connecting if backend API was temporarily restarting
          setTimeout(connectWithRetry, 3000);
        });
    };

    connectWithRetry();
  }

  public subscribeToProject(projectCode: string) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('SubscribeToProject', projectCode).catch(console.error);
    }
  }

  public unsubscribeFromProject(projectCode: string) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('UnsubscribeFromProject', projectCode).catch(console.error);
    }
  }

  public subscribeToGlobal() {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('SubscribeToGlobal').catch(console.error);
    }
  }

  public onLogReceived(callback: (log: RorrLog) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();
