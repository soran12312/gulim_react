import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { insertUserItem, modifyUserItem, deleteUserItem, moneyModify } from '../crud/crud';

const Inventory = (props) => {

    const [onModify,setOnModify] = useState(false);
    const [onDelete,setOnDelete] = useState(false);
    const [onModifyMoney,setOnModifyMoney] = useState(false);
    
    const inventoryGrid = useRef(null);
    const moneyModBtn = useRef(null);
    const [modifyMoney,setModifyMoney] = useState();

    const userId = props.userId;
    const userData = props.userData;
    const userInfo = userData.member_info.find((member) => member.id === userId);
    const refrashRoomData = props.refrashRoomData;
    const socket = props.socket;
    const isMaster = props.isMaster;
    const [inventory,setInventory] = useState(null);

    const [itemStates, setItemStates] = useState(null);

    useEffect(() => {
        if(userInfo){
            setInventory(userInfo.inventory);
        }
    },[userInfo]);

    // 수정버튼 클릭 시 이벤트(인벤토리 수정 form value값을 DB에서 받아온 초기값으로 set)
    const modify = () => {
        setItemStates(
            inventory.items.map((item) => ({
                item_num: item.item_num,
                item_name: item.item_name,
                item_amount: item.item_amount,
                item_weight: item.item_weight,
                equip_state: item.equip_state,
                item_detail: item.item_detail,
            }))
        );
        setOnModify(true);
    }

    // 인벤토리 수정 form submit 시 이벤트
    const handleModifySubmit = (evt) => {
        evt.preventDefault();
        console.log(itemStates);
        // db에 수정된 데이터 전달
        modifyUserItem(itemStates);
        // 다시 방정보 새로 가져옴(내 화면)
        refrashRoomData();
        // 방의 다른 사람들 화면도 새로고침
        socket.current.emit("refrash");

        setOnModify(false);
    }

    // 인벤토리 수정 form value값 변경
    const handleChange = (event, index) => {
        const { name, value } = event.target;
        setItemStates((prevItemStates) => {
          return prevItemStates.map((item, i) => {
            if (i === index) {
              return {
                ...item,
                [name]: value,
              };
            }
            return item;
          });
        });
    };

    const deleteItem = (item_num, item_name) => {
        Swal.fire({
            title: '아이템 삭제',
            text: item_name+'을(를) 정말 삭제하시겠습니까?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
          }).then((result) => {
            if (result.isConfirmed) {
                // db에서 데이터 삭제
                deleteUserItem(item_num);

                // 다시 방정보 새로 가져옴(내 화면)
                refrashRoomData();
                // 방의 다른 사람들 화면도 새로고침
                socket.current.emit("refrash");
                setOnDelete(false);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // 취소 버튼을 클릭한 경우 실행할 로직
              setOnDelete(false);
            }
        });
    }

    // 아이템 추가버튼 클릭 시
    const insertItem =() => {
        
        Swal.fire({
            title: '아이템 등록',
            html:
              '<input style= "width: 130px" type="text" id="insert_item_name" placeholder="아이템 이름">' +
              ' 수량 : <input style= "width: 40px" type="number" min=0 id="insert_item_amount">' +
              ' 무게 : <input style= "width: 50px"  type="number" min=0 id="insert_item_weight">' +
              '<br/>상세정보 : <input style= "width: 250px"  type="text" min=0 id="insert_item_detail">' +
              '<br/>장착상태 : <select id="insert_equip_state"><option value=1>장착중</option><option value=0>장착중이 아님</option></select>',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
            preConfirm: () => {
              const item_name = document.getElementById('insert_item_name').value;
              const item_amount = document.getElementById('insert_item_amount').value;
              const item_weight = document.getElementById('insert_item_weight').value;
              const equip_state = document.getElementById('insert_equip_state').value;
              const item_detail = document.getElementById('insert_item_detail').value;
              return { item_name, item_amount, item_weight, item_detail, equip_state };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const { item_name, item_amount, item_weight, equip_state, item_detail } = result.value;
                var item = {
                    'inventory_num' : inventory.inventory_num
                    , 'item_name' : item_name
                    , 'item_amount' : parseInt(item_amount,10)
                    , 'item_weight' : parseInt(item_weight,10)
                    , 'item_detail' : item_detail
                    , 'equip_state' : parseInt(equip_state,10)
                };
                // console.log(item);
                // db에 아이템 insert
                insertUserItem(item);
                // 다시 방정보 새로 가져옴(내 화면)
                refrashRoomData();
                // 방의 다른 사람들 화면도 새로고침
                socket.current.emit("refrash");
            }
        });
    }

    // 소지금 변경 버튼 클릭 시
    const moneyModHandler = () => {
        if(!onModifyMoney){
            // 버튼 텍스트 변경
            moneyModBtn.current.innerText = "변경 완료"
            setOnModifyMoney(true);
        }else{
            var data = {
                'inventory_num': parseInt(inventory.inventory_num,0),
                'money' : parseInt(modifyMoney,0)
            };

            moneyModify(data);

            // 다시 방정보 새로 가져옴(내 화면)
            refrashRoomData();
            // 방의 다른 사람들 화면도 새로고침
            socket.current.emit("refrash");
            moneyModBtn.current.innerText = "소지금 변경"
            setOnModifyMoney(false);
        }
    }

    // 소지금 수정 input태그 변경 시 이벤트
    const changeMoneyVal = (evt) => {
        setModifyMoney(evt.target.value);
    }

    return(
        <div>
            {!userId && <span>마우스를<br/>화면에 올리면<br/>상대방의<br/>인벤토리 정보 출력</span>}
            {(userId && !onModify) &&
                <div ref={inventoryGrid}>
                    <ul>
                        {userInfo && inventory && inventory.items.map((item) => (
                            <div>
                            <li
                                key={item.item_num}
                                data-tooltip-content={`상세정보: ${item.item_detail}`}
                                data-tooltip-id={`tooltip-${item.item_num}`}
                            >
                                {item.item_name} 수량: {item.item_amount} 무게: {item.item_weight} {item.equip_state===1 && "장착중"}
                            </li>
                            {onDelete && <button onClick={() => deleteItem(item.item_num, item.item_name)}>삭제</button>}
                            </div>
                        ))}
                    </ul>
                    {userInfo && inventory && inventory.items.map((item) => (
                        <Tooltip
                        key={item.item_num}
                        id={`tooltip-${item.item_num}`}
                        place="top"
                        />
                    ))}
                    <br/>
                    {!onModifyMoney && <span>소지금 : {userInfo && inventory && inventory.money}</span>}
                    {onModifyMoney && <span>소지금 : <input type='number' defaultValue={userInfo && inventory && inventory.money} onChange={changeMoneyVal}></input></span>}
                    {isMaster && <button onClick={moneyModHandler} ref={moneyModBtn}>소지금 변경</button>}
                    <br/><br/>
                    {isMaster &&
                    <div>
                        <button onClick={modify}>수정</button>
                        <button onClick={insertItem}>추가</button>
                        <button onClick={() => setOnDelete(!onDelete)}>삭제</button>
                    </div>
                    }
                </div>
            }
            {(userId && onModify) && 
                <div>
                    <form onSubmit={handleModifySubmit}>
                        <table>
                        {itemStates && itemStates.map((item, index) => (
                        <tr key={index}>
                            <td>
                            <input
                                style={{ width: '80px' }}
                                type='text'
                                name='item_name'
                                value={item.item_name}
                                placeholder={item.item_name}
                                onChange={(event) => handleChange(event, index)}
                            />
                            수량: <input
                                style={{ width: '40px' }}
                                type='number'
                                name='item_amount'
                                value={item.item_amount}
                                placeholder={item.item_amount}
                                onChange={(event) => handleChange(event, index)}
                            />
                            무게: <input
                                style={{ width: '50px' }}
                                type='number'
                                name='item_weight'
                                value={item.item_weight}
                                placeholder={item.item_weight}
                                onChange={(event) => handleChange(event, index)}
                            />
                            <br/>
                            상세정보: <input
                                style={{ width: '200px' }}
                                type='text'
                                name='item_detail'
                                value={item.item_detail}
                                placeholder={item.item_detail}
                                onChange={(event) => handleChange(event, index)}
                            />
                            <br/>
                            <select
                                name='equip_state'
                                value={item.equip_state}
                                onChange={(event) => handleChange(event, index)}
                            >
                                <option value='1'>장착중</option>
                                <option value='0'>장착해제</option>
                            </select>
                            </td>
                        </tr>
                        ))}
                        </table>
                        <button type="submit">수정완료</button>
                    </form>
                </div>
            }
        </div>
    )

}
export default Inventory;