import { useEffect, useRef, useState } from "react"
import { io } from 'socket.io-client';
import axios from "axios";
import { useParams } from "react-router-dom";

const imgtag={
  img: {
    width: 30,
    height: 30,
  }
}
const CustomerChat=()=>{
  const[isImage,setImage] = useState([]);
  const socket = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const {userId}= useParams();
  const [isChat,setChat] = useState([]);

  useEffect(() => {
    const getList = async () => {
      const link = "https://localhost:8080/customer_service/CustomerChat";
      try {
        const response = await axios.get(link,{params:{id:userId}});
        console.log(userId);
        console.log(response.data)
        setImage(response.data);
        setIsReady(true);
      } catch (err) {
        console.error(err);
      }
    };

    if(isReady){
      console.log(isImage);
  }else{
      getList();
  }
  }, [isReady]);

  useEffect(() => {
    socket.current = io('https://localhost:3000');
  },[]);

  const send_chat=(chat, userId=" ",img)=>{

    const newChat = document.createElement("li");
    if(userId === " "){
      newChat.textContent = <img src={img.path}/> + chat;
    }else{
      newChat.textContent = userId + chat;
    }

  }

    return(
        <div>
         
          <input type="text"></input>
          <button>전송</button>
        </div>
        
    );    
   
}


export default CustomerChat