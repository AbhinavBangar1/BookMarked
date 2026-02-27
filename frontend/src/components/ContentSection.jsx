import { useState } from "react";
import { supabase } from "../services/supabase";
import '../Profile.css';

export default function ContentSection({
  type,
  data,
  user,
  refreshReviews
}) {

  const [text, setText] = useState("");

async function submitReview() {

  if (!text.trim()) {
    console.log("Empty text");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("No user logged in");
    return;
  }

  const { error } = await supabase
    .from("reviews")
    .insert([
      {
        review: text,
        userid: user.id,
        bookid: "GENERAL"
      }
    ]);

  if (error) {
    console.log("Insert error:", error);
  } else {
    console.log("Inserted successfully");
    setText("");
    refreshReviews();
  }
}  // ---------------- REVIEWS TAB ----------------
  if (type === "reviews") {
  return (
    <>
      <div className="review-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your review..."
        />
        <button onClick={submitReview}>
          Submit Review
        </button>
      </div>

      <div className="review-list">
        {data.length === 0 && <p>No reviews yet.</p>}

        {data.map(r => (
          <div key={r.id} className="review-card">
            {r.content}
          </div>
        ))}
      </div>
    </>
  );
}
  // ---------------- OTHER TABS ----------------
  return (
    <>
      {data.length === 0 ? (
        <p>No items</p>
      ) : (
        data.map(item => (
          <div key={item.id}>{JSON.stringify(item)}</div>
        ))
      )}
    </>
  );
}

