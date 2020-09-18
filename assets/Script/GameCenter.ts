import { game } from "./Game";
import { message, MessageCenter } from "./MessageCenter";
import { Net } from "./Net";
import { getRndUser } from "./Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCenter extends cc.Component {

    start() {
        MessageCenter.i.start();
        message.on("getRoomDataBack", () => {
            if (cc.director.getScene().name == "gamecenter") {
                cc.log("gamecenter 收到消息 跳转场景 gamescene");
                cc.director.loadScene("gamescene");
            }
        });
    }
    click_automatch() {
        let user = getRndUser();
        game.ownPlayer.name = user;
        cc.log(`${user} 请求进入游戏`);
        Net.emit("enterGame", { user: user });
    }
    // update (dt) {}
}
