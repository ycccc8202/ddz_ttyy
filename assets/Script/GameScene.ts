
import { game, OPERATION_STATUS } from "./Game";
import Head from "./Head";
import { message } from "./MessageCenter";
import { Net } from "./Net";
import MenuDizhu from "./MenuDizhu";
import MenuPlay from "./MenuPlay";
import { getAIFreeList, paiTool } from "./Utils";
import OwnHandCon from "./OwnHandCon";
import PokerShower from "./PokerShower";
import DipaiShower from "./DipaiShower";
import Clock from "./Clock";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {

    @property(Head)
    head_left: Head = null;
    @property(Head)
    head_right: Head = null;
    @property(Head)
    head_own: Head = null;
    @property(cc.Label)
    label_roomID: cc.Label = null;

    @property(cc.Label)
    label_own_msg: cc.Label = null;
    @property(cc.Label)
    label_left_msg: cc.Label = null;
    @property(cc.Label)
    label_right_msg: cc.Label = null;
    @property(cc.Node)
    btn_ready: cc.Node = null;
    @property(cc.Label)
    btn_ready_text: cc.Label = null;

    @property(cc.Node)
    menu_dizhu: cc.Node = null;
    menu_dizhu_action: MenuDizhu;
    @property(cc.Node)
    menu_play: cc.Node = null;
    menu_play_action: MenuPlay;
    //自己手牌
    @property(cc.Node)
    own_handCon: cc.Node = null;
    own_handCon_action: OwnHandCon;

    @property(PokerShower)
    left_poker_shower: PokerShower = null;
    @property(PokerShower)
    right_poker_shower: PokerShower = null;

    @property(PokerShower)
    own_poker_shower: PokerShower = null;

    @property(DipaiShower)
    dipai_shower: DipaiShower = null;

    @property(Clock)
    clock: Clock = null;

    onLoad() {
        this.clearReady();
        this.menu_dizhu_action = this.menu_dizhu.getComponent<MenuDizhu>(MenuDizhu);
        this.menu_play_action = this.menu_play.getComponent<MenuPlay>(MenuPlay);
        this.own_handCon_action = this.own_handCon.getComponent<OwnHandCon>(OwnHandCon);
    }
    start() {
        paiTool.initMap();
        this.initView();
        this.addEvents();
        this.updateRoomPlayers();
        this.loadRes();
    }
    initView() {
        if (!Net.socket) return;
        this.own_handCon.active = false;
        this.menu_dizhu.active = false;
        this.menu_play.active = false;
        this.dipai_shower.node.active = false;
        this.clearClock();
    }
    //加载扑克资源
    loadRes() {
        cc.resources.load('poker', cc.SpriteAtlas, (err, assets: cc.SpriteAtlas) => {
            let plist: cc.SpriteFrame[] = assets.getSpriteFrames();
            for (let i = 0; i < plist.length; i++) {
                let p: cc.SpriteFrame = plist[i];
                game.setPokerSpriteFrameMap(p.name, p);
            }
            cc.log("扑克资源加载完成");
            //测试
            if (!Net.socket) {
                this.own_handCon_action.updateHandPai([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
                this.left_poker_shower.updateShow([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
                this.right_poker_shower.updateShow([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
                this.own_poker_shower.updateShow([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
                //this.addClock();
                setTimeout(() =>{
                    this.own_handCon_action.clear();
                    this.own_handCon_action.updateHandPai([1, 1,1,1,1,1,1,1,1,1]);
                },5000);


                //牌型测试
                let list = [3,3,3,3,4,4,4,4,5,5,5,5];
                cc.log(">>>>>>>>>>>>> ",list);
                cc.log(">>>>>>>>>>>>> ",getAIFreeList(list));
            }
        })
    }
    updateRoomPlayers() {
        cc.log("刷新房间玩家信息");
        this.label_roomID.string = `房间号:${game.roomID}`;
        this.head_own.updateName(game.ownPlayer.name);
        this.head_own.updateIcon("girl");
        this.head_left.updateName(game.leftPlayer.name || "");
        this.head_left.updateIcon(game.leftPlayer.name ? "girl" : "empty");
        this.head_right.updateName(game.rightPlayer.name || "");
        this.head_right.updateIcon(game.rightPlayer.name ? "girl" : 'empty');

        if (game.ownPlayer.name && game.leftPlayer.name && game.rightPlayer.name) {
            //人满开始显示准备按钮
            this.ready();
        }
    }

    ready() {
        game.operation_status = OPERATION_STATUS.READY;
        this.addClock();
        this.btn_ready.active = true;
        this.btn_ready_text.string = this.label_left_msg.string = this.label_right_msg.string = "未准备";
    }

    updateDizhu(index) {

        if (game.ownPlayer.index == index) this.head_own.updateIcon("boy");
        if (game.rightPlayer.index == index) this.head_right.updateIcon("boy");
        if (game.leftPlayer.index == index) this.head_left.updateIcon("boy");

    }


    updateTurnTip(index) {
        this.head_own.turn_flag.active = index == game.ownPlayer.index;
        this.head_left.turn_flag.active = index == game.leftPlayer.index;
        this.head_right.turn_flag.active = index == game.rightPlayer.index;
    }

    updateMsg(index, msg: string) {

        if (game.ownPlayer.index == index) this.label_own_msg.string = msg;
        if (game.rightPlayer.index == index) this.label_right_msg.string = msg;
        if (game.leftPlayer.index == index) this.label_left_msg.string = msg;

    }
    //刷新剩余牌数
    requestLeftCount() {
        Net.emit('refreshCardsCount', game.roomID);
    }
    //添加时钟
    addClock() {
        if (!game.auto.AIPush) return;
        this.clock.node.active = true;
        this.clock.play(game.auto.pushDelay, () => {
            game.autoOperation();
            this.clearClock();
            this.clearMenu();
        })
    }
    clearMenu(){
        this.btn_ready.active = false;
        this.menu_play.active = false;
        this.menu_dizhu.active = false;
    }

    clearClock() {
        this.clock.node.active = false;
        this.clock.stop();
    }
    addEvents() {
        message.on("getRoomDataBack", () => {
            this.updateRoomPlayers();
        });
        message.on("clearClock",()=>{
            this.clearClock();
        });
        message.on("click_ready",()=>{
            this.click_ready();
        });
        Net.on("readyGame" + game.roomID, data => {
            if (data.roomIndex == game.leftPlayer.index) {
                this.label_left_msg.string = data.ready ? "准备" : "未准备";
                game.leftPlayer.ready = data.ready;
            }
            if (data.roomIndex == game.rightPlayer.index) {
                this.label_right_msg.string = data.ready ? "准备" : "未准备";
                game.rightPlayer.ready = data.ready;
            }
            if (data.roomIndex == game.ownPlayer.index) {
                this.btn_ready_text.string = data.ready ? "准备" : "未准备";
                game.ownPlayer.ready = data.ready;
            }
        });
        Net.on('startGame' + game.roomID, data => {
            this.clearReady();
            //data 是菜单轮选位置
            if (data == game.ownPlayer.index) {
                game.operation_status = OPERATION_STATUS.SELECT_DIZHU;
                this.addClock();
                this.menu_dizhu.active = true;
                this.menu_dizhu_action.updateFirst(true);
            }
            this.dipai_shower.node.active = true;
            //刷新轮到标志
            this.updateTurnTip(data);
            //获取手牌
            Net.emit('getCards', { roomID: game.roomID, index: game.ownPlayer.index });

        });

        Net.on('getCardsBack' + game.roomID, pokers => {
            paiTool.sortDescending(pokers);
            game.ownPlayer.pokers = pokers;
            this.own_handCon.active = true;
            this.own_handCon_action.updateHandPai(pokers);
            //刷新自己手牌显示
        });

        //有人抢地主
        Net.on('qiangdizhuResult', msg => {
            let data = JSON.parse(msg);
            //let qiangdizhu = data.qiangdizhuResult;
            this.updateMsg(data.index, data.str);
        });
        //目前抢地主用户
        Net.on('qiangdizhuNotice', msg => {
            let data = JSON.parse(msg);
            //当前操作对象
            this.updateTurnTip(data.nextIndex);

            if (data.nextIndex == game.ownPlayer.index) {//自己
                this.menu_dizhu.active = true;
                this.updateMsg(data.nextIndex, "");
                this.menu_dizhu_action.updateFirst(data.isFirst);

                game.operation_status = OPERATION_STATUS.SELECT_DIZHU;
                this.addClock();
            } else {
                this.menu_dizhu.active = false;
            }
        });

        //开始出牌
        Net.on('startPlayerPoker', playerIndex => {
            console.log("地主为:" + playerIndex);
            //存储地主人员
            game.dizhu = playerIndex;
            this.clearMsg();
            //当前操作对象
            this.updateTurnTip(playerIndex);
            this.updateDizhu(playerIndex);

            //请求底牌
            Net.emit('getCards', { roomID: game.roomID, index: 3 });

            //自己是地主
            if (playerIndex == game.ownPlayer.index) {
                game.operation_status = OPERATION_STATUS.SELECT_FREE;
                //显示打牌菜单
                this.menu_play.active = true;
                this.menu_play_action.setMenu(false, false, true);
                Net.emit('getCards', { roomID: game.roomID, index: playerIndex });
                //加入时钟
                this.addClock();
            }
            this.requestLeftCount();
        });
        Net.on('getDipaiCardsBack' + game.roomID, cards => {
            this.dipai_shower.updatePais(cards);
        });

        //出牌
        Net.on('chupai', mes => {
            let data = JSON.parse(mes);
            let playerIndex = data.playerIndex;
            let pokers = data.pokers;

            //存储上一手牌
            game.lastPokers = playerIndex == game.ownPlayer.index ? [] : data.pokers;

            this.requestLeftCount();

            this.updateMsg(playerIndex, "");

            if (playerIndex == game.leftPlayer.index) {

                this.left_poker_shower.updateShow(pokers);

            }
            if (playerIndex == game.rightPlayer.index) {

                this.right_poker_shower.updateShow(pokers);

            }
            if (playerIndex == game.ownPlayer.index) {
                this.menu_play.active = false;
                this.own_poker_shower.updateShow(pokers);
                //请求手牌
                Net.emit('getCards', { roomID: game.roomID, index: game.ownPlayer.index });
                //重置poker
                // var showPoker = self.playerHandCards.getComponent('ShowPoker');
                // showPoker.pokerAllDown();
            }

        });
        Net.on('buchu', index => {
            //let data = JSON.parse(mes);

            this.updateMsg(index, "不出");
        })

        //打牌菜单回调
        Net.on('playerAction', msg => {
            let data = JSON.parse(msg);
            //当前操作对象
            this.updateTurnTip(data.nextIndex);
            //轮到某人出牌清理文本显示
            this.updateMsg(data.nextIndex, "");

            //轮到某人随意出牌
            if (data.isFirst) this.clearAllShower();

            if (data.nextIndex == game.ownPlayer.index) {

                game.checkPush();

                this.own_poker_shower.clear();

                //要不起，自动pass
                if (game.auto.pass && !data.isFirst && game.ailist.length == 0) {
                    //this.lab_own_show.string = "自动...";
                    this.updateMsg(game.ownPlayer.index, "自动...")
                    setTimeout(() => this.menu_play_action.buchu(), 2000);
                }
                else {
                    game.operation_status = data.isFirst ? OPERATION_STATUS.SELECT_FREE : OPERATION_STATUS.SELECT_PREV;
                    this.menu_play.active = true;
                    this.menu_play_action.setMenu(!data.isFirst, !data.isFirst, true);
                    this.addClock();
                }
            }
        });
        Net.on("refreshCardsCountBack" + game.roomID, data => {
            this.head_right.updateCount(data[game.rightPlayer.index]);
            this.head_left.updateCount(data[game.leftPlayer.index]);
            this.head_own.updateCount(data[game.ownPlayer.index]);
        });
        //收到结束
        Net.on("gameOver", data => {
            this.clearMsg();
            this.updateMsg(data, "win");
            setTimeout(() => this.gameover(), 2000);

        });
    }
    clearReady() {
        this.btn_ready.active = false;
        this.clearMsg();
    }
    clearMsg() {
        this.label_own_msg.string = this.label_right_msg.string = this.label_left_msg.string = "";
    }
    clearAllShower() {
        this.left_poker_shower.clear();
        this.right_poker_shower.clear();
        this.own_poker_shower.clear();
    }
    clearDipaiShower(){
        this.dipai_shower.node.active = false;
        this.dipai_shower.reset();
    }
    allHeadRoundReset() {
        this.head_own.updateIcon("girl");
        this.head_left.updateIcon("girl");
        this.head_right.updateIcon("girl");
        this.head_own.updateCount(-1);
        this.head_left.updateCount(-1);
        this.head_right.updateCount(-1);
        this.updateTurnTip(-1);
    }

    click_ready() {

        Net.emit('readyGame', { roomID: game.roomID, index: game.ownPlayer.index });//game.roomNum, game.roomIndex);
        message.emit("clearClock");
    }

    gameover() {
        game.roundReset();
        this.clearClock();
        this.clearMsg();
        this.clearAllShower();
        this.clearDipaiShower();
        this.allHeadRoundReset();
        this.own_handCon_action.clear();
        this.ready();
    }
    // update (dt) {}
}
