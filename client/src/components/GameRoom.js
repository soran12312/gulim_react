
const cellStyle = {
    padding: '10px',
    fontSize: '14px',
    textAlign: 'center',
    padding : '20px'
};
const cellStyle2 = {
    padding: '10px',
    fontSize: '14px'
};

const buttonStyle = {
    margin: '5px',
    padding: '5px',
    backgroundColor: 'rgba(141,113,234,0.8)', 
    border: 'none',
    color: 'white',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius : '15px'
};
const buttonStyle2 = {
    margin: '5px',
    padding: '5px',
    backgroundColor: 'rgba(113,218,234,0.8)', 
    border: 'none',
    color: 'white',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius : '15px'
};
const buttonStyle3 = {
    margin: '5px',
    padding: '5px',
    backgroundColor: 'rgba(234,198,113,0.8)', 
    border: 'none',
    color: 'white',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius : '15px'
};

const linkStyle = {
    color: 'black',
    textDecoration: 'none'
};

const GameRoom = (props) => {
    const room = props.room;

    const setVideoAudio = props.setVideoAudio;

    const selectHashtag = props.selectHashtag;

    const goGameDetail = props.goGameDetail;

    if(room){
        return (
        
            <tr>
                <td style={cellStyle}>
                    {room.nickname}
                </td>
                <td style={cellStyle}>
                    <a style={{cursor: 'pointer'}} onClick={() => goGameDetail(room.room_num)}>
                    <h3>{room.room_name}</h3>
                    <br/>
                    <span>{room.plot}</span>
                    </a>
                </td>
                <td style={cellStyle2}>
                    {room.tag_contents && room.tag_contents.map(tag_content => 
                    <button style={buttonStyle} className="hashtag" onClick={() => selectHashtag(tag_content)}>{tag_content}</button>)}
                    <p>현재인원 : {room.curr_member}/{room.max_member}</p>
                    <p>다음 게임 일시 : {!room.next_play_date && "미정"}{room.next_play_date && room.next_play_date}</p>
                    <p>예상 기간 : {!room.period && "미정"}{room.period && room.period+"주"}</p>
                    {room.video===0 && <button className="video" style={buttonStyle2} onClick={() => setVideoAudio("video")}>영상</button>}
                    {room.video===1 && <button className="audio" style={buttonStyle3} onClick={() => setVideoAudio("audio")}>음성</button>}
                </td>
            </tr>
            
        )
    }
    
}

export default GameRoom;