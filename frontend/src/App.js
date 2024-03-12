import Layout from "./layout_components/Layout";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AllUsers from "./pages/user_management/AllUsers";
import AuthLayout from "./layout_components/AuthLayout";
import Login from "./pages/auth_pages/Login";
import Register from "./pages/auth_pages/Register";
import EditUser from "./pages/user_management/EditUser";
import ProfileUser from "./pages/user_management/ProfileUser";
import Unauthorized from "./pages/Unauthorized";
import RequireAuth from "./components/RequireAuth";
import ResetPassword from "./pages/auth_pages/ResetPassword";
import EmailVerif from "./pages/auth_pages/EmailVerif"

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Protected Routes */}
        <Route element={<Layout />}>
        <Route
            path="/dashboard"
            element={
              <RequireAuth allowedRoles={['Admin', 'SuperAdmin']}>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="/super-admin">
            <Route path="users" element={<RequireAuth allowedRoles={['SuperAdmin']}><AllUsers /></RequireAuth>} />
            <Route path="edit-user/:id" element={<RequireAuth allowedRoles={['SuperAdmin']}><EditUser /></RequireAuth>} />
            <Route path="profile-user/:id" element={<RequireAuth allowedRoles={['SuperAdmin']}><ProfileUser /></RequireAuth>} />
          </Route>
          <Route path="profile" element={<RequireAuth><ProfileUser /></RequireAuth>} />
        </Route>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/password-reset/:token" element={<ResetPassword />} />
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/verify-email/:id/:hash" element={<EmailVerif />} />
      </Routes>
    </div>
  );
}

export default App;
