import axios from "axios";
import { useEffect, useState } from "react";
import GameRoom from "./GameRoom";
import '../css/chat.css'

// 방만들기, 전체방보기, 모집중인 방만보기, 관전가능한 방만 보기, 검색 버튼 css
const buttonStyle = {
    margin: '5px',
    padding: '10px',
    backgroundColor: '#812323', 
    border: 'none',
    color: 'white',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    transitionDuration: '0.4s',
    cursor: 'pointer',
    borderRadius : '8px'
  };

  //gamelist전체 background 컬러
  const background = {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center' , 
   
};


const GameList = () => {

    const [rooms,setRooms] = useState([]);
    const [isReady,setIsReady] = useState(false);
    const [selectedRooms,setSelectedRooms] = useState([]);
    const [selectedOption, setSelectedOption] = useState('room_name');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const getList = async () => {
            //방목록 반환하는 API의 주소
            const link = "https://192.168.0.68:8080/game/play/getList"
            try{
                //기다렸다가 응답도착하면
                const response = await axios.get(link);
                //rooms에 방목록 데이터 초기값으로 설정
                setRooms(response.data);
                //selectrooms에 방목록 데이터 설정(모든방이 선택된 상태)
                setSelectedRooms(response.data);
                //더이상 데이터 가져오지 않음
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

    // 전체 방 보기 클릭 시 일치하는 방을 selected 리스트에 추가 
    const selectAllRooms = () => {
        if(rooms){
            setSelectedRooms(rooms);
        }
    }

    // 모집중인 방만 보기 클릭 시 일치하는 방을 selected 리스트에 추가 
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

    // 관전가능한 방만 보기 클릭 시 일치하는 방을 selected 리스트에 추가 
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

    // 영상, 음성 버튼 클릭 시 일치하는 방을 selected 리스트에 추가 
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

    // 해시태그 클릭 시 일치하는 방을 selected 리스트에 추가 
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

    const goWatching = (room_num) => {
        var url = "https://192.168.0.68:3000/watchGame/"+room_num;
		window.open(url, 'Chatting Room','width=1300,height=900');
    }


    return (
        <div style={background}>
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
                    <tr style={{ textAlign: 'center' }}>
                        <td>마스터</td>
                        <td>이름 및 소개</td>
                        <td>게임정보</td>
                    </tr>
                </thead>
                {selectedRooms && 
                selectedRooms
                    .sort((a, b) => new Date(b.create_date) - new Date(a.create_date))
                    .map(room => 
                    
                        <GameRoom 
                        key={room.room_num} 
                        room={room} 
                        etVideoAudio={setVideoAudio} 
                        selectHashtag={selectHashtag} 
                        goGameDetail={goGameDetail}/>
                    
                )}
            </table>
            <form onSubmit={handleSubmit}>
                <select defaultValue={"room_name"} onChange={handleOptionChange} style={{height : '40px'}}>
                    <option value={"nickname"}>작성자</option>
                    <option value={"room_name"}>제목</option>
                </select>
                <input type="text" onChange={handleInputChange} onKeyDown={enterKeyPress} style={{height : '40px' , width: '300px'}}></input>
                <button style={buttonStyle}>검색</button>
            </form>
        </div>
    )
}

export default GameList;