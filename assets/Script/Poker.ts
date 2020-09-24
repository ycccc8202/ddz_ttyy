import CardData from "./CardData";
import { game, getCacheSpriteFrame } from "./Game";
import { config, HUASE } from "./Utils";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Poker extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Node)
    icon_con: cc.Node = null;

    grade: number;
    huase: HUASE;
    num: number;
    card: CardData;
    //canTouch: boolean = false;
    index: number;//序号
    defaultSpriteFrame: cc.SpriteFrame;
    isMoveUp: boolean;
    onLoad() {
        this.icon_con.on(cc.Node.EventType.TOUCH_START, () => null);//这样处理可以让父容器的target能获取到真实的目标
    }
    //初始化数据 add之后进行牌的初始化
    init(card: CardData = null) {
        this.card = card;
        //let sp = this.node.getComponent(cc.Sprite);
        let frame;
        if (card == null) {
            frame = getCacheSpriteFrame("PokerBack");
        } else {
            frame = game.getPokerSpriteFrameMap(card.spriteFrame);
        }
        this.icon.spriteFrame = frame;
    }
    //选中
    select() {
        this.icon.node.color = cc.Color.BLACK.fromHEX("#808080");
    }
    //取消选中8
    unselect() {
        this.icon.node.color = cc.Color.BLACK.fromHEX("#FFFFFF");
    }

    move() {
        this.isMoveUp ? this.moveBack() : this.moveUp();
    }
    moveUp() {
        this.isMoveUp = true;
        this.icon_con.y = config.move_dis;
        this.icon_con.getComponent<cc.Sprite>(cc.Sprite).enabled = true;
    }
    moveBack() {
        this.isMoveUp = false;
        this.icon_con.y = 0;
        this.icon_con.getComponent<cc.Sprite>(cc.Sprite).enabled = false;
    }
    reset() {
        this.moveBack();
        this.unselect();
    }
    
    //对象池默认调用
    unuse(){

    }
    reuse(){
        this.reset();
    }
}
