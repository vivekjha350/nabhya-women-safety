import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import {
  getCurrentLocation,
  watchUserLocation,
  stopWatchingLocation,
  type UserLocation,
} from "./LocationService";

import "leaflet/dist/leaflet.css";

/* =====================================================
   LOCATION ICON
===================================================== */

const locationIcon = L.divIcon({
  className:
    "nabhya-live-location-marker",

  html: `
    <div style="
      width:42px;
      height:42px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      background:rgba(0,229,255,0.16);
      border:2px solid #00e5ff;
      box-shadow:0 0 25px rgba(0,229,255,0.5);
      font-size:22px;
    ">
      📍
    </div>
  `,

  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

/* =====================================================
   COMPONENT
===================================================== */

function LiveTracking() {
  const [location, setLocation] =
    useState<UserLocation | null>(
      null
    );

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [tracking, setTracking] =
    useState(false);

  /* ===================================================
     START TRACKING
  =================================================== */

  useEffect(() => {
    let watchId:
      | number
      | null = null;

    const startTracking =
      async () => {
        try {
          setError("");

          const initialLocation =
            await getCurrentLocation();

          setLocation(
            initialLocation
          );

          setLastUpdated(
            new Date()
          );

          setTracking(true);

          watchId =
            watchUserLocation(
              (updatedLocation) => {
                setLocation(
                  updatedLocation
                );

                setLastUpdated(
                  new Date()
                );
              },
              (locationError) => {
                console.error(
                  "Live tracking error:",
                  locationError
                );
              }
            );
        } catch (trackingError) {
          console.error(
            trackingError
          );

          setTracking(false);

          setError(
            "Unable to access your current location. Please allow location permission."
          );
        }
      };

    startTracking();

    return () => {
      if (watchId !== null) {
        stopWatchingLocation(
          watchId
        );
      }
    };
  }, []);

  /* ===================================================
     STOP TRACKING
  =================================================== */

  const stopTracking = () => {
    setTracking(false);
  };

  /* ===================================================
     ERROR
  =================================================== */

  if (error) {
    return (
      <section className="w-full">

        <div className="mx-auto flex min-h-[500px] max-w-5xl items-center justify-center rounded-3xl border border-red-300/10 bg-red-300/[0.025] p-8">

          <div className="max-w-md text-center">

            <div className="text-5xl">
              ⚠️
            </div>

            <h2 className="mt-5 text-2xl font-black text-white">
              Location Unavailable
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] px-6 py-4 font-bold text-cyan-200"
            >
              🔄 Try Again
            </button>

          </div>

        </div>

      </section>
    );
  }

  /* ===================================================
     LOADING
  =================================================== */

  if (!location) {
    return (
      <section className="w-full">

        <div className="mx-auto flex min-h-[500px] max-w-5xl items-center justify-center rounded-3xl border border-cyan-300/10 bg-white/[0.025] p-8">

          <div className="text-center">

            <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] text-4xl">
              📍
            </div>

            <h2 className="mt-6 text-2xl font-black text-white">
              Getting Your Location
            </h2>

            <p className="mt-3 text-sm text-white/40">
              Nabhya is connecting to your
              current location...
            </p>

          </div>

        </div>

      </section>
    );
  }

  const position: [
    number,
    number
  ] = [
    location.latitude,
    location.longitude,
  ];

  /* ===================================================
     MAIN
  =================================================== */

  return (
    <section className="w-full">

      {/* LIVE STATUS */}

      <div className="mb-5 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.03] p-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <span className="relative flex h-3 w-3">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />

              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-300" />

            </span>

            <div>

              <p className="text-sm font-black tracking-[0.12em] text-emerald-200">
                LIVE TRACKING
              </p>

              <p className="mt-1 text-xs text-white/35">
                Location updates are being
                received on this device.
              </p>

            </div>

          </div>

          <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-3 py-2 text-xs font-bold text-emerald-300">
            {tracking
              ? "ACTIVE"
              : "STANDBY"}
          </span>

        </div>

      </div>

      {/* MAP */}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">

        <div className="h-[480px] w-full sm:h-[580px]">

          <MapContainer
            center={position}
            zoom={16}
            scrollWheelZoom={true}
            className="h-full w-full"
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Circle
              center={position}
              radius={
                location.accuracy
              }
              pathOptions={{
                color:
                  "#00e5ff",
                fillColor:
                  "#00e5ff",
                fillOpacity:
                  0.08,
              }}
            />

            <Marker
              position={position}
              icon={locationIcon}
            >
              <Popup>
                <strong>
                  Nabhya Live Location
                </strong>
                <br />
                Accuracy:{" "}
                {Math.round(
                  location.accuracy
                )}{" "}
                m
              </Popup>
            </Marker>

          </MapContainer>

        </div>

      </div>

      {/* LOCATION DATA */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

          <span className="text-xl">
            📍
          </span>

          <p className="mt-4 text-[10px] font-bold tracking-[0.18em] text-white/30">
            LATITUDE
          </p>

          <p className="mt-2 break-all font-mono text-sm font-bold text-white">
            {location.latitude.toFixed(
              6
            )}
          </p>

        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

          <span className="text-xl">
            🌐
          </span>

          <p className="mt-4 text-[10px] font-bold tracking-[0.18em] text-white/30">
            LONGITUDE
          </p>

          <p className="mt-2 break-all font-mono text-sm font-bold text-white">
            {location.longitude.toFixed(
              6
            )}
          </p>

        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

          <span className="text-xl">
            🎯
          </span>

          <p className="mt-4 text-[10px] font-bold tracking-[0.18em] text-white/30">
            ACCURACY
          </p>

          <p className="mt-2 font-mono text-sm font-bold text-emerald-300">
            {Math.round(
              location.accuracy
            )}{" "}
            m
          </p>

        </div>

      </div>

      {/* LAST UPDATE */}

      <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/[0.05] text-xl">
            🔄
          </div>

          <div>

            <p className="text-sm font-bold text-white">
              Last Location Update
            </p>

            <p className="mt-1 text-xs text-white/35">
              {lastUpdated
                ? lastUpdated.toLocaleTimeString()
                : "Updating..."}
            </p>

          </div>

        </div>

      </div>

      {/* NOTE */}

      <div className="mt-4 rounded-2xl border border-yellow-300/10 bg-yellow-300/[0.025] p-5">

        <div className="flex items-start gap-3">

          <span className="text-xl">
            🔒
          </span>

          <p className="m-0 text-xs leading-6 text-white/40">
            This prototype tracks your
            location on this device. It does
            not currently send a live location
            stream to another person's phone.
          </p>

        </div>

      </div>

      <button
        type="button"
        onClick={stopTracking}
        className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
      >
        Stop Tracking
      </button>

    </section>
  );
}

export default LiveTracking;