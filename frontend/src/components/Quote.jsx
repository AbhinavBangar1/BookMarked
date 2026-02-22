import { useEffect, useState } from 'react';
import './Quote.css';
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import { TbTilde } from "react-icons/tb";

function Quote() {
  const [result, setResult] = useState({ quote: "", author: "" });

  useEffect(() => {
    fetch(`/api/quote`)
      .then(res => res.json())
      .then(data => setResult(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="main-container">
      <div className="quote-container">
        <p className="quote">
          <RiDoubleQuotesL className="quote-icon" />
           {result.quote}
          <RiDoubleQuotesR className="quote-icon" />
        </p>

        <p className="author">
          <TbTilde /> {result.author}<br/>({result.book})
        </p>
      </div>
    </div>
  );
}

export default Quote;
