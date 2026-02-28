import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);


  const loadProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      setNeedsProfileCompletion(false);
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("userid", userId)
      .maybeSingle();

    if (error || !data) {
      setProfile(null);
      setNeedsProfileCompletion(true);
      return;
    }

    setProfile(data);
    setNeedsProfileCompletion(false);
  };


    useEffect(() => {
      let mounted = true;

      const init = async () => {
        console.log("AUTH:init start");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("AUTH:getSession resolved", session?.user?.id);

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log("AUTH:loading profile");
          await loadProfile(session.user.id);
          console.log("AUTH:profile loaded");
        }

        console.log("AUTH:setting loading false");
        setLoading(false);
      };

      init();

      return () => {
        mounted = false;
      };
    }, []);


  const signUp = (email, password, username) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setNeedsProfileCompletion(false);
  };

  const updateProfile = async (username, email) => {
    if (!user) return;

    const { data } = await supabase
      .from("users")
      .upsert(
        {
          userid: user.id,
          email: email || user.email,
          username,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "userid" }
      )
      .select()
      .single();

    if (data) {
      setProfile(data);
      setNeedsProfileCompletion(false);
    }
  };


  const value = {
    session,
    user,
    profile,
    loading,
    needsProfileCompletion,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};