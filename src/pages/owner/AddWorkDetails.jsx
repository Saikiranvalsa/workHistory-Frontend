import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";

function AddWorkDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const vehicle =
    location.state?.vehicle || "";

  const selectedCustomer =
    location.state?.customer || null;

  const isNewCustomer =
    location.state?.newCustomer === true;

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    customerName:
      selectedCustomer?.name || "",

    customerNumber:
      selectedCustomer?.number || "",

    workType: "",

    date: new Date()
      .toISOString()
      .split("T")[0],

    acres: "",

    amount: "",

    paid: "",
  });

  // =====================================================
  // CUSTOMERS
  // =====================================================

  const [customers, setCustomers] =
    useState([]);

  const [customerExists, setCustomerExists] =
    useState(
      !isNewCustomer &&
        !!selectedCustomer
    );

  const [checkingCustomer, setCheckingCustomer] =
    useState(false);

  // =====================================================
  // OTP
  // =====================================================

  const [otp, setOtp] =
    useState("");

  const [generatedOtp, setGeneratedOtp] =
    useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [otpVerified, setOtpVerified] =
    useState(!isNewCustomer);

  // =====================================================
  // OTHER STATES
  // =====================================================

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // =====================================================
  // LOAD CUSTOMERS
  // =====================================================

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response =
        await api.get(
          "/owner/mycustomers"
        );

      console.log(
        "MY CUSTOMERS:",
        response.data
      );

      setCustomers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "CUSTOMER LOAD ERROR:",
        err
      );
    }
  };

  // =====================================================
  // NORMALIZE PHONE NUMBER
  // =====================================================

  const normalizeNumber = (
    number
  ) => {
    return String(
      number || ""
    ).replace(/\D/g, "");
  };

  // =====================================================
  // FIND EXISTING CUSTOMER
  // =====================================================

  const findExistingCustomer = (
    number
  ) => {
    const cleanNumber =
      normalizeNumber(number);

    if (
      cleanNumber.length !== 10
    ) {
      return null;
    }

    return (
      customers.find(
        (customer) => {
          const existingNumber =
            normalizeNumber(
              customer.number
            );

          return (
            existingNumber ===
            cleanNumber
          );
        }
      ) || null
    );
  };

  // =====================================================
  // CHECK CUSTOMER AFTER LIST LOADS
  // =====================================================

  useEffect(() => {
    if (!isNewCustomer) {
      return;
    }

    if (
      formData.customerNumber.length !==
      10
    ) {
      return;
    }

    if (
      customers.length === 0
    ) {
      return;
    }

    const foundCustomer =
      findExistingCustomer(
        formData.customerNumber
      );

    if (foundCustomer) {
      console.log(
        "EXISTING CUSTOMER:",
        foundCustomer
      );

      setFormData((prev) => ({
        ...prev,
        customerName:
          foundCustomer.name || "",
      }));

      setCustomerExists(true);

      // Existing customer does not need OTP
      setOtpVerified(true);

      setOtpSent(false);
      setGeneratedOtp("");
      setOtp("");

      // Prevent duplicate message
      setMessage("");
    }
  }, [
    customers,
    formData.customerNumber,
    isNewCustomer,
  ]);

  // =====================================================
  // NORMAL INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // CUSTOMER NUMBER CHANGE
  // =====================================================

  const handleCustomerNumberChange = (
    e
  ) => {
    const value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      customerNumber: value,
    }));

    setError("");
    setMessage("");

    if (!isNewCustomer) {
      return;
    }

    // Reset previous customer / OTP status
    setOtpSent(false);
    setGeneratedOtp("");
    setOtp("");
    setOtpVerified(false);
    setCustomerExists(false);

    if (
      value.length !== 10
    ) {
      return;
    }

    setCheckingCustomer(true);

    const foundCustomer =
      findExistingCustomer(value);

    console.log(
      "CHECKING NUMBER:",
      value
    );

    console.log(
      "FOUND CUSTOMER:",
      foundCustomer
    );

    if (foundCustomer) {
      // =================================================
      // EXISTING CUSTOMER
      // =================================================

      setFormData((prev) => ({
        ...prev,
        customerNumber: value,
        customerName:
          foundCustomer.name || "",
      }));

      setCustomerExists(true);

      // Existing customer = no OTP
      setOtpVerified(true);

      setOtpSent(false);
      setGeneratedOtp("");
      setOtp("");

      setMessage("");

    } else {
      // =================================================
      // NEW CUSTOMER
      // =================================================

      setCustomerExists(false);
      setOtpVerified(false);
      setMessage("");
    }

    setCheckingCustomer(false);
  };

  // =====================================================
  // SEND OTP
  // =====================================================

  const handleSendOtp = () => {
    setError("");
    setMessage("");

    // Existing customer never needs OTP
    if (customerExists) {
      setOtpVerified(true);
      return;
    }

    if (
      !formData.customerName.trim()
    ) {
      setError(
        "Please enter customer name."
      );
      return;
    }

    if (
      !formData.customerNumber.trim()
    ) {
      setError(
        "Please enter customer mobile number."
      );
      return;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        formData.customerNumber
      )
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    // Development OTP
    const newOtp =
      Math.floor(
        100000 +
          Math.random() *
            900000
      ).toString();

    setGeneratedOtp(newOtp);
    setOtp("");
    setOtpSent(true);
    setOtpVerified(false);

    console.log(
      "NEW CUSTOMER OTP:",
      newOtp
    );

    setMessage(
      `Development OTP: ${newOtp}`
    );
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOtp = () => {
    setError("");
    setMessage("");

    if (!otp) {
      setError(
        "Please enter OTP."
      );
      return;
    }

    if (
      otp !== generatedOtp
    ) {
      setError(
        "Invalid OTP. Please try again."
      );
      return;
    }

    setOtpVerified(true);
    setOtpSent(false);

    setMessage(
      "Mobile number verified successfully."
    );
  };

  // =====================================================
  // SAVE WORK
  // =====================================================

  const handleSaveWork = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // New customer must verify OTP
    if (
      isNewCustomer &&
      !otpVerified
    ) {
      setError(
        "Please verify the customer mobile number first."
      );
      return;
    }

    if (!vehicle) {
      setError(
        "Vehicle information is missing."
      );
      return;
    }

    if (
      !formData.customerName.trim()
    ) {
      setError(
        "Customer name is required."
      );
      return;
    }

    if (
      !formData.customerNumber.trim()
    ) {
      setError(
        "Customer mobile number is required."
      );
      return;
    }

    if (!formData.workType) {
      setError(
        "Please select work type."
      );
      return;
    }

    if (!formData.date) {
      setError(
        "Please select work date."
      );
      return;
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      setError(
        "Please enter a valid amount."
      );
      return;
    }

    const totalAmount =
      Number(formData.amount);

    // =====================================================
    // PAID
    //
    // Empty = 0
    // Entered = entered amount
    // =====================================================

    const paidAmount =
      formData.paid === "" ||
      formData.paid === null ||
      formData.paid === undefined
        ? 0
        : Number(formData.paid);

    if (paidAmount < 0) {
      setError(
        "Paid amount cannot be negative."
      );
      return;
    }

    if (
      paidAmount > totalAmount
    ) {
      setError(
        "Paid amount cannot be greater than total amount."
      );
      return;
    }

    // =====================================================
    // ACRES
    //
    // Default = 0
    // =====================================================

    let acresValue = 0;

    /*
      Acres required:

      Tractor + Ploughing
      Tractor + Cultivation
      Tractor + Rotavator
      Tractor + Harvesting

      Harvester + non-Transport work

      Acres = 0:

      Tractor + Transport
      JCB
      Magic
      Car / EV
      Others
    */

    const requiresAcres =
      (
        vehicle === "Tractor" ||
        vehicle === "Harvester"
      ) &&
      formData.workType !==
        "Transport";

    if (requiresAcres) {

      if (
        !formData.acres ||
        Number(formData.acres) <= 0
      ) {
        setError(
          "Please enter acres."
        );
        return;
      }

      acresValue =
        Number(formData.acres);
    }

    // Transport = 0 acres
    if (
      formData.workType ===
      "Transport"
    ) {
      acresValue = 0;
    }

    // =====================================================
    // WORK DATA
    //
    // NO DUE FIELD
    // =====================================================

    const workData = {
      machine: vehicle,

      workType:
        formData.workType,

      date: formData.date,

      amount: totalAmount,

      acres: acresValue,

      paid: paidAmount,

      customerName:
        formData.customerName.trim(),

      customerNumber:
        formData.customerNumber.trim(),
    };

    console.log(
      "WORK DATA:",
      workData
    );

    try {
      setSaving(true);

      const response =
        await api.post(
          "/work",
          workData
        );

      console.log(
        "SAVE WORK RESPONSE:",
        response.data
      );

      alert(
        "Work added successfully!"
      );

      navigate("/owner");

    } catch (err) {
      console.error(
        "SAVE WORK ERROR:",
        err
      );

      if (
        err.response?.status ===
        401
      ) {
        localStorage.removeItem(
          "JWT_TOKEN"
        );

        navigate("/login");

        return;
      }

      setError(
        err.response?.data
          ?.message ||
          err.response?.data ||
          "Failed to save work."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DUE
  //
  // Empty paid is 0
  // =====================================================

  const due =
    Number(
      formData.amount || 0
    ) -
    Number(
      formData.paid || 0
    );

  const workTypes =
    getWorkTypes(vehicle);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-green-700 text-white">

        <div className="max-w-3xl mx-auto px-4">

          <div className="h-[72px] flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/owner/customer-history",
                  {
                    state: {
                      vehicle,
                    },
                  }
                )
              }
              className="
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                text-2xl
                hover:bg-green-600
              "
            >
              ←
            </button>

            <div>

              <h1 className="text-xl font-bold">
                Add Work Details
              </h1>

              <p className="text-xs text-green-100">
                {vehicle}
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-3xl mx-auto px-4 py-6 pb-10">

        <form
          onSubmit={handleSaveWork}
        >

          {/* =================================================
              VEHICLE
          ================================================= */}

          <section className="bg-white border rounded-2xl p-5 shadow-sm mb-5">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center text-3xl">
                {getVehicleIcon(
                  vehicle
                )}
              </div>

              <div>

                <p className="text-xs text-gray-500">
                  VEHICLE / MACHINE
                </p>

                <h2 className="text-lg font-bold text-gray-900">
                  {vehicle}
                </h2>

              </div>

            </div>

          </section>

          {/* =================================================
              CUSTOMER DETAILS
          ================================================= */}

          <section className="bg-white border rounded-2xl p-5 shadow-sm mb-5">

            <div className="flex items-start justify-between gap-3 mb-5">

              <div className="min-w-0">

                <h2 className="text-lg font-bold text-gray-900">
                  Customer Details
                </h2>

                <p className="text-xs text-gray-500 mt-1">

                  {customerExists
                    ? "Existing customer found automatically."
                    : isNewCustomer
                    ? "Enter new customer details and verify mobile number."
                    : "Customer selected from your history."}

                </p>

              </div>

              {!isNewCustomer && (

                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold shrink-0">
                  Selected
                </span>

              )}

              {isNewCustomer &&
                customerExists && (

                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold shrink-0">
                    Existing
                  </span>

                )}

              {isNewCustomer &&
                !customerExists &&
                otpVerified && (

                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold shrink-0">
                    Verified
                  </span>

                )}

            </div>

            {/* CUSTOMER NAME */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Customer Name
              </label>

              <input
                type="text"
                name="customerName"
                value={
                  formData.customerName
                }
                onChange={
                  handleChange
                }
                readOnly={
                  !isNewCustomer ||
                  customerExists
                }
                placeholder="Enter customer name"
                className={`
                  w-full
                  border
                  rounded-xl
                  px-4
                  py-3
                  outline-none
                  ${
                    !isNewCustomer ||
                    customerExists
                      ? "bg-gray-100 border-gray-300"
                      : "bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  }
                `}
              />

            </div>

            {/* CUSTOMER NUMBER */}

            <div>

              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Customer Mobile Number
              </label>

              <div className="flex flex-col sm:flex-row gap-2 w-full">

                <input
                  type="tel"
                  name="customerNumber"
                  value={
                    formData.customerNumber
                  }
                  onChange={
                    handleCustomerNumberChange
                  }
                  readOnly={
                    !isNewCustomer ||
                    otpVerified
                  }
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="Enter 10-digit mobile number"
                  className={`
                    w-full
                    min-w-0
                    border
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    ${
                      !isNewCustomer ||
                      otpVerified
                        ? "bg-gray-100 border-gray-300"
                        : "bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    }
                  `}
                />

                {/* SEND OTP */}

                {isNewCustomer &&
                  !customerExists &&
                  !otpVerified && (

                    <button
                      type="button"
                      onClick={
                        handleSendOtp
                      }
                      className="
                        w-full
                        sm:w-auto
                        sm:min-w-[120px]
                        px-5
                        py-3
                        bg-green-600
                        hover:bg-green-700
                        text-white
                        rounded-xl
                        font-bold
                        whitespace-nowrap
                        shrink-0
                      "
                    >
                      Send OTP
                    </button>

                  )}

              </div>

              {/* CHECKING */}

              {checkingCustomer && (

                <p className="mt-2 text-xs text-gray-500">
                  Checking customer...
                </p>

              )}

              {/* EXISTING CUSTOMER */}

              {isNewCustomer &&
                customerExists && (

                  <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">

                    <p className="text-sm font-semibold text-green-700">
                      ✓ Existing customer found
                    </p>

                    <p className="text-xs text-green-600 mt-1">
                      Customer name has been filled
                      automatically. OTP is not required.
                    </p>

                  </div>

                )}

            </div>

            {/* =================================================
                OTP BOX
            ================================================= */}

            {isNewCustomer &&
              !customerExists &&
              otpSent &&
              !otpVerified && (

                <div className="mt-5 w-full bg-slate-50 border border-slate-200 rounded-xl p-4">

                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Enter OTP
                  </label>

                  <input
                    type="text"
                    value={otp}
                    maxLength={6}
                    inputMode="numeric"
                    onChange={(e) => {

                      setOtp(
                        e.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            6
                          )
                      );

                      setError("");

                    }}
                    placeholder="Enter 6-digit OTP"
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-xl
                      px-4
                      py-3
                      text-center
                      text-xl
                      tracking-[0.5em]
                      outline-none
                      focus:border-green-500
                      focus:ring-2
                      focus:ring-green-100
                    "
                  />

                  <button
                    type="button"
                    onClick={
                      handleVerifyOtp
                    }
                    className="
                      w-full
                      mt-4
                      bg-green-600
                      hover:bg-green-700
                      text-white
                      py-3.5
                      rounded-xl
                      font-bold
                    "
                  >
                    Verify OTP
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleSendOtp
                    }
                    className="
                      w-full
                      mt-3
                      text-green-700
                      text-sm
                      font-semibold
                    "
                  >
                    Resend OTP
                  </button>

                </div>

              )}

            {/* NEW CUSTOMER OTP MESSAGE */}

            {isNewCustomer &&
              !customerExists &&
              message && (

                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">

                  <p className="text-sm text-green-700 break-words">
                    {message}
                  </p>

                </div>

              )}

          </section>

          {/* =================================================
              WORK DETAILS
          ================================================= */}

          <section className="bg-white border rounded-2xl p-5 shadow-sm mb-5">

            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Work Details
            </h2>

            {/* WORK TYPE */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Work Type
              </label>

              <select
                name="workType"
                value={
                  formData.workType
                }
                onChange={
                  handleChange
                }
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-xl
                  px-4
                  py-3
                  bg-white
                  outline-none
                  focus:border-green-500
                  focus:ring-2
                  focus:ring-green-100
                "
              >

                <option value="">
                  Select work type
                </option>

                {workTypes.map(
                  (type) => (

                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>

                  )
                )}

              </select>

            </div>

            {/* DATE */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Work Date
              </label>

              <input
                type="date"
                name="date"
                value={
                  formData.date
                }
                onChange={
                  handleChange
                }
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-xl
                  px-4
                  py-3
                  outline-none
                  focus:border-green-500
                  focus:ring-2
                  focus:ring-green-100
                "
              />

            </div>

            {/* =================================================
                ACRES
                HIDDEN FOR TRANSPORT
            ================================================= */}

            {(vehicle === "Tractor" ||
              vehicle === "Harvester") &&
              formData.workType !==
                "Transport" && (

                <div>

                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Acres
                  </label>

                  <input
                    type="number"
                    name="acres"
                    value={
                      formData.acres
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="Enter acres"
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-xl
                      px-4
                      py-3
                      outline-none
                      focus:border-green-500
                      focus:ring-2
                      focus:ring-green-100
                    "
                  />

                </div>

              )}

          </section>

          {/* =================================================
              PAYMENT DETAILS
          ================================================= */}

          <section className="bg-white border rounded-2xl p-5 shadow-sm mb-5">

            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Payment Details
            </h2>

            {/* TOTAL AMOUNT */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Total Amount
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  ₹
                </span>

                <input
                  type="number"
                  name="amount"
                  value={
                    formData.amount
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="Enter total amount"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    pl-10
                    pr-4
                    py-3
                    outline-none
                    focus:border-green-500
                    focus:ring-2
                    focus:ring-green-100
                  "
                />

              </div>

            </div>

            {/* PAID AMOUNT */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Paid Amount
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  ₹
                </span>

                <input
                  type="number"
                  name="paid"
                  value={
                    formData.paid
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="Enter paid amount"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    pl-10
                    pr-4
                    py-3
                    outline-none
                    focus:border-green-500
                    focus:ring-2
                    focus:ring-green-100
                  "
                />

              </div>

            </div>

            {/* DUE */}

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-600">
                  Due Amount
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Remaining amount
                </p>

              </div>

              <p className="text-xl font-bold text-orange-600">

                ₹
                {Math.max(
                  due,
                  0
                ).toLocaleString(
                  "en-IN"
                )}

              </p>

            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">

              <p className="text-sm text-red-600 font-medium">
                {error}
              </p>

            </div>

          )}

          {/* =================================================
              SAVE
          ================================================= */}

          <button
            type="submit"
            disabled={
              saving ||
              (
                isNewCustomer &&
                !otpVerified
              )
            }
            className={`
              w-full
              rounded-2xl
              py-4
              text-white
              font-bold
              text-base
              shadow-md
              ${
                saving ||
                (
                  isNewCustomer &&
                  !otpVerified
                )
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }
            `}
          >

            {saving
              ? "Saving Work..."
              : "Save Work"}

          </button>

        </form>

      </main>

    </div>
  );
}

// =====================================================
// WORK TYPES
// =====================================================

function getWorkTypes(
  vehicle
) {
  const workTypes = {

    Tractor: [
      "Ploughing",
      "Cultivation",
      "Rotavator",
      "Harvesting",
      "Transport",
      "Other",
    ],

    JCB: [
      "Land Levelling",
      "Excavation",
      "Digging",
      "Road Work",
      "Construction",
      "Other",
    ],

    Harvester: [
      "Harvesting",
      "Paddy Harvesting",
      "Wheat Harvesting",
      "Other",
    ],

    Magic: [
      "Goods Transport",
      "Passenger Transport",
      "Delivery",
      "Other",
    ],

    "Car / EV": [
      "Taxi",
      "Rental",
      "Transport",
      "Delivery",
      "Other",
    ],

    Other: [
      "General Work",
      "Transport",
      "Other",
    ],
  };

  return (
    workTypes[vehicle] ||
    workTypes.Other
  );
}

// =====================================================
// VEHICLE ICON
// =====================================================

function getVehicleIcon(
  vehicle
) {
  const icons = {

    Tractor: "🚜",

    JCB: "🏗️",

    Harvester: "🌾",

    Magic: "🚐",

    "Car / EV": "🚗",

    Other: "🚛",
  };

  return (
    icons[vehicle] ||
    "🚜"
  );
}

export default AddWorkDetails;