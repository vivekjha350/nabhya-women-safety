import { useEffect, useState } from "react";

import {
  getCurrentLocation,
  type UserLocation,
} from "./LocationService";

type Contact = {
  id: number;
  name: string;
  phone: string;
  relation: string;
  primary: boolean;
};

type CheckInState =
  | "idle"
  | "active"
  | "safe"
  | "expired";

function SafetyCheckIn() {
  const [duration, setDuration] =
    useState(15);

  const [remaining, setRemaining] =
    useState(0);

  const [state, setState] =
    useState<CheckInState>(
      "idle"
    );

  const [contacts, setContacts] =
    useState<Contact[]>([]);

  const [location, setLocation] =
    useState<UserLocation | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ===================================================
     LOAD CONTACTS
  =================================================== */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "nabhya_contacts"
        );

      if (!saved) {
        setContacts([]);
        return;
      }

      const parsed =
        JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setContacts(parsed);
      } else {
        setContacts([]);
      }
    } catch (contactError) {
      console.error(
        contactError
      );

      setContacts([]);
    }
  }, []);

  /* ===================================================
     COUNTDOWN
  =================================================== */

  useEffect(() => {
    if (state !== "active") {
      return;
    }

    if (remaining <= 0) {
      setState("expired");
      return;
    }

    const timer =
      window.setInterval(() => {
        setRemaining(
          (previous) =>
            previous - 1
        );
      }, 1000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [state, remaining]);

  /* ===================================================
     FORMAT TIME
  =================================================== */

  const formatTime = (
    totalSeconds: number
  ) => {
    const minutes =
      Math.floor(
        totalSeconds / 60
      )
        .toString()
        .padStart(2, "0");

    const seconds =
      (
        totalSeconds % 60
      )
        .toString()
        .padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  /* ===================================================
     START CHECK-IN
  =================================================== */

  const startCheckIn = async () => {
    if (contacts.length === 0) {
      setError(
        "Please add at least one trusted contact before starting a safety check-in."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const currentLocation =
        await getCurrentLocation();

      setLocation(
        currentLocation
      );

      setRemaining(
        duration * 60
      );

      setState("active");
    } catch (locationError) {
      console.error(
        locationError
      );

      setError(
        "Unable to access your location. Please allow location permission."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     I'M SAFE
  =================================================== */

  const markSafe = () => {
    setRemaining(0);
    setState("safe");
  };

  /* ===================================================
     CANCEL
  =================================================== */

  const cancelCheckIn = () => {
    setRemaining(0);
    setState("idle");
    setLocation(null);
    setError("");
  };

  /* ===================================================
     PRIMARY CONTACT
  =================================================== */

  const primaryContact =
    contacts.find(
      (contact) =>
        contact.primary
    ) ?? contacts[0];

  /* ===================================================
     IDLE SCREEN
  =================================================== */

  if (state === "idle") {
    return (
      <section className="w-full">

        <div className="mx-auto w-full max-w-5xl">

          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 sm:p-8">

            {/* HEADER */}

            <div className="flex items-start gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] text-3xl">
                ⏰
              </div>

              <div>

                <div className="inline-flex rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-cyan-200/80">
                  SAFETY TIMER
                </div>

                <h1 className="mt-3 text-3xl font-black text-white">
                  Safety Check-In
                </h1>

                <p className="mt-2 text-sm leading-6 text-white/40">
                  Set a timer and confirm that
                  you reached safely.
                </p>

              </div>

            </div>

            <div className="my-7 h-px bg-white/[0.07]" />

            {/* DURATION */}

            <p className="text-xs font-bold tracking-[0.18em] text-white/35">
              SELECT CHECK-IN TIME
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">

              {[15, 30, 60].map(
                (minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() =>
                      setDuration(
                        minutes
                      )
                    }
                    className={`rounded-2xl border px-4 py-5 text-center transition ${
                      duration ===
                      minutes
                        ? "border-cyan-300/30 bg-cyan-300/[0.09] text-cyan-200"
                        : "border-white/10 bg-white/[0.025] text-white/50 hover:bg-white/[0.05]"
                    }`}
                  >

                    <span className="block text-2xl font-black">
                      {minutes}
                    </span>

                    <span className="mt-1 block text-xs">
                      minutes
                    </span>

                  </button>
                )
              )}

            </div>

            {/* CONTACT */}

            <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/20 p-5">

              <p className="text-[10px] font-bold tracking-[0.18em] text-white/30">
                TRUSTED CONTACT
              </p>

              {primaryContact ? (
                <div className="mt-3 flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-300/[0.08] text-xl">
                    👤
                  </div>

                  <div>

                    <p className="font-bold text-white">
                      {
                        primaryContact.name
                      }
                    </p>

                    <p className="mt-1 text-xs text-white/35">
                      {
                        primaryContact.relation
                      }{" "}
                      •{" "}
                      {
                        primaryContact.phone
                      }
                    </p>

                  </div>

                </div>
              ) : (
                <p className="mt-3 text-sm text-yellow-200/60">
                  No trusted contact added yet.
                </p>
              )}

            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-300/15 bg-red-300/[0.05] p-4">

                <p className="text-sm leading-6 text-red-200/80">
                  ⚠️ {error}
                </p>

              </div>
            )}

            {/* START */}

            <button
              type="button"
              onClick={
                startCheckIn
              }
              disabled={loading}
              className="mt-6 flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-300 px-5 font-black text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-xl">
                ⏰
              </span>

              {loading
                ? "Getting Location..."
                : `Start ${duration}-Minute Check-In`}
            </button>

            {/* NOTE */}

            <div className="mt-5 rounded-2xl border border-yellow-300/10 bg-yellow-300/[0.025] p-5">

              <div className="flex items-start gap-3">

                <span className="text-xl">
                  ⚠️
                </span>

                <p className="m-0 text-xs leading-6 text-white/40">
                  This prototype tracks the
                  countdown on this device.
                  Automatic SMS or WhatsApp
                  notifications require a backend
                  service.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>
    );
  }

  /* ===================================================
     ACTIVE SCREEN
  =================================================== */

  if (state === "active") {
    return (
      <section className="w-full">

        <div className="mx-auto w-full max-w-5xl">

          <div className="rounded-3xl border border-cyan-300/10 bg-gradient-to-b from-cyan-300/[0.04] to-white/[0.015] p-6 text-center shadow-2xl shadow-black/20 sm:p-10">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] text-4xl">
              ⏰
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-4 py-2 text-xs font-bold tracking-[0.15em] text-emerald-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              CHECK-IN ACTIVE
            </div>

            <h1 className="mt-6 text-3xl font-black text-white sm:text-4xl">
              Safety Timer Running
            </h1>

            <p className="mt-3 text-sm text-white/40">
              Please confirm your safe arrival
              before the timer expires.
            </p>

            {/* TIMER */}

            <div className="mt-10 rounded-3xl border border-white/[0.07] bg-black/20 p-7">

              <p className="text-xs font-bold tracking-[0.25em] text-white/30">
                TIME REMAINING
              </p>

              <div className="mt-4 font-mono text-6xl font-black tracking-wider text-cyan-300 sm:text-7xl">
                {formatTime(
                  remaining
                )}
              </div>

            </div>

            {/* LOCATION */}

            {location && (
              <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-left">

                <div className="flex items-center gap-3">

                  <span className="text-xl">
                    📍
                  </span>

                  <div>

                    <p className="text-sm font-bold text-white">
                      Location Captured
                    </p>

                    <p className="mt-1 break-all text-xs text-white/35">
                      {location.latitude.toFixed(
                        6
                      )}
                      ,{" "}
                      {location.longitude.toFixed(
                        6
                      )}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* CONTACT */}

            {primaryContact && (
              <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-left">

                <p className="text-[10px] font-bold tracking-[0.18em] text-white/30">
                  CHECK-IN CONTACT
                </p>

                <p className="mt-2 font-bold text-white">
                  {primaryContact.name}
                </p>

                <p className="mt-1 text-xs text-white/35">
                  {
                    primaryContact.phone
                  }
                </p>

              </div>
            )}

            {/* ACTIONS */}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={
                  markSafe
                }
                className="min-h-[58px] rounded-2xl bg-emerald-300 px-5 font-black text-slate-950 transition hover:brightness-105"
              >
                ✅ I'm Safe
              </button>

              <button
                type="button"
                onClick={
                  cancelCheckIn
                }
                className="min-h-[58px] rounded-2xl border border-red-300/20 bg-red-300/[0.06] px-5 font-bold text-red-200 transition hover:bg-red-300/[0.1]"
              >
                Cancel Check-In
              </button>

            </div>

          </div>

        </div>

      </section>
    );
  }

  /* ===================================================
     SAFE SCREEN
  =================================================== */

  if (state === "safe") {
    return (
      <section className="w-full">

        <div className="mx-auto flex min-h-[500px] w-full max-w-5xl items-center justify-center rounded-3xl border border-emerald-300/10 bg-emerald-300/[0.025] p-8">

          <div className="max-w-md text-center">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] text-5xl">
              ✅
            </div>

            <h1 className="mt-7 text-3xl font-black text-white">
              You're Safe
            </h1>

            <p className="mt-3 text-sm leading-7 text-white/40">
              Your safety check-in has been
              completed successfully.
            </p>

            <button
              type="button"
              onClick={
                cancelCheckIn
              }
              className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 font-bold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
            >
              Start Another Check-In
            </button>

          </div>

        </div>

      </section>
    );
  }

  /* ===================================================
     EXPIRED SCREEN
  =================================================== */

  return (
    <section className="w-full">

      <div className="mx-auto flex min-h-[500px] w-full max-w-5xl items-center justify-center rounded-3xl border border-red-300/15 bg-red-300/[0.03] p-8">

        <div className="max-w-md text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-red-300/20 bg-red-300/[0.08] text-5xl">
            ⚠️
          </div>

          <h1 className="mt-7 text-3xl font-black text-white">
            Check-In Expired
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/45">
            Your safety timer expired without a
            safe confirmation.
          </p>

          <div className="mt-6 rounded-2xl border border-red-300/10 bg-red-300/[0.04] p-5 text-left">

            <p className="text-sm font-bold text-red-200">
              Need immediate help?
            </p>

            <p className="mt-2 text-xs leading-6 text-white/40">
              If you are in danger, use Nabhya's
              SOS emergency feature.
            </p>

          </div>

          <button
            type="button"
            onClick={
              cancelCheckIn
            }
            className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 font-bold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
          >
            Start New Check-In
          </button>

        </div>

      </div>

    </section>
  );
}

export default SafetyCheckIn;