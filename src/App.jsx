import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import AddWork from "./pages/owner/AddWork";
import AddWorkDetails from "./pages/owner/AddWorkDetails";
import CustomerHistory from "./pages/owner/CustomerHistory";
function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-4xl font-bold text-green-600">
                WorkHistory
              </h1>
            </div>
          }
        />

        {/* Authentication */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/role"
          element={<RoleSelection />}
        />


        {/* Owner */}
        <Route
          path="/owner"
          element={<OwnerDashboard />}
        />

        <Route
          path="/owner/add-work"
          element={<AddWork />}
        />

        <Route
          path="/owner/add-work/details"
          element={<AddWorkDetails />}
        />
        <Route
          path="/owner/customer-history"
          element={<CustomerHistory />}
        />

        

      </Routes>

    </BrowserRouter>
  );
}

export default App;