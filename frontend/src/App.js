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
import AllMateriels from "./pages/materiel_management/AllMateriels";
import EditMateriel from "./pages/materiel_management/EditMateriel";
import AllFormateurs from "./pages/formateur_management/AllFormateurs";
import EditFormateur from "./pages/formateur_management/EditFormateur";
import AllCommandes from "./pages/commande_management/AllCommandes";
import EditCommande from "./pages/commande_management/EditCommande"

function App() {
  const persistRootData = localStorage.getItem("persist:root");
  const storedUser = persistRootData ? JSON.parse(persistRootData).user : null;

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
          <Route
            path="/materiaux"
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
                <AllMateriels />
              </RequireAuth>
            }
          />
          <Route
            path="/edit-materiel/:id"
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
                <EditMateriel />
              </RequireAuth>
            }
          />
          <Route
            path="/formateurs"
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
                <AllFormateurs />
              </RequireAuth>
            }
          />
          <Route
            path="/edit-formateur/:id"
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
                <EditFormateur />
              </RequireAuth>
            }
          />
          <Route
            path="/commandes"
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
                <AllCommandes />
              </RequireAuth>
            }
          />
          <Route
            path="/edit-commande/:id"
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
                <EditCommande />
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
          {storedUser ? (
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          ) : (
            <Route path="/" element={<Navigate to="/login" replace />} />
          )}
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
        <Route path="*" element={<Unauthorized status="404" />} />
      </Routes>
    </div>
  );
}

export default App;
