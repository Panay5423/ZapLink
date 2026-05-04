import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "../../../../environments/environment";
import { NotificationService } from "../social/Notification-services/notification.service";

@Injectable({ providedIn: 'root' })
export class SocketService {
    private baseUrl = environment.BaseAPiURL;
    private socket!: Socket;

    constructor(private notificationService: NotificationService) { }

    SocketConnetion(userId: string) {

        console.log("socket service", userId)
        console.log("base url", this.baseUrl)
        this.socket = io(this.baseUrl)
        console.log("socket", this.socket)


        this.socket.on('connect', () => {
            console.log('Connected to web-Socket', this.socket.id);

            this.socket.emit("INIT", { userId })
            this.socket.on("reply", (data) => {
                console.log("reply", data)

                this.socket.on("Notification", (data) => {
                    console.log("Notification received:", data);
                    if (data && data.message) {
                        this.notificationService.show(data.message, data.from, 'info');
                    }
                })
            })
        })

    }

    getSocket(): Socket {
        return this.socket;
    }
}