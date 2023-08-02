import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import axios from "axios";
import { useDispatch, useSelector  } from 'react-redux';
import { addUser, removeUser } from '../reducer/roomReducer';
import Chatting from './Chatting';
import CenterLoc from './CenterLoc';
import Inventory from './Inventory';
import StatAndSkill from './StatAndSkill';
import Modal from 'react-modal';
import Memo from './Memo';
import '../css/videoRoom.css'

const styles = {
  video: {
    width: 300,
    height: 170,
  }
};


const VideoRoom = () => {

  const dispatch = useDispatch();
  const state = useSelector((state) => state.roomInfo.user);
  var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  const { room } = useParams();
  const { userId } = useParams();

  const  roomId = room;
  let myPeerId;
  const myStream = useRef(null);

  const [camereState,setCamereState] = useState(true);
  const cameraBtn = useRef(null);

  const [muteState,setMuteState] = useState(true);
  const muteBtn = useRef(null);

  const [recodeState, setRecodeState] = useState(true);
  const recodeBtn = useRef(null);

  const [download,setDownload] = useState(false);
  const downloadLink = useRef(null);
  const [audioURL, setAudioURL] = useState(null);
  const [runSTT,setRunSTT] = useState(false);
  const [recodedAudio,setRecodedAudio] = useState(null);

  const [ignoreSelect, setIgnoreSelect] = useState(false);

  const videoRefs = useRef(Array(6).fill(null));
  const [isReady, setIsReady] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [diceRoll, setDiceRoll] = useState(false);

  const [diceFace, setDiceFace] = useState(0);
  const [diceCount, setDiceCount] = useState(0);
  const [myDice, setMyDice] = useState({});

  const [userData, setUserData] = useState({});

  const [members, setMembers] = useState({});
  const [membersState, setMembersState] = useState(false);
  const [streamSetting, setStreamSetting] = useState({});

  const [myMemo, setMyMemo] = useState([]);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  // key = 연결된 유저들의 peerId, value = peer.call 객체
  const peers = useRef({});
  const centerLoc = useRef(null);

  // 소켓과 피어연결을 컴포넌트에서 참조할 수 있도록 useRef사용
  const socket = useRef(null);
  const peer = useRef(null);

  useEffect(() => {
    // 화면이 처음 랜더링될 때 1번만 소켓,피어연결 시행
    socket.current = io('https://192.168.0.68:3030');
    peer.current = new Peer({
      config: {
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302',
              'stun:stun2.l.google.com:19302',
              'stun:stun3.l.google.com:19302',
              'stun:stun4.l.google.com:19302',
            ],
          },
        ],
      },
      path: '/peerjs',
      host: '/',
      port: '3030',
      secure: true,
    });

  }, []);

  useEffect(() => {
    // 스프링을 통해 db에서 채팅방의 데이터를 얻어오는 함수
    // (첫 랜더링 시 한번만 실행되며, 실행 후 isReady를 true로 만들어 다시 실행되지 않는다.)
    const getRoomData = async () => {
      const link = `https://192.168.0.68:8080/chatData/room/${room}`;
      try {
        const response = await axios.get(link);
        const resData = response.data;
        setUserData(response.data);
        if(resData.video===0){
          setStreamSetting({video: true, audio: true});
        }else if(resData.video===1){
          setStreamSetting({audio: true});
        }
        //streamId = resData.streamId;
        if(resData.id === userId){
          setIsMaster(true);
        }
        console.log(resData);
        setIsReady(true);
      } catch (error) {
        console.error(error);
      }
    };
    
    // isReady가 true일 경우에만 실행하고 false인 경우 getRoomData()를 시행
    if (isReady) {
      memoSetting();
      getUserMedia(streamSetting, (stream) =>{
        console.log(stream);
        myStream.current = stream;
        // 나의 스트림을 비디오에 set
        for (const ref of videoRefs.current) {
          
          if (ref && !ref.srcObject) {

            // 유저가 게임마스터일 경우
            if (userId == userData.id){
              var span = document.createElement("span");
              var user = `게임마스터(${userData.id})`;
              span.textContent = user;
              ref.parentNode.prepend(span);
            }else{ // 일반 유저일 경우
              var userInfo = userData.member_info.find((member) => member.id === userId);

              var span = document.createElement("span");
              var user = `${userInfo.char_name}(${userInfo.id}) / ${userInfo.char_propensity} / ${userInfo.char_class} / ${userInfo.species} / LV.${userInfo.level}`;
              span.textContent = user;
              ref.parentNode.prepend(span);
            }
            
            console.log("비디오 setting");
            ref.srcObject = stream;
            break; // 반복문 종료
          }
        }

        myPeerId = peer.current.id;
        // 소켓에 roomId로 join 하면서 방에 있는 다른 유저에게 나의 userId, streamId, peerId를 보냄
        socket.current.emit("join-room",roomId, userId, myPeerId, stream.id);

        // 리듀서에 유저정보를 저장한 후 dispatch
        dispatch(addUser(roomId, myPeerId, userId, myStream.current.id));

        // 소켓에 다른 유저가 접속 시 해당 유저의 peerId를 받아 peer 연결
        socket.current.on("user-connected", (peerId, userId, users) => {
          setMembers(users);
          setMembersState(true);
          connectToNewUser(peerId, stream);
        });


        // 다른 유저가 나의 peerId로 call 했을 때 이벤트
        peer.current.on('call', (call) => {
          console.log("call");
          // answer로 나의 stream을 보내준다
          call.answer(stream);

          // 다른 유저의 stream이 넘어왔을 때 이벤트
          call.on("stream", (remoteStream) => {
            console.log("stream");
            // console.log(userNum);
            // videoRefs를 순회하면서 srcObject가 null인곳에 userVideoStream을 set
            for (const ref of videoRefs.current) {
              if (ref && !ref.srcObject) {

                console.log("넘어온 stream 비디오에 setting");
                console.log(remoteStream.id);
                ref.srcObject = remoteStream;
                break; // 반복문 종료
              }else if (ref && ref.srcObject.id === remoteStream.id) break;
            }
            setMembersState(true);
          });
        }); // end of peer.on call

        // 유저가 소켓연결을 끊을 시(채팅방을 나갔을 때)
        socket.current.on("user-disconnected", (peerId, streamId) => {
          console.log("유저 접속 해제");
          // 접속을 끊은 유저의 stream을 null로
          videoRefs.current.forEach((ref) => {
            if (ref && ref.srcObject && ref.srcObject.id && ref.srcObject.id === streamId) {
              ref.srcObject = null;
            }
          });
          // 해당 유저와 연결된 call을 삭제
          delete peers.current[peerId]
          // 리듀서의 유저정보 삭제
          removeUser(peerId);
        });

        // 강퇴 당했을 때
        socket.current.on("ignored", () => {
          socket.current.disconnect();
          //다른 유저들의 스트림을 제거
          videoRefs.current.forEach((ref) => {
            if (ref && ref.srcObject && ref.srcObject.id && ref.srcObject.id !== myStream.current.id) {
              ref.srcObject = null;
            }
          });
        });

        // 방의 누군가가 강퇴당했을 때
        socket.current.on("userIgnored", (userId) => {
          alert(userId+"님이 강퇴되었습니다.");
        });

        // 주사위 굴리기 권한 받았을 때
        socket.current.on("getDice", (diceFace, diceCount) => {
          setMyDice({"diceFace": diceFace, "diceCount": diceCount});
          setDiceRoll(true);
        });

        // 접속 시 서버에서 기존에 접속해있던 유저정보를 받아옴
        socket.current.on("userInfo", (users) => {
          console.log("유저정보 받아옴 :", users);
          setMembers(users);
          setMembersState(true);
        });

        // 새로운 유저가 peer에 접속 시 peerId(상대방의 peerId)와 stream(나의 Stream)을 받아 video stream(상대방)을 제어
        const connectToNewUser = (peerId, stream) => {
          // 상대방의 peerId로 peer를 연결하면서 나의 stream을 보냄
            const call = peer.current.call(peerId, stream);
            console.log("call");
            console.log(call);
            // 상대방의 stream이 넘어오면 화면에 set
            call.on('stream', (userVideoStream) => {
              console.log("on stream");
              // videoRefs를 순회하면서 srcObject가 null인곳에 userVideoStream을 set
              for (const ref of videoRefs.current) {
                if (ref && !ref.srcObject) {

                  console.log("새로운 유저 비디오 setting");
                  ref.srcObject = userVideoStream;
                  break; // 반복문 종료
                }else if (ref && ref.srcObject.id === userVideoStream.id) break;
              }
              setMembersState(true);
            });

            // 현재 연결중인 call을 map에 담음
            peers.current[peerId] = call;
            console.log("peers :",peers);
        }; // end of connectToNewUser

        // 인벤토리, 스킬, 스텟 변화 시 db에서 방정보 다시 가져옴
        socket.current.on("refrash", () => {
          refrashRoomData();
        });

        // 방정보 새로 가져오기
        const refrashRoomData = async () => {
          const link = `https://192.168.0.68:8080/chatData/room/${room}`;
          try {
            const response = await axios.get(link);
            setUserData(response.data);
            console.log("refrash");
          } catch (error) {
            console.error(error);
          }
        };

      });


    } else {
      getRoomData();
    }
  }, [isReady]);

  useEffect(() => {

    // streamId로 해당 유저의 userId 검색
    let getUserIdByStreamId = (users, streamId) => {
      var roomUsers = users[roomId];
      for (var userId in roomUsers) {
        if (roomUsers[userId].streamId === streamId) {
          return userId;
        }
      }
      return null;
    };

    if(membersState){
      console.log("맴버: ",members);

      for (const ref of videoRefs.current) {
        if (ref && ref.srcObject) {
          //streamId를 이용하여 유저의 id를 알아냄
          var remoteUserId = getUserIdByStreamId(members,ref.srcObject.id);
          console.log("기존유저: ",remoteUserId);

          var parentNode = ref.parentNode;
          var spans = parentNode.querySelectorAll('span');
          spans.forEach(span => {
            parentNode.removeChild(span);
          });

          // 유저가 게임마스터일 경우
          if (remoteUserId == userData.id){
            var span = document.createElement("span");
            var user = `게임마스터(${userData.id})`;
            span.textContent = user;
            ref.parentNode.prepend(span);
          }else{ // 일반 유저일 경우
            var remoteUserInfo = userData.member_info.find((member) => member.id === remoteUserId);

            var span = document.createElement("span");
            var user = `${remoteUserInfo.char_name}(${remoteUserInfo.id}) / ${remoteUserInfo.char_propensity} / ${remoteUserInfo.char_class} / ${remoteUserInfo.species} / LV.${remoteUserInfo.level}`;
            span.textContent = user;
            ref.parentNode.prepend(span);
          }
          
        }
      }

      setMembersState(false);
    }
  }, [membersState]);

  // 화면 송출 조작 버튼이벤트
  const cameraHandler = () => {
    //console.log(myStream.current);
    myStream.current.getVideoTracks().forEach((track) =>{track.enabled = !track.enabled});
    if(camereState){
      cameraBtn.current.innerText = "화면켜기";
      setCamereState(false);
    }else{
      cameraBtn.current.innerText = "화면끄기";
      setCamereState(true);
    }
  }

  // mute, unmute 버튼이벤트
  const muteHandler = () => {

    myStream.current.getAudioTracks().forEach((track) =>{track.enabled = !track.enabled});
    if(muteState){
      muteBtn.current.innerText = "unmute";
      setMuteState(false);
    }else{
      muteBtn.current.innerText = "mute";
      setMuteState(true);
    }
  }

  // 유저 화면 클릭 시 이벤트
  const ignoreHandler = (evt) => {
    // 강퇴버튼을 누른 상황일 경우에만 이벤트 작동(강퇴버튼은 마스터에게만 보임)
    if(ignoreSelect){
      const targetElement = evt.target;
      if(targetElement && targetElement.srcObject){
        //console.log(targetElement.srcObject.id);
        if(window.confirm("정말 강퇴하시겠습니까?")){
          socket.current.emit("ignoreUser", targetElement.srcObject.id);
        }
        setIgnoreSelect(false);
      }
    }
  }

  // 강퇴하기 버튼 클릭 시 이벤트(이용자 화면 클릭하여 강퇴하기 활성화)
  const ignoreSelectBtn =() => {
    alert("내보낼 이용자의 화면을 클릭해주세요");
    setIgnoreSelect(true);
  }

  // 주사위굴리기 권한 받은 유저가 주사위 굴리면 주사위굴리기버튼 비활성화
  const diceRollClick = () => {
    setDiceRoll(false);
  }

  // 주사위 주기버튼 클릭 시 이벤트
  const handleGiveDice = (btnId) => {
    centerLoc.current.selectDice()

    setSelectedUserVideo(videoRefs.current[btnId]);
  }

  // 주사위를 줄 유저의 비디오
  const [selectedUserVideo, setSelectedUserVideo] = useState();

  // setDiceFace와 setDiceCount를 작동시키는 함수인 handleGiveDice에서 setSelectedUserVideo 작동이 끝난 후 작동하는 useEffect
  useEffect(() => {
    // 주사위를 줄 유저의 비디오가 null이 아닐때만 작동
    if(selectedUserVideo){
      
      // 소켓서버에 주사위를 줄 유저, 주사위 면 수, 주사위 갯수를 보냄
      socket.current.emit("giveDice", selectedUserVideo.srcObject.id, diceFace, diceCount);
      // null로 바꿔주지 않으면 똑같은 유저에게 주사위를 2번 연속으로 줄 때 작동하지 않음
      setSelectedUserVideo(null);
    }
  },[selectedUserVideo]);

  // CenterLoc에서 마스터가 선택한 주사위 면수와 갯수를 가져옴
  const getDice = async (diceFace, diceCount) => {
    setDiceFace(diceFace);
    setDiceCount(diceCount);
  }

  const [mouseHoverUser, setMouseHoverUser] = useState();

  // video에 마우스 올렸을 시 이벤트
  const userSetting = (num) => {
    var selectedStreamId = videoRefs.current[num].srcObject && videoRefs.current[num].srcObject.id;
    var selectedUserId = getUserIdByStreamId(members, selectedStreamId);
    // 마우스 올린 유저가 게임마스터가 아닐경우에만 작동
    if((selectedUserId !== userData.id) && selectedUserId){
      setMouseHoverUser(selectedUserId);
    }
  }

  // streamId로 해당 유저의 userId 검색
  let getUserIdByStreamId = (users, streamId) => {
    var roomUsers = users[roomId];
    for (var userId in roomUsers) {
      if (roomUsers[userId].streamId === streamId) {
        return userId;
      }
    }
    return null;
  };

  const mediaRecorder = useRef(null);
  let recordedChunks = [];

  const recodeHandler = () => {
    
    if(recodeState){
      recodeBtn.current.innerText = "녹음중지";

      // 오디오 스트림만 가져오기
      let audioStream = myStream.current.clone();
      audioStream.getVideoTracks().forEach(track => track.stop());
    
      // 녹음 시작
      mediaRecorder.current = new MediaRecorder(audioStream);
      mediaRecorder.current.start();

      // 녹음 데이터 저장
      mediaRecorder.current.ondataavailable = function(e) {
        console.log('Data available: ', e.data.size);
        recordedChunks.push(e.data);
      };

      // 녹음 완료되면 Blob으로 변환하고 다운로드 링크 생성
      mediaRecorder.current.onstop = function() {
        const blob = new Blob(recordedChunks, {
          type: 'audio/wav'
        });
        recordedChunks = [];
        setRecodedAudio(blob);
        // Blob URL 생성
        const audioURL = URL.createObjectURL(blob);

        setAudioURL(audioURL);
        setDownload(true);
        setRunSTT(true);
      }
      
      setRecodeState(false);
    } else {
      recodeBtn.current.innerText = "녹음";

      // 녹음 중지
      if (mediaRecorder && mediaRecorder.current) {
        mediaRecorder.current.stop();
      }
      setRecodeState(true);
    }
  }

  
  // 녹음본 다운로드 링크 출력 컨트롤
  useEffect(() => {
    if(download && downloadLink.current) {
      downloadLink.current.href = audioURL;
      downloadLink.current.download = 'recorded.wav';
      downloadLink.current.innerText = "녹음본 다운로드";
    } else if(downloadLink.current) {
        downloadLink.current.href = '';
        downloadLink.current.download = '';
        downloadLink.current.innerText = '';
    }
  }, [download, audioURL]);

  const [transcription, setTranscription] = useState("");
  const [saveText,setSaveText] = useState(false);
  const textSave = useRef(null);


  // 음성 텍스트로 변환 버튼이벤트
  const sttHandler = () => {
    // 파이썬으로 보낼 데이터
    let formData = new FormData();
    formData.append('audio', recodedAudio, 'recorded.wav');
    
    // 파이썬으로 post요청
    axios.post('https://192.168.0.68:5000/transcribe', formData, {
      headers: {
          'Content-Type': 'multipart/form-data'
      }
  })
    .then((response) => {
      console.log(response.data);
      setTranscription(response.data);
      setSaveText(true);
      setRunSTT(false);
    })
    .catch((error) => {
      console.error(error);
      setRunSTT(false);
    });
  }

  const saveTextAsFile = () => {
    const blob = new Blob([transcription], {type: "text/plain;charset=utf-8"});
    const href = URL.createObjectURL(blob);
    textSave.current.href = href;
    textSave.current.download = 'transcribed.txt';
  }

  // 방정보 새로 가져오기
  const refrashRoomData = async () => {
    const link = `https://192.168.0.68:8080/chatData/room/${room}`;
    try {
      const response = await axios.get(link);
      setUserData(response.data);
      console.log("refrash");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if(userData && userData.member_info){
      memoSetting();
    }

  },[userData]);
  
  // 유저정보에서 나의 메모를 찾아 myMemo에 set
  const memoSetting = () => {
    if(isMaster){
      setMyMemo(userData.master_memos);
    }else{
      setMyMemo(userData.member_info.find((member) => member.id === userId).memos);
    }
  }

  // 나가기버튼 클릭 시 창닫기
  const closeWindow = () => {
    window.close();
  }

