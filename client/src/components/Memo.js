import { useEffect, useRef, useState } from "react";
import { updateMemo, insertMemo, deleteMemo } from "../crud/crud"

const Memo = (props) => {

    const myMemo = props.myMemo;
    const refrashRoomData = props.refrashRoomData;
    const join_num = props.join_num;
    const room_num = props.room_num;
    const [memos, setMemos] = useState([]);
    const [editingMemo, setEditingMemo] = useState(null);
    const [memoContent, setMemoContent] = useState("");
    const [addMemo, setAddMemo] = useState(false);
    const [newMemo, setNewMemo] = useState("");
    const [isDelete, setIsDelete] = useState(false);

    const memoListRef = useRef(null);

    useEffect(() => {
        if(myMemo){
            console.log("set");
            setMemos(myMemo);
        }
    },[myMemo]);
    
    const handleEdit = (memo) => {
        setEditingMemo(memo.memo_num);
        setMemoContent(memo.memo_content);
    }

    // 메모수정 insert에서 엔터 쳤을 때 db값 수정
    const handleKeyPress = (event, memo) => {
        if (event.key === 'Enter') {
            const updatedMemo = {
                memo_num: memo.memo_num,
                memo_content: memoContent
            };
            console.log(updatedMemo);

            updateMemo(updatedMemo);

            // 다시 방정보 새로 가져옴(내 화면)
            refrashRoomData();

            setEditingMemo(null);
        }
    }

    // 메모 수정 시 value 관리하는 state set
    const handleChange = (event) => {
        setMemoContent(event.target.value);
    }

    // 메모 리스트 클릭 후 다른 곳 클릭 시 수정취소
    const handleClickOutside = (event) => {
        if (memoListRef.current && !memoListRef.current.contains(event.target)) {
            setEditingMemo(null);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);

    const newMemoHandler = (evt) => {
        setNewMemo(evt.target.value);
    }

    // 메모추가 버튼 클릭 시
    const btnClick = (evt) => {
        if(!addMemo){
            setAddMemo(true);
            evt.target.innerText = "저장"
        }else{
            console.log(memos);
            if(join_num === 0){
                var data = {
                    room_num: room_num,
                    memo_content: newMemo,
                }
                console.log(data);
                insertMemo(data);
            }else{
                var data = {
                    join_num: join_num,
                    memo_content: newMemo,
                }
                console.log(data);
                insertMemo(data);
            }

            // 다시 방정보 새로 가져옴(내 화면)
            refrashRoomData();

            setAddMemo(false);
            evt.target.innerText = "메모 추가"
        }
        
    }

    // 메모 삭제 버튼 클릭 시
    const deleteBtnClick = () => {
        setIsDelete(true);
    }

    const memoDelete = (memo_num) => {
        deleteMemo(memo_num);

        // 다시 방정보 새로 가져옴(내 화면)
        refrashRoomData();

        setIsDelete(false);
    }

    return (
        <ul ref={memoListRef}>
            {memos.map(memo => (
                <li key={memo.memo_num} onClick={() => handleEdit(memo)}>
                    {editingMemo === memo.memo_num 
                        ? <textarea value={memoContent} onChange={handleChange} onKeyPress={(event) => handleKeyPress(event, memo)}/>
                        : memo.memo_content.length <= 10 
                            ? memo.memo_content 
                            : `${memo.memo_content.substring(0, 10)}...`}
                    {isDelete && <button onClick={() => memoDelete(memo.memo_num)}>삭제</button>}
                </li>
            ))}
            {addMemo && <input type="text" value={newMemo} onChange={newMemoHandler}></input>}
            <button onClick={btnClick}>메모 추가</button>
            <button onClick={deleteBtnClick}>메모 삭제</button>
        </ul>
    );
}

export default Memo;
