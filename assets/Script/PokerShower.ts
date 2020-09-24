
import { PokerShowType, pools } from "./Game";
import Poker from "./Poker";
import { config } from "./Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PokerShower extends cc.Component {

    layout =
        {
            width: 105,
            height: 150,
            spaceX: 35,
            spaceY: 45,
            yCount: 10, // 换行数量 
        };

    @property(cc.Prefab)
    prefab_poker: cc.Prefab = null;
    @property({ type: cc.Enum(PokerShowType), serializable: true })
    type: PokerShowType = PokerShowType.OWNER;

    updateShow(pais: any) {
        this.clear();
        switch (this.type) {
            case PokerShowType.LEFT:
                this.left(pais);
                break;
            case PokerShowType.RIGHT:
                this.right(pais);
                break;
            case PokerShowType.OWNER:
                this.owner(pais);
                break;
        }
    }
    //左边玩家的出牌 左对齐，换行排列
    left(pais: any) {
        let sx = this.layout.width / 2;
        for (let i = 0; i < pais.length; i++) {
            let pai = pais[i];
            let poker: Poker = pools.poker_get(this.prefab_poker).getComponent<Poker>(Poker);
            poker.node.x = sx + i % this.layout.yCount * this.layout.spaceX;
            poker.node.y = -(i / this.layout.yCount ^ 0) * this.layout.spaceY;
            poker.node.parent = this.node;
            poker.init(config.getCard(pai));
        }
    }
    //右边玩家的出牌展示 右对齐，换行排列
    right(pais: any) {


        let length = pais.length > this.layout.yCount ? this.layout.yCount : pais.length;
        let paisWidth = (length - 1) * this.layout.spaceX + this.layout.width;
        let sx = - paisWidth + this.layout.width / 2;

        for (let i = 0; i < pais.length; i++) {
            let pai = pais[i];
            let poker: Poker = pools.poker_get(this.prefab_poker).getComponent<Poker>(Poker);
            poker.node.x = sx + i % this.layout.yCount * this.layout.spaceX;
            poker.node.y = -(i / this.layout.yCount ^ 0) * this.layout.spaceY;
            poker.node.parent = this.node;
            poker.init(config.getCard(pai));
        }
    }
    //自己的出牌 居中单行显示
    owner(pais: any) {
        cc.log("Layout", this.getComponent(cc.Layout));
        for (let i = 0; i < pais.length; i++) {
            let pai = pais[i];
            let poker: Poker = pools.poker_get(this.prefab_poker).getComponent<Poker>(Poker);
            poker.node.x = 0;
            poker.node.y = 0;
            poker.node.parent = this.node;
            poker.init(config.getCard(pai));
        }
    }
    clear() {

        // for(let node of this.node.children){
        //     poker_pool.return(node);
        // }

        for(let i = this.node.childrenCount - 1 ; i >=0 ; i --){
            let node = this.node.children[i];
            //node.parent = null;
            //poker_pool.return(node);
            pools.poker_put(node)
        }

        //this.node.removeAllChildren();
    }
    // update (dt) {}
}
