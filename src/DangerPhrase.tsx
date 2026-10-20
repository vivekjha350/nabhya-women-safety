import { useEffect, useState } from "react";

const STORAGE_KEY =
  "nabhya_danger_phrase";

function DangerPhrase() {
  const [phrase, setPhrase] =
    useState("");

  const [savedPhrase, setSavedPhrase] =
    useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [detected, setDetected] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /* ===================================================
     LOAD SAVED PHRASE
  =================================================== */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (saved) {
      setSavedPhrase(saved);
      setPhrase(saved);
    }
  }, []);

  /* ===================================================
     SAVE
  =================================================== */

  const savePhrase = () => {
    const cleaned =
      phrase.trim();

    if (!cleaned) {
      setMessage(
        "Please enter an emergency phrase."
      );
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      cleaned
    );

    setSavedPhrase(cleaned);
    setPhrase(cleaned);
    setMessage(
      "Emergency phrase saved successfully."
    );
  };

  /* ===================================================
     START
  =================================================== */

  const startListening = () => {
    if (!savedPhrase) {
      setMessage(
        "Please save a danger phrase first."
      );
      return;
    }

    setDetected(false);
    setMessage(
      "Danger phrase monitoring started."
    );

    setIsListening(true);
  };

  /* ===================================================
     STOP
  =================================================== */

  const stopListening = () => {
    setIsListening(false);
    setDetected(false);

    setMessage(
      "Danger phrase monitoring stopped."
    );
  };

  /* ===================================================
     SIMULATE DETECTION
  =================================================== */

  const simulateDetection = () => {
    if (!savedPhrase) {
      setMessage(
        "Save a danger phrase first."
      );
      return;
    }

    setDetected(true);

    setMessage(
      `Danger phrase detected: "${savedPhrase}"`
    );
  };

  /* ===================================================
     DELETE
  =================================================== */

  const clearPhrase = () => {
    localStorage.removeItem(
      STORAGE_KEY
    );

    setPhrase("");
    setSavedPhrase("");
    setDetected(false);
    setIsListening(false);

    setMessage(
      "Danger phrase removed."
    );
  };

  /* ===================================================
     UI
  =================================================== */

  return (
    <section className="w-full">

      <div className="mx-auto w-full max-w-5xl">

        {/* MAIN CARD */}

        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 sm:p-8">

          {/* HEADER */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-300/[0.05] text-3xl">
              🎙️
            </div>

            <div>

              <div className="inline-flex rounded-full border border-purple-300/15 bg-purple-300/[0.05] px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-purple-200/80">
                EMERGENCY VOICE TOOL
              </div>

              <h1 className="mt-3 text-3xl font-black text-white">
                Danger Phrase
              </h1>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Set a phrase that can be used
                as your emergency trigger.
              </p>

            </div>

          </div>

          <div className="my-7 h-px bg-white/[0.07]" />

          {/* PHRASE */}

          <label
            htmlFor="danger-phrase"
            className="block text-xs font-bold tracking-[0.16em] text-white/40"
          >
            YOUR EMERGENCY PHRASE
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">

            <input
              id="danger-phrase"
              type="text"
              value={phrase}
              onChange={(event) =>
                setPhrase(
                  event.target.value
                )
              }
              placeholder='Example: "I need my blue bag"'
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-base text-white outline-none placeholder:text-white/20 focus:border-purple-300/30 focus:ring-4 focus:ring-purple-300/[0.05]"
            />

            <button
              type="button"
              onClick={savePhrase}
              className="rounded-2xl border border-purple-300/20 bg-purple-300/[0.07] px-6 py-4 font-bold text-purple-200 transition hover:bg-purple-300/[0.12]"
            >
              Save Phrase
            </button>

          </div>

          {/* SAVED */}

          <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/20 p-5">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-[10px] font-bold tracking-[0.18em] text-white/30">
                  SAVED PHRASE
                </p>

                <p className="mt-2 text-base font-bold text-white">
                  {savedPhrase ||
                    "No phrase configured"}
                </p>

              </div>

              {savedPhrase && (
                <button
                  type="button"
                  onClick={
                    clearPhrase
                  }
                  className="rounded-xl border border-red-300/15 bg-red-300/[0.04] px-3 py-2 text-xs font-bold text-red-200/70"
                >
                  Remove
                </button>
              )}

            </div>

          </div>

          {/* MONITORING */}

          <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    isListening
                      ? "bg-emerald-300/[0.08]"
                      : "bg-white/[0.04]"
                  }`}
                >
                  {isListening
                    ? "🎙️"
                    : "⏸️"}
                </div>

                <div>

                  <p className="font-bold text-white">
                    {isListening
                      ? "Monitoring Active"
                      : "Monitoring Off"}
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    {isListening
                      ? "Danger phrase monitoring is active."
                      : "Start monitoring when needed."}
                  </p>

                </div>

              </div>

              {!isListening ? (
                <button
                  type="button"
                  onClick={
                    startListening
                  }
                  className="rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950 transition hover:brightness-105"
                >
                  Start Monitoring
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    stopListening
                  }
                  className="rounded-2xl border border-red-300/20 bg-red-300/[0.06] px-6 py-4 font-bold text-red-200 transition hover:bg-red-300/[0.1]"
                >
                  Stop Monitoring
                </button>
              )}

            </div>

          </div>

          {/* SIMULATE */}

          <div className="mt-5 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.025] p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="font-bold text-white">
                  Test Detection
                </p>

                <p className="mt-1 text-xs leading-5 text-white/35">
                  Use this button to simulate
                  phrase detection in the
                  browser prototype.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  simulateDetection
                }
                className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-300/[0.1]"
              >
                🎤 Simulate Detection
              </button>

            </div>

          </div>

          {/* DETECTED */}

          {detected && (
            <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/[0.05] p-5">

              <div className="flex items-start gap-4">

                <div className="text-3xl">
                  🚨
                </div>

                <div>

                  <p className="font-black text-red-200">
                    Danger Phrase Detected
                  </p>

                  <p className="mt-2 text-sm leading-6 text-red-100/50">
                    The configured emergency
                    phrase was detected in this
                    simulated test.
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* MESSAGE */}

          {message && (
            <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/20 p-4">

              <p className="text-sm text-white/50">
                {message}
              </p>

            </div>
          )}

          {/* PROTOTYPE NOTE */}

          <div className="mt-6 rounded-2xl border border-yellow-300/10 bg-yellow-300/[0.025] p-5">

            <div className="flex items-start gap-3">

              <span className="text-xl">
                ⚠️
              </span>

              <p className="m-0 text-xs leading-6 text-white/40">
                This browser prototype does not
                continuously listen for your voice
                in the background. Real emergency
                voice detection requires native
                mobile capabilities and appropriate
                permissions.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default DangerPhrase;