import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

function DriverAttendance() {
  const navigate = useNavigate();
  const location = useLocation();

  const driver = location.state?.driver || null;

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    today.getMonth()
  );

  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear()
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
  // IF DRIVER IS MISSING
  // =====================================================

  useEffect(() => {
    if (!driver) {
      navigate("/owner/drivers");
    }
  }, [driver, navigate]);

  // =====================================================
  // LOAD OWNER WORKS
  // =====================================================

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/owner/works");

      console.log("OWNER WORKS:", response.data);

      setWorks(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "DRIVER ATTENDANCE ERROR:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("JWT_TOKEN");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load attendance."
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
  // GET DRIVER WORKS
  // =====================================================

  const driverWorks = useMemo(() => {
    if (!driver) {
      return [];
    }

    const driverNumber = normalizeNumber(
      driver.number
    );

    return works.filter((work) => {
      const workDriverNumber =
        normalizeNumber(
          work.driverNumber
        );

      const sameNumber =
        driverNumber &&
        workDriverNumber &&
        driverNumber === workDriverNumber;

      const sameName =
        String(work.driverName || "")
          .trim()
          .toLowerCase() ===
        String(driver.name || "")
          .trim()
          .toLowerCase();

      return sameNumber || sameName;
    });
  }, [works, driver]);

  // =====================================================
  // ATTENDANCE FOR SELECTED MONTH
  // =====================================================

  const attendanceDays = useMemo(() => {
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
        date.getMonth() !== selectedMonth ||
        date.getFullYear() !== selectedYear
      ) {
        return;
      }

      const dateKey = String(
        work.date
      ).substring(0, 10);

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          works: [],
        });
      }

      dateMap
        .get(dateKey)
        .works.push(work);
    });

    return Array.from(
      dateMap.values()
    ).sort((a, b) => {
      return (
        new Date(`${b.date}T00:00:00`) -
        new Date(`${a.date}T00:00:00`)
      );
    });
  }, [
    driverWorks,
    selectedMonth,
    selectedYear,
  ]);

  // =====================================================
  // PRESENT DAYS
  // =====================================================

  const presentDays =
    attendanceDays.length;

  // =====================================================
  // TOTAL WORKS
  // =====================================================

  const totalWorks =
    attendanceDays.reduce(
      (total, day) =>
        total + day.works.length,
      0
    );

  // =====================================================
  // TOTAL DAYS IN MONTH
  // =====================================================

  const totalDaysInMonth =
    new Date(
      selectedYear,
      selectedMonth + 1,
      0
    ).getDate();

  // =====================================================
  // ATTENDANCE PERCENTAGE
  // =====================================================

  const attendancePercentage =
    totalDaysInMonth > 0
      ? Math.round(
          (presentDays /
            totalDaysInMonth) *
            100
        )
      : 0;

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

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  // =====================================================
  // DAY NAME
  // =====================================================

  const getDayName = (date) => {
    const parsedDate = new Date(
      `${date}T00:00:00`
    );

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
      }
    );
  };

  // =====================================================
  // VEHICLE ICON
  // =====================================================

  const getVehicleIcon = (vehicle) => {
    const icons = {
      Tractor: "🚜",
      JCB: "🏗️",
      Harvester: "🌾",
      Magic: "🚐",
      "Car / EV": "🚗",
      Other: "🚛",
    };

    return icons[vehicle] || "🚛";
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

  // =====================================================
  // DRIVER CHECK
  // =====================================================

  if (!driver) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="
        sticky
        top-0
        z-30
        bg-white
        border-b
        border-slate-200
      ">

        <div className="
          max-w-3xl
          mx-auto
          px-4
        ">

          <div className="
            h-[72px]
            flex
            items-center
            gap-3
          ">

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

            <div className="
              flex-1
              min-w-0
            ">

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

      <main className="
        max-w-3xl
        mx-auto
        px-4
        py-5
        pb-10
      ">

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

            <div className="flex-1">

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

        {/* MONTH / YEAR */}

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
            flex
            items-center
            justify-between
            mb-3
          ">

            <div>

              <p className="
                text-xs
                text-gray-500
              ">
                Attendance
              </p>

              <h2 className="
                text-base
                font-bold
                text-gray-900
              ">
                {months[selectedMonth]}{" "}
                {selectedYear}
              </h2>

            </div>

            <div className="text-2xl">
              📅
            </div>

          </div>

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
                w-full
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
                w-full
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

        {/* ATTENDANCE SUMMARY */}

        <section className="
          grid
          grid-cols-3
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
              Present
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
              Works
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
              text-blue-600
            ">
              {attendancePercentage}%
            </p>

            <p className="
              text-xs
              text-gray-500
              mt-1
            ">
              Working
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
            mb-5
          ">

            <p className="
              text-sm
              text-red-600
            ">
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
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    p-4
                    animate-pulse
                  "
                >

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <div
                    className="
                        w-11
                        h-11
                        rounded-full
                        bg-gray-200
                    "
                    />

                    <div className="flex-1">

                      <div className="
                        h-4
                        bg-gray-200
                        rounded
                        w-28
                      />

                      <div className="
                        h-3
                        bg-gray-200
                        rounded
                        w-20
                        mt-2
                      />

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

        {/* NO ATTENDANCE */}

        {!loading &&
          !error &&
          attendanceDays.length === 0 && (

            <div className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-8
              text-center
            ">

              <div className="
                w-16
                h-16
                mx-auto
                rounded-full
                bg-slate-100
                flex
                items-center
                justify-center
                text-3xl
              ">
                📅
              </div>

              <h2 className="
                text-lg
                font-bold
                text-gray-900
                mt-4
              ">
                No attendance
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

        {/* ATTENDANCE LIST */}

        {!loading &&
          attendanceDays.length > 0 && (

            <section>

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
                  Present Days
                </h2>

                <span className="
                  text-xs
                  text-green-600
                  font-semibold
                ">
                  {presentDays} days
                </span>

              </div>

              <div className="space-y-3">

                {attendanceDays.map(
                  (day) => (

                    <div
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

                      {/* DATE HEADER */}

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

                        <div className="flex-1">

                          <p className="
                            text-sm
                            font-bold
                            text-gray-900
                          ">
                            {formatDate(day.date)}
                          </p>

                          <p className="
                            text-xs
                            text-gray-500
                            mt-0.5
                          ">
                            {getDayName(day.date)}
                          </p>

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

                      <div className="
                        mt-4
                        pt-4
                        border-t
                        border-slate-100
                        space-y-2
                      ">

                        <p className="
                          text-xs
                          font-semibold
                          text-gray-500
                          mb-2
                        ">
                          Work on this day
                        </p>

                        {day.works.map(
                          (work, workIndex) => (

                            <div
                              key={
                                work.id ||
                                `${day.date}-${workIndex}`
                              }
                              className="
                                bg-slate-50
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
                                  w-9
                                  h-9
                                  rounded-lg
                                  bg-white
                                  border
                                  border-slate-200
                                  flex
                                  items-center
                                  justify-center
                                  text-lg
                                ">
                                  {getVehicleIcon(
                                    work.machine
                                  )}
                                </div>

                                <div className="
                                  flex-1
                                  min-w-0
                                ">

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
                                    mt-0.5
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
                                  mt-0.5
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

                    </div>
                  )
                )}

              </div>

            </section>
          )}

      </main>

    </div>
  );
}

export default DriverAttendance;