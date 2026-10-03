import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function OwnerCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/owner/mycustomers");

      console.log("CUSTOMERS:", response.data);

      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("CUSTOMER ERROR:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("JWT_TOKEN");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.name || "";
    const number = customer.number || "";

    const value = search.toLowerCase().trim();

    return (
      name.toLowerCase().includes(value) ||
      number.includes(value)
    );
  });

  const openCustomer = (customer) => {
    navigate("/owner/customer-details", {
      state: {
        customer: {
          name: customer.name,
          number: customer.number,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header
        className="
          sticky
          top-0
          z-30
          bg-green-700
          text-white
          h-[70px]
          sm:h-[76px]
          px-4
          sm:px-6
          flex
          items-center
          justify-between
        "
      >
        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate("/owner")}
            className="
              text-xl
              sm:text-2xl
              px-2
              py-1
              rounded-lg
              hover:bg-green-600
            "
          >
            ←
          </button>

          <div>
            <h1
              className="
                text-lg
                sm:text-2xl
                font-bold
              "
            >
              Customers
            </h1>

            <p
              className="
                text-[10px]
                sm:text-sm
              "
            >
              Your customers
            </p>
          </div>

        </div>

        <div
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            rounded-full
            bg-white
            text-green-700
            flex
            items-center
            justify-center
            font-bold
          "
        >
          VS
        </div>
      </header>

      {/* CONTENT */}

      <main
        className="
          max-w-[900px]
          mx-auto
          px-3
          sm:px-6
          py-5
          sm:py-7
        "
      >

        {/* SEARCH */}

        <div className="mb-5">

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name or mobile..."
            className="
              w-full
              px-4
              py-3
              rounded-xl
              border
              border-slate-300
              bg-white
              text-sm
              outline-none
              focus:border-green-500
              focus:ring-1
              focus:ring-green-500
            "
          />

        </div>

        {/* LOADING */}

        {loading && (
          <div
            className="
              bg-white
              rounded-2xl
              p-8
              text-center
              text-slate-500
            "
          >
            Loading customers...
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div
            className="
              bg-red-50
              border
              border-red-200
              text-red-600
              rounded-2xl
              p-4
            "
          >
            {error}
          </div>
        )}

        {/* NO CUSTOMERS */}

        {!loading &&
          !error &&
          filteredCustomers.length === 0 && (
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
                👤
              </div>

              <h2 className="mt-3 font-semibold">
                No customers found
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                No customer matches your search.
              </p>
            </div>
          )}

        {/* CUSTOMER LIST */}

        {!loading &&
          !error &&
          filteredCustomers.length > 0 && (
            <div className="space-y-3">

              {filteredCustomers.map((customer, index) => (
                <button
                  key={`${customer.number}-${index}`}
                  onClick={() => openCustomer(customer)}
                  className="
                    w-full
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    p-4
                    sm:p-5
                    flex
                    items-center
                    gap-3
                    text-left
                    hover:border-green-400
                    hover:shadow-sm
                    transition
                  "
                >

                  {/* AVATAR */}

                  <div
                    className="
                      w-11
                      h-11
                      sm:w-13
                      sm:h-13
                      min-w-[44px]
                      rounded-full
                      bg-green-100
                      text-green-700
                      flex
                      items-center
                      justify-center
                      font-bold
                      text-lg
                    "
                  >
                    {(customer.name || "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  {/* CUSTOMER */}

                  <div className="flex-1 min-w-0">

                    <p
                      className="
                        font-bold
                        text-sm
                        sm:text-base
                        truncate
                      "
                    >
                      {customer.name}
                    </p>

                    <p
                      className="
                        text-xs
                        sm:text-sm
                        text-slate-500
                        mt-1
                      "
                    >
                      {customer.number}
                    </p>

                  </div>

                  {/* ARROW */}

                  <span
                    className="
                      text-green-600
                      text-2xl
                    "
                  >
                    ›
                  </span>

                </button>
              ))}

            </div>
          )}

      </main>
    </div>
  );
}

export default OwnerCustomers;