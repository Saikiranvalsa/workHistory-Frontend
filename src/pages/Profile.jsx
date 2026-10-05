import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/profile");

      console.log("PROFILE:", response.data);

      setProfile(response.data);
    } catch (error) {
      console.error("PROFILE LOAD ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("JWT_TOKEN");
        navigate("/login");
        return;
      }

      setError("Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET INITIALS
  // =====================================================

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("JWT_TOKEN");
    navigate("/login");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <header className="bg-green-700 text-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="h-[72px] flex items-center gap-4">

              <button
                type="button"
                onClick={() => navigate(-1)}
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
                  Profile
                </h1>

                <p className="text-xs text-green-100">
                  Your account
                </p>
              </div>

            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">

          <div
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-8
              text-center
              shadow-sm
            "
          >
            <div className="text-3xl">
              ⏳
            </div>

            <p className="text-sm text-slate-500 mt-3">
              Loading profile...
            </p>
          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">

        <header className="bg-green-700 text-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="h-[72px] flex items-center gap-4">

              <button
                type="button"
                onClick={() => navigate(-1)}
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
                  Profile
                </h1>

                <p className="text-xs text-green-100">
                  Your account
                </p>
              </div>

            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">

          <div
            className="
              bg-white
              border
              border-red-200
              rounded-2xl
              p-6
              text-center
              shadow-sm
            "
          >

            <div className="text-3xl">
              ⚠️
            </div>

            <p className="text-sm font-semibold text-slate-800 mt-3">
              {error || "Profile not found"}
            </p>

            <button
              type="button"
              onClick={loadProfile}
              className="
                mt-4
                px-5
                py-2.5
                bg-green-600
                text-white
                rounded-xl
                text-sm
                font-semibold
                hover:bg-green-700
              "
            >
              Try Again
            </button>

          </div>

        </main>

      </div>
    );
  }

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
              onClick={() => navigate(-1)}
              className="
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                text-2xl
                hover:bg-green-600
                active:scale-95
                transition
              "
            >
              ←
            </button>

            <div>
              <h1 className="text-xl font-bold">
                Profile
              </h1>

              <p className="text-xs text-green-100">
                Your account
              </p>
            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-3xl mx-auto px-4 py-6 pb-10">

        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section
          className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-5
            shadow-sm
          "
        >

          <div className="flex items-center gap-4">

            {/* AVATAR */}

            <div
              className="
                w-20
                h-20
                rounded-full
                bg-green-100
                text-green-700
                flex
                items-center
                justify-center
                text-2xl
                font-bold
                shrink-0
              "
            >
              {getInitials(profile.name)}
            </div>

            {/* USER INFO */}

            <div className="min-w-0">

              <h2
                className="
                  text-xl
                  font-bold
                  text-slate-900
                  truncate
                "
              >
                {profile.name || "User"}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                WorkHistory Account
              </p>

              {profile.username && (
                <p className="text-xs text-slate-400 mt-1">
                  @{profile.username}
                </p>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <section className="mt-5">

          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Personal Information
          </h2>

          <div
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              overflow-hidden
              shadow-sm
            "
          >

            {/* FULL NAME */}

            <div className="px-5 py-4 border-b border-slate-100">

              <p className="text-xs text-slate-400">
                FULL NAME
              </p>

              <p className="text-sm font-semibold text-slate-800 mt-1">
                {profile.name || "Not available"}
              </p>

            </div>

            {/* MOBILE NUMBER */}

            <div className="px-5 py-4 border-b border-slate-100">

              <p className="text-xs text-slate-400">
                MOBILE NUMBER
              </p>

              <p className="text-sm font-semibold text-slate-800 mt-1">
                {profile.number || "Not available"}
              </p>

            </div>

            {/* USERNAME */}

            <div className="px-5 py-4">

              <p className="text-xs text-slate-400">
                USERNAME
              </p>

              <p className="text-sm font-semibold text-slate-800 mt-1">
                {profile.username || "Not available"}
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            ACCOUNT
        ================================================= */}

        <section className="mt-5">

          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Account
          </h2>

          <div
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              overflow-hidden
              shadow-sm
            "
          >

            {/* SWITCH ROLE */}

            <button
              type="button"
              onClick={() => navigate("/role")}
              className="
                w-full
                px-5
                py-4
                flex
                items-center
                justify-between
                text-left
                border-b
                border-slate-100
                hover:bg-slate-50
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-green-50
                    flex
                    items-center
                    justify-center
                  "
                >
                  🔄
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    Switch Role
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Switch between Owner and Customer
                  </p>

                </div>

              </div>

              <span className="text-slate-400 text-xl">
                →
              </span>

            </button>

            {/* REFER & EARN */}

            <button
              type="button"
              className="
                w-full
                px-5
                py-4
                flex
                items-center
                justify-between
                text-left
                hover:bg-slate-50
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-orange-50
                    flex
                    items-center
                    justify-center
                  "
                >
                  🎁
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    Refer & Earn
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Invite friends to WorkHistory
                  </p>

                </div>

              </div>

              <span className="text-slate-400 text-xl">
                →
              </span>

            </button>

          </div>

        </section>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"
          onClick={handleLogout}
          className="
            w-full
            mt-5
            bg-white
            border
            border-red-200
            text-red-600
            rounded-2xl
            py-4
            font-semibold
            hover:bg-red-50
            active:scale-[0.99]
            transition
          "
        >
          Logout
        </button>

      </main>

    </div>
  );
}

export default Profile;