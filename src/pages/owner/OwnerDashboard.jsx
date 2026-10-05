import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function OwnerDashboard() {
  const navigate = useNavigate();

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =====================================================
  // LOAD WORKS
  // =====================================================

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);

      const response = await api.get("/owner/works");

      console.log("OWNER WORKS:", response.data);

      setWorks(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("WORK LOAD ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("JWT_TOKEN");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLOSE SIDEBAR
  // =====================================================

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // =====================================================
  // GO TO PROFILE
  // =====================================================

  const openProfile = () => {
    closeSidebar();
    navigate("/profile");
  };

  // =====================================================
  // GO TO DRIVERS
  // =====================================================

  const openDrivers = () => {
    closeSidebar();
    navigate("/owner/drivers");
  };

  // =====================================================
  // VEHICLE NAME
  // =====================================================

  const formatVehicle = (machine) => {
    if (!machine) {
      return "Others";
    }

    const value = machine
      .toString()
      .trim()
      .toLowerCase();

    if (value === "tractor") {
      return "Tractor";
    }

    if (value === "jcb") {
      return "JCB";
    }

    if (value === "harvester") {
      return "Harvester";
    }

    if (value === "magic") {
      return "Magic";
    }

    if (
      value === "car" ||
      value === "car/ev" ||
      value === "car / ev"
    ) {
      return "Car / EV";
    }

    if (
      value === "other" ||
      value === "others"
    ) {
      return "Others";
    }

    return machine;
  };

  // =====================================================
  // VEHICLE ICON
  // =====================================================

  const getVehicleIcon = (machine) => {
    const vehicle = formatVehicle(machine);

    if (vehicle === "Tractor") {
      return "🚜";
    }

    if (vehicle === "JCB") {
      return "🏗️";
    }

    if (vehicle === "Harvester") {
      return "🌾";
    }

    if (vehicle === "Magic") {
      return "🚐";
    }

    if (vehicle === "Car / EV") {
      return "🚗";
    }

    return "🚛";
  };

  // =====================================================
  // OPEN VEHICLE HISTORY
  // =====================================================

  const openVehicleHistory = (vehicle) => {
    closeSidebar();

    navigate("/owner/work-history", {
      state: {
        vehicle: vehicle,
        selectVehicleMode: false,
      },
    });
  };

  // =====================================================
  // OPEN ALL WORK HISTORY
  // =====================================================

  const openAllVehicles = () => {
    closeSidebar();

    navigate("/owner/work-history", {
      state: {
        vehicle: "All",
        selectVehicleMode: true,
      },
    });
  };

  // =====================================================
  // RECENT WORK HISTORY
  // =====================================================

  const openRecentWorkHistory = () => {
    navigate("/owner/work-history", {
      state: {
        vehicle: "All",
        selectVehicleMode: false,
      },
    });
  };

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const today = new Date();

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const workStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const difference = Math.floor(
      (todayStart - workStart) /
        (1000 * 60 * 60 * 24)
    );

    if (difference === 0) {
      return "Today";
    }

    if (difference === 1) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  // =====================================================
  // RECENT WORK
  // =====================================================

  const recentWorks = useMemo(() => {
    return [...works]
      .sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      )
      .slice(0, 3);
  }, [works]);

  // =====================================================
  // VEHICLE TOTALS
  // =====================================================

  const vehicleTotals = useMemo(() => {
    const totals = {};

    works.forEach((work) => {
      const vehicle = formatVehicle(
        work.machine
      );

      if (!totals[vehicle]) {
        totals[vehicle] = 0;
      }

      totals[vehicle] += Number(
        work.amount || 0
      );
    });

    return totals;
  }, [works]);

  // =====================================================
  // CURRENT YEAR
  // =====================================================

  const currentYear =
    new Date().getFullYear();

  const currentYearWorks = useMemo(() => {
    return works.filter((work) => {
      if (!work.date) {
        return false;
      }

      const workDate = new Date(
        work.date
      );

      return (
        workDate.getFullYear() ===
        currentYear
      );
    });
  }, [works, currentYear]);

  // =====================================================
  // YEARLY EARNINGS
  // =====================================================

  const totalEarnings =
    currentYearWorks.reduce(
      (sum, work) =>
        sum + Number(work.amount || 0),
      0
    );

  // =====================================================
  // YEARLY PAID
  // =====================================================

  const totalPaid =
    currentYearWorks.reduce(
      (sum, work) =>
        sum + Number(work.paid || 0),
      0
    );

  // =====================================================
  // YEARLY PENDING
  // =====================================================

  const totalPending =
    currentYearWorks.reduce(
      (sum, work) => {
        const amount =
          Number(work.amount || 0);

        const paid =
          Number(work.paid || 0);

        const due =
          work.due !== undefined &&
          work.due !== null
            ? Number(work.due || 0)
            : amount - paid;

        return sum + due;
      },
      0
    );

  // =====================================================
  // VEHICLE CARDS
  // =====================================================

  const vehicleCards = [
    "Tractor",
    "JCB",
    "Harvester",
    "Car / EV",
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside
        className="
          hidden
          md:flex
          fixed
          left-0
          top-0
          bottom-0
          w-64
          bg-white
          border-r
          border-slate-200
          flex-col
          z-50
        "
      >

        {/* LOGO */}

        <div className="p-6">
          <h1 className="text-2xl font-bold text-green-600">
            WorkHistory
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Owner Portal
          </p>
        </div>

        {/* CHANGE ROLE */}

        <div className="px-5 py-4 border-b border-slate-200">

          <button
            type="button"
            onClick={() => navigate("/role")}
            className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-xl
              bg-green-50
              text-green-700
              font-semibold
              hover:bg-green-100
            "
          >
            🔄

            <span>
              Change Role
            </span>
          </button>

        </div>

        {/* DESKTOP MENU */}

        <div className="flex-1 p-5 space-y-2">

          {/* DASHBOARD */}

          <button
            type="button"
            onClick={() => navigate("/owner")}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              bg-green-50
              text-green-700
              font-semibold
            "
          >
            ⌂
            Dashboard
          </button>

          {/* PAYMENTS */}

          <button
            type="button"
            onClick={() =>
              navigate("/owner/payments")
            }
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              text-slate-700
              hover:bg-slate-50
              rounded-xl
            "
          >
            ₹
            Payments
          </button>

          {/* WORK HISTORY */}

          <button
            type="button"
            onClick={openAllVehicles}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              text-slate-700
              hover:bg-slate-50
              rounded-xl
            "
          >
            ▤
            Work History
          </button>

          {/* CUSTOMERS */}

          <button
            type="button"
            onClick={() =>
              navigate("/owner/customers")
            }
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              text-slate-700
              hover:bg-slate-50
              rounded-xl
            "
          >
            ♙
            Customers
          </button>

          {/* DRIVERS */}

          <button
            type="button"
            onClick={openDrivers}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              text-slate-700
              hover:bg-slate-50
              rounded-xl
            "
          >
            🚚
            Drivers
          </button>

          {/* VEHICLE TYPES */}

          <button
            type="button"
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              text-slate-700
              hover:bg-slate-50
              rounded-xl
            "
          >
            🚜
            Vehicle Types
          </button>

          {/* PROFIT HISTORY */}

          <button
            type="button"
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              text-slate-700
              hover:bg-slate-50
              rounded-xl
            "
          >
            ▥
            Profit History
          </button>

          {/* PROFILE */}

          <button
            type="button"
            onClick={openProfile}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              text-slate-700
              hover:bg-slate-50
              rounded-xl
            "
          >
            ♙
            Profile
          </button>

          {/* REFER & EARN */}

          <button
            type="button"
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              text-slate-700
              hover:bg-slate-50
              rounded-xl
            "
          >
            🎁
            Refer & Earn
          </button>

        </div>

        {/* DESKTOP LOGOUT */}

        <div className="border-t border-slate-200 p-5">

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(
                "JWT_TOKEN"
              );

              navigate("/login");
            }}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              text-red-600
              rounded-xl
              hover:bg-red-50
            "
          >
            →
            Logout
          </button>

        </div>

      </aside>

      {/* =================================================
          MOBILE SIDEBAR OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <div
          className="
            md:hidden
            fixed
            inset-0
            bg-black/40
            z-[60]
          "
          onClick={closeSidebar}
        />
      )}

      {/* =================================================
          MOBILE SIDEBAR
      ================================================= */}

      <aside
        className={`
          md:hidden
          fixed
          top-0
          left-0
          bottom-0
          w-[280px]
          bg-white
          z-[70]
          shadow-2xl
          transform
          transition-transform
          duration-300
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* SIDEBAR HEADER */}

        <div
          className="
            p-5
            border-b
            border-slate-200
            flex
            items-center
            justify-between
          "
        >

          <div>
            <h1 className="text-xl font-bold text-green-600">
              WorkHistory
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Owner Portal
            </p>
          </div>

          <button
            type="button"
            onClick={closeSidebar}
            className="
              w-10
              h-10
              rounded-full
              bg-slate-100
              text-slate-600
              flex
              items-center
              justify-center
              text-xl
            "
          >
            ×
          </button>

        </div>

        {/* OWNER */}

        <button
          type="button"
          onClick={openProfile}
          className="
            w-full
            p-5
            border-b
            border-slate-200
            flex
            items-center
            gap-3
            text-left
            hover:bg-slate-50
          "
        >

          <div
            className="
              w-12
              h-12
              rounded-full
              bg-green-100
              text-green-700
              flex
              items-center
              justify-center
              font-bold
            "
          >
            VS
          </div>

          <div>
            <p className="font-bold text-lg">
              Owner
            </p>

            <p className="text-xs text-slate-500">
              WorkHistory
            </p>
          </div>

        </button>

        {/* MOBILE MENU */}

        <div
          className="
            p-4
            overflow-y-auto
            h-[calc(100%-180px)]
          "
        >

          {/* CHANGE ROLE */}

          <button
            type="button"
            onClick={() => {
              closeSidebar();
              navigate("/role");
            }}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              mb-2
              rounded-xl
              bg-green-50
              text-green-700
              font-semibold
            "
          >
            <span>🔄</span>

            <span>
              Change Role
            </span>
          </button>

          {/* DASHBOARD */}

          <button
            type="button"
            onClick={() => {
              closeSidebar();
              navigate("/owner");
            }}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              bg-green-50
              text-green-700
              font-semibold
            "
          >
            <span>⌂</span>

            <span>
              Dashboard
            </span>
          </button>

          {/* PAYMENTS */}

          <button
            type="button"
            onClick={() => {
              closeSidebar();
              navigate("/owner/payments");
            }}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-50
            "
          >
            <span>₹</span>

            <span>
              Payments
            </span>
          </button>

          {/* WORK HISTORY */}

          <button
            type="button"
            onClick={openAllVehicles}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-50
            "
          >
            <span>▤</span>

            <span>
              Work History
            </span>
          </button>

          {/* CUSTOMERS */}

          <button
            type="button"
            onClick={() => {
              closeSidebar();
              navigate("/owner/customers");
            }}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-50
            "
          >
            <span>♙</span>

            <span>
              Customers
            </span>
          </button>

          {/* DRIVERS */}

          <button
            type="button"
            onClick={openDrivers}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-50
            "
          >
            <span>🚚</span>

            <span>
              Drivers
            </span>
          </button>

          {/* VEHICLE TYPES */}

          <button
            type="button"
            onClick={closeSidebar}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-50
            "
          >
            <span>🚜</span>

            <span>
              Vehicle Types
            </span>
          </button>

          {/* PROFIT HISTORY */}

          <button
            type="button"
            onClick={closeSidebar}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-50
            "
          >
            <span>▥</span>

            <span>
              Profit History
            </span>
          </button>

          {/* PROFILE */}

          <button
            type="button"
            onClick={openProfile}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-50
            "
          >
            <span>♙</span>

            <span>
              Profile
            </span>
          </button>

          {/* REFER & EARN */}

          <button
            type="button"
            onClick={closeSidebar}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-50
            "
          >
            <span>🎁</span>

            <span>
              Refer & Earn
            </span>
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={() => {
              closeSidebar();

              localStorage.removeItem(
                "JWT_TOKEN"
              );

              navigate("/login");
            }}
            className="
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              mt-2
              rounded-xl
              text-red-600
              hover:bg-red-50
            "
          >
            <span>→</span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main
        className="
          md:ml-64
          min-h-screen
          pb-24
        "
      >

        {/* HEADER */}

        <header
          className="
            bg-green-700
            text-white
            px-4
            py-3
            md:px-8
            md:py-4
          "
        >

          <div
            className="
              flex
              justify-between
              items-center
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              {/* MOBILE MENU */}

              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="
                  md:hidden
                  w-10
                  h-10
                  rounded-xl
                  bg-green-600
                  flex
                  items-center
                  justify-center
                  text-xl
                "
              >
                ☰
              </button>

              <div>
                <h1 className="text-lg md:text-2xl font-bold">
                  WorkHistory
                </h1>

                <p className="text-xs md:text-sm">
                  Owner Dashboard
                </p>
              </div>

            </div>

            {/* PROFILE */}

            <button
              type="button"
              onClick={openProfile}
              className="
                w-9
                h-9
                rounded-full
                bg-white
                text-green-700
                flex
                items-center
                justify-center
                font-bold
                hover:bg-green-50
                active:scale-95
                transition
                cursor-pointer
              "
            >
              VS
            </button>

          </div>

        </header>

        {/* CONTENT */}

        <div
          className="
            max-w-5xl
            mx-auto
            px-3
            md:px-8
            py-4
          "
        >

          {/* =================================================
              YEARLY EARNINGS
          ================================================= */}

          <section
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-4
              shadow-sm
            "
          >

            <div className="flex items-center justify-between">

              <p className="text-xs text-slate-500">
                Yearly Earnings
              </p>

              <span className="text-xs font-semibold text-green-600">
                {currentYear}
              </span>

            </div>

            {/* REDUCED FROM text-3xl TO text-2xl */}

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {formatMoney(totalEarnings)}
            </h2>

            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-4
              "
            >

              {/* PAID */}

              <div>

                <p className="text-xs text-slate-500">
                  Paid
                </p>

                {/* REDUCED FROM text-lg TO text-base */}

                <p className="text-base font-bold text-green-600">
                  {formatMoney(totalPaid)}
                </p>

              </div>

              {/* PENDING */}

              <div
                className="
                  border-l
                  border-slate-200
                  pl-4
                "
              >

                <p className="text-xs text-slate-500">
                  Pending
                </p>

                {/* REDUCED FROM text-lg TO text-base */}

                <p className="text-base font-bold text-orange-500">
                  {formatMoney(totalPending)}
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="mt-6">

            <h2 className="text-xl font-bold mb-3">
              Quick Actions
            </h2>

            <div
              className="
                grid
                grid-cols-4
                gap-2
              "
            >

              {/* PAYMENTS */}

              <button
                type="button"
                onClick={() =>
                  navigate("/owner/payments")
                }
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-xl
                  p-2
                  text-center
                  active:scale-95
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    mx-auto
                    rounded-xl
                    bg-blue-100
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  ₹
                </div>

                <p className="text-xs mt-1">
                  Payments
                </p>

              </button>

              {/* HISTORY */}

              <button
                type="button"
                onClick={openAllVehicles}
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-xl
                  p-2
                  text-center
                  active:scale-95
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    mx-auto
                    rounded-xl
                    bg-purple-100
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  ▤
                </div>

                <p className="text-xs mt-1">
                  History
                </p>

              </button>

              {/* CUSTOMERS */}

              <button
                type="button"
                onClick={() =>
                  navigate("/owner/customers")
                }
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-xl
                  p-2
                  text-center
                  active:scale-95
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    mx-auto
                    rounded-xl
                    bg-orange-100
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  ♙
                </div>

                <p className="text-xs mt-1">
                  Customers
                </p>

              </button>

              {/* DRIVERS */}

              <button
                type="button"
                onClick={openDrivers}
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-xl
                  p-2
                  text-center
                  active:scale-95
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    mx-auto
                    rounded-xl
                    bg-green-100
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  🚚
                </div>

                <p className="text-xs mt-1">
                  Drivers
                </p>

              </button>

            </div>

          </section>

          {/* =================================================
              WORK BY VEHICLE
          ================================================= */}

          <section className="mt-6">

            <div
              className="
                flex
                justify-between
                items-center
                mb-3
              "
            >

              <h2 className="text-xl font-bold">
                Work by Vehicle
              </h2>

              <button
                type="button"
                onClick={openAllVehicles}
                className="
                  text-sm
                  text-green-600
                  font-semibold
                "
              >
                See all →
              </button>

            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-2
              "
            >

              {vehicleCards.map(
                (vehicle) => (

                  <button
                    key={vehicle}
                    type="button"
                    onClick={() =>
                      openVehicleHistory(
                        vehicle
                      )
                    }
                    className="
                      w-full
                      bg-white
                      border
                      border-slate-200
                      rounded-xl
                      p-3
                      flex
                      items-center
                      justify-between
                      text-left
                      active:scale-[0.98]
                      hover:border-green-400
                      hover:shadow-sm
                      transition
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <div
                        className="
                          w-10
                          h-10
                          rounded-full
                          bg-green-50
                          flex
                          items-center
                          justify-center
                          text-xl
                        "
                      >
                        {getVehicleIcon(
                          vehicle
                        )}
                      </div>

                      <div>

                        <p className="text-sm font-bold">
                          {vehicle}
                        </p>

                        {/* REDUCED FROM text-sm TO text-xs */}

                        <p className="text-xs font-bold">
                          {formatMoney(
                            vehicleTotals[
                              vehicle
                            ] || 0
                          )}
                        </p>

                      </div>

                    </div>

                    <span
                      className="
                        text-green-600
                        text-xl
                        font-bold
                      "
                    >
                      →
                    </span>

                  </button>

                )
              )}

            </div>

          </section>

          {/* =================================================
              RECENT WORK
          ================================================= */}

          <section className="mt-6">

            <div
              className="
                flex
                items-center
                justify-between
                mb-3
              "
            >

              <h2 className="text-xl font-bold">
                Recent Work
              </h2>

              <button
                type="button"
                onClick={openRecentWorkHistory}
                className="
                  text-green-600
                  font-semibold
                  text-sm
                "
              >
                See all →
              </button>

            </div>

            {loading && (

              <div
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-xl
                  p-5
                  text-center
                  text-sm
                  text-slate-500
                "
              >
                Loading recent work...
              </div>

            )}

            {!loading &&
              recentWorks.length === 0 && (

                <div
                  className="
                    bg-white
                    border
                    border-slate-200
                    rounded-xl
                    p-5
                    text-center
                  "
                >

                  <p className="text-2xl">
                    📋
                  </p>

                  <p className="text-sm font-semibold mt-2">
                    No work records yet
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Add your first work record.
                  </p>

                </div>

              )}

            {!loading &&
              recentWorks.length > 0 && (

                <div className="space-y-2.5">

                  {recentWorks.map(
                    (work, index) => {

                      const vehicle =
                        formatVehicle(
                          work.machine
                        );

                      return (
                        <div
                          key={
                            work.id ||
                            work.Id ||
                            index
                          }
                          className="
                            bg-white
                            border
                            border-slate-200
                            rounded-2xl
                            px-3
                            py-3
                            shadow-sm
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-2
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                                min-w-0
                              "
                            >

                              <div
                                className="
                                  w-11
                                  h-11
                                  rounded-full
                                  bg-green-50
                                  flex
                                  items-center
                                  justify-center
                                  text-2xl
                                  shrink-0
                                "
                              >
                                {getVehicleIcon(
                                  work.machine
                                )}
                              </div>

                              <div className="min-w-0">

                                <p
                                  className="
                                    text-sm
                                    font-bold
                                    text-slate-900
                                    truncate
                                  "
                                >
                                  {work.customerName ||
                                    "Customer"}
                                </p>

                                <p
                                  className="
                                    text-xs
                                    text-slate-500
                                    mt-0.5
                                    truncate
                                  "
                                >
                                  {vehicle}

                                  <span className="mx-1">
                                    •
                                  </span>

                                  {work.workType ||
                                    "Work"}
                                </p>

                              </div>

                            </div>

                            <div
                              className="
                                text-right
                                shrink-0
                              "
                            >

                              <p
                                className="
                                  text-sm
                                  font-bold
                                  text-slate-900
                                "
                              >
                                {formatMoney(
                                  work.amount
                                )}
                              </p>

                              <p
                                className="
                                  text-[10px]
                                  text-slate-400
                                  mt-0.5
                                "
                              >
                                {formatDate(
                                  work.date
                                )}
                              </p>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

          </section>

        </div>

      </main>

      {/* =================================================
          MOBILE BOTTOM NAVIGATION
      ================================================= */}

      <div
        className="
          md:hidden
          fixed
          bottom-0
          left-0
          right-0
          h-16
          bg-white
          border-t
          border-slate-200
          flex
          items-center
          justify-around
          z-50
        "
      >

        {/* HOME */}

        <button
          type="button"
          onClick={() =>
            navigate("/owner")
          }
          className="
            flex
            flex-col
            items-center
            text-green-600
            text-[10px]
          "
        >
          <span className="text-lg">
            ⌂
          </span>

          Home
        </button>

        {/* HISTORY */}

        <button
          type="button"
          onClick={openAllVehicles}
          className="
            flex
            flex-col
            items-center
            text-slate-500
            text-[10px]
          "
        >
          <span className="text-lg">
            ▤
          </span>

          History
        </button>

        {/* ADD WORK */}

        <button
          type="button"
          onClick={() =>
            navigate("/owner/add-work")
          }
          className="
            -mt-8
            w-14
            h-14
            rounded-full
            bg-green-600
            text-white
            text-3xl
            shadow-lg
            border-4
            border-white
            flex
            items-center
            justify-center
          "
        >
          +
        </button>

        {/* CUSTOMERS */}

        <button
          type="button"
          onClick={() =>
            navigate("/owner/customers")
          }
          className="
            flex
            flex-col
            items-center
            text-slate-500
            text-[10px]
          "
        >
          <span className="text-lg">
            ♙
          </span>

          Customers
        </button>

        {/* DRIVERS */}

        <button
          type="button"
          onClick={openDrivers}
          className="
            flex
            flex-col
            items-center
            text-slate-500
            text-[10px]
          "
        >
          <span className="text-lg">
            🚚
          </span>

          Drivers
        </button>

      </div>

    </div>
  );
}

export default OwnerDashboard;