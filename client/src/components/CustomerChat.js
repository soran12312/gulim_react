import { useEffect, useRef, useState } from "react"
import { io } from 'socket.io-client';
import axios from "axios";
import { useParams } from "react-router-dom";
import "../css/chat.css"

const CustomerChat=()=>{

  const socket = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const {userId}= useParams();
  const [chat,setChat] = useState("");
  const [isManager,setIsmanager] = useState(null);

  const chatGrid = useRef(null);
  const input_grid = useRef(null);

  const style_iframe={
    iframe : {
      width: "450px", 
      overflow: "auto",
      height : "450px"
    }
  }

  // 서버 불러옴
  useEffect(() => {
    socket.current = io('https://192.168.0.68:3030');
  },[]);

  useEffect(() => {
    
    const getData = async () => {
      
      // 스프링에서 이 url이 불릴 때 작동하는 함수
      const link = "https://192.168.0.68:8080/customer_service/customer_chat";    
      try {
        var result = await axios.get(link);
        console.log(result.data);

        //받아오는 데이터가 0이라면
        if(result.data === 0){
          //관리자가 아님
          setIsmanager(false);
        }else{
          //관리자가 맞음
          setIsmanager(true);
        }
        //setIsReady를 true 바꿈
        setIsReady(true)
      } catch (error) {
        console.log(error);
      }
    }
    //isReady라면
    if(isReady){
      //'socket'과 'socket.current'가 존재하고 관리자로 채팅에 참가하면
      if(isManager && socket && socket.current){
        console.log("관리자");
        // 서버에 'join_admin' 이벤트를 발송하여 관리자로 채팅에 참여함을 알림
        socket.current.emit("join_admin",userId);

        // 서버로부터 'user_joined' 이벤트를 수신하면 실행할 콜백 함수
        socket.current.on("user_joined",(userId) => {

        // 스프링에 message , userId 를 보냄
        window.parent.postMessage({message: "user_connect", userId: userId}, "*");
        // 화면에 "유저가 입장하였습니다."라는 메시지를 표시
        send_chat("유저가 입장하였습니다.", userId);
        // 서버에 'join_chat' 이벤트를 발송하여 채팅 방에 참여함
        socket.current.emit("join_chat",userId);

        });
        // 서버로부터 'leave_user' 이벤트를 수신하면 실행할 콜백 함수
        socket.current.on("leave_user",(userId) => {
        //스프링에 message , userId를 보냄
        window.opener.postMessage({message: "leave_chatting", userId: userId}, "*");
        });

      // 'socket'과 'socket.current'가 존재하고,유저로서 채팅에 접속한 경우
      }else if(socket && socket.current){
        
        console.log("유저");
        // 서버에 'join_customer' 이벤트를 발송하여 유저로 채팅에 참여함을 알림
        socket.current.emit("join_customer", userId);
        // 서버로부터 'admin_joined' 이벤트를 수신하면 실행할 콜백 함수
        socket.current.on("admin_joined",() => {
        // 화면에 "관리자가 입장하였습니다."라는 메시지를 표시
        send_chat("관리자가 입장하였습니다.", "admin");
        });

      }
    // 상태가 변경되었을 때 실행되는 useEffect
    // 'isReady'는 서버에서 데이터를 가져왔는지의 여부를 나타냄
    }else{
      //서버에서 데이터 가져옴
      getData();
      // 서버로부터 'chatting_arrive' 이벤트를 수신하면 실행할 콜백 함수 등록
      // 이벤트를 통해 새로운 채팅 메시지를 수신함
      socket.current.on("chatting_arrive", (message, id) => {
      // 'send_chat' 함수를 사용하여 새로운 채팅 메시지를 화면에 표시
      send_chat(message, id);
      });

    }
  },[isReady]);

  // 새로운 채팅 메시지를 화면에 표시
  const send_chat=(chat, userId=" ")=>{
    //li 태그 생성
    const newChat = document.createElement("li");
    // userId 가 " " 이거면
    if(userId === " "){
      newChat.textContent = chat + ": 나  ";
      newChat.classList.add("user-chat");
    }else{
      newChat.textContent = chat+ " : " + userId;
      newChat.classList.add("admin-chat");
    }
    // 채팅 메시지를 화면에 추가
    chatGrid.current.appendChild(newChat);

   
    scrollToBottom();
  }

  // 채팅 그리드의 스크롤을 가장 하단으로 설정
  const scrollToBottom = () => {
    const gridElement = chatGrid.current;
    gridElement.scrollTop = gridElement.scrollHeight;
  };

  // 채팅 창에 값이 변경되면 불림
  const chatInput = (evt) => {
    setChat(evt.target.value);
  }
  // Enter 키가 눌리면 불림
  const enterHandler = (evt) => {
    if(evt.key === "Enter"){
      chatingHandler();
    }
  }

  //전송 버튼을 누르면 호출 되는 함수
  const chatingHandler = () => {

    //새로운 채팅 메세지를 화면에 찍어줌
    send_chat(chat);

    //서버로 "chatting" 이벤트 보내서 채팅 메세지 전달
    socket.current.emit("chatting", chat);
    // 채팅 창 초기화
    setChat("");
    input_grid.current.value = "";
  }
  //나가기 버튼을 누르면 호출 되는 함수
  function handleLeavechat() {
    //서버로 "leave_chat" 이벤트를 보냄
    socket.current.emit("leave_chat");
    window.close();
  }

    return(
      <div className="chat-container">

        <ul ref={chatGrid} className="chat-list" style={style_iframe.iframe}>
        </ul>

      <div className="input-button-container">
        <input type="text" onChange={chatInput} onKeyDown={enterHandler} ref={input_grid}className="input-box"/>
        <button onClick={chatingHandler} className="button">
          전송
        </button>
        <button onClick={handleLeavechat} className="button">
          나가기
        </button>
      </div>
      
    </div>
  );
};


export default CustomerChat