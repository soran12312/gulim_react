import axios from "axios";

const link = "https://192.168.0.68:8080/chatData";

// 아이템 등록
export const insertUserItem = (item) => {
    var crudLink = link+"/insertItem";
    try {
        axios.post(crudLink,item);
    } catch (error) {
        console.error(error);
    }
}

// 아이템 수정
export const modifyUserItem = (items) => {
    var crudLink = link+"/modifyItem";
    try {
        items.forEach(item => {
            axios.post(crudLink,item);
        });
    } catch (error) {
        console.error(error);
    }
}

// 아이템 삭제
export const deleteUserItem = (item_num) => {
    var crudLink = link+"/deleteItem";
    try {
        axios.get(crudLink,{
            params: {
                'item_num': item_num
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// 소지금 변경
export const moneyModify = (data) => {
    var crudLink = link+"/modifyMoney";
    try {
        axios.get(crudLink,{
            params: data
        });
    } catch (error) {
        console.error(error);
    }
}

// 능력치 변경
export const modifyStat = (data) => {
    var crudLink = link+"/modifyStat";
    try {
        axios.post(crudLink,data);
    } catch (error) {
        console.error(error);
    }
}

// 기술 추가
export const insertSkill = (skill) => {
    var crudLink = link+"/insertSkill";
    try {
        axios.post(crudLink,skill);
    } catch (error) {
        console.error(error);
    }
}

// 기술 수정
export const modifySkills = (skills) => {
    var crudLink = link+"/modifySkill";
    try {
        skills.forEach(skill => {
            axios.post(crudLink,skill);
        });
    } catch (error) {
        console.error(error);
    }
}

// 기술 삭제
export const deleteUserSkill = (skill_num) => {
    var crudLink = link+"/deleteSkill";
    try {
        axios.get(crudLink,{
            params: {
                'skill_num': skill_num
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// 특징 및 설명 수정
export const charExplainModify = (data) => {
    var crudLink = link+"/charExplainModify";
    try {
        axios.post(crudLink,data);
    } catch (error) {
        console.error(error);
    }
}

// 메모 수정
export const updateMemo = (data) => {
    var crudLink = link+"/updateMemo";
    try {
        axios.post(crudLink,data);
    } catch (error) {
        console.error(error);
    }
}

// 메모 추가
export const insertMemo = (data) => {
    var crudLink = link+"/insertMemo";
    try {
        axios.post(crudLink,data);
    } catch (error) {
        console.error(error);
    }
}

// 메모 삭제
export const deleteMemo = (memo_num) => {
    var crudLink = link+"/deleteMemo";
    try {
        axios.get(crudLink,{
            params: {
                'memo_num': memo_num
            }
        });
    } catch (error) {
        console.error(error);
    }
}
