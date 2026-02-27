import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import DashboardLayout from "../layout/DashboardLayout";
import "../Profile.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error(error);
          return;
        }

        if (data?.user) {
          setUser(data.user);

          // 🔥 JOIN with books table
          const { data: reviewsData, error: reviewsError } =
            await supabase
              .from("reviews")
              .select(`
                reviewid,
                review,
                createdat,
                books (
                  title
                )
              `)
              .eq("userid", data.user.id)
              .order("createdat", { ascending: false });

          if (reviewsError) {
            console.error(reviewsError);
          } else {
            setReviews(reviewsData || []);
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ padding: 40 }}>Please log in.</div>;
  }

  return (
    <DashboardLayout user={user}>
      <div className="dashboard-container">
        <h2>Your Reviews</h2>

        <div className="review-list">
          {reviews.length === 0 && <p>No reviews yet.</p>}

          {reviews.map((r) => (
            <div key={r.reviewid} className="review-card">
              <h4 className="book-title">
                {r.books?.title || "Unknown Book"}
              </h4>

              <p>{r.review}</p>

              <small>
                {new Date(r.createdat).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}