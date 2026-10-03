import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../services/api";

function CustomerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // CUSTOMER DATA
  // =====================================================

  const customer = location.state?.customer;

  const customerName =
    customer?.name ||
    customer?.customerName ||
    "Customer";

  const customerNumber =
    customer?.number ||
    customer?.customerNumber ||
    "";

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FILTERS
  // =====================================================

  const today = new Date();
  const currentYear = today.getFullYear();

  const [historyType, setHistoryType] =
    useState("year");

  const [selectedYear, setSelectedYear] =
    useState("");

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth() + 1);

  const [selectedVehicle, setSelectedVehicle] =
    useState("All");

  // =====================================================
  // LOAD OWNER WORKS
  // =====================================================

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("/owner/works");

      console.log(
        "OWNER WORKS:",
        response.data
      );

      setWorks(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {
      console.error(
        "OWNER WORKS ERROR:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem(
          "JWT_TOKEN"
        );

        navigate("/login");
        return;
      }

      setWorks([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VEHICLE NAME
  // =====================================================

  const formatVehicleName = (vehicle) => {
    if (!vehicle) {
      return "Others";
    }

    const value =
      vehicle.trim().toLowerCase();

    if (value === "tractor") {
      return "Tractor";
    }

    if (value === "jcb") {
      return "JCB";
    }

    if (value === "harvester") {
      return "Harvester";
    }

    if (value === "magic") {
      return "Magic";
    }

    if (
      value === "car" ||
      value === "car/ev" ||
      value === "car / ev"
    ) {
      return "Car / EV";
    }

    if (
      value === "other" ||
      value === "others"
    ) {
      return "Others";
    }

    return vehicle
      .trim()
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // =====================================================
  // VEHICLE ICON
  // =====================================================

  const getVehicleIcon = (vehicle) => {
    if (vehicle === "Tractor") {
      return "🚜";
    }

    if (vehicle === "JCB") {
      return "🏗️";
    }

    if (vehicle === "Harvester") {
      return "🌾";
    }

    if (vehicle === "Magic") {
      return "🚐";
    }

    if (vehicle === "Car / EV") {
      return "🚗";
    }

    return "🚛";
  };

  // =====================================================
  // CUSTOMER WORKS
  // =====================================================

  const customerWorks = useMemo(() => {
    if (!customerNumber) {
      return [];
    }

    return works.filter(
      (work) =>
        String(
          work.customerNumber || ""
        ) === String(customerNumber)
    );
  }, [
    works,
    customerNumber,
  ]);

  // =====================================================
  // YEAR FILTER
  // =====================================================

  const dateFilteredWorks =
    useMemo(() => {
      return customerWorks.filter(
        (work) => {
          if (!work.date) {
            return false;
          }

          const date =
            new Date(work.date);

          const year =
            date.getFullYear();

          const month =
            date.getMonth() + 1;

          // Full history

          if (!selectedYear) {
            return true;
          }

          // Year

          if (
            historyType === "year"
          ) {
            return (
              year ===
              Number(selectedYear)
            );
          }

          // Month

          if (
            historyType === "month"
          ) {
            return (
              year ===
                Number(selectedYear) &&
              month ===
                Number(selectedMonth)
            );
          }

          return true;
        }
      );
    }, [
      customerWorks,
      selectedYear,
      selectedMonth,
      historyType,
    ]);

  // =====================================================
  // VEHICLE OPTIONS
  // =====================================================

  const vehicleOptions =
    useMemo(() => {
      const map = new Map();

      dateFilteredWorks.forEach(
        (work) => {
          if (!work.machine) {
            return;
          }

          const vehicle =
            formatVehicleName(
              work.machine
            );

          const key =
            vehicle.toLowerCase();

          if (!map.has(key)) {
            map.set(
              key,
              vehicle
            );
          }
        }
      );

      return [
        "All",
        ...Array.from(
          map.values()
        ),
      ];
    }, [
      dateFilteredWorks,
    ]);

  // =====================================================
  // FINAL FILTER
  // =====================================================

  const filteredWorks =
    useMemo(() => {

      let result =
        dateFilteredWorks;

      if (
        selectedVehicle !==
        "All"
      ) {
        result =
          dateFilteredWorks.filter(
            (work) =>
              formatVehicleName(
                work.machine
              ) === selectedVehicle
          );
      }

      // =================================================
      // SORT
      // LATEST WORK DATE FIRST
      // =================================================

      result = [...result].sort(
        (a, b) => {
          const dateA =
            new Date(
              a.date || 0
            ).getTime();

          const dateB =
            new Date(
              b.date || 0
            ).getTime();

          return dateB - dateA;
        }
      );

      return result;

    }, [
      dateFilteredWorks,
      selectedVehicle,
    ]);

  // =====================================================
  // TOTALS
  // =====================================================

  const totals = useMemo(() => {
    let total = 0;
    let paid = 0;
    let pending = 0;

    filteredWorks.forEach(
      (work) => {
        const amount =
          Number(
            work.amount || 0
          );

        const paidAmount =
          Number(
            work.paid || 0
          );

        const due =
          work.due !==
            undefined &&
          work.due !== null
            ? Number(
                work.due || 0
              )
            : amount -
              paidAmount;

        total += amount;
        paid += paidAmount;
        pending += due;
      }
    );

    return {
      total,
      paid,
      pending,
    };

  }, [filteredWorks]);

  // =====================================================
  // YEARS
  // =====================================================

  const years = [];

  for (
    let year = currentYear;
    year >= currentYear - 5;
    year--
  ) {
    years.push(year);
  }

  // =====================================================
  // MONTHS
  // =====================================================

  const months = [
    {
      value: 1,
      label: "January",
    },
    {
      value: 2,
      label: "February",
    },
    {
      value: 3,
      label: "March",
    },
    {
      value: 4,
      label: "April",
    },
    {
      value: 5,
      label: "May",
    },
    {
      value: 6,
      label: "June",
    },
    {
      value: 7,
      label: "July",
    },
    {
      value: 8,
      label: "August",
    },
    {
      value: 9,
      label: "September",
    },
    {
      value: 10,
      label: "October",
    },
    {
      value: 11,
      label: "November",
    },
    {
      value: 12,
      label: "December",
    },
  ];

  const selectedMonthName =
    months.find(
      (month) =>
        month.value ===
        Number(selectedMonth)
    )?.label || "";

  // =====================================================
  // PERIOD TITLE
  // =====================================================

  const periodTitle =
    !selectedYear
      ? "Full History"
      : historyType === "year"
      ? `${selectedYear} History`
      : `${selectedMonthName} ${selectedYear} History`;

  // =====================================================
  // MONEY
  // =====================================================

  const formatMoney = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const pdfMoney = (value) => {
    return `Rs. ${Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // DETAILS FOR PDF
  // =====================================================

  const getVehicleDetails = (
    work
  ) => {
    const vehicle =
      formatVehicleName(
        work.machine
      );

    const details = [];

    if (
      vehicle === "Tractor"
    ) {
      if (
        Number(
          work.acres || 0
        ) > 0
      ) {
        details.push(
          `${Number(
            work.acres
          ).toFixed(2)} acres`
        );
      }
    }

    if (
      vehicle === "Harvester"
    ) {
      if (
        Number(
          work.acres || 0
        ) > 0
      ) {
        details.push(
          `${Number(
            work.acres
          ).toFixed(2)} acres`
        );
      }

      if (
        work.timeTaken !==
          undefined &&
        work.timeTaken !==
          null &&
        String(
          work.timeTaken
        ).trim() !== ""
      ) {
        details.push(
          `Time: ${work.timeTaken}`
        );
      }
    }

    return details;
  };

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const downloadPDF = () => {
    if (
      filteredWorks.length ===
      0
    ) {
      alert(
        "No work history available to download."
      );

      return;
    }

    const doc = new jsPDF();

    const pageWidth =
      doc.internal.pageSize.getWidth();

    // HEADER

    doc.setFillColor(
      0,
      140,
      58
    );

    doc.rect(
      0,
      0,
      pageWidth,
      40,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(20);

    doc.text(
      "WORKHISTORY",
      pageWidth / 2,
      16,
      {
        align: "center",
      }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.text(
      "Customer Work History",
      pageWidth / 2,
      26,
      {
        align: "center",
      }
    );

    // CUSTOMER DETAILS

    doc.setTextColor(
      30,
      41,
      59
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(14);

    doc.text(
      customerName,
      14,
      53
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.text(
      `Phone: ${customerNumber}`,
      14,
      61
    );

    doc.text(
      `Period: ${periodTitle}`,
      14,
      68
    );

    doc.text(
      `Vehicle: ${selectedVehicle}`,
      14,
      75
    );

    // SUMMARY

    const summaryY = 84;

    const gap = 5;

    const boxWidth =
      (pageWidth -
        28 -
        gap * 2) /
      3;

    doc.setFillColor(
      248,
      250,
      252
    );

    doc.roundedRect(
      14,
      summaryY,
      boxWidth,
      27,
      3,
      3,
      "F"
    );

    doc.setFillColor(
      236,
      253,
      245
    );

    doc.roundedRect(
      14 +
        boxWidth +
        gap,
      summaryY,
      boxWidth,
      27,
      3,
      3,
      "F"
    );

    doc.setFillColor(
      255,
      247,
      237
    );

    doc.roundedRect(
      14 +
        (boxWidth +
          gap) *
          2,
      summaryY,
      boxWidth,
      27,
      3,
      3,
      "F"
    );

    doc.setTextColor(
      100,
      116,
      139
    );

    doc.setFontSize(8);

    doc.text(
      "TOTAL",
      19,
      summaryY + 9
    );

    doc.setTextColor(
      15,
      23,
      42
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      pdfMoney(
        totals.total
      ),
      19,
      summaryY + 20
    );

    const paidX =
      14 +
      boxWidth +
      gap;

    doc.setTextColor(
      22,
      163,
      74
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      "PAID",
      paidX + 5,
      summaryY + 9
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      pdfMoney(
        totals.paid
      ),
      paidX + 5,
      summaryY + 20
    );

    const pendingX =
      14 +
      (boxWidth +
        gap) *
        2;

    doc.setTextColor(
      234,
      88,
      12
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      "PENDING",
      pendingX + 5,
      summaryY + 9
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      pdfMoney(
        totals.pending
      ),
      pendingX + 5,
      summaryY + 20
    );

    // TABLE

    const tableData =
      filteredWorks.map(
        (work) => {
          const vehicle =
            formatVehicleName(
              work.machine
            );

          const pending =
            work.due !==
              undefined &&
            work.due !== null
              ? Number(
                  work.due || 0
                )
              : Number(
                  work.amount ||
                    0
                ) -
                Number(
                  work.paid ||
                    0
                );

          const details =
            getVehicleDetails(
              work
            ).join(" / ");

          return [
            formatDate(
              work.date
            ),
            vehicle,
            work.workType ||
              "-",
            details || "-",
            pdfMoney(
              work.amount
            ),
            pdfMoney(
              work.paid
            ),
            pdfMoney(
              pending
            ),
          ];
        }
      );

    autoTable(doc, {
      startY: 123,

      head: [
        [
          "Date",
          "Vehicle",
          "Work",
          "Details",
          "Amount",
          "Paid",
          "Pending",
        ],
      ],

      body: tableData,

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 7.5,
        cellPadding: 3,
        textColor: [
          30,
          41,
          59,
        ],
        valign: "middle",
      },

      headStyles: {
        fillColor: [
          0,
          140,
          58,
        ],
        textColor: [
          255,
          255,
          255,
        ],
        fontStyle: "bold",
        halign: "center",
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252,
        ],
      },

      margin: {
        left: 14,
        right: 14,
      },
    });

    // FOOTER

    const pageCount =
      doc.internal.getNumberOfPages();

    for (
      let page = 1;
      page <= pageCount;
      page++
    ) {
      doc.setPage(page);

      const pageHeight =
        doc.internal.pageSize.getHeight();

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        148,
        163,
        184
      );

      doc.text(
        `WorkHistory • Page ${page} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        {
          align: "center",
        }
      );
    }

    const vehicleName =
      selectedVehicle ===
      "All"
        ? "All_Vehicles"
        : selectedVehicle.replace(
            /\s+/g,
            "_"
          );

    let historyName =
      "Full_History";

    if (selectedYear) {
      if (
        historyType ===
        "month"
      ) {
        historyName =
          `${selectedYear}_${selectedMonthName}`;
      } else {
        historyName =
          `${selectedYear}`;
      }
    }

    doc.save(
      `CustomerHistory_${customerName}_${vehicleName}_${historyName}.pdf`
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header
        className="
          bg-green-700
          text-white
          px-3
          py-3
          flex
          items-center
          justify-between
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <button
            onClick={() =>
              navigate(-1)
            }
            className="
              text-2xl
              px-1
              active:scale-95
            "
          >
            ←
          </button>

          <div>

            <h1
              className="
                text-base
                font-bold
              "
            >
              Customer Details
            </h1>

            <p
              className="
                text-[10px]
              "
            >
              Customer information
            </p>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main
        className="
          max-w-[700px]
          mx-auto
          px-2.5
          py-3
        "
      >

        {/* CUSTOMER CARD */}

        <section
          className="
            bg-white
            rounded-xl
            border
            border-slate-200
            p-3
            shadow-sm
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            {/* INITIAL */}

            <div
              className="
                w-14
                h-14
                rounded-full
                bg-green-100
                text-green-700
                flex
                items-center
                justify-center
                text-xl
                font-bold
                shrink-0
              "
            >
              {customerName
                .charAt(0)
                .toUpperCase()}
            </div>

            {/* CUSTOMER */}

            <div className="min-w-0">

              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                  truncate
                "
              >
                {customerName}
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                {customerNumber}
              </p>

            </div>

          </div>

          {/* TOTALS */}

          <div
            className="
              mt-3
              grid
              grid-cols-3
              gap-1.5
            "
          >

            <SummaryBox
              title="Total"
              value={formatMoney(
                totals.total
              )}
            />

            <SummaryBox
              title="Paid"
              value={formatMoney(
                totals.paid
              )}
              green
            />

            <SummaryBox
              title="Pending"
              value={formatMoney(
                totals.pending
              )}
              orange
            />

          </div>

        </section>

        {/* HISTORY FILTER */}

        <section
          className="
            mt-3
            bg-white
            rounded-xl
            border
            border-slate-200
            px-3
            py-2.5
            shadow-sm
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div>

              <h2
                className="
                  text-sm
                  font-bold
                  text-slate-900
                "
              >
                History
              </h2>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-slate-500
                "
              >
                Select the period you want to view
              </p>

            </div>

          </div>

          {/* YEAR / MONTH */}

          <div
            className="
              mt-2
              flex
              gap-1.5
            "
          >

            <button
              onClick={() => {
                setHistoryType(
                  "year"
                );

                setSelectedVehicle(
                  "All"
                );
              }}
              className={`
                flex-1
                h-8
                rounded-lg
                border
                text-[10px]
                font-medium
                ${
                  historyType ===
                  "year"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-slate-600 border-slate-300"
                }
              `}
            >
              Year
            </button>

            <button
              onClick={() => {
                setHistoryType(
                  "month"
                );

                setSelectedVehicle(
                  "All"
                );
              }}
              className={`
                flex-1
                h-8
                rounded-lg
                border
                text-[10px]
                font-medium
                ${
                  historyType ===
                  "month"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-slate-600 border-slate-300"
                }
              `}
            >
              Month
            </button>

          </div>

          {/* YEAR */}

          <div className="mt-1.5">

            <label
              className="
                block
                text-[10px]
                text-slate-500
                mb-1
              "
            >
              Select Year
            </label>

            <select
              value={
                selectedYear || ""
              }
              onChange={(e) => {
                const value =
                  e.target.value;

                setSelectedYear(
                  value === ""
                    ? ""
                    : Number(value)
                );

                setSelectedVehicle(
                  "All"
                );
              }}
              className="
                w-full
                h-8
                px-2
                rounded-lg
                border
                border-slate-300
                bg-white
                text-[10px]
                outline-none
              "
            >

              <option value="">
                Full History
              </option>

              {years.map(
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

          {/* MONTH */}

          {historyType ===
            "month" &&
            selectedYear && (

              <div className="mt-1.5">

                <select
                  value={
                    selectedMonth
                  }
                  onChange={(e) => {
                    setSelectedMonth(
                      Number(
                        e.target.value
                      )
                    );

                    setSelectedVehicle(
                      "All"
                    );
                  }}
                  className="
                    w-full
                    h-8
                    px-2
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    text-[10px]
                    outline-none
                  "
                >

                  {months.map(
                    (month) => (
                      <option
                        key={
                          month.value
                        }
                        value={
                          month.value
                        }
                      >
                        {
                          month.label
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            )}

        </section>

        {/* VEHICLES */}

        <section className="mt-4">

          <div
            className="
              flex
              items-center
              justify-between
              mb-2
            "
          >

            <h2
              className="
                text-base
                font-bold
              "
            >
              Vehicles
            </h2>

            <span
              className="
                text-[10px]
                text-slate-500
              "
            >
              {filteredWorks.length} works
            </span>

          </div>

          <div
            className="
              flex
              gap-1.5
              overflow-x-auto
              pb-1
            "
          >

            {vehicleOptions.map(
              (vehicle) => (

                <button
                  key={vehicle}
                  onClick={() =>
                    setSelectedVehicle(
                      vehicle
                    )
                  }
                  className={`
                    whitespace-nowrap
                    px-3
                    py-1.5
                    rounded-full
                    border
                    text-[10px]
                    font-medium
                    ${
                      selectedVehicle ===
                      vehicle
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-slate-600 border-slate-300"
                    }
                  `}
                >
                  {vehicle}
                </button>

              )
            )}

          </div>

        </section>

        {/* SHOWING + PDF */}

        <div
          className="
            mt-2
            flex
            items-center
            justify-between
          "
        >

          <p
            className="
              text-[10px]
              text-slate-500
              truncate
            "
          >
            Showing:

            <span
              className="
                ml-1
                font-semibold
                text-slate-800
              "
            >
              {periodTitle}
            </span>

            <span className="mx-1">
              •
            </span>

            <span
              className="
                font-semibold
                text-slate-800
              "
            >
              {selectedVehicle}
            </span>

          </p>

          {/* DOWNLOAD */}

          <button
            onClick={downloadPDF}
            disabled={
              filteredWorks.length ===
              0
            }
            className="
              w-9
              h-9
              flex
              items-center
              justify-center
              rounded-lg
              border
              border-green-200
              bg-green-50
              text-green-700
              shrink-0
              active:scale-95
            "
            title="Download PDF"
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>

          </button>

        </div>

        {/* WORK HISTORY */}

        <section className="mt-3">

          {loading ? (

            <div
              className="
                bg-white
                rounded-xl
                border
                border-slate-200
                p-5
                text-center
                text-sm
                text-slate-500
              "
            >
              Loading...
            </div>

          ) : filteredWorks.length ===
            0 ? (

            <div
              className="
                bg-white
                rounded-xl
                border
                border-slate-200
                p-6
                text-center
              "
            >

              <div className="text-3xl">
                📋
              </div>

              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                "
              >
                No work records found
              </p>

            </div>

          ) : (

            <div className="space-y-2.5">

              {filteredWorks.map(
                (work, index) => {

                  const vehicle =
                    formatVehicleName(
                      work.machine
                    );

                  return (

                    <div
                      key={
                        work.id ||
                        work.Id ||
                        index
                      }
                      className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        px-3
                        py-3
                        shadow-sm
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                      >

                        {/* ICON */}

                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            min-w-0
                          "
                        >

                          <div
                            className="
                              w-11
                              h-11
                              rounded-full
                              bg-green-50
                              flex
                              items-center
                              justify-center
                              text-2xl
                              shrink-0
                            "
                          >
                            {getVehicleIcon(
                              vehicle
                            )}
                          </div>

                          {/* NAME + WORK */}

                          <div className="min-w-0">

                            <h3
                              className="
                                text-sm
                                font-bold
                                text-slate-900
                                truncate
                              "
                            >
                              {work.customerName ||
                                customerName}
                            </h3>

                            <p
                              className="
                                mt-0.5
                                text-xs
                                text-slate-500
                                truncate
                              "
                            >
                              {vehicle}

                              <span className="mx-1">
                                •
                              </span>

                              {work.workType ||
                                "-"}
                            </p>

                          </div>

                        </div>

                        {/* AMOUNT + DATE */}

                        <div
                          className="
                            text-right
                            shrink-0
                          "
                        >

                          <p
                            className="
                              text-sm
                              font-bold
                              text-slate-900
                              whitespace-nowrap
                            "
                          >
                            {formatMoney(
                              work.amount
                            )}
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[10px]
                              text-slate-400
                              whitespace-nowrap
                            "
                          >
                            {formatDate(
                              work.date
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

// =====================================================
// SUMMARY BOX
// =====================================================

function SummaryBox({
  title,
  value,
  green = false,
  orange = false,
}) {

  let background =
    "bg-slate-50";

  let textColor =
    "text-slate-900";

  if (green) {
    background =
      "bg-green-50";

    textColor =
      "text-green-600";
  }

  if (orange) {
    background =
      "bg-orange-50";

    textColor =
      "text-orange-500";
  }

  return (
    <div
      className={`
        ${background}
        rounded-lg
        px-2
        py-2
      `}
    >

      <p
        className="
          text-[9px]
          text-slate-500
        "
      >
        {title}
      </p>

      <p
        className={`
          mt-0.5
          text-xs
          font-bold
          ${textColor}
          truncate
        `}
      >
        {value}
      </p>

    </div>
  );
}

export default CustomerDetails;