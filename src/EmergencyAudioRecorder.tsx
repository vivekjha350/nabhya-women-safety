import { useEffect, useRef, useState } from "react";

type RecordingStatus = "idle" | "recording" | "stopped";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const secs = (seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${secs}`;
}

export default function AudioRecorder() {
  const [status, setStatus] =
    useState<RecordingStatus>("idle");

  const [recordingTime, setRecordingTime] =
    useState(0);

  const [audioUrl, setAudioUrl] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const timerRef =
    useRef<number | null>(null);

  /* -----------------------------
     CLEANUP
  ----------------------------- */

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }

      streamRef.current?.getTracks().forEach(
        (track) => track.stop()
      );

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  /* -----------------------------
     START RECORDING
  ----------------------------- */

  const startRecording = async () => {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Your browser does not support microphone recording."
        );
        return;
      }

      if (typeof MediaRecorder === "undefined") {
        setError(
          "Your browser does not support audio recording."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current = stream;

      chunksRef.current = [];

      const recorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(
          chunksRef.current,
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          }
        );

        const url =
          URL.createObjectURL(blob);

        setAudioUrl(url);

        stream
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;

        setStatus("stopped");
      };

      recorder.onerror = () => {
        setError(
          "An error occurred while recording audio."
        );

        stream
          .getTracks()
          .forEach((track) => track.stop());

        setStatus("idle");
      };

      recorder.start();

      setRecordingTime(0);
      setStatus("recording");

      timerRef.current =
        window.setInterval(() => {
          setRecordingTime(
            (previous) => previous + 1
          );
        }, 1000);

    } catch (err) {
      console.error(err);

      streamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;

      setError(
        "Microphone permission was denied or recording could not be started."
      );

      setStatus("idle");
    }
  };

  /* -----------------------------
     STOP RECORDING
  ----------------------------- */

  const stopRecording = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  /* -----------------------------
     DELETE RECORDING
  ----------------------------- */

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setRecordingTime(0);
    setStatus("idle");
    setError("");

    chunksRef.current = [];
  };

  /* -----------------------------
     UI
  ----------------------------- */

  return (
    <section className="audio-recorder-card">

      {/* HEADER */}

      <div className="audio-recorder-header">

        <div>

          <div className="audio-recorder-badge">
            🎙️ EMERGENCY AUDIO
          </div>

          <h2>
            Emergency Audio Recorder
          </h2>

          <p>
            Record important audio during
            an emergency situation.
          </p>

        </div>

        <div className="audio-recorder-icon">
          🎙️
        </div>

      </div>

      {/* STATUS */}

      <div className="audio-recorder-status">

        <span
          className={
            status === "recording"
              ? "recording-dot active"
              : "recording-dot"
          }
        />

        {status === "recording" &&
          "Recording in progress"}

        {status === "idle" &&
          "Ready to record"}

        {status === "stopped" &&
          "Recording completed"}

      </div>

      {/* TIMER */}

      <div className="audio-recorder-timer">
        {formatTime(recordingTime)}
      </div>

      {/* ERROR */}

      {error && (
        <div className="audio-recorder-error">
          ⚠️ {error}
        </div>
      )}

      {/* CONTROLS */}

      <div className="audio-recorder-controls">

        {/* START */}

        {status === "idle" && (
          <button
            type="button"
            className="audio-record-button"
            onClick={startRecording}
          >
            🔴 Start Recording
          </button>
        )}

        {/* STOP */}

        {status === "recording" && (
          <button
            type="button"
            className="audio-stop-button"
            onClick={stopRecording}
          >
            ⏹ Stop Recording
          </button>
        )}

        {/* COMPLETED */}

        {status === "stopped" &&
          audioUrl && (
            <>
              <audio
                controls
                src={audioUrl}
                className="audio-player"
              />

              <a
                href={audioUrl}
                download={`nabhya-emergency-${Date.now()}.webm`}
                className="audio-download-button"
              >
                💾 Save Recording
              </a>

              <button
                type="button"
                className="audio-delete-button"
                onClick={deleteRecording}
              >
                🗑️ Delete
              </button>
            </>
          )}

      </div>

      {/* PRIVACY NOTE */}

      <div className="audio-recorder-note">
        🔒 Recording stays in this browser
        unless you choose to save it.
      </div>

      {/* PROTOTYPE WARNING */}

      <div className="audio-recorder-warning">
        ⚠️ This is currently a browser
        prototype. Background recording while
        the phone is locked is not supported
        by this web version.
      </div>

    </section>
  );
}
