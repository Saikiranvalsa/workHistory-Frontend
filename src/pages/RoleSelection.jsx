import { useNavigate } from "react-router-dom";

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-6 md:py-10">

      <div className="w-full max-w-2xl">

        {/* ================= TITLE ================= */}
        <div className="text-center mb-6 md:mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-green-600">
            WorkHistory
          </h1>

          <p className="mt-2 text-base md:text-lg text-slate-500">
            How do you want to use WorkHistory?
          </p>

        </div>

        {/* ================= OWNER ================= */}
        <button
          onClick={() => navigate("/owner")}
          className="
            w-full
            bg-white
            border
            border-slate-300
            rounded-2xl
            p-6
            md:p-8
            mb-5
            text-left
            hover:border-green-500
            hover:shadow-lg
            transition
          "
        >

          <div className="text-4xl md:text-5xl mb-4">
            👨‍🌾
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Owner
          </h2>

          <p className="mt-3 text-base md:text-lg text-slate-500 leading-relaxed">
            Add work, manage customers, track payments
            and view your complete work history.
          </p>

          <div className="mt-5 text-green-600 font-bold text-base md:text-lg">
            Continue as Owner →
          </div>

        </button>

        {/* ================= CUSTOMER ================= */}
        <button
          onClick={() => navigate("/customer")}
          className="
            w-full
            bg-white
            border
            border-slate-300
            rounded-2xl
            p-6
            md:p-8
            text-left
            hover:border-green-500
            hover:shadow-lg
            transition
          "
        >

          <div className="text-4xl md:text-5xl mb-4">
            👤
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Customer
          </h2>

          <p className="mt-3 text-base md:text-lg text-slate-500 leading-relaxed">
            View your work, payments, pending amounts
            and complete work history.
          </p>

          <div className="mt-5 text-green-600 font-bold text-base md:text-lg">
            Continue as Customer →
          </div>

        </button>

      </div>

    </div>
  );
}

export default RoleSelection;