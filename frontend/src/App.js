import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toaster, toast } from "sonner";
import pusher from "./services/pusherConfig";
import { setNotifications } from "./store/slices/notificationsSlice";
import { fetchAllUnreadNotifs } from "./services/CommandeServices";

function App() {
  const persistRootData = localStorage.getItem("persist:root");
  const storedUser = persistRootData ? JSON.parse(persistRootData).user : null;
  const tokenUser = localStorage.getItem("token");
  const [token, setToken] = useState(null);
  const dispatch = useDispatch();

  const Layout = lazy(() => import("./layout_components/Layout"));
  const AuthLayout = lazy(() => import("./layout_components/AuthLayout"));
  const Dashboard = lazy(() => import("./pages/Dashboard"));
  const AllUsers = lazy(() => import("./pages/user_management/AllUsers"));
  const AllSalles = lazy(() => import("./pages/salle_management/AllSalles"));
  const AllMateriels = lazy(() =>
    import("./pages/materiel_management/AllMateriels")
  );
  const AllFormateurs = lazy(() =>
    import("./pages/formateur_management/AllFormateurs")
  );
  const AllCommandes = lazy(() =>
    import("./pages/commande_management/AllCommandes")
  );
  const AllFormations = lazy(() =>
    import("./pages/formation_management/AllFormations")
  );
  const AllCandidats = lazy(() =>
    import("./pages/candidat_management/AllCandidat")
  );
  const AllSessions = lazy(() =>
    import("./pages/session_management/AllSession")
  );
  const TemplateEditor = lazy(() =>
    import("./pages/document_management/templateEditor")
  );
  const AllConfirmedCommandes = lazy(() =>
    import("./pages/commande_management/AllConfirmedCommandes")
  );
  const Login = lazy(() => import("./pages/auth_pages/Login"));
  const Register = lazy(() => import("./pages/auth_pages/Register"));
  const ResetPassword = lazy(() => import("./pages/auth_pages/ResetPassword"));
  const EmailVerif = lazy(() => import("./pages/auth_pages/EmailVerif"));
  const EmailVerification = lazy(() =>
    import("./pages/auth_pages/EmailVerification")
  );
  const GoogleCallback = lazy(() =>
    import("./pages/auth_pages/GoogleCallback")
  );
  const Unauthorized = lazy(() => import("./pages/Unauthorized"));
  const EditUser = lazy(() => import("./pages/user_management/EditUser"));
  const ProfileUser = lazy(() => import("./pages/user_management/ProfileUser"));
  const AssignRole = lazy(() => import("./pages/user_management/AssignRole"));
  const RequireAuth = lazy(() => import("./components/RequireAuth"));
  const EditSalle = lazy(() => import("./pages/salle_management/EditSalle"));
  const EditMateriel = lazy(() =>
    import("./pages/materiel_management/EditMateriel")
  );
  const EditFormateur = lazy(() =>
    import("./pages/formateur_management/EditFormateur")
  );
  const EditCommande = lazy(() =>
    import("./pages/commande_management/EditCommande")
  );
  const EditFormation = lazy(() =>
    import("./pages/formation_management/EditFormation")
  );
  const EditCandidat = lazy(() =>
    import("./pages/candidat_management/EditCandidat")
  );
  const AllDocuments = lazy(() =>
    import("./pages/document_management/AllDocuments")
  );
  const AllPartenaires = lazy(() =>
    import("./pages/partenaire_management/AllPartenaires")
  );

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.matchMedia("(min-width: 991px)").matches) {
        if (window.scrollY >= 197) {
          document
            .getElementsByClassName("App")[0]
            .classList.add("navbar-fixed-top");
        } else {
          document
            .getElementsByClassName("App")[0]
            .classList.remove("navbar-fixed-top");
        }
      }
      if (window.matchMedia("(max-width: 991px)").matches) {
        document
          .getElementsByClassName("App")[0]
          .classList.add("navbar-fixed-top");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Suspense
      fallback={
        <div className="d-flex justify-content-center">
          <div
            className="spinner-grow text-primary"
            style={{
              width: "3rem",
              height: "3rem",
              position: "absolute",
              margin: "auto",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
            role="status"
          ></div>
        </div>
      }
    >
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
                <RequireAuth allowedRoles={["ServiceFinancier"]}>
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
            <Route
              path="/sessions"
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
                  <AllSessions />
                </RequireAuth>
              }
            />
            <Route
              path="/add-document"
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
                  <TemplateEditor />
                </RequireAuth>
              }
            />
            <Route
              path="/documents"
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
                  <AllDocuments />
                </RequireAuth>
              }
            />
            <Route
              path="/partenaires"
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
                  <AllPartenaires />
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
    </Suspense>
  );
}

export default App;
