import { game } from "./Game";
import { Net } from "./Net";

//消息中心
export class MessageCenter {

    private static _instance: MessageCenter;

    static get i() {
        return MessageCenter._instance || (MessageCenter._instance = new MessageCenter());
    }
    start() {

        Net.on("getRoomDataBack", (args) => {
            //用户列表
            let players = args.players;
            let jumpNextScene = players.length == 1;
            game.roomID = args.roomID;
            //初始化用户信息
            for (let i = 0; i < players.length; i++) {
                let playerName = players[i];
                if (playerName == game.ownPlayer.name) {
                    game.ownPlayer.index = i;
                }
            }
            players.length = 3;
            game.rightPlayer.index = (game.ownPlayer.index + 1) % 3;
            game.rightPlayer.name = players[game.rightPlayer.index] || null;
            game.leftPlayer.index = (game.ownPlayer.index + 2) % 3;
            game.leftPlayer.name = players[game.leftPlayer.index] || null;

            //消息广播
            message.emit("getRoomDataBack");

        });
    }
}
//简陋消息派发器
export var message = {

    map: {},

    on(type: string, callback: Function) {

        this.map[type] || (this.map[type] = []);

        this.map[type].push(callback);
    },
    emit(type: string, args: any = null) {
        if (this.map[type]) {
            for (let callback of this.map[type]) {
                callback.call(null, args);
            }
        }
    },
    delete(type: string, callback: Function) {
        if (this.map[type]) {
            let index = this.map[type].indexof(callback);
            if (~index) {
                this.map[type].splice(index, 1);
            }

        }
    }
}
