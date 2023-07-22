

const GameRoom = (props) => {
    const room = props.room;


    return (
        <tr>
            <td>
                {room.nickname}
            </td>
            <td>
                <h4>{room.room_name}</h4>
                <br/>
                <span>{room.plot}</span>
            </td>
            <td>
                {room.tag && room.tag.map(tag_content => <span className="hashtag">{tag_content}</span>)}
                <br/>
                <span>현재인원 : {room.curr_member}/{room.max_member}</span>
                <br/>
                <span>다음 게임 일시 : {!room.next_play_date && "미정"}{room.next_play_date && room.next_play_date}</span>
                <br/>
                <span>예상 기간 : {!room.period && "미정"}{room.period && room.period+"주"}</span>
                <br/>
                {room.video===0 && <span className="video">영상</span>}
                {room.video===1 && <span className="audio">음성</span>}
            </td>
        </tr>
    )
}

export default GameRoom;