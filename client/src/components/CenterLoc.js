import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import Modal from 'react-modal';

const CenterLoc = React.forwardRef((props, ref) => {

    const isMaster = props.isMaster;
    const diceRoll = props.diceRoll;
    const socket = props.socket;
    const myDice = props.myDice;

    const diceFace = useRef(null);
    const diceCount = useRef(null);
    const fileInput = useRef(null);

    const [rolling,setRolling] = useState(false);
    const [result,setResult] = useState(false);
    const [diceResult,setDiceResult] = useState([]);
    const [diceSum,setDiceSum] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [imgDownload, setImgDownload] = useState(false);
    const [imgData, setImgData] = useState(null);

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

        socket.current.on('imgArrive', (data) => {
            console.log("이미지 받음"+data);
            setImgData(data.buffer);
            setImgDownload(true);
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

    // 이미지 보내기 버튼 클릭 시 모달 출력
    const openSendImgModal = () => {
        setModalIsOpen(true);
    }

    // 이미지 업로드시 이벤트
    const handleImageUpload = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            console.log("이미지 보냄");
            socket.current.emit('image', { image: true, buffer: reader.result });
            
        };
        
        reader.readAsDataURL(file);
    };

    const imgDownloadHandler = () => {
        var url = imgData;

        // 다운로드 링크를 생성
        var link = document.createElement('a');
        link.href = url;
        link.download = 'download.png'; // 다운로드할 파일명

        // 링크를 클릭하여 다운로드를 시작
        link.click();

    }

    return (
        <div>
            <div>
                {isMaster && <button className="imgBtn" onClick={openSendImgModal}>이미지 보내기</button>}
                {imgDownload && <button className="imgBtn" onClick={imgDownloadHandler}>이미지 다운로드</button>}
                <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} style={{content: {overflow: "auto", top: '10%',width: '10%', height: '10%',left: '20%'}}}>
                    <input 
                    type="file"
                    accept="image/*"
                    ref={fileInput}
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    />
                    <button onClick={() => fileInput.current.click()}>
                        이미지 업로드
                    </button>
                </Modal>
                <br/>
                <div className="diceImg">
                    {rolling && <img src="/img/gulim_dice_roll.gif" alt="GIF"/>}
                    {!rolling && <img src="/img/gulim_dice.png" alt="PNG"/>}
                    {result && <span>결과 : {diceResult.join(', ')} 합 : {diceSum}</span>}
                </div>
            </div>
                <div className="diceArea">
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
        </div>
    );
});

export default CenterLoc;