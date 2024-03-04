import Layout from "./layout_components/Layout";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AllUsers from "./pages/user_management/AllUsers"
import AuthLayout from "./layout_components/AuthLayout";
import Login from "./pages/auth_pages/Login";
import Register from "./pages/auth_pages/Register";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/super-admin"
          >
            <Route path="users" element={<AllUsers />} />
            {/* <Route path="edit-user/:id" element={<EditUser />} /> */}
          </Route>
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
