export default function ProfileHeader({ user }) {

  return (
    <div className="card">
      <h1>{user?.username}</h1>
      <p>{user?.email}</p>
    </div>
  );
}
