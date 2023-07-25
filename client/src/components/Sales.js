import React, { useEffect, useState } from "react";
import axios from "axios";

const Sales = () => {
  const [isSale, setSale] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const book_title_tag=(book_num)=>{
    window.location.href = `https://localhost:8080/sale/book/book_detail?book_num=${book_num}`;
  }


    const pocket = () => {
      window.location.href = "https://192.168.0.68:8080/sale/basket";
    };

  useEffect(() => {
    const getList = async () => {
      const link = "https://192.168.0.68:8080/sale/sales";
      try {
        const response = await axios.get(link);
        setSale(response.data);
        setIsReady(true);
      } catch (err) {
        console.error(err);
      }
    };

    if(isReady){
      console.log(isSale);
  }else{
      getList();
  }
  }, [isReady]);


  return (
    <div>
      <button onClick={pocket}>장바구니</button>
          <h1>많이 보는 설정집</h1> 
            <hr/>
            <div> 
              {isSale.map((product) => (          
                  <td>
                    <img src={product.path}/><br/>
                      <span onClick={() => book_title_tag(product.book_num)}>{product.book_title}</span>
                    <br/>
                    <span>BEST</span><br/>
                    <strong>{product.genre}</strong><br/>
                    
                    </td>
              ))}
            </div>


            <table>
            <h1>오늘 확! 뜨는 설정집</h1> 
            <hr/>
            <tr>
            {isSale.map((product) => (
                <td key={product.book_num}>
                  <div>
                    <img src={product.path}/><br/>
                    <a href={`https://localhost:8080/sales/product_detail/${product.book_num}`}>
                      <span>{product.book_title}</span>
                    </a>
                    <br/>
                    <span>BEST</span><br/>
                    <strong>{product.genre}</strong><br/>
            
                  </div>
                </td>
              ))}
            </tr>
          
        </table>
      
    </div>
  );
};

export default Sales
