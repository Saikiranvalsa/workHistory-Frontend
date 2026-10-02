import { useState } from "react";
import { useNavigate } from "react-router-dom";

function OwnerDashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("JWT_TOKEN");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          MOBILE LEFT DRAWER
      ====================================================== */}

      {menuOpen && (
        <div className="fixed inset-0 z-[100]">

          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="absolute left-0 top-0 bottom-0 w-[290px] max-w-[85vw] bg-white shadow-2xl flex flex-col">

            <div className="bg-green-700 text-white px-6 pt-8 pb-6">

              <div className="flex items-center justify-between">

                <div>
                  <h1 className="text-2xl font-bold">
                    WorkHistory
                  </h1>

                  <p className="text-sm text-green-100 mt-1">
                    Owner Portal
                  </p>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                >
                  ×
                </button>

              </div>

              <div className="flex items-center gap-3 mt-7">

                <div className="w-14 h-14 rounded-full bg-white text-green-700 flex items-center justify-center font-bold">
                  VS
                </div>

                <div>
                  <p className="text-lg font-semibold">
                    Saikiran
                  </p>

                  <p className="text-sm text-green-100">
                    Owner
                  </p>
                </div>

              </div>

            </div>

            <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">

              <DrawerItem
                icon="⌂"
                text="Dashboard"
                active
                onClick={() => goTo("/owner")}
              />

              <DrawerItem
                icon="+"
                text="Add Work"
                onClick={() => goTo("/owner/add-work")}
              />

              <DrawerItem
                icon="₹"
                text="Payments"
                onClick={() => goTo("/owner/payments")}
              />

              <DrawerItem
                icon="▤"
                text="Work History"
                onClick={() => goTo("/owner/work-history")}
              />

              <DrawerItem
                icon="♙"
                text="Customers"
                onClick={() => goTo("/owner/customers")}
              />

              <DrawerItem
                icon="🚜"
                text="Vehicle Types"
                onClick={() => goTo("/owner/vehicles")}
              />

              <DrawerItem
                icon="▥"
                text="Profit History"
                onClick={() => goTo("/owner/profit")}
              />

              <div className="border-t my-4" />

              <DrawerItem
                icon="♙"
                text="Profile"
                onClick={() => goTo("/owner/profile")}
              />

              <DrawerItem
                icon="⚙"
                text="Settings"
                onClick={() => goTo("/owner/settings")}
              />

            </nav>

            <div className="p-4 border-t">

              <button
                onClick={handleLogout}
                className="w-full h-14 rounded-xl bg-red-50 text-red-600 flex items-center gap-4 px-5 font-semibold"
              >
                <span className="text-xl">
                  ⇥
                </span>

                Logout
              </button>

            </div>

          </aside>

        </div>
      )}


      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r z-40 flex-col">

        <div className="px-6 py-7 border-b">

          <h1 className="text-2xl font-bold text-green-700">
            WorkHistory
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Owner Portal
          </p>

        </div>

        <nav className="flex-1 p-4 space-y-1">

          <DrawerItem
            icon="⌂"
            text="Dashboard"
            active
            onClick={() => goTo("/owner")}
          />

          <DrawerItem
            icon="+"
            text="Add Work"
            onClick={() => goTo("/owner/add-work")}
          />

          <DrawerItem
            icon="₹"
            text="Payments"
            onClick={() => goTo("/owner/payments")}
          />

          <DrawerItem
            icon="▤"
            text="Work History"
            onClick={() => goTo("/owner/work-history")}
          />

          <DrawerItem
            icon="♙"
            text="Customers"
            onClick={() => goTo("/owner/customers")}
          />

          <DrawerItem
            icon="🚜"
            text="Vehicle Types"
            onClick={() => goTo("/owner/vehicles")}
          />

          <DrawerItem
            icon="▥"
            text="Profit History"
            onClick={() => goTo("/owner/profit")}
          />

          <DrawerItem
            icon="♙"
            text="Profile"
            onClick={() => goTo("/owner/profile")}
          />

        </nav>

        <div className="p-4 border-t">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
          >
            <span className="text-xl">
              ⇥
            </span>

            Logout
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="lg:ml-64 min-h-screen pb-32">

        {/* HEADER */}

        <header className="sticky top-0 z-30 bg-green-700 text-white">

          <div className="max-w-7xl mx-auto px-4 sm:px-6">

            <div className="h-[72px] flex items-center justify-between">

              <div className="flex items-center gap-3">

                <button
                  onClick={() => setMenuOpen(true)}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-2xl lg:hidden"
                >
                  ☰
                </button>

                <div>

                  <h1 className="text-xl sm:text-2xl font-bold">
                    WorkHistory
                  </h1>

                  <p className="text-xs sm:text-sm text-green-100">
                    Owner Dashboard
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <button className="relative w-11 h-11 flex items-center justify-center text-xl">
                  🔔

                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-green-700" />
                </button>

                <button
                  onClick={() => goTo("/owner/profile")}
                  className="w-11 h-11 rounded-full bg-white text-green-700 flex items-center justify-center font-bold"
                >
                  VS
                </button>

              </div>

            </div>

          </div>

        </header>


        {/* CONTENT */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

          <section className="mb-6">

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Hello, Saikiran 👋
            </h2>

            <p className="text-gray-500 mt-1">
              Manage your work and payments
            </p>

          </section>


          {/* EARNINGS */}

          <section className="bg-white rounded-3xl border shadow-sm p-5 sm:p-7">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Total Earnings
                </p>

                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
                  ₹12,500
                </h2>

              </div>

              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                📊
              </div>

            </div>

            <div className="border-t mt-6 pt-5 grid grid-cols-2">

              <div>

                <p className="text-sm text-gray-500">
                  Paid
                </p>

                <p className="text-xl font-bold text-green-600 mt-1">
                  ₹9,000
                </p>

              </div>

              <div className="border-l pl-5">

                <p className="text-sm text-gray-500">
                  Pending
                </p>

                <p className="text-xl font-bold text-orange-500 mt-1">
                  ₹3,500
                </p>

              </div>

            </div>

          </section>


          {/* QUICK ACTIONS */}

          <section className="mt-8">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Quick Actions
              </h2>

              <button className="text-green-600 text-sm font-semibold">
                See all →
              </button>

            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-5">

              <QuickAction
                icon="+"
                title="Add Work"
                bg="bg-green-100"
                color="text-green-600"
                onClick={() => goTo("/owner/add-work")}
              />

              <QuickAction
                icon="₹"
                title="Payments"
                bg="bg-blue-100"
                color="text-blue-600"
                onClick={() => goTo("/owner/payments")}
              />

              <QuickAction
                icon="▤"
                title="History"
                bg="bg-purple-100"
                color="text-purple-600"
                onClick={() => goTo("/owner/work-history")}
              />

              <QuickAction
                icon="♙"
                title="Customers"
                bg="bg-orange-100"
                color="text-orange-600"
                onClick={() => goTo("/owner/customers")}
              />

            </div>

          </section>


          {/* VEHICLES */}

          <section className="mt-8">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Work by Vehicle
              </h2>

              <button className="text-sm text-gray-500">
                This month ▼
              </button>

            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5">

              <VehicleCard
                icon="🚜"
                name="Tractor"
                amount="₹5,000"
              />

              <VehicleCard
                icon="🏗️"
                name="JCB"
                amount="₹3,500"
              />

              <VehicleCard
                icon="🌾"
                name="Harvester"
                amount="₹2,000"
              />

              <VehicleCard
                icon="🚐"
                name="Others"
                amount="₹2,000"
              />

            </div>

          </section>


          {/* RECENT WORK */}

          <section className="mt-8">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Recent Work
              </h2>

              <button
                onClick={() => goTo("/owner/work-history")}
                className="text-green-600 text-sm font-semibold"
              >
                See all →
              </button>

            </div>

            <div className="space-y-3">

              <WorkCard
                name="Ramesh"
                vehicle="Tractor"
                work="Ploughing"
                date="12 Sep 2026"
                amount="₹2,500"
                status="Paid"
              />

              <WorkCard
                name="Suresh"
                vehicle="JCB"
                work="Land Work"
                date="10 Sep 2026"
                amount="₹3,000"
                status="Due ₹1,000"
              />

              <WorkCard
                name="Mahesh"
                vehicle="Harvester"
                work="Harvesting"
                date="8 Sep 2026"
                amount="₹4,000"
                status="Paid"
              />

            </div>

          </section>

        </div>

      </main>


      {/* =====================================================
          FIXED ADD WORK BUTTON
          THIS IS ALWAYS AT BOTTOM CENTER
      ====================================================== */}

      <button
        type="button"
        onClick={() => goTo("/owner/add-work")}
        className="
          fixed
          left-1/2
          -translate-x-1/2
          bottom-5
          z-[120]
          flex
          flex-col
          items-center
        "
      >

        <div className="
          w-[68px]
          h-[68px]
          rounded-full
          bg-green-600
          border-[5px]
          border-white
          shadow-xl
          flex
          items-center
          justify-center
          text-white
          text-4xl
          font-light
        ">
          +
        </div>

        <span className="
          mt-1
          text-xs
          font-bold
          text-gray-700
          bg-white
          px-2
          rounded
        ">
          Add Work
        </span>

      </button>


      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <div className="
        lg:hidden
        fixed
        left-0
        right-0
        bottom-0
        z-[100]
        h-[82px]
        bg-white
        border-t
        border-gray-200
        shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
      ">

        <div className="grid grid-cols-5 h-full">

          <BottomNav
            icon="⌂"
            text="Home"
            active
            onClick={() => goTo("/owner")}
          />

          <BottomNav
            icon="▤"
            text="History"
            onClick={() => goTo("/owner/work-history")}
          />

          <div />

          <BottomNav
            icon="♙"
            text="Customers"
            onClick={() => goTo("/owner/customers")}
          />

          <BottomNav
            icon="♙"
            text="Profile"
            onClick={() => goTo("/owner/profile")}
          />

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   DRAWER ITEM
========================================================= */

function DrawerItem({
  icon,
  text,
  active = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left ${
        active
          ? "bg-green-100 text-green-700 font-semibold"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >

      <span className="w-7 text-center text-xl">
        {icon}
      </span>

      <span>
        {text}
      </span>

    </button>
  );
}


/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  title,
  bg,
  color,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center"
    >

      <div
        className={`w-full aspect-square max-w-[100px] rounded-2xl ${bg} ${color} flex items-center justify-center text-4xl`}
      >
        {icon}
      </div>

      <p className="text-xs sm:text-sm font-medium text-gray-700 mt-2">
        {title}
      </p>

    </button>
  );
}


