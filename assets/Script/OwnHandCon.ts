import { poker_pool } from "./Game";
import { message } from "./MessageCenter";
import Poker from "./Poker";
import { config } from "./Utils";
const { ccclass, property } = cc._decorator;

@ccclass
export default class OwnHandCon extends cc.Component {

    //手牌容器布局配置,容器本身0.8的缩放
    layout =
        {
            width: 105,
            height: 150,
            spaceX: 45,
            spaceY: 45,
            yCount: 14, // 换行数量 
        };

    @property(cc.Prefab)
    prefab_poker: cc.Prefab = null;

    pokers: Poker[];
    select_startIndex: number;
    select_pokers_temp = [];//临时选择的牌

    onLoad() {
        
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        message.emit("pokerMoveUp",this.pokerMoveUp);
    }
    updateHandPai(pais) {

        this.clear();

        if (pais.length > this.layout.yCount) {
            this.twinRom(pais);
        } else {
            this.singleRow(pais);
        }
        cc.log(this.node.active);
    }
    //单排
    private singleRow(pais: any) {
        cc.log("单排 ---- ");
        let pokersWidth = (pais.length - 1) * this.layout.spaceX + this.layout.width;
        let startX = -pokersWidth / 2 + this.layout.width / 2;
        for (let i = 0; i < pais.length; i++) {
            let pai = pais[i];
            let poker: Poker = poker_pool.borrow(this.prefab_poker).getComponent<Poker>(Poker);
            poker.node.x = startX + i * this.layout.spaceX;
            poker.node.y = 0;
            poker.node.parent = this.node;
            poker.init(config.getCard(pai));
            poker.index = i;
            this.pokers.push(poker);
        }

    }
    //双排
    private twinRom(pais:any) {
        cc.log("双排 ---- ");
        let upCount = Math.ceil(pais.length / 2);
        let downCount = pais.length - upCount;
        let upY = this.layout.spaceY / 2;
        let downY = -upY ;

        let upX = (1 - upCount) * this.layout.spaceX / 2;
        let downX = (1-downCount) * this.layout.spaceX /2;

        for (let i = 0; i < pais.length; i++) {
            let x,y;
            if(i < upCount){
                x = upX;
                y = upY;
            }else{
                x = downX;
                y = downY;
            }
            let pai = pais[i];
            let poker: Poker = poker_pool.borrow(this.prefab_poker).getComponent<Poker>(Poker);
            poker.node.x = x + i%upCount * this.layout.spaceX;
            poker.node.y = y;
            poker.node.parent = this.node;
            poker.init(config.getCard(pai));
            poker.index = i;
            this.pokers.push(poker);
        }

    }
    private onTouchStart(e: cc.Event.EventTouch) {
        
        let node: cc.Node = e.target as cc.Node;
        if (node.name != "icon_con") return;
        let poker: Poker = node.parent.getComponent<Poker>(Poker);
        poker.select();
        this.select_startIndex = poker.index;
        this.select_pokers_temp = [poker];
    }
    private onTouchEnd() {
        this.clearSelectPokers();
        this.pokersSelectMove();
    }

    private onTouchMove(e: cc.Event.EventTouch) {
        let space = this.node.convertToNodeSpaceAR(e.touch.getLocation());
        let touchIndex = -1;
        for (let i = this.pokers.length - 1; i >= 0; i--) {
            let node = this.pokers[i].icon_con;
            let rect = node.getBoundingBox();
            rect.x += node.parent.x;
            rect.y += node.parent.y;
            if (rect.contains(space)) {
                touchIndex = i;
                break;
            }
        }
        if (touchIndex > -1) {
            if (this.select_startIndex < touchIndex) {
                this.selectPokers(this.select_startIndex, touchIndex);
            } else {
                this.selectPokers(touchIndex, this.select_startIndex);
            }
        }
    }
    private selectPokers(start: number, end: number) {
        this.select_pokers_temp = [];
        for (let i = 0; i < this.pokers.length; i++) {
            let poker: Poker = this.pokers[i];
            if (i < start || i > end) {
                poker.unselect();
            } else {
                poker.select();
                this.select_pokers_temp.push(poker);
            }
        }
    }
    private pokersSelectMove() {
        for (let i = 0; i < this.select_pokers_temp.length; i++) {
            let poker: Poker = this.select_pokers_temp[i];
            poker.move();
        }
    }
    //清理高亮
    private clearSelectPokers() {
        for (let i = 0; i < this.pokers.length; i++) {
            let poker: Poker = this.pokers[i];
            poker.unselect();
        }
    }
    //获取所有需要打出的牌
    getAllPlayPokers() {
        let pokers = [];
        for (let i = 0; i < this.pokers.length; i++) {
            let poker: Poker = this.pokers[i];
            if (poker.isMoveUp) pokers.push(poker);
        }
        return pokers;
    }
    //移出一些牌
    pokerMoveUp(pais: number[]) {
        for (let i = 0; i < this.pokers.length; i++) {
            let poker: Poker = this.pokers[i];
            poker.reset();
            if (pais && ~pais.indexOf(poker.card.card)) {
                poker.moveUp();
            }
        }
    }

    clear() {

        for(let node of this.node.children){
            poker_pool.return(node);
        }
        this.node.removeAllChildren();
        this.select_pokers_temp = [];
        this.pokers = [];
    }
    // update (dt) {}
}
