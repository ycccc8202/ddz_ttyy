

const {ccclass, property} = cc._decorator;

@ccclass
export default class Clock extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    running:boolean = false;

    time:number;
    startTime:number;
    callback:Function;

    play(startTime:number,callback:Function = null){ // time 秒
        this.time = startTime;
        this.startTime = startTime;
        this.callback = callback;
        this.label.string = `${this.time}`;   
        this.running = true;
    }
    update (dt) {

        if(this.running){
            this.startTime -= dt;
            if(this.startTime<= -0.5){
                this.time = 0;
                this.complete();
            }else{
                this.time = Math.ceil(this.startTime);
            }
            this.label.string = `${this.time}`;
        }
    }
    complete(){
        this.stop();
        this.callback && this.callback();
    }
    stop(){
        this.running = false;
    }
}
