
import Poker from "./Poker";
import { config } from "./Utils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DipaiShower extends cc.Component {

    @property(Poker)
    poker_1: Poker = null;
    @property(Poker)
    poker_2: Poker = null;
    @property(Poker)
    poker_3: Poker = null;

    updatePais(pais:any){

        this.poker_1.init(config.getCard(pais[0]));
        this.poker_2.init(config.getCard(pais[1]));
        this.poker_3.init(config.getCard(pais[2]));
            
    }

    // update (dt) {}
}
