import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

class SocketService {
    private socket: Socket | null = null;

    connect(): Socket {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                autoConnect: true,
            });

            this.socket.on('connect', () => {
                console.log('✅ Conectado ao servidor Socket.io:', this.socket?.id);
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Desconectado do servidor Socket.io');
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Erro de conexão Socket.io:', error);
            });
        }

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('🔌 Socket.io desconectado manualmente');
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    onNovaNotificacao(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('nova_notificacao', callback);
        }
    }

    onNovaMensagem(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('nova_mensagem', callback);
        }
    }

    removeListener(event: string): void {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export default new SocketService();
