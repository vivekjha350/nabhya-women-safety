import { useEffect, useState } from "react";

type CallState =
  | "setup"
  | "ringing"
  | "connected";

function FakeCall() {
  const [callState, setCallState] =
    useState<CallState>("setup");

  const [callerName, setCallerName] =
    useState("Mom");

  const [callerNumber, setCallerNumber] =
    useState("+91 XXXXX XXXXX");

  const [callSeconds, setCallSeconds] =
    useState(0);

  /* =====================================================
     CALL TIMER
  ===================================================== */

  useEffect(() => {
    if (callState !== "connected") {
      return;
    }

    const timer = window.setInterval(() => {
      setCallSeconds((previous) => previous + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [callState]);

  /* =====================================================
     START FAKE CALL
  ===================================================== */

  const startFakeCall = () => {
    setCallSeconds(0);
    setCallState("ringing");
  };

  /* =====================================================
     ANSWER
  ===================================================== */

  const answerCall = () => {
    setCallSeconds(0);
    setCallState("connected");
  };

  /* =====================================================
     END / DECLINE
  ===================================================== */

  const endCall = () => {
    setCallSeconds(0);
    setCallState("setup");
  };

  /* =====================================================
     FORMAT TIMER
  ===================================================== */

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

    const remainingSeconds = (seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  /* =====================================================
     INITIALS
  ===================================================== */

  const getInitials = (name: string) => {
    const words = name
      .trim()
      .split(" ")
      .filter(Boolean);

    if (words.length === 0) {
      return "N";
    }

    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  };

  /* =====================================================
     SETUP SCREEN
  ===================================================== */

  if (callState === "setup") {
    return (
      <section className="w-full">
        <div className="mx-auto w-full max-w-4xl">

          {/* HEADER CARD */}

          <div className="overflow-hidden rounded-3xl border border-cyan-300/10 bg-white/[0.025] shadow-2xl shadow-black/20">

            <div className="p-6 sm:p-8">

              {/* TITLE */}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] text-3xl">
                  📞
                </div>

                <div className="min-w-0">

                  <div className="inline-flex rounded-full border border-purple-300/15 bg-purple-300/[0.05] px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-purple-200/80">
                    DISCREET SAFETY TOOL
                  </div>

                  <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Fake Call
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                    Create a simulated incoming call
                    when you need a simple reason to
                    leave an uncomfortable situation.
                  </p>

                </div>

              </div>

              {/* DIVIDER */}

              <div className="my-7 h-px bg-white/[0.07]" />

              {/* FORM */}

              <div className="grid gap-5 sm:grid-cols-2">

                {/* CALLER NAME */}

                <div>
                  <label
                    htmlFor="fake-call-name"
                    className="mb-2 block text-xs font-bold tracking-[0.15em] text-white/45"
                  >
                    CALLER NAME
                  </label>

                  <input
                    id="fake-call-name"
                    type="text"
                    value={callerName}
                    onChange={(event) =>
                      setCallerName(
                        event.target.value
                      )
                    }
                    placeholder="Mom"
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-base text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/40 focus:bg-black/35 focus:ring-4 focus:ring-cyan-300/[0.05]"
                  />
                </div>

                {/* PHONE NUMBER */}

                <div>
                  <label
                    htmlFor="fake-call-number"
                    className="mb-2 block text-xs font-bold tracking-[0.15em] text-white/45"
                  >
                    PHONE NUMBER
                  </label>

                  <input
                    id="fake-call-number"
                    type="text"
                    value={callerNumber}
                    onChange={(event) =>
                      setCallerNumber(
                        event.target.value
                      )
                    }
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-base text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/40 focus:bg-black/35 focus:ring-4 focus:ring-cyan-300/[0.05]"
                  />
                </div>

              </div>

              {/* CALL PREVIEW */}

              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/20 p-4 sm:p-5">

                <p className="mb-4 text-[10px] font-bold tracking-[0.18em] text-white/30">
                  CALL PREVIEW
                </p>

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/80 to-blue-600/80 text-lg font-black text-white shadow-lg shadow-cyan-500/10">
                    {getInitials(
                      callerName || "N"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-lg font-bold text-white">
                      {callerName || "Caller Name"}
                    </p>

                    <p className="mt-1 truncate text-sm text-white/40">
                      {callerNumber ||
                        "+91 XXXXX XXXXX"}
                    </p>

                  </div>

                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/[0.07] text-xl sm:flex">
                    📞
                  </div>

                </div>

              </div>

              {/* START BUTTON */}

              <button
                type="button"
                onClick={startFakeCall}
                disabled={!callerName.trim()}
                className="mt-5 flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-300 px-5 font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <span className="text-xl">
                  📞
                </span>

                Start Fake Call
              </button>

              {/* SECURITY NOTE */}

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">

                <span className="text-lg">
                  🔒
                </span>

                <p className="m-0 text-xs leading-6 text-white/40">
                  This is a simulated call. It does
                  not contact the person whose name
                  or number you enter.
                </p>

              </div>

            </div>

          </div>

        </div>
      </section>
    );
  }

  /* =====================================================
     RINGING SCREEN
  ===================================================== */

  if (callState === "ringing") {
    return (
      <section className="w-full">
        <div className="mx-auto flex min-h-[620px] w-full max-w-4xl items-center justify-center rounded-3xl border border-yellow-300/10 bg-gradient-to-b from-yellow-300/[0.04] to-white/[0.015] p-6 shadow-2xl shadow-black/20 sm:p-10">

          <div className="w-full max-w-xl text-center">

            {/* STATUS */}

            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/15 bg-yellow-300/[0.06] px-4 py-2 text-xs font-bold tracking-[0.15em] text-yellow-200/80">

              <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.8)]" />

              INCOMING CALL

            </div>

            {/* AVATAR */}

            <div className="mx-auto mt-10 flex h-28 w-28 items-center justify-center rounded-full border-2 border-cyan-300/20 bg-gradient-to-br from-cyan-400/80 to-blue-700/80 text-4xl font-black text-white shadow-[0_0_45px_rgba(0,229,255,0.15)] animate-pulse">
              {getInitials(
                callerName || "N"
              )}
            </div>

            {/* CALLER */}

            <h1 className="mt-7 text-4xl font-black text-white sm:text-5xl">
              {callerName || "Caller"}
            </h1>

            <p className="mt-2 text-base text-white/40">
              {callerNumber ||
                "+91 XXXXX XXXXX"}
            </p>

            <p className="mt-7 text-sm text-white/50">
              Incoming simulated call...
            </p>

            {/* BUTTONS */}

            <div className="mt-10 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={endCall}
                className="flex min-h-[58px] items-center justify-center gap-2 rounded-2xl border border-red-300/20 bg-red-400/[0.07] px-5 font-bold text-red-200 transition hover:bg-red-400/[0.12]"
              >
                <span className="text-xl">
                  📵
                </span>

                Decline
              </button>

              <button
                type="button"
                onClick={answerCall}
                className="flex min-h-[58px] items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.08] px-5 font-bold text-emerald-200 transition hover:bg-emerald-300/[0.13]"
              >
                <span className="text-xl">
                  📞
                </span>

                Answer
              </button>

            </div>

            {/* NOTICE */}

            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left">

              <p className="m-0 text-xs leading-6 text-white/35">
                This incoming call is simulated
                entirely inside Nabhya. No real
                phone call is being placed.
              </p>

            </div>

          </div>

        </div>
      </section>
    );
  }

  /* =====================================================
     CONNECTED SCREEN
  ===================================================== */

  return (
    <section className="w-full">
      <div className="mx-auto flex min-h-[620px] w-full max-w-4xl items-center justify-center rounded-3xl border border-emerald-300/10 bg-gradient-to-b from-emerald-300/[0.04] to-white/[0.015] p-6 shadow-2xl shadow-black/20 sm:p-10">

        <div className="w-full max-w-xl text-center">

          {/* STATUS */}

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-4 py-2 text-xs font-bold tracking-[0.15em] text-emerald-200/80">

            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />

            CALL CONNECTED

          </div>

          {/* AVATAR */}

          <div className="mx-auto mt-10 flex h-28 w-28 items-center justify-center rounded-full border-2 border-emerald-300/20 bg-gradient-to-br from-emerald-400/70 to-cyan-600/70 text-4xl font-black text-white shadow-[0_0_45px_rgba(57,255,136,0.12)]">
            {getInitials(
              callerName || "N"
            )}
          </div>

          {/* CALLER */}

          <h1 className="mt-7 text-4xl font-black text-white sm:text-5xl">
            {callerName || "Caller"}
          </h1>

          <p className="mt-2 text-base text-white/40">
            {callerNumber ||
              "+91 XXXXX XXXXX"}
          </p>

          {/* TIMER */}

          <div className="mt-10">

            <p className="text-[11px] font-bold tracking-[0.25em] text-white/30">
              CALL DURATION
            </p>

            <div className="mt-3 font-mono text-5xl font-black tracking-wider text-emerald-300 sm:text-6xl">
              {formatTime(callSeconds)}
            </div>

          </div>

          <p className="mt-5 text-sm text-white/35">
            Simulated call is active
          </p>

          {/* END BUTTON */}

          <button
            type="button"
            onClick={endCall}
            className="mx-auto mt-10 flex min-h-[58px] w-full max-w-sm items-center justify-center gap-3 rounded-2xl border border-red-300/20 bg-red-400/[0.08] px-5 font-bold text-red-200 transition hover:bg-red-400/[0.14]"
          >
            <span className="text-xl">
              📵
            </span>

            End Fake Call
          </button>

          {/* NOTICE */}

          <div className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left">

            <p className="m-0 text-xs leading-6 text-white/35">
              Reminder: this is only a browser
              simulation. It does not make or
              receive a real phone call.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}

export default FakeCall;