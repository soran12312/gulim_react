import axios from "axios";

const link = "https://192.168.0.68:8080/chatData";

export const insertUserItem = (item) => {
    var crudLink = link+"/insertItem";
    try {
        axios.post(crudLink,item);
    } catch (error) {
        console.error(error);
    }
}

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