/* =========================================================
   VEHICLE CARD
========================================================= */

function VehicleCard({
  icon,
  name,
  amount,
}) {
  return (
    <button className="bg-white border rounded-2xl p-4 flex items-center justify-between shadow-sm text-left">

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-2xl">
          {icon}
        </div>

        <div>

          <p className="font-semibold text-gray-800">
            {name}
          </p>

          <p className="font-bold text-gray-900 mt-1">
            {amount}
          </p>

        </div>

      </div>

      <span className="text-green-600 text-2xl">
        ›
      </span>

    </button>
  );
}


/* =========================================================
   WORK CARD
========================================================= */

function WorkCard({
  name,
  vehicle,
  work,
  date,
  amount,
  status,
}) {
  const paid = status === "Paid";

  return (
    <button className="w-full bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left">

      <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
        👤
      </div>

      <div className="flex-1 min-w-0">

        <p className="font-bold text-gray-900">
          {name}
        </p>

        <p className="text-sm text-gray-500 truncate">
          {vehicle} • {work}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {date}
        </p>

      </div>

      <div className="text-right shrink-0">

        <p className="font-bold text-gray-900">
          {amount}
        </p>

        <span
          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${
            paid
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {status}
        </span>

      </div>

    </button>
  );
}


/* =========================================================
   BOTTOM NAV ITEM
========================================================= */

function BottomNav({
  icon,
  text,
  active = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 ${
        active
          ? "text-green-600"
          : "text-gray-500"
      }`}
    >

      <span className="text-2xl">
        {icon}
      </span>

      <span className={`text-[11px] ${active ? "font-bold" : ""}`}>
        {text}
      </span>

    </button>
  );
}

export default OwnerDashboard;