import { game } from "./Game";
import { message } from "./MessageCenter";
import { Net } from "./Net";
import OwnHandCon from "./OwnHandCon";
import { DDZ_POKER_TYPE, paiTool } from "./Utils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MenuPlay extends cc.Component {


    @property(OwnHandCon)
    ownHandCon:OwnHandCon = null;

    @property(cc.Node)
    btn_buchu:cc.Node = null;
    @property(cc.Node)
    btn_tishi:cc.Node = null;
    @property(cc.Node)
    btn_chupai:cc.Node = null;

    buchu() {

        Net.emit('buchu', JSON.stringify({
            playerIndex: game.ownPlayer.index,
            roomNum: game.roomID
        }));
        this.node.active = false;

        message.emit("clearClock");
    }
    tishi() {
        if(game.ailist.length){
            let pais = game.ailist[game.ai_index++];
            //this.own_hand.moveUpPokers(pais);
            game.ai_index = game.ai_index % game.ailist.length;
            this.ownHandCon.pokerMoveUp(pais);
        }
    }
    chupai() {

        let playPokers = this.ownHandCon.getAllPlayPokers();

        if (!playPokers || !playPokers.length) return;
        //目前只能单牌
        let thisType = 0;
        let pais: number[] = [];
        for (let i = 0; i < playPokers.length; i++) {
            pais.push(playPokers[i].card.card);
        }
        let partern = paiTool.getCardPattern(pais);

        if (partern.type == DDZ_POKER_TYPE.DDZ_PASS) {
            cc.log("牌型不合法", pais, "\n", paiTool.paisToGrades(pais));
            return;
        }
        //存在上一手牌进行比较
        if (game.lastPokers.length) {

            let lastPartern = paiTool.getCardPattern(game.lastPokers);

            let result = paiTool.compare(lastPartern, partern);

            if (result === partern) {

            } else {
                cc.log("要不起！");
                return;
            }
        }
        Net.emit('chupai', JSON.stringify(
            {
                pokers: partern.pais,
                cardsType: thisType,
                roomNum: game.roomID,
                playerIndex: game.ownPlayer.index
            }
        ));
        message.emit("clearClock");
    }
    setMenu(buchu ,tishi ,chupai ){
        this.btn_buchu.active  = buchu;
        this.btn_tishi.active  = tishi;
        this.btn_chupai.active  = chupai;
    }
}
