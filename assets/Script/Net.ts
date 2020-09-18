// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { connect } from "socket.io-client"
import { message } from "./MessageCenter";

export var Net = {
    socket: null,
    connect(server:string) {
        this.socket = connect(server);
        this.socket.on("connect", (e) => {
            cc.log("socket connect success!", (<SocketIOClient.Socket>this.socket).io.uri);
            message.emit("connect");
        })
        this.socket.on("disconnect", () => {
            cc.log("socket disconnect!");
        })

        this.socket.on("connect_error", (e) => {
            cc.log("socket connect_error!");
        })
    },
    on(type: string, callback: Function) {
        if (this.socket)
            this.socket.on(type, arg => {
                cc.log(`收到消息:${type} ==> ${arg ? JSON.stringify(arg) : '无参数'}`);
                callback && callback(arg);
            })
    },
    emit(type: string, arg: any) {
        if (this.socket) {
            cc.log(`发送消息:${type} ==> ${JSON.stringify(arg)}`);
            this.socket.emit(type,arg);
        }
    }
}
//export var socket:SocketIOClient.Socket = null;