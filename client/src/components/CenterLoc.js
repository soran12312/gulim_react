import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useParams } from 'react-router-dom';


const CenterLoc = React.forwardRef((props, ref) => {

    const isMaster = props.isMaster;
    const diceRoll = props.diceRoll;
    const socket = props.socket;
    const myDice = props.myDice;

    const diceFace = useRef(null);
    const diceCount = useRef(null);

    const [rolling,setRolling] = useState(false);
    const [result,setResult] = useState(false);
    const [diceResult,setDiceResult] = useState([]);
    const [diceSum,setDiceSum] = useState(0);

    useEffect(() => {
        socket.current.on("diceResult",(dResult, sum) => {
            // 기존의 주사위결과 안보이게
            setResult(false);
            // 주사위 굴리는 gif 보이게
            setRolling(true);
            setTimeout(() => {
                // 2.6초 후 주사위 굴리는 gif 종료하고 주사위 초기 png 보임
                setRolling(false);
                // 받아온 주사위 결과 set
                setDiceResult(dResult);
                setDiceSum(sum);
                // 새로운 주사위 결과 보이게
                setResult(true);
            },2600);
            
        });
    },[]);

    const rollDice = (hidden) => {
        setResult(false);
        setRolling(true);
        setTimeout(() => {
            setRolling(false);

            // 마스터가 아닌경우
            if(!isMaster){

                var dice = roll(myDice.diceFace, myDice.diceCount);
                // 소켓에 주사위 나온 결과를 보냄
                socket.current.emit("diceRoll", dice.dResult, dice.sum);

            }else if(hidden==="hidden"){ // 마스터가 몰래굴리기를 한 경우
                roll(diceFace.current.value, diceCount.current.value);
            }else if(hidden==="roll"){ // 마스터가 일반 굴리기를 한 경우
                var dice = roll(diceFace.current.value, diceCount.current.value);
                // 소켓에 주사위 나온 결과를 보냄
                socket.current.emit("diceRoll", dice.dResult, dice.sum);
            }
        },2600);
        

        // 굴리기버튼 비활성화(diceRoll을 false로)
        props.diceRollClick();
    }

    const roll = (face, count) => {
        let dResult = [];
        let sum = 0;
        for(var i = 0; i<count; i++){
            // 1~주사위 면 수 사이의 랜덤한 수 생성하여 리스트에 push
            var num = Math.floor(Math.random() * face) + 1;
            dResult.push(num);
            sum = sum + num;
        }
        setDiceResult(dResult);
        setDiceSum(sum);
        setResult(true);

        return {dResult, sum};
    }

    const selectDice = () => {
        console.log(diceFace.current.value);
        console.log(diceCount.current.value);
        props.getDice(diceFace.current.value, diceCount.current.value);
    }

    useImperativeHandle(ref, () => ({
        selectDice,
    }));

    return (
        <div>
            <div>
                가운데 영역(이미지올리기버튼(방장), 주사위굴리기버튼 등)<br/>
                {rolling && <img src="/img/gulim_dice_roll.gif" alt="GIF"/>}
                {!rolling && <img src="/img/gulim_dice.png" alt="PNG"/>}
                {result && <span>결과 : {diceResult.join(', ')} 합 : {diceSum}</span>}
            </div>
                {isMaster && <button onClick={() => rollDice("hidden")}>몰래 주사위 굴리기</button>}
                {isMaster && (
                    <span>
                        <select ref={diceFace}>
                            {[2, 3, 4, 6, 8, 10, 12, 16, 20, 30, 48, 60, 100].map((value) => (
                                <option key={value} value={value}>
                                {value}
                                </option>
                            ))}
                        </select>면체 , 
                        <select ref={diceCount}>
                            {[1, 2, 3].map((value) => (
                                <option key={value} value={value}>
                                {value}
                                </option>
                            ))}
                        </select>개
                    </span>
                )}
                {(!isMaster && diceRoll) && <span>{myDice.diceFace}면체 , {myDice.diceCount}개</span>}
                {(isMaster || diceRoll) && <button onClick={() => rollDice("roll")}>주사위 굴리기</button>}
        </div>
    );
});

export default CenterLoc;