import { game } from "./Game";
import { message } from "./MessageCenter";
import { Net } from "./Net";
/*
    游戏登陆
*/
const { ccclass, property } = cc._decorator;

@ccclass
export default class Login extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    start() {
        if(location.search && ~location.search.indexOf("?server=")){
            game.server = location.search.replace("?server=","");
        }
        Net.connect(game.server);
        message.on("connect",()=>{
            this.label && (this.label.string = "服务器连接成功:" + game.server);
        });
    }
    //点击模式1
    click_parttern_1() {
        cc.log("click_parttern_1");
        if(this.checkConnect()){
            cc.director.loadScene("gamecenter");
        }
    }
    //点击模式2
    click_parttern_2() {
        cc.log("click_parttern_2");
        if(this.checkConnect()){
            cc.director.loadScene("gamecenter");
        }
    }
    checkConnect(){
        if(Net.socket.connected) return true;
        cc.log("---没有连上服务器---");
        return false;
    }
}
