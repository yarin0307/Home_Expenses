import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import ProtectedRoutes from "./ProtectedRoutes";
import SideBar from "./Components/SideBar";
import NewRecordPage from "./Pages/NewRecordPage";
import UpdateRecordPage from "./Pages/UpdateRecordPage";
import HomeExpensesPage from "./Pages/HomeExpensesPage";
import RegisterPage from "./Pages/RegisterPage";
import NotFoundPage from "./Pages/NotFoundPage";
import GroupMembersPage from "./Pages/GroupMembersPage";
import DashboardPage from "./Pages/DashboardPage";

function App() {
  const location = useLocation();

  // ✅ Hide SideBar for Login, Register, and NotFoundPage (404)
  const hideSidebarRoutes = ["/"];
  const isNotFoundPage = ![
    "/", 
    "/register", 
    "/home-expenses", 
    "/new-record", 
    "/update-record",
    "/group-members",
    "/dashboard"
  ].includes(location.pathname);

  return (
    <div className="container-fluid">
      {/* ✅ Sidebar is only shown on valid pages */}
      {!isNotFoundPage && !hideSidebarRoutes.includes(location.pathname) && <SideBar />}

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/home-expenses" element={<HomeExpensesPage />} />
          <Route path="/new-record" element={<NewRecordPage />} />
          <Route path="/update-record" element={<UpdateRecordPage />} />
          <Route path="/group-members" element={<GroupMembersPage />} />
        </Route>
        <Route path="/register" element={<RegisterPage />} />

        {/* ✅ Catch all invalid URLs and show NotFoundPage */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
