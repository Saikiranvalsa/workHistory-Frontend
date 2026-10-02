import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

function CustomerHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const vehicle = location.state?.vehicle || "";

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vehicle) {
      navigate("/owner/add-work");
      return;
    }

    loadCustomers();
  }, [vehicle]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/owner/mycustomers");

      console.log("MY CUSTOMERS:", response.data);

      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("CUSTOMER ERROR:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("JWT_TOKEN");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) => {
      const name = customer.name || "";
      const number = customer.number || "";

      return (
        name.toLowerCase().includes(value) ||
        number.includes(value)
      );
    });
  }, [customers, search]);

  // ==========================================
  // EXISTING CUSTOMER
  // ==========================================

  const selectCustomer = (customer) => {
    navigate("/owner/add-work/details", {
      state: {
        vehicle,
        customer: {
          name: customer.name,
          number: customer.number,
        },
      },
    });
  };

  // ==========================================
  // NEW CUSTOMER
  // ==========================================

  const addNewCustomer = () => {
    navigate("/owner/add-work/details", {
      state: {
        vehicle,
        newCustomer: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-green-700 text-white">

        <div className="max-w-3xl mx-auto px-4">

          <div className="h-[72px] flex items-center gap-4">

            <button
              onClick={() => navigate("/owner/add-work")}
              className="w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-green-600"
            >
              ←
            </button>

            <div>

              <h1 className="text-xl font-bold">
                Customer History
              </h1>

              <p className="text-xs text-green-100">
                Select customer for this work
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* MAIN */}
      <main className="max-w-3xl mx-auto px-4 py-5 pb-10">

        {/* SELECTED VEHICLE */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">

          <p className="text-[11px] text-green-600 font-semibold">
            NEW WORK VEHICLE
          </p>

          <div className="flex items-center gap-3 mt-1">

            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl">
              {getVehicleIcon(vehicle)}
            </div>

            <div>

              <h2 className="text-base font-bold text-gray-900">
                {vehicle}
              </h2>

              <p className="text-xs text-gray-500">
                Customer history is common for all vehicles
              </p>

            </div>

          </div>

        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-xl border p-3 shadow-sm mb-5">

          <div className="relative">

            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer name or number"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />

          </div>

        </div>

        {/* CUSTOMER TITLE */}
        <div className="flex items-center justify-between mb-3">

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              Your Customers
            </h2>

            <p className="text-xs text-gray-500 mt-0.5">
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1 ? "s" : ""}
            </p>

          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white border rounded-xl p-6 text-center">

            <div className="text-2xl mb-2">
              ⏳
            </div>

            <p className="text-sm text-gray-500">
              Loading customers...
            </p>

          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">

            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={loadCustomers}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Try Again
            </button>

          </div>
        )}

        {/* NO CUSTOMERS */}
        {!loading &&
          !error &&
          filteredCustomers.length === 0 && (
            <div className="bg-white border rounded-xl p-6 text-center">

              <div className="text-4xl mb-3">
                👤
              </div>

              <h3 className="text-base font-bold text-gray-900">
                No customers found
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Add a new customer to continue.
              </p>

            </div>
          )}

        {/* CUSTOMER LIST */}
        {!loading &&
          !error &&
          filteredCustomers.length > 0 && (
            <div className="space-y-2">

              {filteredCustomers.map((customer, index) => (
                <CustomerCard
                  key={customer.number || index}
                  customer={customer}
                  onSelect={() => selectCustomer(customer)}
                />
              ))}

            </div>
          )}

        {/* ADD NEW CUSTOMER */}
        <div className="mt-5">

          <button
            onClick={addNewCustomer}
            className="w-full bg-white border-2 border-dashed border-green-300 rounded-xl p-3.5 flex items-center justify-center gap-2 text-green-700 hover:bg-green-50 transition"
          >

            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xl">
              +
            </span>

            <span className="text-sm font-bold">
              Add New Customer
            </span>

          </button>

          <p className="text-center text-[11px] text-gray-400 mt-2">
            New customers will be verified using OTP.
          </p>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   CUSTOMER CARD
========================================================= */

function CustomerCard({ customer, onSelect }) {
  const name = customer.name || "Unknown Customer";
  const number = customer.number || "No number";

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm hover:border-green-500 transition">

      <div className="flex items-center gap-3">

        {/* AVATAR */}
        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">
          {getInitials(name)}
        </div>

        {/* CUSTOMER INFO */}
        <div className="flex-1 min-w-0">

          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {name}
          </h3>

          <p className="text-xs text-gray-500 mt-0.5">
            📱 {number}
          </p>

        </div>

        {/* SELECT BUTTON */}
        <button
          onClick={onSelect}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100"
        >
          Select
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {
  if (!name) {
    return "C";
  }

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}


/* =========================================================
   VEHICLE ICON
========================================================= */

function getVehicleIcon(vehicle) {
  const icons = {
    Tractor: "🚜",
    JCB: "🏗️",
    Harvester: "🌾",
    Magic: "🚐",
    "Car / EV": "🚗",
    Other: "🚛",
  };

  return icons[vehicle] || "🚜";
}

export default CustomerHistory;