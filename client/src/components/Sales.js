import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const style = {
  textCut: {
    width: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'inline-block'
  },
  titleText: {
    padding: '5px',
    margin: '5px',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer'
  }
}

const settings = {
  infinite: true,
  speed: 200,
  slidesToShow: 4,
  slidesToScroll: 4
};

const Sales = () => {
  const [isSale, setSale] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const { userId } = useParams();
  const [recommend, setRecommend] = useState([]);
 
  const book_title_tag=(book_num)=>{
    window.location.href = `https://192.168.0.68:8080/sale/book/book_detail?book_num=${book_num}`;
  }

  const pocket = () => {
    window.location.href = "https://192.168.0.68:8080/sale/basket";
  };
   
  useEffect(() => {   
    const getList = async () => {
      // 스프링에서 url 부름
      const link1 = "https://192.168.0.68:8080/sale/sales";
      const link2 = "https://192.168.0.68:5000/recommend?user_id="+userId;
      try {
        const response = await axios.get(link1);
        setSale(response.data);

        const response2 = await axios.get(link2);
        var recommendList = response2.data;

        const filteredData = response.data.filter(item => recommendList.includes(item.book_num));

        setRecommend(filteredData);

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

  const sliderStyle = {
    margin: 'auto',
    width: 'calc(100% - 700px)' // 슬라이드 간격으로 설정한 값인 20px를 추가합니다.
  };

  return (
    <div>
      <button onClick={pocket}>장바구니</button>
          <h1 className="h1_view">많이 보는 설정집</h1> 
            <hr/>
            <table className="book_table"> 
            <tr>
              {isSale.slice(0, 4).map((product) => (
                  <td className="book_td">
                    <div className="sale_div">
                    <img src={"https://192.168.0.68:8080"+product.path} className="td_img" onClick={() => book_title_tag(product.book_num)} style={{width:"250px"}}/><br/>
                      <span onClick={() => book_title_tag(product.book_num)} className="td_span" style={style.textCut}>{product.book_title}</span>
                    <br/>
                    <span className="td_span_span">BEST</span><br/>
                    <strong className="td_span_span">{product.genre}</strong><br/>
                    </div>
                  </td>
              ))}
            </tr>
            </table>


           
            <h1 className="h1_view">추천하는 설정집</h1> 
            <hr/>
            <table className="book_table"> 
            <tr>
              {recommend.map((product) => (
                  <td className="book_td">
                    <div className="sale_div">
                    <img src={"https://192.168.0.68:8080"+product.path} className="td_img" onClick={() => book_title_tag(product.book_num)} style={{width:"250px"}}/><br/>
                      <span onClick={() => book_title_tag(product.book_num)} className="td_span" style={style.textCut}>{product.book_title}</span>
                    <br/>
                    <strong className="td_span_span">{product.genre}</strong><br/>
                    </div>
                  </td>
              ))}
            </tr>
            </table>

            <h1 className="h1_view">전체 설정집</h1> 
            <hr/>
            <Slider {...settings} style={sliderStyle}>
              {isSale.map(product => (
                  <div className="sale_div">
                    <img 
                        src={`https://192.168.0.68:8080${product.path}`} 
                        alt={product.book_title} 
                        onClick={() => book_title_tag(product.book_num)}
                        style={{...{width: "250px"}, ...style.titleText}}
                    />
                    <span 
                        onClick={() => book_title_tag(product.book_num)}
                        style={{...style.textCut, ...style.titleText}}
                    >
                        {product.book_title}
                    </span>
                    <br/>
                    <strong style={style.titleText}>{product.genre}</strong>
                  </div>
              ))}
            </Slider>

    </div>
  );
};

export default Sales
