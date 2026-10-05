import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import AddWork from "./pages/owner/AddWork";
import AddWorkDetails from "./pages/owner/AddWorkDetails";
import CustomerHistory from "./pages/owner/CustomerHistory";
import OwnerWorkHistory from "./pages/owner/OwnerWorkHistory";
import OwnerCustomers from "./pages/owner/OwnerCustomers";
import CustomerDetails from "./pages/owner/CustomerDetails";
import CustomerWorkHistory from "./pages/owner/CustomerWorkHistory";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import OwnerDrivers from "./pages/owner/OwnerDrivers";
import Profile from "./pages/Profile";
import DriverHistory from "./pages/owner/DriverHistory";
import DriverAttendance from "./pages/owner/DriverAttendance";
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
        <Route
          path="/owner/work-history"
          element={<OwnerWorkHistory />}
        />
        <Route
          path="/owner/customers"
          element={<OwnerCustomers />}
        />

        <Route
          path="/owner/customer-details"
          element={<CustomerDetails />}
        />

        <Route
          path="/owner/customer-history"
          element={<CustomerWorkHistory />}
        />
        <Route
          path="/customer"
          element={<CustomerDashboard />}
        />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/owner/drivers"
          element={<OwnerDrivers />}
        />
        <Route
          path="/owner/driver-attendance"
          element={<DriverAttendance />}
        />
        <Route
          path="/owner/driver-history"
          element={<DriverHistory />}
        />

        

      </Routes>

    </BrowserRouter>
  );
}

export default App;