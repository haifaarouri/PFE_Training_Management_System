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
import EditCommande from "./pages/commande_management/EditCommande";
import { useEffect, useState } from "react";
import AllFormations from "./pages/formation_management/AllFormations";
import { useDispatch, useSelector } from "react-redux";
import { Toaster, toast } from "sonner";
import pusher from "./services/pusherConfig";
import { setNotifications } from "./store/slices/notificationsSlice";
import { fetchAllUnreadNotifs } from "./services/CommandeServices";
import EditFormation from "./pages/formation_management/EditFormation";
import AllCandidats from "./pages/candidat_management/AllCandidat";
import EditCandidat from "./pages/candidat_management/EditCandidat";
import AllConfirmedCommandes from "./pages/commande_management/AllConfirmedCommandes";

function App() {
  const persistRootData = localStorage.getItem("persist:root");
  const storedUser = persistRootData ? JSON.parse(persistRootData).user : null;
  const tokenUser = localStorage.getItem("token");
  const [token, setToken] = useState(null);
  const dispatch = useDispatch();

  const result = useSelector((state) => state.user); //pour récuperer la value de user inside redux

  const playNotificationSound = () => {
    const sound = new Audio("/notification.mp3");
    sound.play().catch((error) => {
      console.error("Failed to play notification sound:", error);
    });
  };

  const onNewNotification = () => {
    playNotificationSound();
  };

  useEffect(() => {
    const n = async () => {
      const notif = await fetchAllUnreadNotifs();
      return notif;
    };

    if (result && result.user) {
      //Subscribe to private channel => only for specific users
      const channel = pusher.private(`statusChannel.${result.user.id}`);

      const handleOrderStatusUpdated = async (e) => {
        onNewNotification();
        toast.info(`Nouvelle commande ${e.order.id} est ${e.order.status} !`);
        let not = await n();
        dispatch(setNotifications(not));
      };

      channel.listen("OrderStatusUpdated", handleOrderStatusUpdated);

      // Unsubscribe from the channel
      return () => {
        channel.stopListening("OrderStatusUpdated", handleOrderStatusUpdated);
      };
    }
  }, [result]);

  useEffect(() => {
    setToken(token);
  }, [tokenUser]);

  return (
    <div className="App">
      <Toaster position="bottom-left" expand={false} richColors />
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
            path="/confirmed-commandes"
            element={
              <RequireAuth
                allowedRoles={[
                  "ServiceFinancier",
                ]}
              >
                <AllConfirmedCommandes />
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
                  // "PiloteDuProcessus",
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
          <Route
            path="/formations"
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
                <AllFormations />
              </RequireAuth>
            }
          />
          <Route
            path="/edit-formation/:id"
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
                <EditFormation />
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
          <Route
            path="/candidats"
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
                <AllCandidats />
              </RequireAuth>
            }
          />
          <Route
            path="/edit-candidat/:id"
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
                <EditCandidat />
              </RequireAuth>
            }
          />
        </Route>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {token && storedUser ? (
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
