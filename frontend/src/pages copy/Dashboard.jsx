import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { getDashboard } from "../services/api";

import DashboardLayout from "../layout/Dashboardlayout";
import ProfileHeader from "../components copy/Profileheader";
import Tabs from "../components copy/tabs";
import ContentSection from "../components copy/ContentSection";

export default function Dashboard() {

  const [data, setData] = useState(null);
  const [active, setActive] = useState("views");

  useEffect(() => {

    async function load() {

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const res = await getDashboard(user.id);

      setData({
        user: res.data.user,
        views: res.data.views || [],
        reviews: res.data.reviews || [],
        comments: res.data.comments || [],
        feedbacks: res.data.feedbacks || []
      });
    }

    load();

  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <DashboardLayout user={data.user}>

      <ProfileHeader user={data.user} />

      <Tabs active={active} setActive={setActive} />

      <div className="card">
        <ContentSection data={data[active]} />
      </div>

    </DashboardLayout>
  );
}
