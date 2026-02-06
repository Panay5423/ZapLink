import { Injectable } from "@angular/core";
@Injectable({ providedIn: 'root' })

export class Soket {

    private soket!: WebSocket;

    connect(userId: string) {
        if (this.soket)
            return;

        this.soket = new WebSocket("ws://localhost:3000");
        this.soket.onopen = () => {

            console.log("websoket connet from client")

            this.soket.send(JSON.stringify({
                type: 'INIT',
                userId
            }))

        }

        this.soket.onmessage = (event) => {


            console.log("message:", event.data);
        }

    }



}