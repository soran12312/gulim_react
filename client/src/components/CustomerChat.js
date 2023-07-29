import { useEffect, useRef, useState } from "react"
import { io } from 'socket.io-client';
import axios from "axios";
import { useParams } from "react-router-dom";


const CustomerChat=()=>{
  const[isImage,setImage] = useState([]);
  const socket = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const {userId}= useParams();
  const [chat,setChat] = useState("");
  const [isManager,setIsmanager] = useState(null);

  const chatGrid = useRef(null);
  const input_grid = useRef(null);

  useEffect(() => {
    socket.current = io('https://192.168.0.68:3030');
  },[]);

  useEffect(() => {
    
    const getData = async () => {
      

      const link = "https://192.168.0.68:8080/customer_service/customer_chat?id="+userId;
      try {
        var result = await axios.get(link);
        console.log(result.data);

        if(result.data === 0){
          setIsmanager(false);
        }else{
          setIsmanager(true);
        }

        setIsReady(true)
      } catch (error) {
        console.log(error);
      }
    }
    
    if(isReady){

      if(isManager && socket && socket.current){
        console.log("관리자");
    
        socket.current.emit("join_admin",userId);
    
        socket.current.on("user_joined",(userId) => {

          // 스프링에 신호 보내기
          window.parent.postMessage("user_connect", "*");

          send_chat("유저가 입장하였습니다.", "admin");
    
          socket.current.emit("join_chat",userId);
        });
    
      }else if(socket && socket.current){
    
        console.log("유저");
        socket.current.emit("join_customer", userId);
    
        socket.current.on("admin_joined",() => {
          send_chat("관리자가 입장하였습니다.", "admin");
        });
      }

    }else{

      getData();

      socket.current.on("chatting_arrive", (message, id) => {
        send_chat(message, id);
      });

    }
  },[isReady]);


  const send_chat=(chat, userId=" ")=>{

    const newChat = document.createElement("li");
    if(userId === " "){
      newChat.textContent = "나 : " + chat;
    }else{
      newChat.textContent = userId + " : " + chat;
    }

    chatGrid.current.appendChild(newChat);

    scrollToBottom();
  }

  // 채팅 그리드의 스크롤을 가장 하단으로 설정
  const scrollToBottom = () => {
    const gridElement = chatGrid.current;
    gridElement.scrollTop = gridElement.scrollHeight;
  };

  const chatInput = (evt) => {
    setChat(evt.target.value);
  }

  const enterHandler = (evt) => {
    if(evt.key === "Enter"){
      chatingHandler();
    }
  }

  const chatingHandler = () => {
    send_chat(chat);

    socket.current.emit("chatting", chat);

    setChat("");
    input_grid.current.value = "";
  }

    return(
        <div>
         <ul ref={chatGrid} style={{ height: "260px", overflow: "auto" }}>

         </ul>
          <input type="text" onChange={chatInput} onKeyDown={enterHandler} ref={input_grid}></input>
          <button onClick={chatingHandler}>전송</button>
        </div>
        
    );    
   
}


export default CustomerChat