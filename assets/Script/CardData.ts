
import { HUASE } from "./Utils";

export default class CardData {
    //1-54 服务器传来的数据
    card: number;
    spriteFrame:string;
    grade: number;//3-15 
    huase:HUASE;
    num:number; // 1-13
    sort:number;
    constructor(card: number) {
        this.card = card;
        this.init();
    }
    init() {
        if(this.card == 53){
            this.huase = HUASE.xiaowang;
            this.spriteFrame = "xiaowang_0";
            this.num = 53;
            this.grade = 16;
            this.sort = 53;
            return;
        }
        if(this.card == 54){
            this.huase = HUASE.dawang;
            this.spriteFrame = "dawang_0";
            this.num = 54;
            this.grade = 17;
            this.sort = 54;
            return;
        }
        let type = this.card / 13 ^ 0;
        let num = this.card % 13;
        if (num == 0) {
            num = 13;
            type--;
        }
        this.huase = type;
        this.num = num;
        this.grade = (num == 1 || num == 2) ? 13 + num : num;
        this.spriteFrame = `${HUASE[type]}_${num}`;
        this.sort = (((num == 1 || num == 2) ? 11 + num : num - 2) - 1) * 4 + type + 1;
    }
}
