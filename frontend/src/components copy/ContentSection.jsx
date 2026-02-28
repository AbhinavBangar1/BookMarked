export default function ContentSection({ data }) {

  if (!data.length) return <p>No items</p>;

  return (
    <>
      {data.map(item => (
        <div key={item.id}>
          {item.books?.title || item.feedback_text}
        </div>
      ))}
    </>
  );
}
