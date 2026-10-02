import { useNavigate } from "react-router-dom";

function RoleSelection() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-10">

          <h1 className="text-4xl font-bold text-green-600">
            WorkHistory
          </h1>

          <p className="text-gray-500 mt-3 text-lg">
            How do you want to use WorkHistory?
          </p>

        </div>


        {/* Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Owner */}
          <button
            onClick={() => navigate("/owner")}
            className="bg-white rounded-2xl p-8 shadow-md
                       hover:shadow-xl hover:-translate-y-1
                       transition text-left border
                       hover:border-green-500"
          >

            <div className="text-5xl mb-5">
              👨‍🌾
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Owner
            </h2>

            <p className="text-gray-500 mt-3">
              Add work, manage customers, track payments
              and view your complete work history.
            </p>

            <div className="mt-6 text-green-600 font-semibold">
              Continue as Owner →
            </div>

          </button>


          {/* Customer */}
          <button
            onClick={() => navigate("/customer")}
            className="bg-white rounded-2xl p-8 shadow-md
                       hover:shadow-xl hover:-translate-y-1
                       transition text-left border
                       hover:border-blue-500"
          >

            <div className="text-5xl mb-5">
              👤
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Customer
            </h2>

            <p className="text-gray-500 mt-3">
              View your work, payments, pending amounts
              and complete work history.
            </p>

            <div className="mt-6 text-blue-600 font-semibold">
              Continue as Customer →
            </div>

          </button>

        </div>

      </div>

    </div>
  );
}

export default RoleSelection;