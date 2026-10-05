import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

function DriverHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const driver = location.state?.driver || null;

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    location.state?.month ?? today.getMonth()
  );

  const [selectedYear, setSelectedYear] = useState(
    location.state?.year ?? today.getFullYear()
  );

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

  // =====================================================
  // IF NO DRIVER
  // =====================================================

  useEffect(() => {
    if (!driver) {
      navigate("/owner/drivers");
    }
  }, [driver, navigate]);

  // =====================================================
  // LOAD WORKS
  // =====================================================

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/owner/works");

      console.log("DRIVER HISTORY WORKS:", response.data);

      setWorks(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "DRIVER HISTORY ERROR:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("JWT_TOKEN");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load driver history."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // NORMALIZE NUMBER
  // =====================================================

  const normalizeNumber = (number) => {
    return String(number || "").replace(/\D/g, "");
  };

  // =====================================================
  // FILTER DRIVER WORK
  // =====================================================

  const driverWorks = useMemo(() => {
    if (!driver) {
      return [];
    }

    const selectedNumber =
      normalizeNumber(driver.number);

    const selectedName = String(
      driver.name || ""
    )
      .trim()
      .toLowerCase();

    return works.filter((work) => {
      const workNumber =
        normalizeNumber(
          work.driverNumber
        );

      const workName = String(
        work.driverName || ""
      )
        .trim()
        .toLowerCase();

      if (
        selectedNumber &&
        workNumber
      ) {
        return (
          selectedNumber === workNumber
        );
      }

      return selectedName === workName;
    });
  }, [works, driver]);

  // =====================================================
  // GROUP WORK BY DATE
  // =====================================================

  const history = useMemo(() => {
    const dateMap = new Map();

    driverWorks.forEach((work) => {
      if (!work.date) {
        return;
      }

      const date = new Date(
        `${work.date}T00:00:00`
      );

      if (Number.isNaN(date.getTime())) {
        return;
      }

      if (
        date.getMonth() !==
        selectedMonth
      ) {
        return;
      }

      if (
        date.getFullYear() !==
        selectedYear
      ) {
        return;
      }

      const dateKey = String(
        work.date
      ).substring(0, 10);

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }

      dateMap
        .get(dateKey)
        .push(work);
    });

    return Array.from(
      dateMap.entries()
    )
      .map(([date, dayWorks]) => ({
        date,
        works: dayWorks,
      }))
      .sort(
        (a, b) =>
          new Date(
            `${b.date}T00:00:00`
          ) -
          new Date(
            `${a.date}T00:00:00`
          )
      );
  }, [
    driverWorks,
    selectedMonth,
    selectedYear,
  ]);

  // =====================================================
  // TOTAL WORKS
  // =====================================================

  const totalWorks = history.reduce(
    (total, day) =>
      total + day.works.length,
    0
  );

  // =====================================================
  // PRESENT DAYS
  // =====================================================

  const presentDays = history.length;

  // =====================================================
  // AVAILABLE YEARS
  // =====================================================

  const availableYears = useMemo(() => {
    const yearSet = new Set();

    driverWorks.forEach((work) => {
      if (!work.date) {
        return;
      }

      const date = new Date(
        `${work.date}T00:00:00`
      );

      if (!Number.isNaN(date.getTime())) {
        yearSet.add(
          date.getFullYear()
        );
      }
    });

    yearSet.add(today.getFullYear());

    return Array.from(yearSet).sort(
      (a, b) => b - a
    );
  }, [driverWorks]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    const parsedDate = new Date(
      `${date}T00:00:00`
    );

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  // =====================================================
  // DAY
  // =====================================================

  const getDayName = (date) => {
    const parsedDate = new Date(
      `${date}T00:00:00`
    );

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
      }
    );
  };

  // =====================================================
  // VEHICLE ICON
  // =====================================================

  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case "Tractor":
        return "🚜";

      case "JCB":
        return "🏗️";

      case "Harvester":
        return "🌾";

      case "Magic":
        return "🚐";

      case "Car / EV":
        return "🚗";

      default:
        return "🚛";
    }
  };

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (name) => {
    if (!name) {
      return "DR";
    }

    const parts = name
      .trim()
      .split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  if (!driver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">

        <div className="max-w-3xl mx-auto px-4">

          <div className="h-[72px] flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate("/owner/drivers")
              }
              className="
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                text-2xl
                text-gray-700
                hover:bg-gray-100
              "
            >
              ←
            </button>

            <div className="
              w-11
              h-11
              rounded-full
              bg-green-100
              text-green-700
              flex
              items-center
              justify-center
              font-bold
            ">
              {getInitials(driver.name)}
            </div>

            <div className="flex-1 min-w-0">

              <h1 className="
                text-lg
                font-bold
                text-gray-900
                truncate
              ">
                {driver.name}
              </h1>

              <p className="
                text-xs
                text-gray-500
              ">
                {driver.number}
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="max-w-3xl mx-auto px-4 py-5 pb-10">

        {/* DRIVER SUMMARY */}

        <section className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          p-5
          shadow-sm
          mb-4
        ">

          <div className="
            flex
            items-center
            gap-4
          ">

            <div className="
              w-16
              h-16
              rounded-full
              bg-green-100
              text-green-700
              flex
              items-center
              justify-center
              text-xl
              font-bold
            ">
              {getInitials(driver.name)}
            </div>

            <div>

              <h2 className="
                text-lg
                font-bold
                text-gray-900
              ">
                {driver.name}
              </h2>

              <p className="
                text-sm
                text-gray-500
                mt-1
              ">
                {driver.number}
              </p>

            </div>

          </div>

        </section>

        {/* MONTH */}

        <section className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          p-4
          shadow-sm
          mb-4
        ">

          <div className="
            grid
            grid-cols-2
            gap-3
          ">

            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(
                  Number(e.target.value)
                )
              }
              className="
                border
                border-gray-300
                rounded-xl
                px-3
                py-3
                bg-white
                text-sm
                outline-none
                focus:border-green-500
              "
            >

              {months.map(
                (month, index) => (
                  <option
                    key={month}
                    value={index}
                  >
                    {month}
                  </option>
                )
              )}

            </select>

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  Number(e.target.value)
                )
              }
              className="
                border
                border-gray-300
                rounded-xl
                px-3
                py-3
                bg-white
                text-sm
                outline-none
                focus:border-green-500
              "
            >

              {availableYears.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}

            </select>

          </div>

        </section>

        {/* SUMMARY */}

        <section className="
          grid
          grid-cols-2
          gap-3
          mb-5
        ">

          <div className="
            bg-white
            border
            border-green-200
            rounded-2xl
            p-4
            text-center
          ">

            <p className="
              text-2xl
              font-bold
              text-green-600
            ">
              {presentDays}
            </p>

            <p className="
              text-xs
              text-gray-500
              mt-1
            ">
              Present Days
            </p>

          </div>

          <div className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-4
            text-center
          ">

            <p className="
              text-2xl
              font-bold
              text-gray-900
            ">
              {totalWorks}
            </p>

            <p className="
              text-xs
              text-gray-500
              mt-1
            ">
              Total Works
            </p>

          </div>

        </section>

        {/* ERROR */}

        {error && (

          <div className="
            bg-red-50
            border
            border-red-200
            rounded-xl
            p-4
            mb-4
          ">

            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadWorks}
              className="
                mt-2
                text-sm
                font-semibold
                text-red-700
              "
            >
              Try Again
            </button>

          </div>

        )}

        {/* LOADING */}

        {loading && (

          <div className="space-y-3">

            {[1, 2, 3].map(
              (item) => (

                <div
                  key={item}
                  className="
                    h-32
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    animate-pulse
                  "
                />

              )
            )}

          </div>

        )}

        {/* NO HISTORY */}

        {!loading &&
          !error &&
          history.length === 0 && (

            <div className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-8
              text-center
            ">

              <div className="text-4xl">
                📅
              </div>

              <h2 className="
                text-lg
                font-bold
                text-gray-900
                mt-3
              ">
                No work history
              </h2>

              <p className="
                text-sm
                text-gray-500
                mt-2
              ">
                No work was recorded for this
                driver in{" "}
                {months[selectedMonth]}{" "}
                {selectedYear}.
              </p>

            </div>

          )}

        {/* HISTORY */}

        {!loading &&
          history.length > 0 && (

            <div>

              <div className="
                flex
                items-center
                justify-between
                mb-3
              ">

                <h2 className="
                  text-base
                  font-bold
                  text-gray-900
                ">
                  Work History
                </h2>

                <span className="
                  text-xs
                  font-semibold
                  text-green-600
                ">
                  {presentDays} present days
                </span>

              </div>

              <div className="space-y-3">

                {history.map(
                  (day) => (

                    <section
                      key={day.date}
                      className="
                        bg-white
                        border
                        border-slate-200
                        rounded-2xl
                        p-4
                        shadow-sm
                      "
                    >

                      {/* DATE */}

                      <div className="
                        flex
                        items-center
                        justify-between
                        mb-4
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
                            text-green-600
                            flex
                            items-center
                            justify-center
                            font-bold
                          ">
                            ✓
                          </div>

                          <div>

                            <p className="
                              font-bold
                              text-gray-900
                            ">
                              {formatDate(day.date)}
                            </p>

                            <p className="
                              text-xs
                              text-gray-500
                              mt-1
                            ">
                              {getDayName(day.date)}
                            </p>

                          </div>

                        </div>

                        <span className="
                          px-3
                          py-1
                          rounded-full
                          bg-green-100
                          text-green-700
                          text-xs
                          font-semibold
                        ">
                          Present
                        </span>

                      </div>

                      {/* WORKS */}

                      <div className="space-y-3">

                        {day.works.map(
                          (work, index) => (

                            <div
                              key={
                                work.id ||
                                `${day.date}-${index}`
                              }
                              className="
                                bg-slate-50
                                border
                                border-slate-200
                                rounded-xl
                                p-3
                              "
                            >

                              <div className="
                                flex
                                items-center
                                gap-3
                              ">

                                <div className="
                                  w-10
                                  h-10
                                  rounded-lg
                                  bg-white
                                  border
                                  border-slate-200
                                  flex
                                  items-center
                                  justify-center
                                  text-xl
                                ">
                                  {getVehicleIcon(
                                    work.machine
                                  )}
                                </div>

                                <div className="flex-1">

                                  <p className="
                                    text-sm
                                    font-bold
                                    text-gray-900
                                  ">
                                    {work.machine ||
                                      "Vehicle"}
                                  </p>

                                  <p className="
                                    text-xs
                                    text-green-600
                                    mt-1
                                  ">
                                    {work.workType ||
                                      "Work"}
                                  </p>

                                </div>

                              </div>

                              <div className="
                                mt-3
                                pt-3
                                border-t
                                border-slate-200
                              ">

                                <p className="
                                  text-[10px]
                                  uppercase
                                  tracking-wide
                                  text-gray-400
                                ">
                                  Customer
                                </p>

                                <p className="
                                  text-sm
                                  font-semibold
                                  text-gray-800
                                  mt-1
                                ">
                                  {work.customerName ||
                                    "Unknown"}
                                </p>

                                {work.customerNumber && (

                                  <p className="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                  ">
                                    {work.customerNumber}
                                  </p>

                                )}

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </section>

                  )
                )}

              </div>

            </div>

          )}

      </main>

    </div>
  );
}

export default DriverHistory;