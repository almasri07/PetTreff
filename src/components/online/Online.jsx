export default function Online({ user, online }) {
  return (
    <li className="rightbarFriend">
      <div className="rightbarProfileImgContainer">
        <img className="rightbarFriendImg" src={user.profilePicture} alt="" />
        {online && <span className="rightbarOnline"></span>}
      </div>
      <span className="rightbarUsername">{user.username}</span>
    </li>
  );
}
