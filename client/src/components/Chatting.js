import { useEffect, useRef } from "react";


const Chatting = (props) => {
    const socket = props.socket;

    const chatGrid = useRef(null);
    const chatInput = useRef(null);

    console.log(socket.current);

    useEffect(() => {
        // 소켓서버에서 메시지 수신 시 채팅그리드에 출력
        socket.current.on("newMessage", (userId, message) => {
            setMessage(message, userId);
        });
    },[]);
    
    // input 태그에서 엔터 누르면 chatHandler 호출
    const enterKeyPress = (evt) => {
        if(evt.key === "Enter"){
            chatHandler()
        }
    }

    // input 태그에 입력한 값을 받아 내 채팅그리드에 출력 및 소켓서버로 보냄
    const chatHandler = () => {
        const message = chatInput.current.value;
        // 입력값이 있을 경우에만 작동
        if(message && message.trim() !== ""){
            socket.current.emit("message", message);

            setMessage(message);
    
            chatInput.current.value = "";
        }
    }

    // 메시지와 유저아이디를 받아 채팅그리드에 출력
    const setMessage = (message, userId=" ") => {
        const newMessage = document.createElement("li");
        if(userId === " "){
            newMessage.textContent = "나 : "+message;
        }else{
            newMessage.textContent = userId+" : "+message;
        }

        chatGrid.current.appendChild(newMessage);
        scrollToBottom();
    }

    // 채팅 그리드의 스크롤을 가장 하단으로 설정
    const scrollToBottom = () => {
        const gridElement = chatGrid.current;
        gridElement.scrollTop = gridElement.scrollHeight;
    };

    return (
        <div>
            <ul className="chatGrid" ref={chatGrid} style={{ height: "190px", overflow: "auto" }}></ul>
            <input style={{ width: "330px" }} type="text" ref={chatInput} onKeyDown={enterKeyPress}></input><button onClick={chatHandler}>보내기</button>
        </div>
    );
}

export default Chatting;