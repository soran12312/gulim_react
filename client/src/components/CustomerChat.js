import { useEffect, useRef, useState } from "react"
import { io } from 'socket.io-client';
import axios from "axios";


const CustomerChat=()=>{
  const[isChat,setChat] = useState([]);
  const socket = useRef(null);
  const [isReady, setIsReady] = useState(false);


  useEffect(() => {
    const getList = async () => {
      const link = "https://192.168.0.68:8080/customer_service/CustomerChat";
      try {
        const response = await axios.get(link);
        console.log(response.data);
        setChat(response.data);
        setIsReady(true);
      } catch (err) {
        console.error(err);
      }
    };

    if(isReady){
      console.log(isChat);
  }else{
      getList();
  }
  }, [isReady]);

  useEffect(() => {
    socket.current = io('https://192.168.0.68:3030');
  },[]);

 

    return(
        <div></div>
        
    );    
   
}


export default CustomerChat