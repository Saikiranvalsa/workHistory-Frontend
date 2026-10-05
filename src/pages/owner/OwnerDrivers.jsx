import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function OwnerDrivers() {
  const navigate = useNavigate();

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
      console.error("OWNER WORKS ERROR:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("JWT_TOKEN");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load drivers."
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
  // INITIALS
  // =====================================================

  const getInitials = (name) => {
    if (!name) {
      return "DR";
    }

    const parts = name.trim().split(/\s+/);

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
  // AVAILABLE YEARS
  // =====================================================

  const availableYears = useMemo(() => {
    const yearSet = new Set();

    works.forEach((work) => {
      if (!work.date) {
        return;
      }

      const date = new Date(
        `${work.date}T00:00:00`
      );

      if (!Number.isNaN(date.getTime())) {
        yearSet.add(date.getFullYear());
      }
    });

    yearSet.add(today.getFullYear());

    return Array.from(yearSet).sort(
      (a, b) => b - a
    );
  }, [works]);

  // =====================================================
  // BUILD DRIVER LIST
  // =====================================================

  const drivers = useMemo(() => {
    const driverMap = new Map();

    works.forEach((work) => {
      const driverName = String(
        work.driverName || ""
      ).trim();

      const driverNumber = String(
        work.driverNumber || ""
      ).trim();

      // Ignore work without driver
      if (!driverName && !driverNumber) {
        return;
      }

      if (!work.date) {
        return;
      }

      const workDate = new Date(
        `${work.date}T00:00:00`
      );

      if (Number.isNaN(workDate.getTime())) {
        return;
      }

      // Selected month
      if (
        workDate.getMonth() !==
        selectedMonth
      ) {
        return;
      }

      // Selected year
      if (
        workDate.getFullYear() !==
        selectedYear
      ) {
        return;
      }

      const numberKey =
        normalizeNumber(driverNumber);

      const key =
        numberKey ||
        driverName.toLowerCase();

      if (!driverMap.has(key)) {
        driverMap.set(key, {
          name: driverName,
          number: driverNumber,
          dates: new Set(),
        });
      }

      const driver = driverMap.get(key);

      driver.dates.add(
        String(work.date).substring(0, 10)
      );
    });

    return Array.from(
      driverMap.values()
    )
      .map((driver) => ({
        name: driver.name,
        number: driver.number,
        presentDays: driver.dates.size,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [
    works,
    selectedMonth,
    selectedYear,
  ]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredDrivers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return drivers;
    }

    return drivers.filter((driver) => {
      const name = String(
        driver.name || ""
      ).toLowerCase();

      const number = String(
        driver.number || ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        number.includes(query)
      );
    });
  }, [drivers, search]);

  // =====================================================
  // OPEN DRIVER HISTORY
  // =====================================================

  const openDriverHistory = (driver) => {
    navigate("/owner/driver-history", {
      state: {
        driver,
        month: selectedMonth,
        year: selectedYear,
      },
    });
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">

        <div className="max-w-3xl mx-auto px-4">

          <div className="h-[72px] flex items-center gap-3">

            <button
              type="button"
              onClick={() => navigate("/owner")}
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

            <div className="flex-1">

              <h1 className="text-xl font-bold text-gray-900">
                Drivers
              </h1>

              <p className="text-xs text-gray-500 mt-1">
                View driver attendance and history
              </p>

            </div>

            <div className="
              w-10
              h-10
              rounded-full
              bg-green-100
              flex
              items-center
              justify-center
              text-xl
            ">
              🚚
            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-3xl mx-auto px-4 py-5 pb-10">

        {/* =================================================
            MONTH / YEAR
        ================================================= */}

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

              <p className="text-xs text-gray-500">
                Attendance period
              </p>

              <h2 className="text-base font-bold text-gray-900">
                {months[selectedMonth]} {selectedYear}
              </h2>

            </div>

            <span className="text-2xl">
              📅
            </span>

          </div>

          <div className="grid grid-cols-2 gap-3">

            {/* MONTH */}

            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(
                  Number(e.target.value)
                );
              }}
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

            {/* YEAR */}

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(
                  Number(e.target.value)
                );
              }}
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

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-4">

          <div className="relative">

            <span className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-gray-400
            ">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search driver name or number"
              className="
                w-full
                bg-white
                border
                border-slate-200
                rounded-2xl
                pl-11
                pr-4
                py-3.5
                outline-none
                focus:border-green-500
              "
            />

          </div>

        </div>

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

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="space-y-3">

            {[1, 2, 3].map(
              (item) => (

                <div
                  key={item}
                  className="
                    h-24
                    bg-white
                    rounded-2xl
                    animate-pulse
                    border
                    border-slate-200
                  "
                />

              )
            )}

          </div>

        )}

        {/* =================================================
            NO DRIVERS
        ================================================= */}

        {!loading &&
          !error &&
          filteredDrivers.length === 0 && (

            <div className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-8
              text-center
            ">

              <div className="text-4xl">
                🚚
              </div>

              <h2 className="
                text-lg
                font-bold
                text-gray-900
                mt-3
              ">
                No drivers found
              </h2>

              <p className="
                text-sm
                text-gray-500
                mt-2
              ">
                No driver work was recorded for{" "}
                {months[selectedMonth]}{" "}
                {selectedYear}.
              </p>

            </div>

          )}

        {/* =================================================
            DRIVER LIST
        ================================================= */}

        {!loading &&
          !error &&
          filteredDrivers.length > 0 && (

            <div className="space-y-3">

              {filteredDrivers.map(
                (driver, index) => (

                  <button
                    key={
                      normalizeNumber(
                        driver.number
                      ) ||
                      `${driver.name}-${index}`
                    }
                    type="button"
                    onClick={() =>
                      openDriverHistory(
                        driver
                      )
                    }
                    className="
                      w-full
                      text-left
                      bg-white
                      border
                      border-slate-200
                      rounded-2xl
                      p-4
                      shadow-sm
                      hover:bg-slate-50
                      active:scale-[0.99]
                      transition
                    "
                  >

                    <div className="
                      flex
                      items-center
                      gap-3
                    ">

                      {/* AVATAR */}

                      <div className="
                        w-12
                        h-12
                        rounded-full
                        bg-green-100
                        text-green-700
                        flex
                        items-center
                        justify-center
                        font-bold
                        flex-shrink-0
                      ">
                        {getInitials(
                          driver.name
                        )}
                      </div>

                      {/* DRIVER DETAILS */}

                      <div className="
                        flex-1
                        min-w-0
                      ">

                        <p className="
                          font-bold
                          text-gray-900
                          truncate
                        ">
                          {driver.name ||
                            "Unknown Driver"}
                        </p>

                        <p className="
                          text-sm
                          text-gray-500
                          mt-1
                        ">
                          {driver.number ||
                            "No number"}
                        </p>

                      </div>

                      {/* PRESENT DAYS */}

                      <div className="
                        text-center
                        min-w-[55px]
                      ">

                        <p className="
                          text-lg
                          font-bold
                          text-green-600
                        ">
                          {driver.presentDays}
                        </p>

                        <p className="
                          text-[10px]
                          text-gray-400
                        ">
                          Present
                        </p>

                      </div>

                      {/* ARROW */}

                      <div className="
                        text-xl
                        text-gray-400
                      ">
                        →
                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          )}

      </main>

    </div>
  );
}

export default OwnerDrivers;