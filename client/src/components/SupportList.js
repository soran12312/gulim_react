const SupportList = (props) =>{

    const list=props.list;

    return (
        <div>
        <p>{list.num}</p>
        <img src= "{list.path}"/>
        <p>{list.title}</p>
        </div>
    )
}
export default SupportList;