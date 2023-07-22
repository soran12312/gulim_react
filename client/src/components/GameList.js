import axios from "axios";
import { useEffect, useState } from "react";
import GameRoom from "./GameRoom";


const GameList = () => {

    const [rooms,setRooms] = useState([]);
    const [isReady,setIsReady] = useState(false);
    const [selectedRooms,setSelectedRooms] = useState([]);

    useEffect(() => {
        const getList = async () => {
            const link = "https://192.168.0.68:8080/game/play/getList"
            try{
                const response = await axios.get(link);
                setRooms(response.data);
                setSelectedRooms(response.data);
                setIsReady(true);

            }catch(err){
                console.error(err);
            }
        }

        if(isReady){
            console.log(rooms);
        }else{
            getList();
        }

    },[isReady]);


    return (
        <div>
            <button>방 만들기</button>
            <br/>
            <button>전체 방 보기</button>
            <button>모집중인 방만 보기</button>
            <button>관전가능한 방만 보기</button>

            <table>
                <thead>
                    <td>마스터</td>
                    <td>이름 및 소개</td>
                    <td>게임정보</td>
                </thead>
                {selectedRooms && selectedRooms.sort((a, b) => new Date(b.create_date) - new Date(a.create_date)).map(room => <GameRoom key={room.room_num} room={room} />)}
            </table>
        </div>
    )
}

export default GameList;