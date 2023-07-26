import { useParams } from "react-router-dom";
import SupportList from "./SupportList";
import { useEffect, useState } from "react";
import axios from "axios";

const Support = () => {
    const {category} = useParams();
    const [lists,setLists] = useState([]);
    const [isReady,setIsReady] = useState(false);
    const [cateList,setCateList] = useState([]);

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

    
        
        
    

 
    return(
        <div>
            <div>

                <div>왜 안뜨지</div>
                {cateList && cateList.sort((a, b) => a.s_img_num - b.s_img_num).map((list) => ( 
                     <SupportList key={list.num} list={list} />
                ))}
            </div>
        </div>
    )
}

export default Support;