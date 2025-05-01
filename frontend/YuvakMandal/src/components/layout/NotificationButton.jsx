// src/components/layout/NotificationButton.jsx
import React, { useContext } from 'react';
import { MdNotifications } from 'react-icons/md';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';



const NotificationButton = () => {
  const {user} = useContext(AuthContext)
  return (

    <>
    {!user?.isGuest ? <Link 
      to="/notifications" 
      className="fixed top-3 right-1 z-50 p-2 rounded-md bg-gray-800 text-white md:hidden"
      aria-label="Notifications"
      >
      <MdNotifications size={25} />
    </Link> : <> </> }
        </>
  );
};

export default NotificationButton;