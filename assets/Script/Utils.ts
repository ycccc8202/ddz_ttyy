import CardData from "./CardData";
//获取随机用户名
export function getRndUser() {
    let dic = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let a = dic[Math.random() * 26 ^ 0] + dic[Math.random() * 26 ^ 0] + dic[Math.random() * 26 ^ 0];
    let b = Math.random() * 1000 ^ 0;
    return a + "_" + b;
}
export enum HUASE {
    fangzhuan = 0,//方块
    meihua = 1,//梅花
    hongxin = 2,//红心
    heitao = 3,//黑桃
    xiaowang = 53,//小王
    dawang = 54//大王
}
export enum DDZ_POKER_TYPE {
    DDZ_PASS = 0,   //过牌，不出
    SINGLE = 1,//单牌
    TWIN = 2,//对子
    TRIPLE = 3,//三张不带
    TRIPLE_WITH_SINGLE = 4,//三张带单
    TRIPLE_WITH_TWIN = 5,//三张带对
    STRAIGHT_SINGLE = 6,//顺子
    STRAIGHT_TWIN = 7,//连对
    PLANE_PURE = 8,//飞机不带
    PLANE_WITH_SINGLE = 9,//飞机带单
    PLANE_WITH_TWIN = 10,//飞机带对
    FOUR_WITH_SINGLE = 11,//四张带单
    FOUR_WITH_TWIN = 12,//四张带双
    FOUR_BOMB = 13,//四张炸弹
    KING_BOMB = 14//王炸
}
export interface IPartern {
    type,
    pais
}
export var config = {

    move_dis: 15,
    cards: [],
    getCard(pai: number): CardData {
        return this.cards[pai];
    },
    getSpriteFrames(pais) {
        let list = [];
        for (let pai of pais) {
            let card: CardData = this.getCard(pai);
            list.push(card.spriteFrame);
        }
        return list;
    },
}
export var paiTool = {
    //初始化扑克数据表
    initMap() {
        for (let i = 1; i <= 54; i++) {
            let card: CardData = new CardData(i);
            config.cards[i] = card;
        }
    },
    //升序列
    sortAscending(pais) {
        pais.sort((a, b) => {
            return config.getCard(a).sort - config.getCard(b).sort;
        });
    },
    sortDescending(pais) {
        pais.sort((a, b) => {
            return config.getCard(b).sort - config.getCard(a).sort;
        });
    },
    //获取数量组(1-4张),进行分组,存放原始牌值 1-54
    getCountPais_1_4(pais) {
        let map = [null, [], [], [], []];
        let jump = 1; 6
        for (let i = 0; i < pais.length; i += jump) {
            let sameCount = 1;
            let card = config.getCard(pais[i]);
            let list = [card.card];
            for (let j = i + 1; j < pais.length; j++) {
                let card_j = config.getCard(pais[j]);
                if (card.grade != card_j.grade) {
                    break;
                }
                sameCount++;
                list.push(card_j.card);
            }
            jump = sameCount;
            if (sameCount > 4) {
                return null;
            }
            map[sameCount] = map[sameCount].concat(list);
        }
        cc.log("======打印数量列表=====")
        cc.log(pais);
        cc.log(map);
        cc.log("======================")
        return map;
    },
    //获取牌型
    getCardPattern(pais) {
        let pattern = { type: DDZ_POKER_TYPE.DDZ_PASS, pais: [] }
        if (!pais || pais.length == 0) return pattern;
        this.sortDescending(pais);
        cc.log("*****************************************************")
        cc.log("原始牌排序:==>", pais, "\n", this.paisToGrades(pais));
        cc.log("=============");
        let countPais = this.getCountPais_1_4(pais);
        if (!countPais) {
            cc.log("有相同牌长度超4!");
            return;
        }
        switch (pais.length) {
            case 1://1张判断 单牌
                pattern = { type: DDZ_POKER_TYPE.SINGLE, pais: pais };
                break;
            case 2://2张判断 对子|王炸
                if (countPais[2].length == 2) pattern = { type: DDZ_POKER_TYPE.TWIN, pais: countPais[2] };
                if (countPais[1][0] == 54 && countPais[1][1] == 53) pattern = { type: DDZ_POKER_TYPE.KING_BOMB, pais: countPais[1] };
                break;
            case 3://3张判断 3不带
                if (countPais[3].length == 3) pattern = { type: DDZ_POKER_TYPE.TRIPLE, pais: countPais[3] };
                break;
            case 4://4张判断 炸弹 | 三带1
                if (countPais[4].length == 4) pattern = { type: DDZ_POKER_TYPE.FOUR_BOMB, pais: countPais[4] }
                if (countPais[3].length == 3) pattern = { type: DDZ_POKER_TYPE.TRIPLE_WITH_SINGLE, pais: countPais[3].concat(countPais[1]) }
                break;
            case 5://5张判断 顺子| 三带对子
                if (countPais[3].length == 3 && countPais[2].length == 2) {
                    pattern = { type: DDZ_POKER_TYPE.TRIPLE_WITH_TWIN, pais: countPais[3].concat(countPais[2]) };
                } else {
                    let result = this.isStraightSingle(countPais, pais);
                    if (result) pattern = { type: DDZ_POKER_TYPE.STRAIGHT_SINGLE, pais: result };
                }
                break;
            default://6张判断 飞机不带|飞机带单|飞机带双|4带2|连对|顺子|

                let result = this.isStraightSingle(countPais, pais);
                if (result) { pattern = { type: DDZ_POKER_TYPE.STRAIGHT_SINGLE, pais: result }; break; }

                result = this.isStraightTwin(countPais, pais);
                if (result) { pattern = { type: DDZ_POKER_TYPE.STRAIGHT_TWIN, pais: result }; break; }

                //优先判断4带2,再判断飞机  
                result = this.isFourWithSingle(countPais, pais);
                if (result) { pattern = { type: DDZ_POKER_TYPE.FOUR_WITH_SINGLE, pais: result }; break; }

                result = this.isFourWithTwin(countPais, pais);
                if (result) { pattern = { type: DDZ_POKER_TYPE.FOUR_WITH_TWIN, pais: result }; break; }

                result = this.isPlane(countPais, pais);
                if (result) { pattern = { type: DDZ_POKER_TYPE.PLANE_PURE, pais: result }; break; }

                result = this.isPlaneWithSingleWing(countPais, pais);
                if (result) { pattern = { type: DDZ_POKER_TYPE.PLANE_WITH_SINGLE, pais: result }; break; }

                result = this.isPlaneWithDoubleWing(countPais, pais);
                if (result) { pattern = { type: DDZ_POKER_TYPE.PLANE_WITH_TWIN, pais: result }; break; }

                break;
        }
        //打印结果
        cc.log("牌型:==>", DDZ_POKER_TYPE[pattern.type], pattern.pais, "\n", this.paisToGrades(pattern.pais));
        return pattern;
    },

    //顺子判断
    isStraightSingle(countPais, pais) {
        let list_1 = countPais[1];
        if (list_1.length != pais.length || config.getCard(list_1[0]).grade == 16 || config.getCard(list_1[0]).grade == 17 || config.getCard(list_1[0]).grade == 15) return null;
        if (config.getCard(list_1[0]).grade - config.getCard(list_1[pais.length - 1]).grade == pais.length - 1) {
            // let pais = countPais[1].concat();
            // pais.reverse();
            return pais;
        }
        return null;
    },
    //连对判断
    isStraightTwin(countPais, pais) {

        if (countPais[2].length == 0 || countPais[2].length != pais.length || config.getCard(countPais[2][0]).grade == 15) return null;

        if (config.getCard(countPais[2][0]).grade - config.getCard(countPais[2][pais.length - 1]).grade == pais.length / 2 - 1) return pais;

        return null;

    },

    //飞机不带翅膀
    isPlane(list, length) {
        let list_3 = list[3];
        if (list_3.length == 0 || list_3[0].grade == 15) return null;
        if (list_3.length == length && list_3[0].grade - list_3[list_3.length - 1].grade == length / 3 - 1) {
            let cards = list_3.concat();
            cards.reverse();
            return cards;
        }
        return null;
    },
    //飞机带单牌翅膀
    isPlaneWithSingleWing(countPais, pais) {
        cc.log(" ---- 飞机带单牌翅膀检测 -----");
        cc.log("待检测牌序列:", pais);
        let map = { 8: 2, 12: 3, 16: 4, 20: 5 };
        let needThreeCount = map[pais.length];
        //长度不满足飞机
        if (!needThreeCount) {
            cc.log("---- 飞机带单检测失败 , 长度不满足 飞机带单 条件");
            return null;
        }
        //寻找3张牌的
        let threeGrades = [];
        if (countPais[3].length > 0) {
            for (let i = 0; i < countPais[3].length; i += 3) {
                //cc.log("===>for  ",i,countList[3][i])
                let grade = config.getCard(countPais[3][i]).grade;
                //cc.log(grade)
                grade != 15 && threeGrades.push(grade);
            }
        }
        if (countPais[4].length > 0) {
            for (let i = 0; i < countPais[4].length; i += 4) {
                let grade = config.getCard(countPais[4][i]).grade;
                grade != 15 && threeGrades.push(grade);
            }
        }
        if (threeGrades.length < needThreeCount) {
            cc.log("---- 飞机带单检测失败,三张牌的grade列表长度不符合", needThreeCount, threeGrades.length);
            return null;
        }
        threeGrades.sort((a, b) => { return b - a });
        cc.log("三张牌的grade列表:: -> ", threeGrades);
        let preGrade = -1;
        let lianxuGrades = [];
        let find = false;
        //判断是否连续
        for (let grade of threeGrades) {
            if (preGrade - grade != 1) {
                lianxuGrades = [grade];
            } else {
                lianxuGrades.push(grade);
                if (lianxuGrades.length == needThreeCount) {
                    find = true;
                    break;
                }
            }
            preGrade = grade;
        }
        if (!find) {
            cc.log("---- 飞机带单检测失败,没有找到符合长度的连续牌");
            return null;
        }
        cc.log("符合条件的连续序列：", lianxuGrades);
        let threePlane = [];
        let threeWing = pais.concat();
        for (let i = 0; i < threeWing.length;) {
            let grade = config.getCard(threeWing[i]).grade;
            if (grade == lianxuGrades[0]) {
                threePlane.push(threeWing[i], threeWing[i + 1], threeWing[i + 2]);
                threeWing.splice(i, 3);
                lianxuGrades.shift();
            } else {
                i++;
            }
        }
        cc.log("threePlane-飞机 :> ", threePlane);
        cc.log("threeWing- 翅膀 :> ", threeWing);
        cc.log("---- 飞机带单检测完毕 -----");
        return threePlane.concat(threeWing);
    },
    //飞机带对子牌翅膀
    isPlaneWithDoubleWing(countPais, pais) {
        cc.log(" ---- 飞机带双牌翅膀检测 -----");
        cc.log("待检测牌序列:", pais);
        let map = { 10: 2, 15: 3, 20: 4 };
        let needThreeCount = map[pais.length];
        //长度不满足飞机
        if (!needThreeCount) {
            cc.log("---- 飞机带双检测失败 , 长度不满足 飞机带双 条件");
            return null;
        }
        //寻找3张牌的,飞机带双不能到 组4里查找,组4只能当翅膀,关键!
        let threeGrades = [];
        if (countPais[3].length > 0) {
            for (let i = 0; i < countPais[3].length; i += 3) {
                let grade = config.getCard(countPais[3][i]).grade;
                grade != 15 && threeGrades.push(grade);
            }
        }
        if (threeGrades.length < needThreeCount) {
            cc.log("---- 飞机带双检测失败,三张牌的grade列表长度不符合", needThreeCount, threeGrades.length);
            return null;
        }
        threeGrades.sort((a, b) => { return b - a });
        cc.log("三张牌的grade列表:: -> ", threeGrades);
        let preGrade = -1;
        let lianxuGrades = [];
        let find = false;
        //判断是否连续
        for (let grade of threeGrades) {
            if (preGrade - grade != 1) {
                lianxuGrades = [grade];
            } else {
                lianxuGrades.push(grade);
                if (lianxuGrades.length == needThreeCount) {
                    find = true;
                    break;
                }
            }
            preGrade = grade;
        }
        if (!find) {
            cc.log("---- 飞机带双检测失败,没有找到符合长度的连续牌");
            return null;
        }
        cc.log("符合条件的连续序列：", lianxuGrades);
        let threePlane = [];
        let threeWing = pais.concat();
        for (let i = 0; i < threeWing.length;) {
            let grade = config.getCard(threeWing[i]).grade;
            if (grade == lianxuGrades[0]) {
                threePlane.push(threeWing[i], threeWing[i + 1], threeWing[i + 2]);
                threeWing.splice(i, 3);
                lianxuGrades.shift();
            } else {
                i++;
            }
        }
        cc.log("threePlane-飞机 :> ", threePlane);
        cc.log("threeWing- 翅膀 :> ", threeWing);
        //判断翅膀是不是都是对子
        let duizi = true;
        for (let i = 0; i < threeWing.length; i += 2) {
            if (threeWing[i] != threeWing[i + 1]) {
                duizi = false;
                break;
            }
        }
        if (!duizi) {
            cc.log("---- 飞机带双检测失败,翅膀不是全对子");
            return null;
        }
        cc.log("---- 飞机带双检测完毕 -----");
        return threePlane.concat(threeWing);
    },
    //判断4带两个单
    isFourWithSingle(countPais, pais): any {

        if (pais.length == 6 && countPais[4].length == 4) {
            return countPais[4].concat(countPais[1]).concat(countPais[2]);
        }
        return null;

    },
    //判断4带两个双
    isFourWithTwin(countPais, pais): any {

        if (pais.length == 8) {

            if (countPais[4].length == 4 && countPais[2].length == 4) {
                return countPais[4].concat(countPais[2]);
            }
            if (countPais[4].length == 8) {
                return countPais[4];
            }
        }
        return null;

    },
    paisToGrades(pais) {
        let grades = [];
        for (let pai of pais) {
            grades.push(config.getCard(pai).grade);
        }
        return grades;
    },
    //牌型比较大小 返回大的
    compare(partern_1: IPartern, partern_2: IPartern) {

        if (partern_1.type == DDZ_POKER_TYPE.DDZ_PASS || partern_2.type == DDZ_POKER_TYPE.DDZ_PASS) return null;

        if (partern_1.type == partern_2.type && partern_1.pais.length == partern_2.pais.length) {
            let grade_1 = config.getCard(partern_1.pais[0]).grade;
            let grade_2 = config.getCard(partern_2.pais[0]).grade;
            if (grade_1 == grade_2) return null;
            return grade_1 > grade_2 ? partern_1 : partern_2;
        }
        if (partern_1.type == DDZ_POKER_TYPE.KING_BOMB) return partern_1;
        if (partern_2.type == DDZ_POKER_TYPE.KING_BOMB) return partern_2;

        if (partern_1.type == DDZ_POKER_TYPE.FOUR_BOMB) return partern_1;
        if (partern_2.type == DDZ_POKER_TYPE.FOUR_BOMB) return partern_2;
        return null;

    }
}
//从a表中找出大于b牌型的所有牌型列表(出牌提示)
export function getAIList(list: number[], target: number[]) {

    console.time('find:');

    let targetPartern = paiTool.getCardPattern(target);

    if (targetPartern.type == DDZ_POKER_TYPE.KING_BOMB) return [];


    paiTool.sortDescending(list);
    //列表的1-4张分组
    let list_count_14 = paiTool.getCountPais_1_4(list);

    let result = [];

    switch (targetPartern.type) {

        case DDZ_POKER_TYPE.SINGLE://单牌

            var target_grade = config.getCard(target[0]).grade;
            var prevGrade = 0;

            for (let i = list.length - 1; i >= 0; i--) {

                let grade = config.getCard(list[i]).grade;

                if (grade == prevGrade) continue;

                if (grade > target_grade) {
                    result.push([list[i]])
                }
                prevGrade = grade;
            }
            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }

            break;
        case DDZ_POKER_TYPE.TWIN://对子

            var target_grade = config.getCard(target[0]).grade;

            var prevGrade = 0;

            for (let i = list.length - 1; i >= 0; i--) {

                let grade = config.getCard(list[i]).grade;

                if (prevGrade == grade) continue;

                if (grade > target_grade) {

                    if (list[i - 1] && config.getCard(list[i - 1]).grade == grade) {

                        result.push([list[i - 1], list[i]]);

                        i--;
                    }
                    prevGrade = grade;
                }

            }
            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }
            break;
        case DDZ_POKER_TYPE.TRIPLE://三不带

            var target_grade = config.getCard(target[0]).grade;

            var prevGrade = 0;

            for (let i = list.length - 1; i >= 0; i--) {

                let grade = config.getCard(list[i]).grade;

                if (prevGrade == grade) continue;

                if (grade > target_grade) {

                    if (list[i - 1] && list[i - 2] && config.getCard(list[i - 1]).grade == grade && config.getCard(list[i - 2]).grade == grade) {

                        result.push([list[i - 2], list[i - 1], list[i]]);

                        i -= 2;
                    }
                    prevGrade = grade;
                }

            }
            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }
            break;
        case DDZ_POKER_TYPE.FOUR_BOMB://炸弹

            var target_grade = config.getCard(target[0]).grade;

            for (let i = 0; i < list_count_14[4].length; i += 4) {
                if (config.getCard(list_count_14[4][i]).grade > target_grade) {
                    result.push(list_count_14[4].slice(i, i + 4));
                }
            }
            break;
        case DDZ_POKER_TYPE.TRIPLE_WITH_SINGLE://三带单

            if (list.length < 4) break;

            if (list.length == 4 && list_count_14[4].length == 4) {
                result.push(list_count_14[4].concat());
                break;
            }
            var target_grade = config.getCard(targetPartern.pais[0]).grade;

            var plane_list = [];
            //组3 里查找
            for (let i = list_count_14[3].length - 1; i >= 0; i -= 3) {

                let plane_grade = config.getCard(list_count_14[3][i]).grade;

                if (plane_grade > target_grade) {
                    let plane = list_count_14[3].slice(i - 2, i + 1);
                    plane_list.push(plane);

                }
            }
            //组4 里查找

            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                let plane_grade = config.getCard(list_count_14[4][i]).grade;
                if (plane_grade > target_grade) {
                    let plane = list_count_14[4].slice(i - 2, i + 1);
                    plane_list.push(plane);
                }
            }
            //表示有三牌，然后查找翅膀
            if (plane_list.length > 0) {
                for (let i = 0; i < plane_list.length; i++) {
                    let plane_grade = config.getCard(plane_list[i][0]).grade;
                    let last_grade = 0;
                    for (let j = list.length - 1; j >= 0; j--) {
                        let wing_grade = config.getCard(list[j]).grade;
                        if (wing_grade != plane_grade && wing_grade != last_grade) {
                            last_grade = wing_grade;
                            result.push(plane_list[i].concat(list[j]));
                        }
                    }
                }

            }
            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }
            break;

        case DDZ_POKER_TYPE.TRIPLE_WITH_TWIN://三带对子

            if (list.length < 4) break;

            if (list.length > 4) {

                var target_grade = config.getCard(targetPartern.pais[0]).grade;

                var plane_list = [];
                //组3 里查找
                for (let i = list_count_14[3].length - 1; i >= 0; i -= 3) {

                    let plane_grade = config.getCard(list_count_14[3][i]).grade;

                    if (plane_grade > target_grade) {
                        let plane = list_count_14[3].slice(i - 2, i + 1);
                        plane_list.push(plane);
                    }
                }
                //组3 里查找
                for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {

                    let plane_grade = config.getCard(list_count_14[4][i]).grade;

                    if (plane_grade > target_grade) {
                        let plane = list_count_14[4].slice(i - 3, i);
                        plane_list.push(plane);
                    }
                }

                if (plane_list.length > 0) {

                    for (let i = 0; i < plane_list.length; i++) {
                        let plane_grade = config.getCard(plane_list[i][0]).grade;
                        //查找翅膀,从2组,3组,4组里找
                        for (let k = list_count_14[2].length - 1; k >= 0; k -= 2) {
                            result.push(plane_list[i].concat(list_count_14[2].slice(k - 1, k + 1)));
                        }
                        for (let k = list_count_14[3].length - 1; k >= 0; k -= 3) {
                            if (config.getCard(list_count_14[3][k]).grade != plane_grade) {
                                result.push(plane_list[i].concat(list_count_14[3].slice(k - 2, k)));
                            }
                        }
                        for (let k = list_count_14[4].length - 1; k >= 0; k -= 4) {
                            if (config.getCard(list_count_14[4][k]).grade != plane_grade) {
                                result.push(plane_list[i].concat(list_count_14[4].slice(k - 3, k - 1)));
                            }
                        }

                    }
                }
            }
            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }
            break;
        case DDZ_POKER_TYPE.STRAIGHT_SINGLE: // 顺子

            if (list.length < 4) break;

            var target_length = targetPartern.pais.length;
            var target_grade = config.getCard(targetPartern.pais[0]).grade;

            let grade_map = []; // 记录重复的grade

            for (let i = 0; i < list.length - target_length; i++) {

                let grade = config.getCard(list[i]).grade;

                if (grade == 17 || grade == 16 || grade == 15 || grade <= target_grade || grade_map[grade]) continue;

                grade_map[grade] = true;

                let index = i + 1;

                let temp_list = [list[i]];

                for (let j = 0; j < target_length - 1;) {

                    if (index >= list.length) break;

                    let for_grade = config.getCard(list[index]).grade;

                    if (for_grade == grade) {
                        index++;
                        continue;
                    }
                    if (grade - for_grade > 1) break;
                    grade = for_grade;
                    temp_list.push(list[index]);
                    index++;
                    j++;
                }
                if (temp_list.length == target_length) result.push(temp_list);
            }
            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }
            break;
        case DDZ_POKER_TYPE.STRAIGHT_TWIN: // 连对
            if (list.length < 4) break;
            if (list.length >= 6) {
                //对子的个数
                let twin_count = targetPartern.pais.length / 2;
                var target_grade = config.getCard(targetPartern.pais[0]).grade;
                var target_length = targetPartern.pais.length;

                let grade_map = []; // 记录重复的grade

                for (let i = 0; i < list.length - target_length;) {

                    let grade = config.getCard(list[i]).grade;
                    let grade_1 = config.getCard(list[i + 1]).grade;

                    if (grade == 17 || grade == 16 || grade == 15 || grade <= target_grade || grade_map[grade]) {
                        i++;
                        continue;
                    }
                    if (grade == grade_1) { // 是对子就进行后续对子的查询

                        grade_map[grade] = true;

                        let index = i + 2;

                        let temp_list = [list[i], list[i + 1]];

                        for (let j = 0; j < twin_count - 1;) {

                            if (index >= list.length - 1) break;

                            let for_grade = config.getCard(list[index]).grade;
                            let for_grade_1 = config.getCard(list[index + 1]).grade;

                            if (grade == for_grade) {
                                index++;
                                continue;
                            }
                            if (grade - for_grade > 1 || for_grade != for_grade_1) break;
                            grade = for_grade;
                            temp_list.push(list[index], list[index + 1]);
                            index += 2;
                            j++;
                        }

                        if (temp_list.length == target_length) result.push(temp_list);

                        i += 2;

                    } else {
                        i++;
                    }
                }
            }
            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }
            break;
        case DDZ_POKER_TYPE.FOUR_WITH_SINGLE: // 四张带单牌
            if (list.length < 4) break;
            if (list.length > 5) {
                //选出4张主牌
                var four_list = [];
                for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                    four_list.push(list_count_14[4].slice(i - 3, i + 1));
                }
                //找翅膀
                if (four_list.length > 0) {

                    for (let i = 0; i < four_list.length; i++) {
                        let four_grade = config.getCard(four_list[i][0]).grade;
                        let last_grade = 0;
                        let single_list = [];
                        for (let j = list.length - 1; j >= 0; j--) {
                            let wing_grade = config.getCard(list[j]).grade;
                            if (wing_grade != four_grade && wing_grade != last_grade) {
                                last_grade = wing_grade;
                                //result.push(four_list[i].concat(list[j]));
                                single_list.push(list[j]);
                            }
                        }
                        if (single_list.length > 0) {
                            //省略的作法,这里需要选取组合 length里选择两张不重复的组合
                            for (let k = 0; k < single_list.length - 1; k++) {
                                result.push(four_list[i].concat([single_list[k], single_list[k + 1]]));
                            }
                        }
                    }
                }
            }
            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }
            break;
        case DDZ_POKER_TYPE.FOUR_WITH_TWIN: // 四张带对子
            if (list.length < 4) break;
            if (list.length > 7) {
                //选出4张主牌
                var four_list = [];
                for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                    four_list.push(list_count_14[4].slice(i - 3, i + 1));
                }
                //找翅膀
                if (four_list.length > 0) {

                    for (let i = 0; i < four_list.length; i++) {
                        let four_grade = config.getCard(four_list[i][0]).grade;
                        let twin_list = list_count_14[2].concat();
                        //3组
                        for (let j = list_count_14[3].length - 1; j >= 0; j -= 3) {
                            twin_list = twin_list.concat([list_count_14[3][j - 2], list_count_14[3][j - 1]]);
                        }
                        //4组
                        for (let j = list_count_14[4].length - 1; j >= 0; j -= 4) {
                            if (config.getCard(list_count_14[4][j]).grade != four_grade) {
                                twin_list = twin_list.concat([list_count_14[4][j - 3], list_count_14[4][j - 2], list_count_14[4][j - 1], list_count_14[4][j]]);
                            }
                        }
                        if (twin_list.length > 0) {
                            for (let k = 0; k < twin_list.length - 3; k += 2) {
                                result.push(four_list[i].concat([twin_list[k], twin_list[k + 1], twin_list[k + 2], twin_list[k + 3]]));
                            }
                        }
                    }
                }
            }
            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }

            break;
        case DDZ_POKER_TYPE.PLANE_WITH_SINGLE: // 飞机带单牌
            if (list.length < 4) break;
            if (list.length >= 8) {

                //目标飞机数量
                let target_plane_count = targetPartern.pais.length / 4;
                //找飞机
                let all_three_list = [], last_grade;
                for (let i = list.length - 1; i >= 2;) {
                    let grade = config.getCard(list[i]).grade;

                    if (grade == config.getCard(list[i - 1]).grade && grade == config.getCard(list[i - 2]).grade) {

                        if (last_grade) {
                            if (grade - last_grade == 1) {
                                all_three_list[all_three_list.length - 1].push(list[i], list[i - 1], list[i - 2]);
                            } else {
                                all_three_list.push([list[i], list[i - 1], list[i - 2]]);
                            }
                        } else {
                            all_three_list.push([list[i], list[i - 1], list[i - 2]]);
                        }
                        last_grade = grade;
                        i -= 3;
                    } else {
                        if (grade != last_grade) {
                            last_grade = null;
                        }
                        i--;
                    }
                }
                //找出符合长度要求的飞机
                let three_list = [];
                for (let i = 0; i < all_three_list.length; i++) {
                    let three_list_child = all_three_list[i];
                    let three_list_child_count = three_list_child.length / 3;
                    if (three_list_child_count == target_plane_count) {
                        three_list.push(three_list_child);
                    }
                    if (three_list_child_count > target_plane_count) {
                        for (let j = 0; j < three_list_child.length - target_plane_count - 1; j += 3) {
                            three_list.push(three_list_child.slice(j, j + target_plane_count * 3));
                        }
                    }
                }
                for (let i = 0; i < three_list.length; i++) {
                    let single_index = [];
                    for (let j = 0; j < three_list[i].length; j += 3) {
                        single_index.push(config.getCard(three_list[i][j]).grade);
                    }
                    let single_list = list_count_14[1].concat();
                    for (let j = list_count_14[2].length - 1; j >= 0; j -= 2) {
                        single_list.unshift(list_count_14[2][j]);
                    }
                    for (let j = list_count_14[3].length - 1; j >= 0; j -= 3) {
                        let _grade = config.getCard(list_count_14[3][j]).grade;
                        if (single_index.indexOf(_grade) == -1) single_list.unshift(list_count_14[3][j]);
                    }
                    for (let j = list_count_14[4].length - 1; j >= 0; j -= 4) {
                        single_list.unshift(list_count_14[4][j]);
                    }
                    //cc.log("single_list" , single_index , "-",three_list[i], " - "  ,single_list);
                    for (let j = 0; j < single_list.length - target_plane_count + 1; j++) {
                        result.push(three_list[i].concat(single_list.slice(j, j + target_plane_count)));
                    }
                }
            }

            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }
            break;
        case DDZ_POKER_TYPE.PLANE_WITH_TWIN: // 飞机带对子

            if (list.length < 4) break;
            if (list.length >= 10) {

                //目标飞机数量
                let target_plane_count = targetPartern.pais.length / 5;
                //找飞机
                let all_three_list = [], last_grade;
                for (let i = list.length - 1; i >= 2;) {
                    let grade = config.getCard(list[i]).grade;

                    if (grade == config.getCard(list[i - 1]).grade && grade == config.getCard(list[i - 2]).grade) {

                        if (last_grade) {
                            if (grade - last_grade == 1) {
                                all_three_list[all_three_list.length - 1].push(list[i], list[i - 1], list[i - 2]);
                            } else {
                                all_three_list.push([list[i], list[i - 1], list[i - 2]]);
                            }
                        } else {
                            all_three_list.push([list[i], list[i - 1], list[i - 2]]);
                        }
                        last_grade = grade;
                        i -= 3;
                    } else {
                        if (grade != last_grade) {
                            last_grade = null;
                        }
                        i--;
                    }
                }
                //找出符合长度要求的飞机
                let three_list = [];
                for (let i = 0; i < all_three_list.length; i++) {
                    let three_list_child = all_three_list[i];
                    let three_list_child_count = three_list_child.length / 3;
                    if (three_list_child_count == target_plane_count) {
                        three_list.push(three_list_child);
                    }
                    if (three_list_child_count > target_plane_count) {
                        for (let j = 0; j < three_list_child.length - target_plane_count - 1; j += 3) {
                            three_list.push(three_list_child.slice(j, j + target_plane_count * 3));
                        }
                    }
                }


                for (let i = 0; i < three_list.length; i++) {
                    let twin_index = [];
                    for (let j = 0; j < three_list[i].length; j += 3) {
                        twin_index.push(config.getCard(three_list[i][j]).grade);
                    }


                    //找出所有双牌(翅膀)
                    let twin_list = [];
                    twin_list = list_count_14[2].concat();
                    for (let j = list_count_14[3].length - 1; j >= 0; j -= 3) {
                        let _grade = config.getCard(list_count_14[3][j]).grade;
                        if (twin_index.indexOf(_grade) == -1) twin_list.unshift(list_count_14[3][j - 2], list_count_14[3][j - 1]);
                    }
                    for (let j = list_count_14[4].length - 1; j >= 0; j -= 4) {
                        let _grade = config.getCard(list_count_14[4][j]).grade;
                        if (twin_index.indexOf(_grade) == -1) twin_list.unshift(list_count_14[4][j - 3], list_count_14[4][j - 2]);
                    }
                    //cc.log("twin_list" , twin_index , "-",three_list[i], " - "  ,twin_list);
                    for (let j = twin_list.length - target_plane_count * 2; j >= 0; j -= 2) {
                        result.push(three_list[i].concat(twin_list.slice(j, j + target_plane_count * 2)));
                    }
                }
            }

            //炸弹
            for (let i = list_count_14[4].length - 1; i >= 0; i -= 4) {
                result.push(list_count_14[4].slice(i - 3, i + 1));
            }
            break;

    }
    //添加王炸
    if (list[0] == 54 && list[1] == 53) result.push([54, 53]);

    console.timeEnd('find:');
    cc.log("-------查找符合条件的牌型列表:\n", result);

    return result;

}

