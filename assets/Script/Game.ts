import { getAIList } from "./Utils";

export var game = {
    server:"http://192.168.31.224:3000",
    //ownName:"",
    roomID:"",
    ownPlayer:{name:'',index:0,pokers:null},
    rightPlayer:{name:'',index:0},
    leftPlayer:{name:'',index:0},
    dizhu:0,//地主序号
    pokerSpriteFrameMap:{},
    lastPokers:[],//上一家出牌
    ailist:[],//提示列表
    ai_index:0,
    autoPass:true ,// 自动要不起操作

    roundReset(){
        this.lastPokers = [];
        this.ailist = [];
        this.ai_index = 0;
        this.ownPlayer.pokers = null;
        this.dizhu = 0;
    },
    setPokerSpriteFrameMap(key:string,value:cc.SpriteFrame){
        this.pokerSpriteFrameMap[key] = value;
    },
    getPokerSpriteFrameMap(key:string){
        return this.pokerSpriteFrameMap[key];
    },
    //判断是否能出牌,同时更新提示列表
    checkPush(){
        if(this.lastPokers.length) this.ailist = getAIList(game.ownPlayer.pokers, game.lastPokers);
        game.ai_index = 0;
        return this.ailist.length > 0;
    }

}
export function getCacheSpriteFrame(name:string):cc.SpriteFrame{
    let asset = null;
    cc.assetManager.assets.forEach((value,key) =>{
        if(value.name == name) {
            asset = value;
            return;
        }
    })
    return asset;
}
export var poker_pool = {

    pool:[],
    //获取 暂时无效果(待解决)
    borrow(prefab:cc.Prefab):cc.Node{
        return this.pool.length ? this.pool.shift() : cc.instantiate(prefab);
        //return cc.instantiate(prefab);
    },
    //释放
    return(node:cc.Node){
        this.pool.push(node);
    }
    

}
export enum PokerShowType{
    OWNER = 1,
    LEFT = 2,
    RIGHT = 3
}