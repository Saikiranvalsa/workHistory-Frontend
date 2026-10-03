import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

function CustomerWorkHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const customer = location.state?.customer;

  const today = new Date();

  const [works, setWorks] = useState([]);

  const [historyType, setHistoryType] =
    useState("year");

  const [selectedYear, setSelectedYear] =
    useState(today.getFullYear());

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth() + 1);

  const [selectedVehicle, setSelectedVehicle] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!customer) {
      navigate("/owner/customers");
      return;
    }

    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const response = await api.get("/owner/works");

      if (Array.isArray(response.data)) {
        setWorks(response.data);
      }
    } catch (error) {
      console.error("CUSTOMER HISTORY ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("JWT_TOKEN");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const customerWorks = useMemo(() => {
    if (!customer) return [];

    return works.filter(
      (work) =>
        work.customerNumber === customer.number
    );
  }, [works, customer]);

  const vehicles = useMemo(() => {
    const uniqueVehicles = [
      ...new Set(
        customerWorks
          .map((work) => work.machine)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueVehicles];
  }, [customerWorks]);

  const filteredWorks = useMemo(() => {
    return customerWorks.filter((work) => {
      if (!work.date) return false;

      const date = new Date(work.date);

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // YEAR
      if (historyType === "year") {
        if (year !== Number(selectedYear)) {
          return false;
        }
      }

      // MONTH
      if (historyType === "month") {
        if (
          year !== Number(selectedYear) ||
          month !== Number(selectedMonth)
        ) {
          return false;
        }
      }

      // VEHICLE
      if (
        selectedVehicle !== "All" &&
        work.machine !== selectedVehicle
      ) {
        return false;
      }

      return true;
    });
  }, [
    customerWorks,
    historyType,
    selectedYear,
    selectedMonth,
    selectedVehicle,
  ]);

  const totals = useMemo(() => {
    let total = 0;
    let paid = 0;
    let pending = 0;

    filteredWorks.forEach((work) => {
      total += Number(work.amount || 0);

      paid += Number(work.paid || 0);

      pending += Number(
        work.due ??
          Number(work.amount || 0) -
            Number(work.paid || 0)
      );
    });

    return {
      total,
      paid,
      pending,
    };
  }, [filteredWorks]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = today.getFullYear();

  const years = [];

  for (
    let year = currentYear;
    year >= currentYear - 5;
    year--
  ) {
    years.push(year);
  }

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header
        className="
          bg-green-700
          text-white
          h-[70px]
          sm:h-[76px]
          px-4
          sm:px-6
          flex
          items-center
          gap-3
        "
      >

        <button
          onClick={() =>
            navigate("/owner/customer-details", {
              state: { customer },
            })
          }
          className="text-xl sm:text-2xl"
        >
          ←
        </button>

        <div>
          <h1 className="text-lg sm:text-2xl font-bold">
            {customer.name}
          </h1>

          <p className="text-[10px] sm:text-sm">
            Customer History
          </p>
        </div>

      </header>

      <main
        className="
          max-w-[1000px]
          mx-auto
          px-3
          sm:px-6
          py-5
          sm:py-7
          pb-10
        "
      >

        {/* CUSTOMER */}

        <div
          className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-4
            sm:p-5
          "
        >
          <p className="font-bold text-base sm:text-lg">
            {customer.name}
          </p>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {customer.number}
          </p>
        </div>

        {/* HISTORY TYPE */}

        <section
          className="
            mt-4
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-4
            sm:p-5
          "
        >

          <p className="text-sm font-semibold">
            History Type
          </p>

          <div
            className="
              grid
              grid-cols-2
              gap-2
              mt-3
            "
          >

            <button
              onClick={() => setHistoryType("month")}
              className={`
                py-2.5
                rounded-xl
                border
                text-sm
                font-medium
                ${
                  historyType === "month"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-slate-600 border-slate-300"
                }
              `}
            >
              Month
            </button>

            <button
              onClick={() => setHistoryType("year")}
              className={`
                py-2.5
                rounded-xl
                border
                text-sm
                font-medium
                ${
                  historyType === "year"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-slate-600 border-slate-300"
                }
              `}
            >
              Year
            </button>

          </div>

          {/* YEAR + MONTH */}

          <div
            className="
              mt-4
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-3
            "
          >

            <div>

              <label className="text-xs text-slate-500">
                Year
              </label>

              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(
                    Number(e.target.value)
                  )
                }
                className="
                  mt-1
                  w-full
                  border
                  border-slate-300
                  rounded-xl
                  px-3
                  py-2.5
                  text-sm
                  bg-white
                  outline-none
                "
              >
                {years.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>

            </div>

            {historyType === "month" && (
              <div>

                <label className="text-xs text-slate-500">
                  Month
                </label>

                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(
                      Number(e.target.value)
                    )
                  }
                  className="
                    mt-1
                    w-full
                    border
                    border-slate-300
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    bg-white
                    outline-none
                  "
                >
                  {months.map((month, index) => (
                    <option
                      key={month}
                      value={index + 1}
                    >
                      {month}
                    </option>
                  ))}
                </select>

              </div>
            )}

          </div>

        </section>

        {/* VEHICLE FILTER */}

        <section className="mt-5">

          <div className="flex items-center justify-between">

            <h2 className="text-lg sm:text-xl font-bold">
              Vehicle
            </h2>

            <span className="text-xs text-slate-500">
              {filteredWorks.length} works
            </span>

          </div>

          <div
            className="
              mt-3
              flex
              gap-2
              overflow-x-auto
              pb-2
            "
          >

            {vehicles.map((vehicle) => (
              <button
                key={vehicle}
                onClick={() =>
                  setSelectedVehicle(vehicle)
                }
                className={`
                  whitespace-nowrap
                  px-4
                  py-2
                  rounded-full
                  text-xs
                  sm:text-sm
                  border
                  ${
                    selectedVehicle === vehicle
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-slate-600 border-slate-300"
                  }
                `}
              >
                {vehicle}
              </button>
            ))}

          </div>

        </section>

        {/* TOTALS */}

        <section
          className="
            mt-4
            grid
            grid-cols-3
            gap-2
            sm:gap-4
          "
        >

          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[10px] sm:text-xs text-slate-500">
              Total
            </p>

            <p className="font-bold text-sm sm:text-lg mt-1">
              {formatMoney(totals.total)}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[10px] sm:text-xs text-slate-500">
              Paid
            </p>

            <p className="font-bold text-sm sm:text-lg text-green-600 mt-1">
              {formatMoney(totals.paid)}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[10px] sm:text-xs text-slate-500">
              Pending
            </p>

            <p className="font-bold text-sm sm:text-lg text-orange-500 mt-1">
              {formatMoney(totals.pending)}
            </p>
          </div>

        </section>

        {/* WORK HISTORY */}

        <section className="mt-5">

          <h2 className="text-lg sm:text-xl font-bold mb-3">
            Work History
          </h2>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
              Loading...
            </div>
          ) : filteredWorks.length === 0 ? (
            <div
              className="
                bg-white
                border
                border-slate-200
                rounded-2xl
                p-8
                text-center
              "
            >
              <div className="text-4xl">
                📋
              </div>

              <p className="font-semibold mt-3">
                No work found
              </p>

              <p className="text-sm text-slate-500 mt-1">
                No work matches the selected filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {filteredWorks.map((work, index) => (
                <div
                  key={work.id || work.Id || index}
                  className="
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    p-4
                  "
                >

                  <div className="flex justify-between gap-3">

                    <div className="min-w-0">

                      <p className="font-bold text-sm sm:text-base">
                        {work.machine}
                      </p>

                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        {work.workType}
                      </p>

                    </div>

                    <div className="text-right shrink-0">

                      <p className="font-bold text-sm sm:text-base">
                        {formatMoney(work.amount)}
                      </p>

                      <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                        {formatDate(work.date)}
                      </p>

                    </div>

                  </div>

                  <div
                    className="
                      mt-3
                      pt-3
                      border-t
                      border-slate-100
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >

                    <div>
                      <p className="text-[10px] text-slate-400">
                        Paid
                      </p>

                      <p className="text-sm font-semibold text-green-600 mt-1">
                        {formatMoney(work.paid)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">
                        Pending
                      </p>

                      <p className="text-sm font-semibold text-orange-500 mt-1">
                        {formatMoney(
                          work.due ??
                            Number(work.amount || 0) -
                              Number(work.paid || 0)
                        )}
                      </p>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default CustomerWorkHistory;