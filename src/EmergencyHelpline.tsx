
type EmergencyNumber = {
  title: string;
  number: string;
  description: string;
  icon: string;
  color: string;
};

const emergencyNumbers: EmergencyNumber[] = [
  {
    title: "Emergency",
    number: "112",
    description:
      "Police, ambulance and other emergency assistance.",
    icon: "🚨",
    color: "red",
  },
  {
    title: "Women Helpline",
    number: "181",
    description:
      "Women-focused support and assistance.",
    icon: "👩",
    color: "pink",
  },
  {
    title: "Police",
    number: "100",
    description:
      "For police assistance and immediate danger.",
    icon: "👮",
    color: "blue",
  },
  {
    title: "Ambulance",
    number: "108",
    description:
      "Medical emergency and ambulance assistance.",
    icon: "🚑",
    color: "emerald",
  },
];

function EmergencyHelpline() {
  const callNumber = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-5xl">

        {/* HEADER */}

        <div className="mb-8">

          <div className="inline-flex items-center gap-2 rounded-full border border-red-300/15 bg-red-300/[0.05] px-3 py-2 text-[10px] font-bold tracking-[0.18em] text-red-200/80">
            🆘 EMERGENCY SUPPORT
          </div>

          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Emergency Support
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            Quickly access emergency services and
            important helpline numbers.
          </p>

        </div>

        {/* MAIN 112 CARD */}

        <div className="relative overflow-hidden rounded-[2rem] border border-red-300/20 bg-red-500/[0.05] p-6 sm:p-8">

          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-red-300/20 bg-red-400/10 text-4xl">
                🚨
              </div>

              <div className="flex-1">

                <p className="text-xs font-bold tracking-[0.2em] text-red-300/70">
                  NATIONAL EMERGENCY NUMBER
                </p>

                <h2 className="mt-2 text-4xl font-black text-white">
                  112
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                  Use this number when you need immediate
                  emergency assistance.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  callNumber("112")
                }
                className="min-h-[58px] rounded-2xl bg-red-500 px-7 font-black text-white shadow-lg shadow-red-500/20 transition hover:brightness-110 active:scale-[0.98]"
              >
                📞 CALL 112
              </button>

            </div>

          </div>

        </div>

        {/* EMERGENCY SERVICES */}

        <div className="mt-8">

          <div className="mb-4">

            <h2 className="text-xl font-black text-white">
              Emergency Services
            </h2>

            <p className="mt-1 text-sm text-white/35">
              Tap a service to start a phone call.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {emergencyNumbers
              .slice(1)
              .map((service) => (

                <div
                  key={service.number}
                  className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
                >

                  <div className="flex items-start gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                      {service.icon}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center justify-between gap-3">

                        <h3 className="font-black text-white">
                          {service.title}
                        </h3>

                        <span className="font-mono text-lg font-black text-white">
                          {service.number}
                        </span>

                      </div>

                      <p className="mt-2 text-xs leading-5 text-white/40">
                        {service.description}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          callNumber(
                            service.number
                          )
                        }
                        className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white transition hover:border-emerald-300/20 hover:bg-emerald-300/[0.04]"
                      >
                        📞 Call{" "}
                        {service.number}
                      </button>

                    </div>

                  </div>

                </div>

              ))}

          </div>

        </div>

        {/* QUICK ACTIONS */}

        <div className="mt-8 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">

          <h2 className="text-xl font-black text-white">
            Quick Emergency Actions
          </h2>

          <p className="mt-1 text-sm text-white/35">
            Use these options when immediate action
            is required.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <button
              type="button"
              onClick={() =>
                callNumber("112")
              }
              className="rounded-2xl border border-red-300/15 bg-red-300/[0.04] p-5 text-left transition hover:bg-red-300/[0.07]"
            >

              <div className="text-2xl">
                🆘
              </div>

              <div className="mt-3 font-black text-white">
                Immediate Danger
              </div>

              <div className="mt-1 text-xs text-white/35">
                Call emergency services at 112.
              </div>

            </button>

            <button
              type="button"
              onClick={() =>
                callNumber("181")
              }
              className="rounded-2xl border border-pink-300/15 bg-pink-300/[0.04] p-5 text-left transition hover:bg-pink-300/[0.07]"
            >

              <div className="text-2xl">
                👩
              </div>

              <div className="mt-3 font-black text-white">
                Women Support
              </div>

              <div className="mt-1 text-xs text-white/35">
                Call the women helpline.
              </div>

            </button>

          </div>

        </div>

        {/* SAFETY NOTICE */}

        <div className="mt-6 rounded-3xl border border-yellow-300/10 bg-yellow-300/[0.025] p-5">

          <div className="flex items-start gap-3">

            <span className="text-xl">
              ⚠️
            </span>

            <div>

              <p className="font-bold text-white">
                Important
              </p>

              <p className="mt-1 text-xs leading-6 text-white/40">
                Emergency numbers and service
                availability can vary by location.
                If you are in immediate danger,
                use the emergency service available
                in your area.
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default EmergencyHelpline;