import { useEffect, useRef, useState } from "react";
import Swal from 'sweetalert2';

const StatAndSkill = (props) => {
    const userData = props.userData;
    const userId = props.userId;
    const isMaster = props.isMaster;
    const userInfo = userData.member_info.find((member) => member.id === userId);
    const refrashRoomData = props.refrashRoomData;
    const socket = props.socket;

    const [onStatModify, setOnStatModify] = useState(false);
    const [onSkillModify, setOnSkillModify] = useState(false);
    const [onDelete, setOnDelete] = useState(false);
    const [stat, setStat] = useState({});
    const [skills,setSkills] = useState([]);

    const statModifyBtn = useRef(null);

    useEffect(() => {

        if(userInfo){
            setStat({
                str: userInfo.str
                ,dex: userInfo.dex
                ,con: userInfo.con
                ,intelligence: userInfo.intelligence
                ,wis: userInfo.wis
                ,chr: userInfo.chr
            });
            setSkills(userInfo.skills);
        }
        
    },[userInfo]);

    // 스킬 삭제버튼 클릭 시
    const deleteSkill = (skill_num) => {
        console.log(skill_num);
        setOnDelete(false);
    }

    // 삭제버튼 클릭 시(스킬 삭제 화면으로 변경)
    const deleteBtnHandler = () => {
        setOnDelete(true);
    }

    // 능력치 수정 버튼 클릭 시
    const statModifyBtnHandler = () => {
        if(!onStatModify){
            setOnStatModify(true);
            statModifyBtn.current.innerText = "능력치 수정 완료";
        }else{
            setOnStatModify(false);
            statModifyBtn.current.innerText = "능력치 수정";
        }
    }

    // 능력치 수정 시 input value 변경
    const changeStatVal = (evt,keyword) => {
        if(stat){
            var modifyStat = stat;
            modifyStat[keyword] = evt.target.value;
            setStat(modifyStat);
        }
    }

    // 스킬 추가 버튼 클릭 시
    const insertSkillBtnHandler = () => {
        Swal.fire({
            title: '기술 추가',
            html:
              '<input style= "width: 130px" type="text" id="insert_skill_name" placeholder="기술 이름">' +
              ' 기술 상세 : <textarea id="insert_skill_detail"></textarea>',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
            preConfirm: () => {
              const skill_name = document.getElementById('insert_skill_name').value;
              const skill_detail = document.getElementById('insert_skill_detail').value;
              return { skill_name, skill_detail };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const { skill_name, skill_detail } = result.value;
                var skill = {
                    'skill_name' : skill_name
                    , 'skill_detail' : skill_detail
                    , 'sheet_num' : parseInt(userInfo.sheet_num,10)
                };
                

                // 다시 방정보 새로 가져옴(내 화면)
                refrashRoomData();
                // 방의 다른 사람들 화면도 새로고침
                socket.current.emit("refrash");
            }
        });
    }

    return (
        <div>
            {!userId && <span>마우스를<br/>화면에 올리면<br/>상대방의<br/>캐릭터 정보 출력</span>}
            {userId && 
            <div>
                <ul>
                    {stat && !onStatModify &&
                    <>
                        <li>근력 : {stat.str}</li>
                        <li>민첩 : {stat.dex}</li>
                        <li>건강 : {stat.con}</li>
                        <li>지능 : {stat.intelligence}</li>
                        <li>지혜 : {stat.wis}</li>
                        <li>매력 : {stat.chr}</li>
                        <br/>
                    </>
                    }{stat && onStatModify &&
                    <>
                        <li>근력 : <input min={0} type="number" defaultValue={stat.str} onChange={(evt) => changeStatVal(evt,"str")}></input></li>
                        <li>민첩 : <input min={0} type="number" defaultValue={stat.dex} onChange={(evt) => changeStatVal(evt,"dex")}></input></li>
                        <li>건강 : <input min={0} type="number" defaultValue={stat.con} onChange={(evt) => changeStatVal(evt,"con")}></input></li>
                        <li>지능 : <input min={0} type="number" defaultValue={stat.intelligence} onChange={(evt) => changeStatVal(evt,"intelligence")}></input></li>
                        <li>지혜 : <input min={0} type="number" defaultValue={stat.wis} onChange={(evt) => changeStatVal(evt,"wis")}></input></li>
                        <li>매력 : <input min={0} type="number" defaultValue={stat.chr} onChange={(evt) => changeStatVal(evt,"chr")}></input></li>
                        <br/>
                    </>
                    }
                    <span>기술목록</span>
                    {skills && skills.map((skill) => (
                        <li>{skill.skill_name} : {skill.skill_detail} {onDelete && <button onClick={() => deleteSkill(skill.skill_num)}>삭제</button>}</li>
                    ))}
                    <br/>
                </ul>
                {isMaster && 
                <div>
                    <button onClick={statModifyBtnHandler} ref={statModifyBtn}>능력치 수정</button>
                    <button>기술 수정</button>
                    <button onClick={deleteBtnHandler}>삭제</button>
                    <button onClick={insertSkillBtnHandler}>기술 추가</button>
                </div>
                }
            </div>
            }
        </div>
    )
}

export default StatAndSkill;