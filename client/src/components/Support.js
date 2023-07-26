import { useParams } from "react-router-dom";
import SupportList from "./SupportList";
import { useEffect, useState } from "react";
import axios from "axios";



const Support = () => {
    const {category} = useParams();
    const [lists,setLists] = useState([]);
    const [isReady,setIsReady] = useState(false);
    const [cateList,setCateList] = useState([]);


    
    const chunkArray = (array, chunkSize) => {
        const chunkedArray = [];
        for (let i = 0; i < array.length; i += chunkSize) {
          chunkedArray.push(array.slice(i, i + chunkSize));
        }
        return chunkedArray;
      };
    useEffect(() => {
        const getList = async () => {

            console.log("useEffect실행");
            //방목록 반환하는 API의 주소
            const link = "https://localhost:8080/game/support/data"
            try{
                //기다렸다가 응답도착하면
                const response = await axios.get(link);
                //lists에 이미지 목록 데이터 초기값으로 설정
                setLists(response.data);
                console.log(response);
                //더이상 데이터 가져오지 않음

                setIsReady(true);

            }catch(err){
                console.error(err);
            }
        }

        if(isReady){
            var selectList = [];
            lists.forEach(list => {
                if(list.category === category){
                    selectList.push(list);
                }

                
            });
            setCateList(selectList);

            console.log(lists);
        }else{
            getList();
        }


    },[isReady]);

    // groupedCateList를 useEffect 밖으로 이동
    const groupedCateList = chunkArray(cateList, 1);

     return(
   
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {groupedCateList.map((group,index) => (
                    <span key={index} style={{ flex: "0 0 25%", margin: "10px", margin: '30px', border: '1px solid'}}>
                        {group.map((list) => (<SupportList key = {list.num} list = {list} ></SupportList>
                        ))}
                    </span>
                ))}                
            </div>
    )
     
}

export default Support;