//搜索智能随意出牌列表
export function getAIFreeList(list: number[]) {

    paiTool.sortDescending(list);
    //列表的1-4张分组
    let list_count_14 = paiTool.getCountPais_1_4(list);

    let result = [];

    //权重列表
    let g_list = [
        DDZ_POKER_TYPE.STRAIGHT_TWIN,//连对
        DDZ_POKER_TYPE.STRAIGHT_SINGLE,//顺子
        DDZ_POKER_TYPE.TRIPLE_WITH_SINGLE,//三带单
        DDZ_POKER_TYPE.TRIPLE_WITH_TWIN,//三带双
        DDZ_POKER_TYPE.TWIN,//对子
        DDZ_POKER_TYPE.KING_BOMB,//王炸
        DDZ_POKER_TYPE.SINGLE //单牌
    ];
    //单条结果
    let single_result = null;

    loop: for (let k = 0; k < g_list.length; k++) {

        let start_grade;

        let temp_list = [];

        switch (g_list[k]) {

            case DDZ_POKER_TYPE.STRAIGHT_TWIN://连对

                cc.log("find STRAIGHT_TWIN ....");

                if (list.length < 6) break;

                start_grade = -1;

                for (let i = 0; i < list.length - 5; i++) {

                    let grade_1 = config.getCard(list[i]).grade;

                    let grade_2 = config.getCard(list[i + 1]).grade;

                    if (grade_1 == 16 || grade_1 == 17 || grade_1 == 15 || grade_1 != grade_2 || grade_1 == start_grade) {
                        continue;
                    }
                    start_grade = grade_1;
                    let j = i + 2;
                    let prev_grade = grade_1;
                    let temp = [list[i], list[i + 1]];
                    //找到第一对，然后往前继续找
                    while (j < list.length - 1) {

                        let grade_3 = config.getCard(list[j]).grade;

                        if (grade_3 == prev_grade) {
                            j++;
                            continue;
                        }

                        let grade_4 = config.getCard(list[j + 1]).grade;

                        if (grade_3 + 1 == prev_grade && grade_3 == grade_4) {
                            prev_grade = grade_3;
                            temp.push(list[j], list[j + 1]);
                            j += 2;
                        } else {
                            break;
                        }
                    }
                    if (temp.length >= 6) {
                        cc.log("入列:", temp)
                        temp_list.push(temp);
                    }
                }

                break;
            case DDZ_POKER_TYPE.STRAIGHT_SINGLE://顺子

                cc.log("find STRAIGHT_SINGLE ....");

                if (list.length < 5) break;

                start_grade = -1;

                for (let i = 0; i < list.length - 4; i++) {

                    let grade = config.getCard(list[i]).grade;

                    if (grade == 16 || grade == 17 || grade == 15 || start_grade == grade) {
                        continue;
                    }
                    start_grade = grade;
                    let j = i + 1;
                    let temp = [list[i]];
                    let prev_grade = grade;
                    while (j < list.length) {
                        let grade_1 = config.getCard(list[j]).grade;
                        if (prev_grade == grade_1) {
                            j++;
                            continue;
                        }
                        if (grade_1 + 1 == prev_grade) {
                            temp.push(list[j]);
                            prev_grade = grade_1;
                            j++;
                        } else {
                            break;
                        }
                    }
                    if (temp.length >= 5) {
                        cc.log("入列:", temp)
                        temp_list.push(temp);
                    }
                }

                break;
            case DDZ_POKER_TYPE.TRIPLE_WITH_SINGLE://三带单
                cc.log("find TRIPLE_WITH_SINGLE ....");

                if (list.length < 4) break;

                if (list_count_14[3].length) {
                    //取最后一个
                    let triple = list_count_14[3].slice(-3);
                    //找翅膀
                    if (list_count_14[1].length) {

                        let wing = list_count_14[1][list_count_14[1].length - 1];

                        if (list.length == 4 || list.length == 5 || (config.getCard(triple[0]).grade < 14 && config.getCard(wing).grade < 14)) {

                            triple.push(wing);
                            cc.log("入列:", triple)
                            temp_list.push(triple);
                        }
                    }
                }
                break;
            case DDZ_POKER_TYPE.TRIPLE_WITH_TWIN://三带双
                cc.log("find TRIPLE_WITH_TWIN ....");
                if (list.length < 5) break;
                if (list_count_14[3].length) {
                    //取最后一个
                    let triple = list_count_14[3].slice(-3);
                    //找翅膀
                    if (list_count_14[2].length) {

                        let wing = list_count_14[2].slice(-2);

                        if (list.length == 5 || list.length == 6 || (config.getCard(triple[0]).grade < 14 && config.getCard(wing[0]).grade < 14)) {

                            triple = triple.concat(wing);
                            cc.log("入列:", triple)
                            temp_list.push(triple);
                        }
                    }
                }
                break;
            case DDZ_POKER_TYPE.TWIN:
                cc.log("find TWIN ....");
                if (list.length < 2) break;
                start_grade = -1;

                for (let i = 0; i < list.length - 1; i++) {

                    let grade = config.getCard(list[i]).grade;

                    if (grade == 16 || grade == 17 || grade == start_grade) continue;

                    start_grade = grade;

                    let grade_1 = config.getCard(list[i + 1]).grade;

                    let temp = [list[i]];

                    if (grade == grade_1) {
                        temp.push(list[i + 1]);
                        cc.log("入列:", temp)
                        temp_list.push(temp);
                    }
                }
                break;
            case DDZ_POKER_TYPE.KING_BOMB:
                cc.log("find KING_BOMB ....");
                if (list.length == 2 || list.length == 3) {
                    let grade_1 = config.getCard(list[0]).grade;
                    let grade_2 = config.getCard(list[1]).grade;
                    if (grade_1 == 17 && grade_2 == 16) {
                        cc.log("入列:", [list[0], list[1]]);
                        temp_list.push([list[0], list[1]]);
                    }
                }
                break;
            case DDZ_POKER_TYPE.SINGLE:
                cc.log("find STRAIGHT_SINGLE ....");
                cc.log("入列:", list[list.length - 1])
                temp_list.push([list[list.length - 1]]);
                break;
        }
        if (temp_list.length && !single_result) {

            single_result = temp_list[temp_list.length - 1];

            //break loop;
        }
    }
    cc.log("-----------查找优先出牌结束-------------");
    return single_result;
}