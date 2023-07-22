

const GameRoom = (props) => {
    const room = props.room;

    const setVideoAudio = props.setVideoAudio;

    const selectHashtag = props.selectHashtag;

    const goGameDetail = props.goGameDetail;

    if(room){
        return (
        
            <tr>
                <td>
                    {room.nickname}
                </td>
                <td>
                    <a onClick={() => goGameDetail(room.room_num)}>
                    <h3>{room.room_name}</h3>
                    <br/>
                    <span>{room.plot}</span>
                    </a>
                </td>
                <td>
                    {room.tag_contents && room.tag_contents.map(tag_content => <button className="hashtag" onClick={() => selectHashtag(tag_content)}>{tag_content}</button>)}
                    <br/>
                    <span>현재인원 : {room.curr_member}/{room.max_member}</span>
                    <br/>
                    <span>다음 게임 일시 : {!room.next_play_date && "미정"}{room.next_play_date && room.next_play_date}</span>
                    <br/>
                    <span>예상 기간 : {!room.period && "미정"}{room.period && room.period+"주"}</span>
                    <br/>
                    {room.video===0 && <button className="video" onClick={() => setVideoAudio("video")}>영상</button>}
                    {room.video===1 && <button className="audio" onClick={() => setVideoAudio("audio")}>음성</button>}
                </td>
            </tr>
            
        )
    }
    
}

export default GameRoom;