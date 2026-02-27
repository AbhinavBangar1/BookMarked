// import { createContext, useContext, useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';

// const AuthContext = createContext({});

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [profile, setProfile] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

//     // Fetch the user's profile from public.users
//     const fetchProfile = async (userId) => {
//         if (!userId) {
//             setProfile(null);
//             setNeedsProfileCompletion(false);
//             return null;
//         }

//         const { data, error } = await supabase
//             .from('users')
//             .select('*')
//             .eq('userid', userId)
//             .maybeSingle();

//         if (error || !data) {
//             setProfile(null);
//             setNeedsProfileCompletion(true);
//             return null;
//         }

//         setProfile(data);
//         setNeedsProfileCompletion(false);
//         return data;
//     };

//     // Try to sync user to public.users table (called when session is active)
//     const syncProfileToUsersTable = async (authUser) => {
//         if (!authUser) return;

//         // First check if profile already exists
//         const { data: existing } = await supabase
//             .from('users')
//             .select('*')
//             .eq('userid', authUser.id)
//             .maybeSingle();

//         if (existing) {
//             setProfile(existing);
//             setNeedsProfileCompletion(false);
//             return;
//         }

//         // Check if we have username in user_metadata (set during signUp)
//         const username = authUser.user_metadata?.username;
//         const email = authUser.email;

//         if (username) {
//             // We have metadata, create the profile row
//             const { data, error } = await supabase
//                 .from('users')
//                 .insert({
//                     userid: authUser.id,
//                     email: email,
//                     username: username,
//                     updated_at: new Date().toISOString(),
//                 })
//                 .select()
//                 .single();

//             if (!error && data) {
//                 setProfile(data);
//                 setNeedsProfileCompletion(false);
//                 return;
//             }
//         }

//         // No profile and no metadata username — need to complete profile
//         // (this happens for Google sign-in users)
//         setProfile(null);
//         setNeedsProfileCompletion(true);
//     };

//     useEffect(() => {
//         // Get initial session
//         supabase.auth.getSession().then(({ data: { session } }) => {
//             const currentUser = session?.user ?? null;
//             setUser(currentUser);
//             if (currentUser) {
//                 syncProfileToUsersTable(currentUser);
//             }
//             setLoading(false);
//         });

//         // Listen for auth changes
//         const { data: { subscription } } = supabase.auth.onAuthStateChange(
//             async (_event, session) => {
//                 const currentUser = session?.user ?? null;
//                 setUser(currentUser);
//                 if (currentUser) {
//                     await syncProfileToUsersTable(currentUser);
//                 } else {
//                     setProfile(null);
//                     setNeedsProfileCompletion(false);
//                 }
//             }
//         );

//         return () => subscription.unsubscribe();
//     }, []);

//     // Sign up with username stored in user_metadata
//     const signUp = async (email, password, username) => {
//         const { data, error } = await supabase.auth.signUp({
//             email,
//             password,
//             options: {
//                 data: {
//                     username: username,  // stored in user_metadata
//                 },
//             },
//         });
//         return { data, error };
//     };

//     // Save or update the user profile in public.users
//     const updateProfile = async (username, email) => {
//         if (!user) return { error: { message: 'Not authenticated' } };

//         const { data, error } = await supabase
//             .from('users')
//             .upsert({
//                 userid: user.id,
//                 email: email || user.email,
//                 username: username,
//                 updated_at: new Date().toISOString(),
//             }, { onConflict: 'userid' })
//             .select()
//             .single();

//         if (!error && data) {
//             setProfile(data);
//             setNeedsProfileCompletion(false);
//         }

//         return { data, error };
//     };

//     const signIn = async (email, password) => {
//         const { data, error } = await supabase.auth.signInWithPassword({
//             email,
//             password,
//         });
//         return { data, error };
//     };

//     const signInWithGoogle = async () => {
//         const { data, error } = await supabase.auth.signInWithOAuth({
//             provider: 'google',
//             options: {
//                 redirectTo: window.location.origin,
//             },
//         });
//         return { data, error };
//     };

//     const signOut = async () => {
//         const { error } = await supabase.auth.signOut();
//         setProfile(null);
//         setNeedsProfileCompletion(false);
//         return { error };
//     };

//     const value = {
//         user,
//         profile,
//         loading,
//         needsProfileCompletion,
//         signUp,
//         signIn,
//         signInWithGoogle,
//         signOut,
//         updateProfile,
//         fetchProfile,
//     };

//     return (
//         <AuthContext.Provider value={value}>
//             {!loading && children}
//         </AuthContext.Provider>
//     );
// };





import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);   // 🔥 holds access_token
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      setNeedsProfileCompletion(false);
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("userid", userId)
      .maybeSingle();

    if (error || !data) {
      setProfile(null);
      setNeedsProfileCompletion(true);
      return null;
    }

    setProfile(data);
    setNeedsProfileCompletion(false);
    return data;
  };

  const syncProfileToUsersTable = async (authUser) => {
    if (!authUser) return;

    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("userid", authUser.id)
      .maybeSingle();

    if (existing) {
      setProfile(existing);
      setNeedsProfileCompletion(false);
      return;
    }

    const username = authUser.user_metadata?.username;
    const email = authUser.email;

    if (username) {
      const { data, error } = await supabase
        .from("users")
        .insert({
          userid: authUser.id,
          email: email,
          username: username,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
        setNeedsProfileCompletion(false);
        return;
      }
    }

    setProfile(null);
    setNeedsProfileCompletion(true);
  };

  useEffect(() => {
    // 🔥 Get initial session (IMPORTANT)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        syncProfileToUsersTable(currentUser);
      }

      setLoading(false);
    });

    // 🔥 Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await syncProfileToUsersTable(currentUser);
        } else {
          setProfile(null);
          setNeedsProfileCompletion(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, username) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
  };

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setNeedsProfileCompletion(false);
  };

  const updateProfile = async (username, email) => {
    if (!user) return { error: { message: "Not authenticated" } };

    const { data, error } = await supabase
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

    if (!error && data) {
      setProfile(data);
      setNeedsProfileCompletion(false);
    }

    return { data, error };
  };

  const value = {
    session,   // 🔥 gives access_token
    user,
    profile,
    loading,
    needsProfileCompletion,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};