if(isReady){

  return (
    <>
    <div className='backGround'>
      <button className='exitBtn' onClick={closeWindow}>나가기</button>
      <h1 className='title'>{userData.room_name}</h1>
      <div>
        <table className='videoRoomGrid'>
          <tr>
            <td></td>
            <td><video style={styles.video} autoPlay playsInline ref={(element) => (videoRefs.current[0] = element)} /></td>
            <td rowSpan={3} colSpan={2} className="canterLoc">
              <CenterLoc myDice={myDice} ref={centerLoc} isMaster={isMaster} diceRoll={diceRoll} diceRollClick={diceRollClick} socket={socket} getDice={getDice}/>
            </td>
            <td><video style={styles.video} autoPlay playsInline ref={(element) => (videoRefs.current[1] = element)} onClick={ignoreHandler} onMouseEnter={() =>userSetting(1)} onMouseLeave={() =>userSetting(1)}/></td>
            <td>{isMaster && <button onClick={() => handleGiveDice(1)}>주사위주기</button>}</td>
          </tr>
          <tr>
            <td>{isMaster && <button onClick={() => handleGiveDice(2)}>주사위주기</button>}</td>
            <td><video style={styles.video} autoPlay playsInline ref={(element) => (videoRefs.current[2] = element)} onClick={ignoreHandler} onMouseEnter={() =>userSetting(2)} onMouseLeave={() =>userSetting(2)}/></td>
            <td><video style={styles.video} autoPlay playsInline ref={(element) => (videoRefs.current[3] = element)} onClick={ignoreHandler} onMouseEnter={() =>userSetting(3)} onMouseLeave={() =>userSetting(3)}/></td>
            <td>{isMaster && <button onClick={() => handleGiveDice(3)}>주사위주기</button>}</td>
          </tr>
          <tr>
            <td>{isMaster && <button onClick={() => handleGiveDice(4)}>주사위주기</button>}</td>
            <td><video style={styles.video} autoPlay playsInline ref={(element) => (videoRefs.current[4] = element)} onClick={ignoreHandler} onMouseEnter={() =>userSetting(4)} onMouseLeave={() =>userSetting(4)}/></td>
            <td><video style={styles.video} autoPlay playsInline ref={(element) => (videoRefs.current[5] = element)} onClick={ignoreHandler} onMouseEnter={() =>userSetting(5)} onMouseLeave={() =>userSetting(5)}/></td>
            <td>{isMaster && <button onClick={() => handleGiveDice(5)}>주사위주기</button>}</td>
          </tr>
          <tr>
            {!isMaster && 
            <td>
              <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} style={{content: {overflow: "auto", top: '50%',width: '20%', height: '30%',}}}>
                <Memo 
                  myMemo={myMemo} 
                  refrashRoomData={refrashRoomData} 
                  join_num={userData.member_info.find((member) => member.id === userId).join_num}
                  room_num={userData.room_num}/>
              </Modal><br/>
              <button onClick={muteHandler} ref={muteBtn}>mute</button>
              <button onClick={cameraHandler} ref={cameraBtn}>화면끄기</button>
              <button onClick={()=> setModalIsOpen(true)}>메모</button>
              <button onClick={recodeHandler} ref={recodeBtn}>녹음</button>
              {runSTT && <button onClick={sttHandler}>음성을 텍스트로 변환</button>}
              {download && <a ref={downloadLink}></a>}
              {saveText && <button onClick={saveTextAsFile} ref={textSave}>텍스트 다운로드</button>}
              <button>?</button>
            </td>
            }
            {isMaster &&
            <td colSpan={2}>
              <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} style={{content: {overflow: "auto", top: '50%',width: '20%', height: '30%',}}}>
                <Memo 
                  myMemo={myMemo} 
                  refrashRoomData={refrashRoomData} 
                  join_num={0}
                  room_num={userData.room_num}/>
              </Modal><br/>
              <button onClick={muteHandler} ref={muteBtn}>mute</button>
              <button onClick={cameraHandler} ref={cameraBtn}>화면끄기</button>
              <button onClick={()=> setModalIsOpen(true)}>메모</button>
              <button onClick={recodeHandler} ref={recodeBtn}>녹음</button>
              {runSTT && <button onClick={sttHandler}>음성을 텍스트로 변환</button>}
              {download && <a ref={downloadLink}></a>}
              {saveText && <button onClick={saveTextAsFile} ref={textSave}>텍스트 다운로드</button>}
              <button onClick={ignoreSelectBtn}>강퇴</button>
              <button>?</button>
            </td>
            }
            <td>다른사람의 캐릭터정보
              <div style={{ height: "270px", width:"320px", overflow: "auto", wordWrap: 'break-word' }}>
              <StatAndSkill socket={socket} userData={userData} userId={mouseHoverUser} isMaster={isMaster} refrashRoomData={refrashRoomData}/>
              </div>
            </td>
            {!isMaster && 
            <td>나의 캐릭터정보
              <div style={{ height: "270px", width:"320px", overflow: "auto", wordWrap: 'break-word' }}>
              <StatAndSkill socket={socket} userData={userData} userId={userId} refrashRoomData={refrashRoomData}/>
              </div>
            </td>}
            <td>인벤토리
              {isMaster && 
              <div style={{ height: "270px", width:"320px", overflow: "auto", wordWrap: 'break-word' }}>
                <Inventory socket={socket} userData={userData} userId={mouseHoverUser} refrashRoomData={refrashRoomData}/>
              </div>}
              {!isMaster && 
              <div style={{ height: "270px", width:"320px", overflow: "auto", wordWrap: 'break-word' }}>
                <Inventory socket={socket} userData={userData} userId={userId} refrashRoomData={refrashRoomData}/>
              </div>}
            </td>
            <td colSpan={2}><Chatting socket={socket}/></td>
          </tr>
        </table>
      </div>
      </div>
    </>
  );
}else{
  return <div></div>
}
};



export default VideoRoom;