import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AddCustomer() {
  const navigate = useNavigate();
  const location = useLocation();

  const vehicle = location.state?.vehicle || "";

  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==============================
  // SEND OTP
  // ==============================
  const handleSendOtp = () => {
    setError("");
    setMessage("");

    if (!customerName.trim()) {
      setError("Please enter customer name.");
      return;
    }

    if (!customerNumber.trim()) {
      setError("Please enter mobile number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(customerNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Generate 6 digit OTP
    const newOtp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    setGeneratedOtp(newOtp);
    setOtpSent(true);
    setOtp("");
    setVerified(false);

    // Development testing
    console.log("OTP:", newOtp);

    setMessage(
      `OTP generated: ${newOtp}`
    );
  };

  // ==============================
  // VERIFY OTP
  // ==============================
  const handleVerifyOtp = () => {
    setError("");
    setMessage("");

    if (!otp) {
      setError("Please enter OTP.");
      return;
    }

    if (otp !== generatedOtp) {
      setError("Invalid OTP.");
      return;
    }

    setVerified(true);

    setMessage(
      "Mobile number verified successfully."
    );
  };

  // ==============================
  // CONTINUE
  // ==============================
  const handleContinue = () => {
    if (!verified) {
      setError("Please verify the mobile number first.");
      return;
    }

    navigate("/owner/add-work/details", {
      state: {
        vehicle,
        customer: {
          name: customerName.trim(),
          number: customerNumber.trim(),
        },
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
              type="button"
              onClick={() =>
                navigate("/owner/customer-history", {
                  state: { vehicle },
                })
              }
              className="w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-green-600"
            >
              ←
            </button>

            <div>
              <h1 className="text-xl font-bold">
                Add Customer
              </h1>

              <p className="text-xs text-green-100">
                Verify mobile number
              </p>
            </div>

          </div>

        </div>

      </header>

      {/* MAIN */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-10">

        {/* VEHICLE */}
        <section className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-5">

          <p className="text-xs font-semibold text-green-600">
            VEHICLE
          </p>

          <div className="flex items-center gap-4 mt-3">

            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-3xl">
              {getVehicleIcon(vehicle)}
            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                {vehicle}
              </h2>

              <p className="text-sm text-gray-500">
                New customer
              </p>

            </div>

          </div>

        </section>

        {/* CUSTOMER DETAILS */}
        <section className="bg-white border border-gray-300 rounded-2xl p-5 shadow-sm mb-5">

          <h2 className="text-lg font-bold text-gray-900">
            Customer Details
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Verify the customer's mobile number before adding them.
          </p>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">

              <p className="text-sm text-red-600">
                {error}
              </p>

            </div>
          )}

          {/* MESSAGE */}
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-5">

              <p className="text-sm text-green-700">
                {message}
              </p>

            </div>
          )}

          {/* NAME */}
          <div className="mb-5">

            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              disabled={verified}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setOtpSent(false);
                setGeneratedOtp("");
                setOtp("");
                setVerified(false);
                setError("");
                setMessage("");
              }}
              placeholder="Enter customer name"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
            />

          </div>

          {/* MOBILE */}
          <div>

            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Mobile Number
            </label>

            <div className="flex gap-2">

              <input
                type="tel"
                value={customerNumber}
                disabled={verified}
                maxLength={10}
                onChange={(e) => {

                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

                  setCustomerNumber(value);
                  setOtpSent(false);
                  setGeneratedOtp("");
                  setOtp("");
                  setVerified(false);
                  setError("");
                  setMessage("");

                }}
                placeholder="Enter 10-digit number"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />

              {!verified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
                >
                  Send OTP
                </button>
              )}

            </div>

          </div>

        </section>

        {/* OTP SECTION */}
        {otpSent && !verified && (
          <section className="bg-white border border-gray-300 rounded-2xl p-5 shadow-sm mb-5">

            <h2 className="text-lg font-bold text-gray-900">
              Enter OTP
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Enter the 6-digit OTP generated for this customer.
            </p>

            <input
              type="text"
              value={otp}
              maxLength={6}
              onChange={(e) => {
                setOtp(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                );

                setError("");
              }}
              placeholder="Enter 6-digit OTP"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />

            <button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold"
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full mt-3 text-green-700 text-sm font-semibold"
            >
              Resend OTP
            </button>

          </section>
        )}

        {/* VERIFIED */}
        {verified && (
          <section className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-5">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-full bg-green-600 text-white flex items-center justify-center text-xl">
                ✓
              </div>

              <div>

                <h3 className="font-bold text-green-800">
                  Mobile Number Verified
                </h3>

                <p className="text-sm text-green-700 mt-1">
                  Customer is ready for this work.
                </p>

              </div>

            </div>

          </section>
        )}

        {/* CONTINUE */}
        {verified && (
          <button
            type="button"
            onClick={handleContinue}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-4 font-bold shadow-md"
          >
            Continue to Add Work
          </button>
        )}

      </main>

    </div>
  );
}

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

export default AddCustomer;