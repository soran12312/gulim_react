import axios from "axios";
import { useEffect, useState } from "react";
import GameRoom from "./GameRoom";

const buttonStyle = {
    margin: '5px',
    padding: '10px',
    backgroundColor: '#4CAF50', /* Green */
    border: 'none',
    color: 'white',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    transitionDuration: '0.4s',
    cursor: 'pointer'
  };

const GameList = () => {

    const [rooms,setRooms] = useState([]);
    const [isReady,setIsReady] = useState(false);
    const [selectedRooms,setSelectedRooms] = useState([]);
    const [selectedOption, setSelectedOption] = useState('room_name');
    const [searchTerm, setSearchTerm] = useState('');

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

    // 전체 방 보기 클릭 시
    const selectAllRooms = () => {
        if(rooms){
            setSelectedRooms(rooms);
        }
    }

    // 모집중인 방만 보기 클릭 시
    const selectRecruitRooms =() => {
        if(rooms){
            let recruitRooms = [];

            rooms.forEach(room => {
                if(room.max_member>room.curr_member){
                    recruitRooms.push(room);
                }
            });

            setSelectedRooms(recruitRooms);
        }
    }

    // 관전가능한 방만 보기 클릭 시
    const selectWatchableRooms =() => {
        if(rooms){
            let watchableRooms = [];

            rooms.forEach(room => {
                if(room.watching===0){
                    watchableRooms.push(room);
                }
            });

            setSelectedRooms(watchableRooms);
        }
    }

    // 영상, 음성 버튼 클릭 시
    const setVideoAudio = (selected) => {
        if(selected==="video"){
            if(rooms){
                let selected = [];
    
                rooms.forEach(room => {
                    if(room.video===0){
                        selected.push(room);
                    }
                });
    
                setSelectedRooms(selected);
            }
        }else if(selected==="audio"){
            if(rooms){
                let selected = [];
    
                rooms.forEach(room => {
                    if(room.video===1){
                        selected.push(room);
                    }
                });
    
                setSelectedRooms(selected);
            }
        }
    }

    // 해시태그 클릭 시
    const selectHashtag = (selectedTag) => {
        if(rooms){
            let selected = [];

            rooms.forEach(room => {
                if(room.tag_contents){
                    room.tag_contents.forEach(tag => {
                        if(selectedTag === tag){
                            selected.push(room);
                        }
                    });
                }
            });

            setSelectedRooms(selected);
        }
    }

    // 방 만들기 클릭 시
    const createRoom = () => {
        window.parent.location.href = "https://192.168.0.68:8080/game/play/room_create";
    }

    // 방 상세페이지로 이동
    const goGameDetail = (room_num) => {
        window.parent.location.href = "https://192.168.0.68:8080/game/play/room_detail?room_num="+room_num;
    }

    // 검색창 셀렉트태그 변경 시
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    // 검색창 input에 값 변경 시
    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // 검색창 submit 시
    const handleSubmit = (event) => {
        event.preventDefault();

        if(selectedOption==="room_name"){
            if(rooms){
                let selected = [];
    
                rooms.forEach(room => {
                    if(room.room_name && room.room_name.includes(searchTerm)){
                        selected.push(room);
                    }
                });
    
                setSelectedRooms(selected);
            }
        }else if(selectedOption==="nickname"){
            if(rooms){
                let selected = [];
    
                rooms.forEach(room => {
                    if(room.nickname && room.nickname.includes(searchTerm)){
                        selected.push(room);
                    }
                });
    
                setSelectedRooms(selected);
            }
        }
    }

    // input 태그에서 엔터 누르면 handleSubmit 호출
    const enterKeyPress = (evt) => {
        if(evt.key === "Enter"){
            handleSubmit(evt)
        }
    }


    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
                <button onClick={createRoom} style={buttonStyle}>방 만들기</button>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <button onClick={selectAllRooms} style={buttonStyle}>전체 방 보기</button>
                <button onClick={selectRecruitRooms} style={buttonStyle}>모집중인 방만 보기</button>
                <button onClick={selectWatchableRooms} style={buttonStyle}>관전가능한 방만 보기</button>
            </div>

            <table style={{ marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <td>마스터</td>
                        <td>이름 및 소개</td>
                        <td>게임정보</td>
                    </tr>
                </thead>
                {selectedRooms && selectedRooms.sort((a, b) => new Date(b.create_date) - new Date(a.create_date)).map(room => 
                <GameRoom key={room.room_num} room={room} setVideoAudio={setVideoAudio} selectHashtag={selectHashtag} goGameDetail={goGameDetail}/>)}
            </table>
            <form onSubmit={handleSubmit}>
                <select defaultValue={"room_name"} onChange={handleOptionChange}>
                    <option value={"nickname"}>작성자</option>
                    <option value={"room_name"}>제목</option>
                </select>
                <input type="text" onChange={handleInputChange} onKeyDown={enterKeyPress}></input>
                <button style={buttonStyle}>검색</button>
            </form>
        </div>
    )
}

export default GameList;