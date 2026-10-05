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

    driverName: "",
    driverNumber: "",
  });

  // =====================================================
  // USER / OWNER PROFILE
  // =====================================================

  const [userProfile, setUserProfile] =
    useState(null);

  const [loadingProfile, setLoadingProfile] =
    useState(false);

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
  // CUSTOMER OTP
  // =====================================================

  const [otp, setOtp] =
    useState("");

  const [generatedOtp, setGeneratedOtp] =
    useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [otpVerified, setOtpVerified] =
    useState(!isNewCustomer);

  const [customerMessage, setCustomerMessage] =
    useState("");

  // =====================================================
  // DRIVERS
  // =====================================================

  const [drivers, setDrivers] =
    useState([]);

  /*
    Values:
    none = No Driver
    self = I am the Driver
    new  = Add New Driver
    number = existing driver index
  */
  const [driverSelection, setDriverSelection] =
    useState("none");

  const [driverChecking, setDriverChecking] =
    useState(false);

  // =====================================================
  // DRIVER OTP
  // =====================================================

  const [driverOtp, setDriverOtp] =
    useState("");

  const [driverGeneratedOtp, setDriverGeneratedOtp] =
    useState("");

  const [driverOtpSent, setDriverOtpSent] =
    useState(false);

  const [driverOtpVerified, setDriverOtpVerified] =
    useState(false);

  const [driverMessage, setDriverMessage] =
    useState("");

  // =====================================================
  // OTHER STATES
  // =====================================================

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadProfile();
    loadCustomers();
    loadDrivers();
  }, []);

  // =====================================================
  // LOAD LOGGED-IN USER
  // =====================================================

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);

      const response =
        await api.get("/profile");

      console.log(
        "LOGGED-IN USER:",
        response.data
      );

      setUserProfile(response.data);
    } catch (err) {
      console.error(
        "PROFILE LOAD ERROR:",
        err
      );

      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // =====================================================
  // LOAD CUSTOMERS
  // =====================================================

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
  // LOAD DRIVERS
  //
  // Drivers are collected from previous works.
  // =====================================================

  const loadDrivers = async () => {
    try {
      setDriverChecking(true);

      const response =
        await api.get(
          "/owner/works"
        );

      console.log(
        "OWNER WORKS FOR DRIVERS:",
        response.data
      );

      const works =
        Array.isArray(response.data)
          ? response.data
          : [];

      const uniqueDrivers = [];

      works.forEach((work) => {
        const name =
          work.driverName
            ?.toString()
            .trim() || "";

        const number =
          work.driverNumber
            ?.toString()
            .trim() || "";

        if (!name && !number) {
          return;
        }

        const exists =
          uniqueDrivers.some(
            (driver) =>
              normalizeNumber(
                driver.number
              ) ===
                normalizeNumber(
                  number
                ) &&
              driver.name
                .toLowerCase()
                .trim() ===
                name
                  .toLowerCase()
                  .trim()
          );

        if (!exists) {
          uniqueDrivers.push({
            name,
            number,
          });
        }
      });

      setDrivers(
        uniqueDrivers
      );

      console.log(
        "MY DRIVERS:",
        uniqueDrivers
      );
    } catch (err) {
      console.error(
        "DRIVER LOAD ERROR:",
        err
      );
    } finally {
      setDriverChecking(false);
    }
  };

  // =====================================================
  // NORMALIZE NUMBER
  // =====================================================

  const normalizeNumber = (
    number
  ) => {
    return String(
      number || ""
    ).replace(/\D/g, "");
  };

  // =====================================================
  // FIND CUSTOMER
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
        (customer) =>
          normalizeNumber(
            customer.number
          ) === cleanNumber
      ) || null
    );
  };

  // =====================================================
  // CHECK CUSTOMER AFTER LOAD
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
      setFormData((prev) => ({
        ...prev,
        customerName:
          foundCustomer.name || "",
      }));

      setCustomerExists(true);
      setOtpVerified(true);

      setOtpSent(false);
      setGeneratedOtp("");
      setOtp("");
    }
  }, [
    customers,
    formData.customerNumber,
    isNewCustomer,
  ]);

  // =====================================================
  // NORMAL INPUT
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
  // CUSTOMER NUMBER
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
    setCustomerMessage("");

    if (!isNewCustomer) {
      return;
    }

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

    if (foundCustomer) {
      setFormData((prev) => ({
        ...prev,
        customerNumber: value,
        customerName:
          foundCustomer.name || "",
      }));

      setCustomerExists(true);
      setOtpVerified(true);

      setOtpSent(false);
      setGeneratedOtp("");
      setOtp("");
    } else {
      setCustomerExists(false);
      setOtpVerified(false);
    }

    setCheckingCustomer(false);
  };

  // =====================================================
  // SEND CUSTOMER OTP
  // =====================================================

  const handleSendOtp = () => {
    setError("");
    setCustomerMessage("");

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
      !/^[6-9]\d{9}$/.test(
        formData.customerNumber
      )
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

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

    setCustomerMessage(
      `Development OTP: ${newOtp}`
    );
  };

  // =====================================================
  // VERIFY CUSTOMER OTP
  // =====================================================

  const handleVerifyOtp = () => {
    setError("");

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

    setCustomerMessage(
      "Mobile number verified successfully."
    );
  };

  // =====================================================
  // DRIVER SELECTION
  // =====================================================

  const handleDriverSelection = (
    e
  ) => {
    const value =
      e.target.value;

    setError("");
    setDriverMessage("");

    // =================================================
    // NO DRIVER
    // =================================================

    if (value === "none") {
      setDriverSelection("none");

      setFormData((prev) => ({
        ...prev,
        driverName: "",
        driverNumber: "",
      }));

      setDriverOtp("");
      setDriverGeneratedOtp("");
      setDriverOtpSent(false);
      setDriverOtpVerified(false);

      return;
    }

    // =================================================
    // I AM THE DRIVER
    // =================================================

    if (value === "self") {
      setDriverSelection("self");

      if (
        userProfile?.name &&
        userProfile?.number
      ) {
        setFormData((prev) => ({
          ...prev,
          driverName:
            userProfile.name,
          driverNumber:
            userProfile.number,
        }));

        setDriverOtpVerified(true);
        setDriverOtpSent(false);
        setDriverOtp("");
        setDriverGeneratedOtp("");

        setDriverMessage(
          "✓ Your profile details will be used as the driver."
        );
      } else {
        setFormData((prev) => ({
          ...prev,
          driverName: "",
          driverNumber: "",
        }));

        setDriverOtpVerified(false);

        setDriverMessage(
          "Your profile details could not be loaded."
        );
      }

      return;
    }

    // =================================================
    // ADD NEW DRIVER
    // =================================================

    if (value === "new") {
      setDriverSelection("new");

      setFormData((prev) => ({
        ...prev,
        driverName: "",
        driverNumber: "",
      }));

      setDriverOtp("");
      setDriverGeneratedOtp("");
      setDriverOtpSent(false);
      setDriverOtpVerified(false);

      return;
    }

    // =================================================
    // EXISTING DRIVER
    // =================================================

    const driverIndex =
      Number(value);

    const selectedDriver =
      drivers[driverIndex];

    if (!selectedDriver) {
      return;
    }

    setDriverSelection(value);

    setFormData((prev) => ({
      ...prev,
      driverName:
        selectedDriver.name || "",
      driverNumber:
        selectedDriver.number || "",
    }));

    setDriverOtpVerified(true);
    setDriverOtpSent(false);
    setDriverOtp("");
    setDriverGeneratedOtp("");

    setDriverMessage(
      "✓ Existing driver selected. OTP is not required."
    );
  };

  // =====================================================
  // DRIVER NAME CHANGE
  // =====================================================

  const handleDriverNameChange = (
    e
  ) => {
    setFormData((prev) => ({
      ...prev,
      driverName:
        e.target.value,
    }));

    setDriverOtpVerified(false);
    setError("");
  };

  // =====================================================
  // DRIVER NUMBER CHANGE
  // =====================================================

  const handleDriverNumberChange = (
    e
  ) => {
    const value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      driverNumber: value,
    }));

    setDriverOtpVerified(false);
    setDriverOtpSent(false);
    setDriverOtp("");
    setDriverGeneratedOtp("");

    setError("");
  };

  // =====================================================
  // SEND DRIVER OTP
  // =====================================================

  const handleSendDriverOtp = () => {
    setError("");
    setDriverMessage("");

    if (
      !formData.driverName.trim()
    ) {
      setError(
        "Please enter driver name."
      );
      return;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        formData.driverNumber
      )
    ) {
      setError(
        "Please enter a valid 10-digit driver mobile number."
      );
      return;
    }

    // =================================================
    // CHECK EXISTING DRIVER
    // =================================================

    const existingDriver =
      drivers.find(
        (driver) =>
          normalizeNumber(
            driver.number
          ) ===
          normalizeNumber(
            formData.driverNumber
          )
      );

    if (existingDriver) {
      setFormData((prev) => ({
        ...prev,
        driverName:
          existingDriver.name || "",
        driverNumber:
          existingDriver.number || "",
      }));

      setDriverOtpVerified(true);
      setDriverOtpSent(false);

      setDriverMessage(
        "Existing driver found. OTP is not required."
      );

      return;
    }

    // =================================================
    // DEVELOPMENT OTP
    // =================================================

    const newOtp =
      Math.floor(
        100000 +
          Math.random() *
            900000
      ).toString();

    setDriverGeneratedOtp(
      newOtp
    );

    setDriverOtp("");
    setDriverOtpSent(true);
    setDriverOtpVerified(false);

    console.log(
      "NEW DRIVER OTP:",
      newOtp
    );

    setDriverMessage(
      `Development Driver OTP: ${newOtp}`
    );
  };

  // =====================================================
  // VERIFY DRIVER OTP
  // =====================================================

  const handleVerifyDriverOtp = () => {
    setError("");

    if (!driverOtp) {
      setError(
        "Please enter driver OTP."
      );
      return;
    }

    if (
      driverOtp !==
      driverGeneratedOtp
    ) {
      setError(
        "Invalid driver OTP. Please try again."
      );
      return;
    }

    setDriverOtpVerified(true);
    setDriverOtpSent(false);

    setDriverMessage(
      "Driver mobile number verified successfully."
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

    // =================================================
    // CUSTOMER VERIFICATION
    // =================================================

    if (
      isNewCustomer &&
      !otpVerified
    ) {
      setError(
        "Please verify the customer mobile number first."
      );
      return;
    }

    // =================================================
    // DRIVER VERIFICATION
    // =================================================

    if (
      driverSelection === "new" &&
      !driverOtpVerified
    ) {
      setError(
        "Please verify the driver mobile number first."
      );
      return;
    }

    // =================================================
    // SELF DRIVER
    // =================================================

    if (
      driverSelection === "self"
    ) {
      if (
        !userProfile?.name ||
        !userProfile?.number
      ) {
        setError(
          "Unable to get your profile details. Please try again."
        );
        return;
      }
    }

    // =================================================
    // VEHICLE
    // =================================================

    if (!vehicle) {
      setError(
        "Vehicle information is missing."
      );
      return;
    }

    // =================================================
    // CUSTOMER
    // =================================================

    if (
      !formData.customerName.trim()
    ) {
      setError(
        "Customer name is required."
      );
      return;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        formData.customerNumber
      )
    ) {
      setError(
        "Please enter a valid customer mobile number."
      );
      return;
    }

    // =================================================
    // WORK TYPE
    // =================================================

    if (!formData.workType) {
      setError(
        "Please select work type."
      );
      return;
    }

    // =================================================
    // DATE
    // =================================================

    if (!formData.date) {
      setError(
        "Please select work date."
      );
      return;
    }

    // =================================================
    // AMOUNT
    // =================================================

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

    // =================================================
    // PAID
    // =================================================

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

    // =================================================
    // ACRES
    // =================================================

    let acresValue = 0;

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

    if (
      formData.workType ===
      "Transport"
    ) {
      acresValue = 0;
    }

    // =================================================
    // DRIVER DATA
    // =================================================

    let driverName = null;
    let driverNumber = null;

    if (
      driverSelection === "self"
    ) {
      driverName =
        userProfile.name;

      driverNumber =
        userProfile.number;
    }

    if (
      driverSelection !== "none" &&
      driverSelection !== "self"
    ) {
      if (
        formData.driverName.trim() &&
        formData.driverNumber.trim()
      ) {
        driverName =
          formData.driverName.trim();

        driverNumber =
          formData.driverNumber.trim();
      }
    }

    // =================================================
    // WORK DATA
    // =================================================

    const workData = {
      machine: vehicle,

      workType:
        formData.workType,

      date:
        formData.date,

      amount:
        totalAmount,

      acres:
        acresValue,

      paid:
        paidAmount,

      customerName:
        formData.customerName.trim(),

      customerNumber:
        formData.customerNumber.trim(),

      driverName:
        driverName,

      driverNumber:
        driverNumber,
    };

    console.log(
      "FINAL WORK DATA:",
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
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to save work."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DUE
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

          <section className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-5
            shadow-sm
            mb-5
          ">

            <div className="flex items-center gap-4">

              <div className="
                w-14
                h-14
                rounded-xl
                bg-green-50
                flex
                items-center
                justify-center
                text-3xl
              ">
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

          <section className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-5
            shadow-sm
            mb-5
          ">

            <div className="
              flex
              items-start
              justify-between
              gap-3
              mb-5
            ">

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Customer Details
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {customerExists
                    ? "Existing customer found automatically."
                    : "Enter customer details and verify when required."}
                </p>

              </div>

              {customerExists && (

                <span className="
                  px-3
                  py-1
                  rounded-full
                  bg-green-100
                  text-green-700
                  text-xs
                  font-semibold
                ">
                  Existing
                </span>

              )}

            </div>

            {/* CUSTOMER NAME */}

            <div className="mb-5">

              <label className="
                block
                text-sm
                font-semibold
                text-gray-800
                mb-2
              ">
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

              <label className="
                block
                text-sm
                font-semibold
                text-gray-800
                mb-2
              ">
                Customer Mobile Number
              </label>

              <div className="
                flex
                flex-col
                sm:flex-row
                gap-2
              ">

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
                      "
                    >
                      Send OTP
                    </button>

                  )}

              </div>

              {checkingCustomer && (

                <p className="
                  mt-2
                  text-xs
                  text-gray-500
                ">
                  Checking customer...
                </p>

              )}

              {customerExists && (

                <div className="
                  mt-3
                  bg-green-50
                  border
                  border-green-200
                  rounded-xl
                  p-3
                ">

                  <p className="
                    text-sm
                    font-semibold
                    text-green-700
                  ">
                    ✓ Existing customer found
                  </p>

                  <p className="
                    text-xs
                    text-green-600
                    mt-1
                  ">
                    Customer name has been filled
                    automatically. OTP is not required.
                  </p>

                </div>

              )}

            </div>

            {/* CUSTOMER OTP */}

            {isNewCustomer &&
              !customerExists &&
              otpSent &&
              !otpVerified && (

                <div className="
                  mt-5
                  bg-slate-50
                  border
                  border-slate-200
                  rounded-xl
                  p-4
                ">

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-gray-800
                    mb-2
                  ">
                    Enter OTP
                  </label>

                  <input
                    type="text"
                    value={otp}
                    maxLength={6}
                    inputMode="numeric"
                    onChange={(e) =>
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
                      )
                    }
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

            {customerMessage && (

              <div className="
                mt-4
                bg-green-50
                border
                border-green-200
                rounded-xl
                p-3
              ">

                <p className="
                  text-sm
                  text-green-700
                  break-words
                ">
                  {customerMessage}
                </p>

              </div>

            )}

          </section>

          {/* =================================================
              DRIVER
          ================================================= */}

          <section className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-5
            shadow-sm
            mb-5
          ">

            <div className="mb-5">

              <h2 className="
                text-lg
                font-bold
                text-gray-900
              ">
                Driver
              </h2>

              <p className="
                text-xs
                text-gray-500
                mt-1
              ">
                Select a driver for this work.
              </p>

            </div>

            {/* DRIVER SELECT */}

            <div>

              <label className="
                block
                text-sm
                font-semibold
                text-gray-800
                mb-2
              ">
                Select Driver
              </label>

              <select
                value={
                  driverSelection
                }
                onChange={
                  handleDriverSelection
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

                <option value="none">
                  No Driver
                </option>

                {drivers.length > 0 && (
                  <option disabled>
                    ── My Drivers ──
                  </option>
                )}

                {drivers.map(
                  (driver, index) => (

                    <option
                      key={`${driver.number}-${index}`}
                      value={index}
                    >
                      {driver.name} -{" "}
                      {driver.number}
                    </option>

                  )
                )}

                <option value="self">
                  I am the Driver
                </option>

                <option value="new">
                  + Add New Driver
                </option>

              </select>

            </div>

            {/* LOADING */}

            {driverChecking && (

              <p className="
                mt-2
                text-xs
                text-gray-500
              ">
                Loading drivers...
              </p>

            )}

            {/* =================================================
                SELF DRIVER
            ================================================= */}

            {driverSelection ===
              "self" && (

                <div className="
                  mt-4
                  bg-green-50
                  border
                  border-green-200
                  rounded-xl
                  p-4
                ">

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      w-11
                      h-11
                      rounded-full
                      bg-green-100
                      flex
                      items-center
                      justify-center
                      text-xl
                    ">
                      👤
                    </div>

                    <div>

                      <p className="
                        text-sm
                        font-bold
                        text-green-800
                      ">
                        {loadingProfile
                          ? "Loading..."
                          : userProfile?.name ||
                            "User"}
                      </p>

                      <p className="
                        text-xs
                        text-green-600
                        mt-1
                      ">
                        {loadingProfile
                          ? "Loading number..."
                          : userProfile?.number ||
                            "Number unavailable"}
                      </p>

                    </div>

                  </div>

                  {userProfile?.name &&
                    userProfile?.number && (

                      <p className="
                        text-xs
                        text-green-600
                        mt-3
                      ">
                        ✓ Your profile details will be
                        saved as the driver. OTP is not required.
                      </p>

                    )}

                </div>

              )}

            {/* =================================================
                EXISTING DRIVER
            ================================================= */}

            {driverSelection !==
              "none" &&
              driverSelection !==
                "new" &&
              driverSelection !==
                "self" &&
              formData.driverName && (

                <div className="
                  mt-4
                  bg-green-50
                  border
                  border-green-200
                  rounded-xl
                  p-4
                ">

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      w-10
                      h-10
                      rounded-full
                      bg-green-100
                      flex
                      items-center
                      justify-center
                      text-lg
                    ">
                      🚚
                    </div>

                    <div>

                      <p className="
                        text-sm
                        font-bold
                        text-green-800
                      ">
                        {formData.driverName}
                      </p>

                      <p className="
                        text-xs
                        text-green-600
                        mt-1
                      ">
                        {formData.driverNumber}
                      </p>

                    </div>

                  </div>

                  <p className="
                    text-xs
                    text-green-600
                    mt-3
                  ">
                    ✓ Existing driver selected.
                    OTP is not required.
                  </p>

                </div>

              )}

            {/* =================================================
                NEW DRIVER
            ================================================= */}

            {driverSelection ===
              "new" && (

                <div className="mt-5">

                  {/* DRIVER NAME */}

                  <div className="mb-5">

                    <label className="
                      block
                      text-sm
                      font-semibold
                      text-gray-800
                      mb-2
                    ">
                      Driver Name
                    </label>

                    <input
                      type="text"
                      value={
                        formData.driverName
                      }
                      onChange={
                        handleDriverNameChange
                      }
                      readOnly={
                        driverOtpVerified
                      }
                      placeholder="Enter driver name"
                      className={`
                        w-full
                        border
                        rounded-xl
                        px-4
                        py-3
                        outline-none
                        ${
                          driverOtpVerified
                            ? "bg-gray-100 border-gray-300"
                            : "bg-white border-gray-300 focus:border-green-500"
                        }
                      `}
                    />

                  </div>

                  {/* DRIVER NUMBER */}

                  <div>

                    <label className="
                      block
                      text-sm
                      font-semibold
                      text-gray-800
                      mb-2
                    ">
                      Driver Mobile Number
                    </label>

                    <div className="
                      flex
                      flex-col
                      sm:flex-row
                      gap-2
                    ">

                      <input
                        type="tel"
                        value={
                          formData.driverNumber
                        }
                        onChange={
                          handleDriverNumberChange
                        }
                        readOnly={
                          driverOtpVerified
                        }
                        maxLength={10}
                        inputMode="numeric"
                        placeholder="Enter 10-digit mobile number"
                        className={`
                          w-full
                          border
                          rounded-xl
                          px-4
                          py-3
                          outline-none
                          ${
                            driverOtpVerified
                              ? "bg-gray-100 border-gray-300"
                              : "bg-white border-gray-300 focus:border-green-500"
                          }
                        `}
                      />

                      {!driverOtpVerified && (

                        <button
                          type="button"
                          onClick={
                            handleSendDriverOtp
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
                          "
                        >
                          Send OTP
                        </button>

                      )}

                    </div>

                  </div>

                  {/* DRIVER OTP */}

                  {driverOtpSent &&
                    !driverOtpVerified && (

                      <div className="
                        mt-5
                        bg-slate-50
                        border
                        border-slate-200
                        rounded-xl
                        p-4
                      ">

                        <label className="
                          block
                          text-sm
                          font-semibold
                          text-gray-800
                          mb-2
                        ">
                          Enter Driver OTP
                        </label>

                        <input
                          type="text"
                          value={
                            driverOtp
                          }
                          maxLength={6}
                          inputMode="numeric"
                          onChange={(e) =>
                            setDriverOtp(
                              e.target.value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .slice(
                                  0,
                                  6
                                )
                            )
                          }
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
                          "
                        />

                        <button
                          type="button"
                          onClick={
                            handleVerifyDriverOtp
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
                          Verify Driver OTP
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleSendDriverOtp
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

                  {driverOtpVerified && (

                    <div className="
                      mt-4
                      bg-green-50
                      border
                      border-green-200
                      rounded-xl
                      p-3
                    ">

                      <p className="
                        text-sm
                        font-semibold
                        text-green-700
                      ">
                        ✓ Driver mobile number verified
                      </p>

                    </div>

                  )}

                </div>

              )}

            {/* DRIVER MESSAGE */}

            {driverMessage && (

              <div className="
                mt-4
                bg-green-50
                border
                border-green-200
                rounded-xl
                p-3
              ">

                <p className="
                  text-sm
                  text-green-700
                ">
                  {driverMessage}
                </p>

              </div>

            )}

          </section>

          {/* =================================================
              WORK DETAILS
          ================================================= */}

          <section className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-5
            shadow-sm
            mb-5
          ">

            <h2 className="
              text-lg
              font-bold
              text-gray-900
              mb-5
            ">
              Work Details
            </h2>

            {/* WORK TYPE */}

            <div className="mb-5">

              <label className="
                block
                text-sm
                font-semibold
                text-gray-800
                mb-2
              ">
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

              <label className="
                block
                text-sm
                font-semibold
                text-gray-800
                mb-2
              ">
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
                "
              />

            </div>

            {/* ACRES */}

            {(vehicle === "Tractor" ||
              vehicle === "Harvester") &&
              formData.workType !==
                "Transport" && (

                <div>

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-gray-800
                    mb-2
                  ">
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
                    "
                  />

                </div>

              )}

          </section>

          {/* =================================================
              PAYMENT DETAILS
          ================================================= */}

          <section className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-5
            shadow-sm
            mb-5
          ">

            <h2 className="
              text-lg
              font-bold
              text-gray-900
              mb-5
            ">
              Payment Details
            </h2>

            {/* AMOUNT */}

            <div className="mb-5">

              <label className="
                block
                text-sm
                font-semibold
                text-gray-800
                mb-2
              ">
                Total Amount
              </label>

              <div className="relative">

                <span className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-500
                  font-semibold
                ">
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
                  "
                />

              </div>

            </div>

            {/* PAID */}

            <div className="mb-5">

              <label className="
                block
                text-sm
                font-semibold
                text-gray-800
                mb-2
              ">
                Paid Amount
              </label>

              <div className="relative">

                <span className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-500
                  font-semibold
                ">
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
                  "
                />

              </div>

            </div>

            {/* DUE */}

            <div className="
              bg-orange-50
              border
              border-orange-200
              rounded-xl
              p-4
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-gray-600
                ">
                  Due Amount
                </p>

                <p className="
                  text-xs
                  text-gray-400
                  mt-1
                ">
                  Remaining amount
                </p>

              </div>

              <p className="
                text-xl
                font-bold
                text-orange-600
              ">
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

            <div className="
              bg-red-50
              border
              border-red-200
              rounded-xl
              p-4
              mb-5
            ">

              <p className="
                text-sm
                text-red-600
                font-medium
              ">
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
              ) ||
              (
                driverSelection ===
                  "new" &&
                !driverOtpVerified
              ) ||
              (
                driverSelection ===
                  "self" &&
                (
                  !userProfile?.name ||
                  !userProfile?.number
                )
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
                ) ||
                (
                  driverSelection ===
                    "new" &&
                  !driverOtpVerified
                ) ||
                (
                  driverSelection ===
                    "self" &&
                  (
                    !userProfile?.name ||
                    !userProfile?.number
                  )
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