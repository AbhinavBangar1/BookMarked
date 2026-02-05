import { useEffect, useState } from 'react';
import './Quote.css'

function Quote(){
    const [result,setResult] = useState({quote:"" , author:""});
    useEffect(()=>{
        fetch(`/api/quote`)
        .then(res=>res.json())
        .then(data=>setResult(data))
        .catch(err => console.log(err))
    },[]);
    return (
        <>
            <div className='main-container'>
                <div className='quote-container'>
                    <div className='upper'>
                        <p className='quote'>{result.quote}</p>
                    </div>
                    <div className='lower'>
                        <p className='author'>{result.author}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Quote ;