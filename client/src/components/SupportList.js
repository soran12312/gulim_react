import { useEffect, useState } from "react";
const imgsize = {
    width: '100px',
};


const SupportList = (props) =>{

    const [image,setImage] = useState({});

    useEffect(() => {
        setImage(props.list);
    },[]);

    
    return (
        <>
        {image && 
        <span style={{ textAlign : 'center', width: '200px'}}>
        <p  style={{padding: '10px', color: 'white'}}>{image.num}</p>
        <img src= {image.path} style={{height: '300px',width: '200px', margin: 'auto', display: "block"}}/>
        <p style={{padding: '10px', color: 'white'}}>{image.title}</p>
        </span>
        }
        </>
    )
}
export default SupportList;