import { lazy, memo, Suspense } from "react";
import { HardDrive, Users, Server, Play, ChevronDown, Download, Copy } from "lucide-react";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { usePlayerContext } from "../../context/PlayerContext.jsx";
import { useStreamActions } from "../../hooks/useStreamActions.js";

const FileSelectorModal = lazy(() => import("../modals/FileSelectorModal.jsx"));

function ResultCard({ item }) {
  const { useJackett, debridService } = useSettingsContext();
  const { processingMagnet, fileModalData } = usePlayerContext();
  const { initAction, copyMagnet } = useStreamActions();

  const isDirect = item.magnet && item.magnet.startsWith("http");
  const isProcessing = processingMagnet === item.magnet;
  const isFileModalOpen = fileModalData && fileModalData.magnet === item.magnet && !isDirect;

  return (
    <div className="stream-row">
      <div className="stream-info">
        <h3 className="result-title stream-title">{item.title}</h3>

        <div className="stream-meta">
          <span className="inline-flex items-center gap-1.5">
            <Server size={13} aria-hidden="true" /> {item.provider}
          </span>
          {useJackett && (
            <>
              <span className="inline-flex items-center gap-1.5">
                <HardDrive size={13} aria-hidden="true" /> {Math.round(item.size / 1000000)} MB
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={13} aria-hidden="true" /> {item.seeders}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="stream-actions">
        {/* Stream: the one filled action in the row */}
        <div className="stream-split">
          <button
            className="result-btn stream-btn stream-btn-primary"
            onClick={() => initAction(item.magnet, "stream", true)}
            disabled={isProcessing}
            title={isDirect ? "Instantly stream video" : "Instantly stream the main video file"}
          >
            {isProcessing ? (
              <>
                <span className="loader-small"></span> Loading...
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" aria-hidden="true" /> Stream
              </>
            )}
          </button>
          {!isDirect && (
            <button
              className="stream-btn stream-btn-primary stream-btn-icon"
              onClick={() => initAction(item.magnet, "stream", false)}
              disabled={isProcessing}
              title="Choose a specific file to stream"
              aria-label="Choose a specific file to stream"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>

        <div className="stream-split">
          <button
            className="result-btn stream-btn"
            onClick={() => initAction(item.magnet, "external", true)}
            disabled={isProcessing}
            title={
              isDirect
                ? "Instantly play in an external player"
                : "Instantly play the main video file in an external player"
            }
          >
            {isProcessing ? (
              <>
                <span className="loader-small"></span> Loading...
              </>
            ) : (
              "External"
            )}
          </button>
          {!isDirect && (
            <button
              className="stream-btn stream-btn-icon"
              onClick={() => initAction(item.magnet, "external", false)}
              disabled={isProcessing}
              title="Choose a specific file to play externally"
              aria-label="Choose a specific file to play externally"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>

        <button
          className="stream-btn"
          onClick={() => initAction(item.magnet, "download")}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="loader-small"></span> Processing...
            </>
          ) : isDirect ? (
            <>
              <Download size={14} aria-hidden="true" /> Direct Download
            </>
          ) : (
            <>
              <Download size={14} aria-hidden="true" /> Download ({debridService === "torbox" ? "Torbox" : "RD"})
            </>
          )}
        </button>

        <button
          className="stream-btn"
          onClick={() => copyMagnet(item.magnet)}
          title={`Copy ${isDirect ? "link" : "magnet"}`}
        >
          <Copy size={14} aria-hidden="true" /> Copy {isDirect ? "Link" : "Magnet"}
        </button>
      </div>

      {isFileModalOpen && (
        <Suspense fallback={null}>
          <FileSelectorModal files={fileModalData.files} actionType={fileModalData.actionType} />
        </Suspense>
      )}
    </div>
  );
}

export default memo(ResultCard);
