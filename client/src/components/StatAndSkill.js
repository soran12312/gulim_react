import { useEffect, useRef, useState } from "react";
import Swal from 'sweetalert2';
import { modifyStat, insertSkill, modifySkills, deleteUserSkill, charExplainModify } from '../crud/crud';

const StatAndSkill = (props) => {
    const userData = props.userData;
    const userId = props.userId;
    const isMaster = props.isMaster;
    const userInfo = userData.member_info.find((member) => member.id === userId);
    const refrashRoomData = props.refrashRoomData;
    const socket = props.socket;

    const [onStatModify, setOnStatModify] = useState(false);
    const [onSkillModify, setOnSkillModify] = useState(false);
    const [explainModify, setExplainModify] = useState(false);
    const [conditionModify, setConditionModify] = useState(false);
    const [etcModify, setEtcModify] = useState(false);

    const [onDelete, setOnDelete] = useState(false);
    const [stat, setStat] = useState({});
    const [skills, setSkills] = useState([]);
    const [char_explain, setChar_explain] = useState("");
    const [condition, setCondition] = useState("");
    const [char_etc, setChar_etc] = useState("");

    const statModifyBtn = useRef(null);
    const char_explain_grid = useRef(null);
    const condition_grid = useRef(null);
    const char_etc_grid = useRef(null);

    useEffect(() => {

        if(userInfo){
            setStat({
                sheet_num: userInfo.sheet_num
                ,level: userInfo.level
                ,exp: userInfo.exp
                ,str: userInfo.str
                ,dex: userInfo.dex
                ,con: userInfo.con
                ,intelligence: userInfo.intelligence
                ,wis: userInfo.wis
                ,chr: userInfo.chr
            });
            setSkills(userInfo.skills);
            setChar_explain(userInfo.char_explain);
            setCondition(userInfo.condition);
            setChar_etc(userInfo.char_etc);
            if(!userInfo.char_explain){
                setChar_explain("")
            }
            if(!userInfo.condition){
                setCondition("")
            }
            if(!userInfo.char_etc){
                setChar_etc("")
            }
        }
        
    },[userInfo]);

    // 스킬 삭제버튼 클릭 시
    const deleteSkill = (skill_num) => {
        console.log(skill_num);

        deleteUserSkill(skill_num);
        // 다시 방정보 새로 가져옴(내 화면)
        refrashRoomData();
        // 방의 다른 사람들 화면도 새로고침
        socket.current.emit("refrash");

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
            modifyStat(stat);
            // 다시 방정보 새로 가져옴(내 화면)
            refrashRoomData();
            // 방의 다른 사람들 화면도 새로고침
            socket.current.emit("refrash");
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

    // 기술 추가 버튼 클릭 시
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
                
                insertSkill(skill);

                // 다시 방정보 새로 가져옴(내 화면)
                refrashRoomData();
                // 방의 다른 사람들 화면도 새로고침
                socket.current.emit("refrash");
            }
        });
    }

    // 특징 및 설명 수정버튼 클릭 시
    const explainHandler = (evt) => {
        if(!explainModify){
            evt.target.innerText = "수정완료"
            setExplainModify(true);
        }else{
            var data = {
                sheet_num: userInfo.sheet_num,
                char_explain: char_explain
            };
            charExplainModify(data);

            // 다시 방정보 새로 가져옴(내 화면)
            refrashRoomData();
            // 방의 다른 사람들 화면도 새로고침
            socket.current.emit("refrash");

            evt.target.innerText = "수정"
            setExplainModify(false);
        }
    }

    // 특징 및 설명 내용 변경 시
    const explainChange = (evt) => {
        setChar_explain(evt.target.value);
    }

    // 상태이상 수정버튼 클릭 시
    const conditionHandler = (evt) => {
        if(!conditionModify){
            evt.target.innerText = "수정완료"
            setConditionModify(true);
        }else{
            var data = {
                sheet_num: userInfo.sheet_num,
                condition: condition
            };
            charExplainModify(data);

            // 다시 방정보 새로 가져옴(내 화면)
            refrashRoomData();
            // 방의 다른 사람들 화면도 새로고침
            socket.current.emit("refrash");

            evt.target.innerText = "수정"
            setConditionModify(false);
        }
    }

    // 상태이상 내용 변경 시
    const conditionChange = (evt) => {
        setCondition(evt.target.value);
    }

    // 기타사항 수정버튼 클릭 시
    const etcHandler = (evt) => {
        if(!etcModify){
            evt.target.innerText = "수정완료"
            setEtcModify(true);
        }else{
            var data = {
                sheet_num: userInfo.sheet_num,
                char_etc: char_etc
            };
            charExplainModify(data);

            // 다시 방정보 새로 가져옴(내 화면)
            refrashRoomData();
            // 방의 다른 사람들 화면도 새로고침
            socket.current.emit("refrash");

            evt.target.innerText = "수정"
            setEtcModify(false);
        }
    }

    // 기타사항 내용 변경 시
    const etcChange = (evt) => {
        setChar_etc(evt.target.value);
    }

    // 기술 수정 내용 변경 시
    const handleSkillChange = (event, index) => {
        const { name, value } = event.target;
        setSkills((prevSkills) => {
          return prevSkills.map((item, i) => {
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

    // 기술 수정 버튼 클릭 시
    const modifySkillBtnHandler = (evt) => {
        if(!onSkillModify){
            evt.target.innerText = "수정 완료"
            setOnSkillModify(true);
        }else{
            modifySkills(skills);
            // 다시 방정보 새로 가져옴(내 화면)
            refrashRoomData();
            // 방의 다른 사람들 화면도 새로고침
            socket.current.emit("refrash");

            evt.target.innerText = "기술 수정"
            setOnSkillModify(false);
        }
    }

    return (
        <div>
            {!userId && <span>마우스를<br/>화면에 올리면<br/>상대방의<br/>캐릭터 정보 출력</span>}
            {userId && 
            <div>
                <ul>
                    {stat && !onStatModify &&
                    <>
                        <li>레벨 : {stat.level}</li>
                        <li>경험치 : {stat.exp}</li>
                        <li>근력 : {stat.str}</li>
                        <li>민첩 : {stat.dex}</li>
                        <li>건강 : {stat.con}</li>
                        <li>지능 : {stat.intelligence}</li>
                        <li>지혜 : {stat.wis}</li>
                        <li>매력 : {stat.chr}</li>
                    </>
                    }{stat && onStatModify &&
                    <>
                        <li>레벨 : <input min={1} type="number" defaultValue={stat.level} onChange={(evt) => changeStatVal(evt,"level")}/></li>
                        <li>경험치 : <input min={0} type="number" defaultValue={stat.exp} onChange={(evt) => changeStatVal(evt,"exp")}/></li>
                        <li>근력 : <input min={0} type="number" defaultValue={stat.str} onChange={(evt) => changeStatVal(evt,"str")}/></li>
                        <li>민첩 : <input min={0} type="number" defaultValue={stat.dex} onChange={(evt) => changeStatVal(evt,"dex")}></input></li>
                        <li>건강 : <input min={0} type="number" defaultValue={stat.con} onChange={(evt) => changeStatVal(evt,"con")}></input></li>
                        <li>지능 : <input min={0} type="number" defaultValue={stat.intelligence} onChange={(evt) => changeStatVal(evt,"intelligence")}></input></li>
                        <li>지혜 : <input min={0} type="number" defaultValue={stat.wis} onChange={(evt) => changeStatVal(evt,"wis")}></input></li>
                        <li>매력 : <input min={0} type="number" defaultValue={stat.chr} onChange={(evt) => changeStatVal(evt,"chr")}></input></li>
                    </>
                    }
                    {isMaster &&
                    <div>
                        <button onClick={statModifyBtnHandler} ref={statModifyBtn}>능력치 수정</button>
                    </div>
                    }
                    <br/>
                    <span>기술목록</span>
                    {!onSkillModify && skills && skills.map((skill) => (
                        <li>{skill.skill_name} : {skill.skill_detail} {onDelete && <button onClick={() => deleteSkill(skill.skill_num)}>삭제</button>}</li>
                    ))}
                    {onSkillModify && skills && skills.map((skill,index) => (
                        <li key={index}>
                            <input style={{ width: '80px' }} type="text" value={skill.skill_name} name="skill_name" onChange={(event) => handleSkillChange(event, index)}/>
                            {" "} : {" "}<input style={{ width: '190px' }} type="text" value={skill.skill_detail} name="skill_detail" onChange={(event) => handleSkillChange(event, index)}/>
                        </li>
                    ))}
                    {isMaster && 
                    <div>
                        <button onClick={modifySkillBtnHandler}>기술 수정</button>
                        <button onClick={deleteBtnHandler}>기술 삭제</button>
                        <button onClick={insertSkillBtnHandler}>기술 추가</button>
                    </div>
                    }
                    <br/>
                    <span>특징 및 설명</span><br/>
                    {<textarea readOnly={!explainModify} useRef={char_explain_grid} onChange={explainChange} value={char_explain}/>}
                    <br/>
                    {isMaster && <button onClick={(evt) => explainHandler(evt)}>수정</button>}
                    <br/>
                    <span>상태이상</span><br/>
                    {<textarea readOnly={!conditionModify} useRef={condition_grid} onChange={conditionChange} value={condition}/>}
                    <br/>
                    {isMaster && <button onClick={(evt) => conditionHandler(evt)}>수정</button>}
                    <br/>
                    <span>기타사항</span><br/>
                    {<textarea readOnly={!etcModify} useRef={char_etc_grid} onChange={etcChange} value={char_etc}/>}
                    <br/>
                    {isMaster && <button onClick={(evt) => etcHandler(evt)}>수정</button>}
                    <br/>
                </ul>
                
            </div>
            }
        </div>
    )
}

export default StatAndSkill;