import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("JWT_TOKEN");
    navigate("/login");
  };

  const handleChangeRole = () => {
    navigate("/role");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-slate-200">

          <h1 className="text-2xl font-bold text-green-600">
            WorkHistory
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Customer Portal
          </p>

          {/* CHANGE ROLE */}
          <button
            onClick={handleChangeRole}
            className="
              mt-5
              w-full
              px-4
              py-3
              rounded-xl
              bg-green-50
              text-green-700
              font-semibold
              text-left
              hover:bg-green-100
              transition
            "
          >
            🔄 Change Role
          </button>

        </div>


        {/* Sidebar Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

          {/* Dashboard */}
          <button
            onClick={() => navigate("/customer")}
            className="
              w-full
              text-left
              px-4
              py-3
              rounded-xl
              bg-green-50
              text-green-700
              font-semibold
              hover:bg-green-100
              transition
            "
          >
            🏠 Dashboard
          </button>


          {/* Work History */}
          <button
            onClick={() => navigate("/customer/work-history")}
            className="
              w-full
              text-left
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-100
              transition
            "
          >
            📋 Work History
          </button>


          {/* Payments */}
          <button
            onClick={() => navigate("/customer/payments")}
            className="
              w-full
              text-left
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-100
              transition
            "
          >
            💰 Payments
          </button>


          {/* Profile */}
          <button
            onClick={() => navigate("/customer/profile")}
            className="
              w-full
              text-left
              px-4
              py-3
              rounded-xl
              text-slate-700
              hover:bg-slate-100
              transition
            "
          >
            👤 Profile
          </button>

        </nav>


        {/* Logout */}
        <div className="p-4 border-t border-slate-200">

          <button
            onClick={handleLogout}
            className="
              w-full
              px-4
              py-3
              rounded-xl
              text-left
              text-red-600
              hover:bg-red-50
              font-semibold
              transition
            "
          >
            🚪 Logout
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="md:ml-64 pb-24 md:pb-8">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-5 py-5 md:px-8">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Customer Dashboard
              </h2>

              <p className="text-sm md:text-base text-slate-500 mt-1">
                Manage your work and payments
              </p>

            </div>


            {/* Mobile Change Role */}
            <button
              onClick={handleChangeRole}
              className="
                md:hidden
                bg-green-100
                text-green-700
                px-3
                py-2
                rounded-lg
                font-semibold
              "
            >
              🔄
            </button>

          </div>

        </header>


        {/* =====================================================
            DASHBOARD CONTENT
        ===================================================== */}

        <section className="p-5 md:p-8">

          {/* Welcome Card */}
          <div
            className="
              bg-gradient-to-r
              from-green-500
              to-green-600
              rounded-2xl
              p-6
              md:p-8
              text-white
              mb-6
            "
          >

            <p className="text-green-100 text-sm">
              Welcome to
            </p>

            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              Your Customer Portal 👋
            </h1>

            <p className="mt-3 text-green-50 max-w-xl">
              View your work records, payment details and complete
              work history in one place.
            </p>

          </div>


          {/* Quick Actions */}
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Quick Actions
          </h3>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Work History */}
            <button
              onClick={() => navigate("/customer/work-history")}
              className="
                bg-white
                border
                border-slate-200
                rounded-2xl
                p-6
                text-left
                hover:border-green-500
                hover:shadow-md
                transition
              "
            >

              <div className="text-3xl mb-4">
                📋
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Work History
              </h4>

              <p className="text-sm text-slate-500 mt-2">
                View all your completed and ongoing work.
              </p>

              <div className="mt-4 text-green-600 font-semibold">
                View History →
              </div>

            </button>


            {/* Payments */}
            <button
              onClick={() => navigate("/customer/payments")}
              className="
                bg-white
                border
                border-slate-200
                rounded-2xl
                p-6
                text-left
                hover:border-green-500
                hover:shadow-md
                transition
              "
            >

              <div className="text-3xl mb-4">
                💰
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Payments
              </h4>

              <p className="text-sm text-slate-500 mt-2">
                Check your paid and pending amounts.
              </p>

              <div className="mt-4 text-green-600 font-semibold">
                View Payments →
              </div>

            </button>


            {/* Profile */}
            <button
              onClick={() => navigate("/customer/profile")}
              className="
                bg-white
                border
                border-slate-200
                rounded-2xl
                p-6
                text-left
                hover:border-green-500
                hover:shadow-md
                transition
              "
            >

              <div className="text-3xl mb-4">
                👤
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                My Profile
              </h4>

              <p className="text-sm text-slate-500 mt-2">
                View your customer profile details.
              </p>

              <div className="mt-4 text-green-600 font-semibold">
                View Profile →
              </div>

            </button>

          </div>

        </section>

      </main>


      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <nav
        className="
          md:hidden
          fixed
          bottom-0
          left-0
          right-0
          bg-white
          border-t
          border-slate-200
          px-2
          py-2
          z-50
        "
      >

        <div className="grid grid-cols-4 gap-1">

          {/* Home */}
          <button
            onClick={() => navigate("/customer")}
            className="
              flex
              flex-col
              items-center
              py-2
              text-green-600
            "
          >
            <span className="text-xl">
              🏠
            </span>

            <span className="text-xs font-semibold mt-1">
              Home
            </span>
          </button>


          {/* History */}
          <button
            onClick={() => navigate("/customer/work-history")}
            className="
              flex
              flex-col
              items-center
              py-2
              text-slate-600
            "
          >
            <span className="text-xl">
              📋
            </span>

            <span className="text-xs mt-1">
              History
            </span>
          </button>


          {/* Payments */}
          <button
            onClick={() => navigate("/customer/payments")}
            className="
              flex
              flex-col
              items-center
              py-2
              text-slate-600
            "
          >
            <span className="text-xl">
              💰
            </span>

            <span className="text-xs mt-1">
              Payments
            </span>
          </button>


          {/* Change Role */}
          <button
            onClick={handleChangeRole}
            className="
              flex
              flex-col
              items-center
              py-2
              text-slate-600
            "
          >
            <span className="text-xl">
              🔄
            </span>

            <span className="text-xs mt-1">
              Change
            </span>
          </button>

        </div>

      </nav>

    </div>
  );
}

export default CustomerDashboard;