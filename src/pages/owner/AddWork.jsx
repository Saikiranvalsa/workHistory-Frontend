import { useNavigate } from "react-router-dom";

function AddWork() {
  const navigate = useNavigate();

  const vehicles = [
    {
      name: "Tractor",
      icon: "🚜",
      description: "Farming and agricultural work",
    },
    {
      name: "JCB",
      icon: "🏗️",
      description: "Construction and land work",
    },
    {
      name: "Harvester",
      icon: "🌾",
      description: "Harvesting and crop work",
    },
    {
      name: "Magic",
      icon: "🚐",
      description: "Transport and goods work",
    },
    {
      name: "Car / EV",
      icon: "🚗",
      description: "Car and electric vehicle work",
    },
    {
      name: "Other",
      icon: "🚛",
      description: "Other vehicle or machine",
    },
  ];

  const selectVehicle = (vehicle) => {
    navigate("/owner/customer-history", {
      state: {
        vehicle: vehicle.name,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-[72px] flex items-center gap-4">
            <button
              onClick={() => navigate("/owner")}
              className="w-10 h-10 rounded-full hover:bg-green-600 flex items-center justify-center text-2xl"
            >
              ←
            </button>

            <div>
              <h1 className="text-xl font-bold">Add Work</h1>
              <p className="text-xs text-green-100">
                Select vehicle type
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-10">
        <div className="mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            What vehicle did the work?
          </h2>

          <p className="text-gray-500 mt-2">
            Select the vehicle used for this work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.name}
              onClick={() => selectVehicle(vehicle)}
              className="bg-white border rounded-2xl p-5 flex items-center gap-5 text-left shadow-sm hover:shadow-md hover:border-green-500 transition"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-4xl shrink-0">
                {vehicle.icon}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {vehicle.name}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {vehicle.description}
                </p>
              </div>

              <span className="text-2xl text-green-600">
                →
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AddWork;