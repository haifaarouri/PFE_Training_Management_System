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
import EmailVerif from "./pages/auth_pages/EmailVerif";
import AssignRole from "./pages/user_management/AssignRole";
import GoogleCallback from "./pages/auth_pages/GoogleCallback";
import EmailVerification from "./pages/auth_pages/EmailVerification";
import AllSalles from "./pages/salle_management/AllSalles";
import EditSalle from "./pages/salle_management/EditSalle";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <RequireAuth
                allowedRoles={[
                  "Admin",
                  "SuperAdmin",
                  "PiloteDuProcessus",
                  "Sales",
                  "ChargéFormation",
                  "CommunityManager",
                  "AssistanceAcceuil",
                  "ServiceFinancier",
                ]}
              >
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/salles"
            element={
              <RequireAuth
                allowedRoles={[
                  "Admin",
                  "SuperAdmin",
                  "PiloteDuProcessus",
                  "Sales",
                  "ChargéFormation",
                  "CommunityManager",
                  "AssistanceAcceuil",
                  "ServiceFinancier",
                ]}
              >
                <AllSalles />
              </RequireAuth>
            }
          />
          <Route
            path="/edit-salle/:id"
            element={
              <RequireAuth
                allowedRoles={[
                  "Admin",
                  "SuperAdmin",
                  "PiloteDuProcessus",
                  "Sales",
                  "ChargéFormation",
                  "CommunityManager",
                  "AssistanceAcceuil",
                  "ServiceFinancier",
                ]}
              >
                <EditSalle />
              </RequireAuth>
            }
          />
          <Route path="/super-admin">
            <Route
              path="users"
              element={
                <RequireAuth allowedRoles={["SuperAdmin"]}>
                  <AllUsers />
                </RequireAuth>
              }
            />
            <Route
              path="edit-user/:id"
              element={
                <RequireAuth allowedRoles={["SuperAdmin"]}>
                  <EditUser />
                </RequireAuth>
              }
            />
            <Route
              path="profile-user/:id"
              element={
                <RequireAuth allowedRoles={["SuperAdmin"]}>
                  <ProfileUser />
                </RequireAuth>
              }
            />
            <Route
              path="manage-roles"
              element={
                <RequireAuth allowedRoles={["SuperAdmin"]}>
                  <AssignRole />
                </RequireAuth>
              }
            />
          </Route>
          <Route
            path="profile"
            element={
              <RequireAuth>
                <ProfileUser />
              </RequireAuth>
            }
          />
        </Route>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/password-reset/:token" element={<ResetPassword />} />
        </Route>
        <Route
          path="/unauthenticated"
          element={<Unauthorized status="401" />}
        />
        <Route path="/unauthorized" element={<Unauthorized status="403" />} />
        <Route path="/verify-email/:id/:hash" element={<EmailVerif />} />
        <Route
          path="/request-to-verify-email"
          element={<EmailVerification />}
        />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
      </Routes>
    </div>
  );
}

export default App;
