import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';


const ProtectedRoutes = () => {
   let user = localStorage.getItem("user");
   let auth=true;

  if (user !== null) {
    auth = true;
  }
  else {
    auth = false;
  }

  return auth ? <Outlet /> : <Navigate to="/" />;

};


export default ProtectedRoutes;
