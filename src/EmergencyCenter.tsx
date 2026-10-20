
import AudioRecorder from "./EmergencyAudioRecorder";
import "./EmergencyCenter.css";

type EmergencyCenterProps = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  contactsCount: number;
  onEndSOS: () => void;
};

function EmergencyCenter({
  latitude,
  longitude,
  accuracy,
  contactsCount,
  onEndSOS,
}: EmergencyCenterProps) {
  const hasLocation =
    latitude !== null && longitude !== null;

  const locationUrl = hasLocation
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : "";

  const openDirections = () => {
    if (!hasLocation) {
      alert("Current location is not available yet.");
      return;
    }

    window.open(locationUrl, "_blank", "noopener,noreferrer");
  };

  const shareLocation = async () => {
    if (!hasLocation) {
      alert("Current location is not available yet.");
      return;
    }

    const shareText =
      `Nabhya Emergency Location\n\n` +
      `I may need help.\n` +
      `My current location:\n${locationUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Nabhya Emergency Location",
          text: shareText,
          url: locationUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Unable to share location:", error);
        }
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      alert("Location link copied. Send it to someone you trust.");
    } catch (error) {
      console.error("Unable to copy location:", error);
      window.prompt("Copy this emergency location:", shareText);
    }
  };

  const callEmergency = () => {
    window.location.href = "tel:112";
  };

  return (
    <main className="sos-screen">
      <div className="sos-container">

        {/* HEADER */}
        <header className="sos-header">
          <div>
            <div className="sos-status">
              <span aria-hidden="true">●</span>
              SOS SESSION ACTIVE
            </div>

            <h1>Nabhya Emergency Center</h1>

            <p>
              Your emergency dashboard. Choose an action below
              when you need assistance.
            </p>
          </div>

          <div className="sos-header-symbol" aria-hidden="true">
            🚨
          </div>
        </header>

        {/* STATUS CARDS */}
        <section className="sos-grid" aria-label="Emergency status">

          <article className="sos-card">
            <div className="sos-card-heading">
              <span className="sos-icon">📍</span>
              <span className="sos-mini-label">LOCATION</span>
            </div>

            <h2>{hasLocation ? "Location available" : "Location pending"}</h2>

            <p className="sos-muted">
              {hasLocation
                ? `Reported accuracy: ${Math.round(accuracy ?? 0)} metres`
                : "Allow location access in your browser and try again."}
            </p>

            <span className={hasLocation ? "sos-state sos-state-ready" : "sos-state"}>
              {hasLocation ? "● Coordinates received" : "● Waiting for coordinates"}
            </span>
          </article>

          <article className="sos-card">
            <div className="sos-card-heading">
              <span className="sos-icon">👥</span>
              <span className="sos-mini-label">TRUSTED NETWORK</span>
            </div>

            <h2>
              {contactsCount} contact{contactsCount === 1 ? "" : "s"}
            </h2>

            <p className="sos-muted">
              {contactsCount > 0
                ? "Saved trusted contacts detected by the app."
                : "No saved trusted contacts were detected."}
            </p>

            <span className="sos-state">
              {contactsCount > 0
                ? "● Contacts available"
                : "● Setup required"}
            </span>
          </article>

        </section>

        {/* LOCATION CARD */}
        <section className="sos-card sos-section">
          <div className="sos-section-heading">
            <span className="sos-icon">🗺️</span>
            <div>
              <h2>Emergency Location</h2>
              <p className="sos-muted">
                View or share the coordinates detected by your device.
              </p>
            </div>
          </div>

          {hasLocation ? (
            <>
              <div className="sos-location-value">
                <div className="sos-coordinate">
                  <span>LATITUDE</span>
                  <strong>{latitude.toFixed(6)}</strong>
                </div>

                <div className="sos-coordinate">
                  <span>LONGITUDE</span>
                  <strong>{longitude.toFixed(6)}</strong>
                </div>

                <div className="sos-coordinate">
                  <span>LOCATION ACCURACY</span>
                  <strong>
                    {accuracy !== null
                      ? `About ${Math.round(accuracy)} metres`
                      : "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="sos-actions">
                <button
                  type="button"
                  className="sos-btn sos-btn-primary"
                  onClick={shareLocation}
                >
                  ↗ Share emergency location
                </button>

                <button
                  type="button"
                  className="sos-btn"
                  onClick={openDirections}
                >
                  🗺️ Open in Google Maps
                </button>
              </div>
            </>
          ) : (
            <div className="sos-contact-empty">
              <strong>Location not available yet</strong>
              <p className="sos-muted">
                Check browser location permission and ensure the
                page is running in a secure context, such as localhost
                or HTTPS. Location access is not guaranteed.
              </p>
            </div>
          )}
        </section>

        {/* EMERGENCY ACTIONS */}
        <section className="sos-card sos-section">
          <div className="sos-section-heading">
            <span className="sos-icon">☎️</span>
            <div>
              <h2>Emergency Actions</h2>
              <p className="sos-muted">
                Quickly open your phone's emergency dialler or share your location.
              </p>
            </div>
          </div>

          <div className="sos-grid">
            <button
              type="button"
              className="sos-btn sos-btn-emergency"
              onClick={callEmergency}
            >
              <span className="sos-action-emoji">📞</span>
              <span>
                <strong>Call Emergency Services</strong>
                <small>Call 112 in India</small>
              </span>
            </button>

            <button
              type="button"
              className="sos-btn sos-btn-share"
              onClick={shareLocation}
              disabled={!hasLocation}
            >
              <span className="sos-action-emoji">📤</span>
              <span>
                <strong>Share My Location</strong>
                <small>
                  {hasLocation
                    ? "Choose an available sharing app"
                    : "Waiting for location"}
                </small>
              </span>
            </button>
          </div>
        </section>

        {/* TRUSTED CONTACTS */}
        <section className="sos-card sos-section">
          <div className="sos-section-heading">
            <span className="sos-icon">🛡️</span>
            <div>
              <h2>Trusted Contacts</h2>
              <p className="sos-muted">
                Your trusted network status.
              </p>
            </div>
          </div>

          {contactsCount > 0 ? (
            <div className="sos-contact-empty">
              <strong>
                {contactsCount} saved contact{contactsCount === 1 ? "" : "s"} available
              </strong>
              <p className="sos-muted">
                This count confirms that contacts are saved in the app.
                It does not mean they have been notified.
              </p>
            </div>
          ) : (
            <div className="sos-contact-empty">
              <strong>No trusted contacts found</strong>
              <p className="sos-muted">
                Add trusted contacts in the Contacts section of Nabhya.
                This SOS screen does not send alerts automatically.
              </p>
            </div>
          )}
        </section>

        {/* AUDIO RECORDER */}
        <section className="sos-card sos-section">
          <div className="sos-section-heading">
            <span className="sos-icon">🎙️</span>
            <div>
              <h2>Emergency Audio Recorder</h2>
              <p className="sos-muted">
                Use the recorder below if you need to capture audio.
                Microphone access may be requested by your browser.
              </p>
            </div>
          </div>

          <div className="sos-audio-panel">
            <AudioRecorder />
          </div>
        </section>

        {/* SAFETY NOTICE */}
        <aside className="sos-warning">
          <span aria-hidden="true">⚠️</span>
          <p>
            <strong>Important:</strong> SOS mode does not itself guarantee
            that emergency services or trusted contacts have been notified.
            Call emergency services directly if you are in immediate danger.
          </p>
        </aside>

        {/* END SOS */}
        <footer className="sos-footer">
          <button
            type="button"
            className="sos-btn sos-btn-danger sos-end-button"
            onClick={onEndSOS}
          >
            End Emergency Mode
          </button>

          <p>
            Only end this session when it is safe to do so.
          </p>
        </footer>

      </div>
    </main>
  );
}

export default EmergencyCenter;
