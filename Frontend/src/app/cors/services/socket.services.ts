import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class SocketService {
    private socket: Socket;
    constructor() {
        this.socket = io(environment.BaseAPiURL);
    }
    connect() {
        this.socket.connect();
    }
    disconnect() {
        this.socket.disconnect();
    }
    on(event: string, callback: (data: any) => void) {
        this.socket.on(event, callback);
    }
    emit(event: string, data: any) {
        this.socket.emit(event, data);
    }
}