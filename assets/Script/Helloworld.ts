import Poker from "./Poker";
import { config } from "./Utils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    @property(cc.Prefab)
    poker:cc.Prefab = null;

    start () {
        // init logic
        this.label.string = this.text;
        let poker = cc.instantiate(this.poker);
        let action = poker.getComponent<Poker>(Poker);
        poker.parent = this.node;
        action.init(config.getCard(11));
        cc.log(this.poker);
    
    }
}
