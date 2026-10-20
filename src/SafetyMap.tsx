
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";

import {
  getCurrentLocation,
  watchUserLocation,
  stopWatchingLocation,
  type UserLocation,
} from "./LocationService";
import "leaflet/dist/leaflet.css";

type SafetyPlace = {
  id: number;
  name: string;
  type: "police" | "hospital" | "public";
  latitude: number;
  longitude: number;
};

type FilterType = "all" | "police" | "hospital" | "public";


function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );
}

function MapViewController({
  position,
}: {
  position: UserLocation;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [position.latitude, position.longitude],
      Math.max(map.getZoom(), 14),
      { animate: true }
    );
  }, [map, position.latitude, position.longitude]);

  return null;
}

function SafetyMap() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [places, setPlaces] = useState<SafetyPlace[]>([]);
  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>("all");

  const [loading, setLoading] = useState(true);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const trackingRef = useRef(false);
  const mountedRef = useRef(false);

  const stopTracking = useCallback(() => {
    trackingRef.current = false;

    if (watchIdRef.current !== null) {
      stopWatchingLocation(watchIdRef.current);
      watchIdRef.current = null;
    }

    setTracking(false);
  }, []);

  const loadNearbyPlaces = useCallback(
    async (latitude: number, longitude: number) => {
      setPlacesLoading(true);

      try {
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="police"](around:5000,${latitude},${longitude});
            way["amenity"="police"](around:5000,${latitude},${longitude});
            relation["amenity"="police"](around:5000,${latitude},${longitude});

            node["amenity"="hospital"](around:5000,${latitude},${longitude});
            way["amenity"="hospital"](around:5000,${latitude},${longitude});
            relation["amenity"="hospital"](around:5000,${latitude},${longitude});

            node["amenity"="pharmacy"](around:5000,${latitude},${longitude});
            node["amenity"="fire_station"](around:5000,${latitude},${longitude});
            node["amenity"="school"](around:5000,${latitude},${longitude});
            node["amenity"="community_centre"](around:5000,${latitude},${longitude});
          );
          out center tags;
        `;

        const response = await fetch(
          "https://overpass-api.de/api/interpreter",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `data=${encodeURIComponent(query)}`,
          }
        );

        if (!response.ok) {
          throw new Error("Nearby places request failed");
        }

        const data = await response.json();
        const loaded: SafetyPlace[] = [];

        for (const element of data.elements ?? []) {
          const tags = element.tags ?? {};
          const lat = element.lat ?? element.center?.lat;
          const lon = element.lon ?? element.center?.lon;

          if (typeof lat !== "number" || typeof lon !== "number") {
            continue;
          }

          let type: SafetyPlace["type"];

          if (tags.amenity === "police") {
            type = "police";
          } else if (tags.amenity === "hospital") {
            type = "hospital";
          } else {
            type = "public";
          }

          loaded.push({
            id: Number(element.id),
            name:
              tags.name ||
              (type === "police"
                ? "Police Station"
                : type === "hospital"
                ? "Hospital"
                : tags.amenity === "pharmacy"
                ? "Pharmacy"
                : tags.amenity === "fire_station"
                ? "Fire Station"
                : "Public Safety Place"),
            type,
            latitude: lat,
            longitude: lon,
          });
        }

        const unique = loaded.filter(
          (place, index, array) =>
            array.findIndex((item) => item.id === place.id) === index
        );

        unique.sort(
          (a, b) =>
            calculateDistance(
              latitude,
              longitude,
              a.latitude,
              a.longitude
            ) -
            calculateDistance(
              latitude,
              longitude,
              b.latitude,
              b.longitude
            )
        );

        if (mountedRef.current) {
          setPlaces(unique.slice(0, 50));
        }
      } catch (err) {
        console.error("Nearby places error:", err);

        if (mountedRef.current) {
          setPlaces([]);
        }
      } finally {
        if (mountedRef.current) {
          setPlacesLoading(false);
        }
      }
    },
    []
  );

  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const current = await getCurrentLocation();

      if (!mountedRef.current) return;

      setLocation(current);
      setLastUpdated(new Date());

      await loadNearbyPlaces(
        current.latitude,
        current.longitude
      );
    } catch (err) {
      console.error("Location error:", err);

      if (mountedRef.current) {
        setError(
          "Location nahi mil paayi. Browser mein location permission allow karke dobara try karo."
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [loadNearbyPlaces]);

  const startTracking = useCallback(async () => {
    if (trackingRef.current) return;

    setError("");

    try {
      const initial = await getCurrentLocation();

      if (!mountedRef.current) return;

      setLocation(initial);
      setLastUpdated(new Date());

      trackingRef.current = true;
      setTracking(true);

      const id = watchUserLocation(
        (updatedLocation) => {
          if (!mountedRef.current || !trackingRef.current) return;

          setLocation(updatedLocation);
          setLastUpdated(new Date());
        },
        (locationError) => {
          console.error("Live tracking error:", locationError);

          if (mountedRef.current) {
            setError(
              "Live location update mein dikkat aa rahi hai. GPS permission aur device location check karo."
            );
          }
        }
      );

      watchIdRef.current = id;
    } catch (err) {
      console.error("Unable to start tracking:", err);

      if (mountedRef.current) {
        setError(
          "Live tracking start nahi ho paayi. Location permission check karke dobara try karo."
        );
      }

      trackingRef.current = false;
      setTracking(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refreshLocation();

    return () => {
      mountedRef.current = false;
      trackingRef.current = false;

      if (watchIdRef.current !== null) {
        stopWatchingLocation(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [refreshLocation]);

  const filteredPlaces =
    selectedFilter === "all"
      ? places
      : places.filter((place) => place.type === selectedFilter);

  const openDirections = (place: SafetyPlace) =>
    `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

  if (loading && !location) {
    return (
      <section className="flex min-h-[400px] items-center justify-center rounded-3xl border border-cyan-300/10 bg-white/[0.025] p-8">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/5 text-4xl">
            📍
          </div>
          <h2 className="mt-6 text-2xl font-black text-white">
            Detecting Your Location
          </h2>
          <p className="mt-3 text-sm text-white/40">
            Nabhya is loading your map and nearby safety places...
          </p>
        </div>
      </section>
    );
  }

  if (!location) {
    return (
      <section className="flex min-h-[400px] items-center justify-center rounded-3xl border border-red-300/10 bg-red-300/[0.025] p-8">
        <div className="max-w-md text-center">
          <div className="text-5xl">📍</div>
          <h2 className="mt-5 text-2xl font-black text-white">
            Location Unavailable
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/50">
            {error || "Current location detect nahi ho paayi."}
          </p>
          <button
            type="button"
            onClick={() => void refreshLocation()}
            className="mt-6 rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-5 py-3 font-bold text-cyan-200"
          >
            🔄 Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6">
      {/* TRACKING STATUS */}
      <div className="rounded-3xl border border-cyan-300/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-cyan-300/60">
              LOCATION COMMAND
            </p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Safety Map &amp; Live Tracking
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Apni current location aur aas-paas ke safety resources ek hi screen par dekho.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`rounded-full border px-3 py-2 font-bold ${
                  tracking
                    ? "border-emerald-300/20 bg-emerald-300/5 text-emerald-300"
                    : "border-yellow-300/20 bg-yellow-300/5 text-yellow-200"
                }`}
              >
                {tracking ? "● LIVE TRACKING ACTIVE" : "● TRACKING STANDBY"}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-2 text-white/45">
                GPS accuracy: {Math.round(location.accuracy)} m
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!tracking ? (
              <button
                type="button"
                onClick={() => void startTracking()}
                className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-3 font-bold text-emerald-200 hover:bg-emerald-300/15"
              >
                ▶ Start Tracking
              </button>
            ) : (
              <button
                type="button"
                onClick={stopTracking}
                className="rounded-xl border border-red-300/20 bg-red-300/5 px-5 py-3 font-bold text-red-200 hover:bg-red-300/10"
              >
                ■ Stop Tracking
              </button>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={() => void refreshLocation()}
              className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-5 py-3 font-bold text-cyan-200 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "↻ Refresh Location"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-yellow-300/10 bg-yellow-300/5 p-3 text-sm text-yellow-100/80">
            ⚠️ {error}
          </p>
        )}
      </div>

      {/* LOCATION STATS */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <span className="text-xl">📍</span>
          <p className="mt-3 text-[10px] font-bold tracking-[0.18em] text-white/35">
            LATITUDE
          </p>
          <p className="mt-2 break-all font-mono text-sm font-bold text-white">
            {location.latitude.toFixed(6)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <span className="text-xl">🌐</span>
          <p className="mt-3 text-[10px] font-bold tracking-[0.18em] text-white/35">
            LONGITUDE
          </p>
          <p className="mt-2 break-all font-mono text-sm font-bold text-white">
            {location.longitude.toFixed(6)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <span className="text-xl">🔄</span>
          <p className="mt-3 text-[10px] font-bold tracking-[0.18em] text-white/35">
            LAST UPDATE
          </p>
          <p className="mt-2 font-mono text-sm font-bold text-emerald-300">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "Waiting..."}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "🗺️ All Places"],
            ["police", "👮 Police"],
            ["hospital", "🏥 Hospitals"],
            ["public", "🏪 Other Safety Places"],
          ] as [FilterType, string][]
        ).map(([filter, label]) => (
          <button
            key={filter}
            type="button"
            onClick={() => setSelectedFilter(filter)}
            className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
              selectedFilter === filter
                ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                : "border-white/10 bg-white/[0.025] text-white/55 hover:bg-white/[0.05]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {placesLoading && (
        <p className="rounded-xl border border-cyan-300/10 bg-cyan-300/5 p-3 text-sm text-cyan-200/80">
          🔎 Finding nearby safety places...
        </p>
      )}

      {/* COMBINED MAP */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
        <div className="h-[450px] w-full sm:h-[600px]">
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={15}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapViewController position={location} />

            <Circle
              center={[location.latitude, location.longitude]}
              radius={location.accuracy}
              pathOptions={{
                color: "#00e5ff",
                fillColor: "#00e5ff",
                fillOpacity: 0.08,
              }}
            />

            <CircleMarker
              center={[location.latitude, location.longitude]}
              radius={10}
              pathOptions={{
                color: "#ffffff",
                weight: 3,
                fillColor: "#2563eb",
                fillOpacity: 1,
              }}
            >
              <Popup>
                <strong>📍 Your Current Location</strong>
                <br />
                Accuracy: {Math.round(location.accuracy)} m
              </Popup>
            </CircleMarker>

            {filteredPlaces.map((place) => {
              const distance = calculateDistance(
                location.latitude,
                location.longitude,
                place.latitude,
                place.longitude
              );

              const isPolice = place.type === "police";
              const isHospital = place.type === "hospital";
              const emoji = isPolice ? "👮" : isHospital ? "🏥" : "🏪";
              const color = isPolice
                ? "#60a5fa"
                : isHospital
                ? "#f87171"
                : "#fbbf24";

              return (
                <CircleMarker
                  key={`${place.type}-${place.id}`}
                  center={[place.latitude, place.longitude]}
                  radius={8}
                  pathOptions={{
                    color,
                    weight: 3,
                    fillColor: color,
                    fillOpacity: 0.9,
                  }}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <div className="text-lg">{emoji}</div>
                      <strong>{place.name}</strong>
                      <br />
                      <span>{distance.toFixed(2)} km away</span>
                      <br />
                      <a
                        href={openDirections(place)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        🧭 Get Directions
                      </a>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* NEARBY PLACES */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-white">
              Nearby Safety Places
            </h3>
            <p className="mt-1 text-sm text-white/40">
              {filteredPlaces.length} places found in the loaded results
            </p>
          </div>
          <span className="rounded-full border border-cyan-300/10 bg-cyan-300/5 px-3 py-2 text-xs text-cyan-200/70">
            Within ~5 km search
          </span>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center text-sm text-white/45">
            {placesLoading
              ? "Nearby places load ho rahi hain..."
              : "Is category mein nearby places nahi mile. Refresh karke dobara try karo."}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredPlaces.slice(0, 12).map((place) => {
              const distance = calculateDistance(
                location.latitude,
                location.longitude,
                place.latitude,
                place.longitude
              );

              const emoji =
                place.type === "police"
                  ? "👮"
                  : place.type === "hospital"
                  ? "🏥"
                  : "🏪";

              return (
                <div
                  key={`${place.type}-${place.id}`}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-xl">
                      {emoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-bold text-white">
                        {place.name}
                      </h4>
                      <p className="mt-1 text-xs text-white/40">
                        {distance.toFixed(2)} km away
                      </p>
                    </div>

                    <a
                      href={openDirections(place)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-cyan-300/15 bg-cyan-300/5 px-3 py-2 text-xs font-bold text-cyan-200"
                    >
                      Route
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PRIVACY NOTE */}
      <div className="rounded-2xl border border-yellow-300/10 bg-yellow-300/[0.025] p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <p className="text-xs leading-6 text-white/45">
            Live tracking updates this device's map while tracking is active.
            This prototype does not transmit your live location to another
            person's phone. Nearby places depend on OpenStreetMap data and
            network availability; always verify emergency resources before
            relying on them.
          </p>
        </div>
      </div>
    </section>
  );
}

export default SafetyMap;
