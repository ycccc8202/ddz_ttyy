

import { getCacheSpriteFrame } from "./Game";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Head extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    label_name: cc.Label = null;
    @property(cc.Label)
    label_count: cc.Label = null;
    @property(cc.Node)
    turn_flag: cc.Node = null;


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.null();
    }
    start() {
       
    }
    updateName(value: string) {
        this.label_name.string = value;
    }
    updateIcon(value: string) {
        this.icon.spriteFrame = getCacheSpriteFrame(value);
    }
    updateCount(num:number = -1){
        this.label_count.string = num == -1 ? "" : ""+num;
    }

    null() {
        this.label_name.string = "";
        this.label_count.string = "";
        this.icon.spriteFrame = getCacheSpriteFrame("empty");
        this.turn_flag.active = false;
    }
    // update (dt) {}
}
