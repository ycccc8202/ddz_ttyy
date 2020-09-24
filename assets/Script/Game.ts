import { message } from "./MessageCenter";
import { Net } from "./Net";
import Poker from "./Poker";
import { getAIFreeList, getAIList } from "./Utils";

export enum PokerShowType {
    OWNER = 1,
    LEFT = 2,
    RIGHT = 3
}
export enum OPERATION_STATUS { // 用户操作状态
    READY = 0,//选择准备
    SELECT_DIZHU = 1, //选地主
    SELECT_FREE = 2,//自由出牌
    SELECT_PREV = 3 // 上家有出牌
}

export var game = {
    server: "http://192.168.31.224:3000",
    //ownName:"",
    roomID: "",
    ownPlayer: { name: '', index: 0, pokers: null, ready: false },
    rightPlayer: { name: '', index: 0, ready: false },
    leftPlayer: { name: '', index: 0, ready: false },
    dizhu: 0,//地主序号
    pokerSpriteFrameMap: {},
    lastPokers: [],//上一家出牌
    ailist: [],//提示列表
    ai_index: 0,
    operation_status: OPERATION_STATUS.READY,

    auto: {
        pass: true, //自动要不起操作
        AIPush: true, //自动ai出牌
        pushDelay: 3 // 自动出牌延时
    },
    roundReset() {
        this.lastPokers = [];
        this.ailist = [];
        this.ai_index = 0;
        this.ownPlayer.pokers = null;
        this.dizhu = 0;
        this.ownPlayer.ready = this.rightPlayer.ready = this.leftPlayer.ready = false;
    },
    setPokerSpriteFrameMap(key: string, value: cc.SpriteFrame) {
        this.pokerSpriteFrameMap[key] = value;
    },
    getPokerSpriteFrameMap(key: string) {
        return this.pokerSpriteFrameMap[key];
    },
    //判断是否能出牌,同时更新提示列表
    checkPush() {
        if (this.lastPokers.length) this.ailist = getAIList(game.ownPlayer.pokers, game.lastPokers);
        game.ai_index = 0;
        return this.ailist.length > 0;
    },
    autoOperation() {//自动操作

        switch (this.operation_status) {

            case OPERATION_STATUS.READY:

                //判断当前的准备状态
                if (!this.ownPlayer.ready) {
                    message.emit("click_ready");
                }
                break;
            case OPERATION_STATUS.SELECT_DIZHU:

                //随机抢地主
                
                message.emit(Math.random()<.5 ? "click_catch" : "click_nocatch");

                break;

            case OPERATION_STATUS.SELECT_FREE:

                let pokers = getAIFreeList(game.ownPlayer.pokers);

                Net.emit('chupai', JSON.stringify(
                    {
                        pokers: pokers,
                        cardsType: 0,
                        roomNum: game.roomID,
                        playerIndex: game.ownPlayer.index
                    }
                ));

                break;
            case OPERATION_STATUS.SELECT_PREV:
                Net.emit('chupai', JSON.stringify(
                    {
                        pokers: game.ailist[0],
                        cardsType: 0,
                        roomNum: game.roomID,
                        playerIndex: game.ownPlayer.index
                    }
                ));
                break;
        }
    }
}
export function getCacheSpriteFrame(name: string): cc.SpriteFrame {
    let asset = null;
    cc.assetManager.assets.forEach((value, key) => {
        if (value.name == name) {
            asset = value;
            return;
        }
    })
    return asset;
}
export var pools = {

    poker_pool: new cc.NodePool("Poker"),

    poker_get(pb: cc.Prefab) {

        if (pools.poker_pool.size()) {
            return pools.poker_pool.get();
        } else {
            return cc.instantiate(pb);
        }
    },
    poker_put(node: cc.Node) {
        pools.poker_pool.put(node);
    },
}
