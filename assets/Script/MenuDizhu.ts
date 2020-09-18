
import { game } from "./Game";
import { Net } from "./Net";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MenuDizhu extends cc.Component {

    @property(cc.Label)
    lab_nocatch: cc.Label = null;

    @property(cc.Label)
    lab_catch: cc.Label = null;

    //刷新 不叫|不抢 |叫地主 | 抢地主
    updateFirst(first: boolean) {
        this.lab_nocatch.string = first ? "不叫" : "不抢";
        this.lab_catch.string = first ? "叫地主" : "抢地主";
    }
    click_nocatch() {
        let mes = { playerIndex: game.ownPlayer.index, roomNum: game.roomID, qiangdizhu: false };
        Net.emit('qiangdizhu', JSON.stringify(mes));
        this.node.active = false;
    }
    click_catch() {
        let mes = { playerIndex: game.ownPlayer.index, roomNum: game.roomID, qiangdizhu: true };
        Net.emit('qiangdizhu', JSON.stringify(mes));
        this.node.active = false;
    }
}
