
import { useEffect, useState } from "react";
import "./App.css";

import TrustedContacts from "./TrustedContacts";
import SafetyMap from "./SafetyMap";
import SafetyCheckIn from "./SafetyCheckIn";
import FakeCall from "./FakeCall";
import EmergencyHelpline from "./EmergencyHelpline";
import DangerPhrase from "./DangerPhrase";
import EmergencyCenter from "./EmergencyCenter";

import {
  getCurrentLocation,
  watchUserLocation,
  stopWatchingLocation,
} from "./LocationService";

type TrustedContact = {
  id: number;
  name: string;
  phone: string;
  relation: string;
  primary: boolean;
};

type SosLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type MenuPage = "settings" | "profile" | "privacy" | "about" | null;

type ActivePage =
  | "dashboard"
  | "contacts"
  | "safety-map"
  | "check-in"
  | "fake-call"
  | "helpline"
  | "danger-phrase";

const tools: {
  title: string;
  description: string;
  icon: string;
  image: string;
  color: string;
  page: ActivePage;
  tag: string;
}[] = [
  {
    title: "Trusted Contacts",
    description: "Keep your trusted people within easy reach.",
    icon: "👥",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80",
    color: "from-violet-500/25 to-indigo-500/5",
    page: "contacts",
    tag: "YOUR PEOPLE",
  },
  {
    title: "Safety Map",
    description: "Explore nearby hospitals, police stations and safety places.",
    icon: "🗺️",
    image:
      "https://images.unsplash.com/photo-1524666041070-9fc8db6e6b45?auto=format&fit=crop&w=700&q=80",
    color: "from-cyan-500/25 to-blue-500/5",
    page: "safety-map",
    tag: "EXPLORE NEARBY",
  },
  {
    title: "Safety Check-in",
    description: "Keep track of your plans and check in when safe.",
    icon: "⏰",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80",
    color: "from-amber-500/25 to-orange-500/5",
    page: "check-in",
    tag: "STAY CONNECTED",
  },
  {
    title: "Fake Call",
    description: "Use a simulated incoming call when you need an exit.",
    icon: "📞",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",
    color: "from-purple-500/25 to-fuchsia-500/5",
    page: "fake-call",
    tag: "YOUR EXIT PLAN",
  },
  {
    title: "Danger Phrase",
    description: "Explore your discreet emergency phrase settings.",
    icon: "🎙️",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=700&q=80",
    color: "from-rose-500/25 to-red-500/5",
    page: "danger-phrase",
    tag: "DISCREET SAFETY",
  },
  {
    title: "Emergency Help",
    description: "Find emergency helplines and assistance resources.",
    icon: "🆘",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=700&q=80",
    color: "from-red-500/25 to-orange-500/5",
    page: "helpline",
    tag: "HELP WHEN NEEDED",
  },
];

function App() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [showMenu, setShowMenu] = useState(false);
  const [menuPage, setMenuPage] = useState<MenuPage>(null);
  const [sosActive, setSosActive] = useState(false);
  const [sosLocation, setSosLocation] = useState<SosLocation | null>(null);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    if (!sosActive) return;

    let watchId: number | undefined;

    try {
      watchId = watchUserLocation(
        (location) => setSosLocation(location),
        (error) => console.error("Live location error:", error)
      );
    } catch (error) {
      console.error("Unable to start live location:", error);
    }

    return () => {
      if (watchId !== undefined) stopWatchingLocation(watchId);
    };
  }, [sosActive]);

  useEffect(() => {
    const savedContacts = localStorage.getItem("nabhya_contacts");
    if (!savedContacts) return;

    try {
      setTrustedContacts(JSON.parse(savedContacts));
    } catch (error) {
      console.error("Unable to load trusted contacts:", error);
    }
  }, []);

  const checkLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setLocationReady(true);

      alert(
        `Location detected!\n\nLatitude: ${location.latitude}\nLongitude: ${location.longitude}\nAccuracy: ${Math.round(location.accuracy)} meters`
      );
    } catch (error) {
      console.error(error);
      setLocationReady(false);
      alert("Unable to get your location. Please allow location permission.");
    }
  };

  const activateSOS = async () => {
    setShowConfirmation(false);

    try {
      const location = await getCurrentLocation();
      setSosLocation(location);
      setLocationReady(true);
      setSosActive(true);
    } catch (error) {
      console.error(error);
      alert(
        "SOS started, but location could not be detected. Please allow location access."
      );
      setSosLocation(null);
      setSosActive(true);
    }
  };

  const endSOS = () => {
    setSosActive(false);
    setSosLocation(null);
  };

  const goToDashboard = () => {
    setActivePage("dashboard");
    setShowMenu(false);
    setMenuPage(null);
  };

  const openMenuPage = (page: MenuPage) => {
    setShowMenu(false);
    setMenuPage(page);
  };

  const closeMenuPage = () => setMenuPage(null);

  
    trustedContacts.length > 0 ? "CONNECTED" : "NOT SET";
  const trackingStatus = sosActive ? "ACTIVE" : "STANDBY";

  const pageTitle: Record<ActivePage, string> = {
    dashboard: "Dashboard",
    contacts: "Trusted Contacts",
    "safety-map": "Safety Map",
    "check-in": "Safety Check-in",
    "fake-call": "Fake Call",
    helpline: "Emergency Help",
    "danger-phrase": "Danger Phrase",
  };

  const renderActivePage = () => {
    switch (activePage) {
      case "contacts":
        return <TrustedContacts />;
      case "safety-map":
        return <SafetyMap />;
      case "check-in":
        return <SafetyCheckIn />;
      case "fake-call":
        return <FakeCall />;
      case "helpline":
        return <EmergencyHelpline />;
      case "danger-phrase":
        return <DangerPhrase />;
      default:
        return null;
    }
  };

  if (menuPage) {
    const menuContent: Record<
      Exclude<MenuPage, null>,
      { eyebrow: string; title: string; description: string; icon: string }
    > = {
      settings: {
        eyebrow: "PREFERENCES",
        title: "Settings",
        description: "Manage your safety system preferences.",
        icon: "⚙️",
      },
      profile: {
        eyebrow: "PERSONAL SAFETY",
        title: "Safety Profile",
        description: "Your current emergency readiness information.",
        icon: "🛡️",
      },
      privacy: {
        eyebrow: "DATA PROTECTION",
        title: "Privacy & Security",
        description: "Understand how your safety data is used.",
        icon: "🔐",
      },
      about: {
        eyebrow: "OUR MISSION",
        title: "About Nabhya",
        description:
          "A safety-focused space for awareness, preparation and emergency resources.",
        icon: "💜",
      },
    };

    const content = menuContent[menuPage];

    return (
      <div className="min-h-screen bg-[#050914] text-white">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050914]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <button
              type="button"
              onClick={goToDashboard}
              className="flex items-center gap-3 text-left"
            >
              <span className="text-3xl">🛡️</span>
              <span>
                <span className="block text-lg font-black">Nabhya</span>
                <span className="text-[10px] tracking-[0.25em] text-cyan-200/60">
                  WOMEN SAFETY
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={closeMenuPage}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:border-cyan-300/40"
            >
              ← Back
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-10 sm:py-16">
          <div className="nabhya-hero p-7 sm:p-12">
            <span className="text-xs font-bold tracking-[0.3em] text-cyan-100/70">
              {content.eyebrow}
            </span>
            <div className="mt-5 text-5xl">{content.icon}</div>
            <h1 className="mt-4 text-4xl font-black sm:text-5xl">
              {content.title}
            </h1>
            <p className="mt-4 max-w-xl leading-7 text-white/70">
              {content.description}
            </p>
          </div>

          {menuPage === "settings" && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="nabhya-card p-6">
                <div className="text-3xl">📍</div>
                <h2 className="mt-4 text-xl font-bold">Location Access</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Check whether your device can provide a GPS location.
                </p>
                <button
                  type="button"
                  onClick={checkLocation}
                  className="mt-5 rounded-xl border border-cyan-300/30 px-4 py-3 font-bold text-cyan-100 hover:bg-cyan-300/10"
                >
                  Test Location
                </button>
              </div>
              <div className="nabhya-card p-6">
                <div className="text-3xl">🔔</div>
                <h2 className="mt-4 text-xl font-bold">Emergency Alerts</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Automatic notifications are not enabled by this prototype.
                </p>
                <div className="mt-5 text-sm text-amber-200">
                  Backend integration required
                </div>
              </div>
            </div>
          )}

          {menuPage === "profile" && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="nabhya-card p-6">
                <p className="text-sm text-slate-400">TRUSTED CONTACTS</p>
                <p className="mt-2 text-3xl font-black text-cyan-200">
                  {trustedContacts.length}
                </p>
              </div>
              <div className="nabhya-card p-6">
                <p className="text-sm text-slate-400">LOCATION</p>
                <p className="mt-2 text-xl font-bold">
                  {locationReady ? "Available" : "Not checked"}
                </p>
              </div>
              <div className="nabhya-card p-6">
                <p className="text-sm text-slate-400">SOS MODE</p>
                <p className="mt-2 text-xl font-bold text-emerald-200">
                  {sosActive ? "ACTIVE" : "STANDBY"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeMenuPage();
                  setActivePage("contacts");
                }}
                className="rounded-2xl border border-cyan-300/20 p-4 text-left font-bold text-cyan-100 hover:bg-cyan-300/10 sm:col-span-3"
              >
                Manage Trusted Contacts →
              </button>
            </div>
          )}

          {menuPage === "privacy" && (
            <div className="mt-6 grid gap-4">
              <div className="nabhya-card p-6">
                <h2 className="text-xl font-bold">🔐 Local Safety Data</h2>
                <p className="mt-3 leading-7 text-slate-300">
                  Trusted contact information is stored locally in your browser
                  for this prototype. Anyone with access to the same browser
                  profile may be able to access that data.
                </p>
              </div>
              <div className="nabhya-card p-6">
                <h2 className="text-xl font-bold">📍 Location Privacy</h2>
                <p className="mt-3 leading-7 text-slate-300">
                  Browser location permission is required for GPS features.
                  Location sharing to other devices requires additional
                  infrastructure.
                </p>
              </div>
            </div>
          )}

          {menuPage === "about" && (
            <div className="nabhya-card mt-6 p-7 sm:p-10">
              <h2 className="text-2xl font-black">Safety. Awareness. Empowerment.</h2>
              <p className="mt-4 max-w-2xl leading-8 text-slate-300">
                Nabhya brings safety maps, trusted contacts, check-ins, a
                simulated fake call, emergency helplines and danger phrase
                tools into one interface.
              </p>
              <p className="mt-4 text-sm text-slate-400">
                Prototype version 1.0 · Emergency delivery must be configured
                and tested separately.
              </p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 top-48 h-96 w-96 rounded-full bg-teal-400/[0.06] blur-[120px]" />
        <div className="absolute -right-40 top-96 h-96 w-96 rounded-full bg-indigo-500/[0.10] blur-[120px]" />
      </div>

      <header className="sticky top-0 z-[1000] border-b border-white/[0.08] bg-[#050914]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <button
            type="button"
            onClick={goToDashboard}
            className="flex items-center gap-3 text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-cyan-300/20 to-indigo-400/10 text-2xl">
              🛡️
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">
                Nabhya
              </span>
              <span className="block text-[9px] font-bold tracking-[0.25em] text-cyan-100/55">
                WOMEN SAFETY SYSTEM
              </span>
            </span>
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] px-4 py-2 text-xs font-bold text-emerald-100 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            SAFETY TOOLS READY
          </div>

          <button
            type="button"
            onClick={() => setShowMenu(true)}
            aria-label="Open command menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xl hover:border-cyan-200/40 hover:bg-cyan-200/10"
          >
            ☰
          </button>
        </div>
      </header>

      {activePage !== "dashboard" ? (
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-10">
          <button
            type="button"
            onClick={goToDashboard}
            className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-200/30"
          >
            ← Back to Dashboard
          </button>
          <div className="mb-6">
            <p className="text-xs font-bold tracking-[0.25em] text-cyan-100/60">
              NABHYA SAFETY TOOLS
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              {pageTitle[activePage]}
            </h1>
          </div>
          {renderActivePage()}
        </main>
      ) : (
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
          {/* HERO */}
          <section className="nabhya-hero nabhya-animate-in mb-8 min-h-[350px] p-6 sm:min-h-[410px] sm:p-12 lg:p-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-xs font-bold tracking-wide text-white/90 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                YOUR PERSONAL SAFETY SPACE
              </div>

              <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                Your safety.
                <br />
                <span className="nabhya-gradient-text">Your strength.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                Prepare with confidence. Keep your trusted people close and
                your safety tools within reach.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  className="rounded-xl border border-red-300/40 bg-red-500 px-5 py-3.5 font-extrabold text-white shadow-lg shadow-red-950/30 hover:bg-red-400"
                >
                  🚨 Emergency SOS
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage("safety-map")}
                  className="rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 font-bold text-white backdrop-blur hover:bg-white/15"
                >
                  Explore Safety Map →
                </button>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/70">
                <span>✓ Safety resources</span>
                <span>✓ Location tools</span>
                <span>✓ Trusted contacts</span>
              </div>
            </div>
          </section>

          {/* STATUS */}
          <section className="mb-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-cyan-100/55">
                  AT A GLANCE
                </p>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Your safety overview
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                Personal dashboard
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="nabhya-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🛡️</span>
                  <span className="text-xs text-emerald-200">READY</span>
                </div>
                <p className="mt-4 text-sm text-slate-400">Safety tools</p>
                <p className="mt-1 text-lg font-bold text-emerald-100">
                  Available
                </p>
              </div>

              <button
                type="button"
                onClick={checkLocation}
                className="nabhya-card p-5 text-left hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📍</span>
                  <span className="text-xs text-cyan-100">GPS</span>
                </div>
                <p className="mt-4 text-sm text-slate-400">Device location</p>
                <p className="mt-1 text-lg font-bold text-cyan-100">
                  {locationReady ? "Available" : "Check location"}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActivePage("contacts")}
                className="nabhya-card p-5 text-left hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">👥</span>
                  <span className="text-xs text-violet-100">NETWORK</span>
                </div>
                <p className="mt-4 text-sm text-slate-400">Trusted contacts</p>
                <p className="mt-1 text-lg font-bold text-violet-100">
                  {trustedContacts.length > 0
                    ? `${trustedContacts.length} saved`
                    : "Not configured"}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActivePage("safety-map")}
                className="nabhya-card p-5 text-left hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🗺️</span>
                  <span className="text-xs text-teal-100">MAP</span>
                </div>
                <p className="mt-4 text-sm text-slate-400">Tracking mode</p>
                <p className="mt-1 text-lg font-bold text-teal-100">
                  {trackingStatus}
                </p>
              </button>
            </div>
          </section>

          {/* FEATURE CARDS */}
          <section className="mb-10">
            <div className="mb-5">
              <p className="text-xs font-bold tracking-[0.25em] text-cyan-100/55">
                EXPLORE NABHYA
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Your safety toolkit
              </h2>
              <p className="mt-2 max-w-xl leading-7 text-slate-400">
                Practical tools to help you plan ahead and find safety
                resources when you need them.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool, index) => (
                <button
                  type="button"
                  key={tool.page}
                  onClick={() => setActivePage(tool.page)}
                  className={`nabhya-card nabhya-animate-in group overflow-hidden text-left nabhya-delay-${Math.min(index % 3 + 1, 3)} hover:-translate-y-1`}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={tool.image}
                      alt=""
                      loading="lazy"
                      className="nabhya-image"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${tool.color} from-[#071020] via-[#071020]/15 to-transparent`}
                    />
                    <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] text-white backdrop-blur">
                      {tool.tag}
                    </div>
                    <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/35 text-2xl backdrop-blur">
                      {tool.icon}
                    </div>
                    <span className="absolute bottom-5 right-4 text-sm text-white/80 transition-transform group-hover:translate-x-1">
                      ↗
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-extrabold">{tool.title}</h3>
                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
                      {tool.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4 text-sm font-bold text-cyan-100">
                      Open tool <span>→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* EMERGENCY BANNER */}
          <section className="mb-8 overflow-hidden rounded-3xl border border-rose-300/15 bg-gradient-to-br from-rose-500/[0.12] via-[#11172a] to-indigo-500/[0.10] p-6 sm:p-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold tracking-[0.25em] text-rose-200/70">
                  EMERGENCY RESOURCES
                </p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  Help should be easy to find.
                </h2>
                <p className="mt-3 leading-7 text-slate-300">
                  Open the emergency resources page to view available helplines
                  and assistance information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage("helpline")}
                className="shrink-0 rounded-xl border border-rose-200/25 bg-rose-400/10 px-5 py-3.5 font-bold text-rose-100 hover:bg-rose-400/20"
              >
                Emergency Help →
              </button>
            </div>
          </section>

          <footer className="border-t border-white/[0.08] py-7 text-center">
            <div className="font-black tracking-wide text-white/80">
              NABHYA
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Safety · Awareness · Empowerment
            </p>
            <p className="mt-2 text-xs text-slate-600">
              A safety-support prototype. Verify emergency services and
              notification delivery before relying on them.
            </p>
          </footer>
        </main>
      )}

      {/* SOS CONFIRMATION */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-title"
            className="w-full max-w-md rounded-3xl border border-red-300/20 bg-[#0b1120] p-7 shadow-2xl shadow-red-950/30"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-3xl">
              🚨
            </div>
            <p className="text-xs font-bold tracking-[0.2em] text-red-200/70">
              EMERGENCY CONTROL
            </p>
            <h2 id="sos-title" className="mt-2 text-2xl font-black">
              Do you need immediate help?
            </h2>
            <p className="mt-3 leading-7 text-slate-300">
              Activate SOS only when you need emergency assistance. Nabhya
              will start emergency mode and try to access your current
              location.
            </p>
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 font-semibold hover:bg-white/[0.08]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={activateSOS}
                className="flex-1 rounded-xl bg-red-600 px-4 py-4 font-extrabold hover:bg-red-500"
              >
                Activate SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE SOS */}
      {sosActive && (
        <div className="fixed inset-0 z-[5000] overflow-y-auto bg-[#080a0f]">
          <EmergencyCenter
            latitude={sosLocation?.latitude ?? null}
            longitude={sosLocation?.longitude ?? null}
            accuracy={sosLocation?.accuracy ?? null}
            contactsCount={trustedContacts.length}
            onEndSOS={endSOS}
          />
        </div>
      )}

      {/* COMMAND MENU */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[6000] bg-black/70 backdrop-blur-sm"
          onClick={() => setShowMenu(false)}
        >
          <aside
            aria-label="Command menu"
            className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto border-l border-white/10 bg-[#080e1b] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-cyan-100/60">
                  NABHYA
                </p>
                <h2 className="mt-1 text-2xl font-black">Command Menu</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.05] p-4">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <div>
                  <p className="font-bold text-emerald-100">
                    SAFETY OVERVIEW
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {trustedContacts.length} trusted contacts ·{" "}
                    {locationReady ? "Location checked" : "Location not checked"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {(
                [
                  ["settings", "⚙️", "Settings", "Location and preferences"],
                  ["profile", "🛡️", "Safety Profile", "Your readiness overview"],
                  ["privacy", "🔐", "Privacy & Security", "Understand local data"],
                  ["about", "💜", "About Nabhya", "Our safety mission"],
                ] as const
              ).map(([page, icon, title, description]) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => openMenuPage(page)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left hover:border-cyan-200/25 hover:bg-white/[0.05]"
                >
                  <span className="text-2xl">{icon}</span>
                  <span>
                    <span className="block font-bold">{title}</span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {description}
                    </span>
                  </span>
                  <span className="ml-auto text-slate-500">→</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setActivePage("helpline");
                }}
                className="flex w-full items-center gap-4 rounded-2xl border border-rose-200/15 bg-rose-400/[0.04] p-4 text-left hover:bg-rose-400/[0.09]"
              >
                <span className="text-2xl">🆘</span>
                <span>
                  <span className="block font-bold">Emergency Help</span>
                  <span className="mt-1 block text-xs text-slate-400">
                    Helplines and resources
                  </span>
                </span>
                <span className="ml-auto text-slate-500">→</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMenu(false)}
              className="mt-8 w-full rounded-xl border border-white/10 px-5 py-4 text-sm font-bold text-slate-300 hover:bg-white/[0.05]"
            >
              Close Menu
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
