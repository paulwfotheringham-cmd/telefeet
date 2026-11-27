"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Games311ConsentBanner } from "@/components/games311/consent-banner";
import { Games311FeedbackPopup } from "@/components/games311/feedback-popup";
import { gameIdFromPath, isSelectionSurface } from "@/lib/games311/game-from-path";
import { isUuid, newUuid } from "@/lib/games311/ids";
import {
  STORAGE_KEYS,
  readStorage,
  writeStorage,
  type ConsentValue,
  type FeedbackStatus,
} from "@/lib/games311/storage";

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000;
const HEARTBEAT_MS = 45_000;
const TICK_MS = 5_000;

type FunQuizGameDetail = { gameId: string | null; inGame: boolean };

async function postAnalytics(body: Record<string, unknown>) {
  const res = await fetch("/api/games311/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `Analytics ${res.status}`);
  }
  return (await res.json()) as {
    ok?: boolean;
    visitNumber?: number;
    isReturning?: boolean;
    feedbackStatus?: FeedbackStatus;
  };
}

function readConsent(): ConsentValue | null {
  const v = readStorage(STORAGE_KEYS.consent);
  return v === "accepted" || v === "declined" ? v : null;
}

function readFeedbackStatus(): FeedbackStatus {
  const v = readStorage(STORAGE_KEYS.feedbackStatus);
  if (v === "eligible" || v === "shown" || v === "submitted" || v === "dismissed" || v === "pending") {
    return v;
  }
  return "pending";
}

function ensureId(key: string): string {
  const existing = readStorage(key);
  if (isUuid(existing)) return existing;
  const id = newUuid();
  writeStorage(key, id);
  return id;
}

export function Games311AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [ready, setReady] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupBusy, setPopupBusy] = useState(false);
  const [funQuizInGame, setFunQuizInGame] = useState(false);
  const [funQuizGameId, setFunQuizGameId] = useState<string | null>(null);

  const visitorIdRef = useRef<string>("");
  const sessionIdRef = useRef<string>("");
  const activeMsRef = useRef(0);
  const pendingDeltaRef = useRef(0);
  const feedbackStatusRef = useRef<FeedbackStatus>("pending");
  const currentGameRef = useRef<string | null>(null);
  const gameActiveStartedRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const visitNumberRef = useRef(1);
  const visibleRef = useRef(true);
  const startedRef = useRef(false);

  useEffect(() => {
    setConsent(readConsent());
    feedbackStatusRef.current = readFeedbackStatus();
    const storedActive = Number(readStorage(STORAGE_KEYS.activeMs) || "0");
    if (Number.isFinite(storedActive) && storedActive > 0) {
      activeMsRef.current = storedActive;
    }
    setReady(true);
  }, []);

  useEffect(() => {
    function onFunQuizGame(ev: Event) {
      const detail = (ev as CustomEvent<FunQuizGameDetail>).detail;
      if (!detail) return;
      setFunQuizInGame(Boolean(detail.inGame));
      setFunQuizGameId(detail.gameId);
    }
    window.addEventListener("games311:funquiz-game", onFunQuizGame as EventListener);
    return () => window.removeEventListener("games311:funquiz-game", onFunQuizGame as EventListener);
  }, []);

  const flushHeartbeat = useCallback(async (endSession = false) => {
    if (consent !== "accepted") return;
    const delta = pendingDeltaRef.current;
    if (delta <= 0 && !endSession) return;
    pendingDeltaRef.current = 0;
    writeStorage(STORAGE_KEYS.activeMs, String(activeMsRef.current));
    try {
      await postAnalytics({
        action: "heartbeat",
        visitorId: visitorIdRef.current,
        sessionId: sessionIdRef.current,
        activeMsDelta: delta,
        feedbackStatus: feedbackStatusRef.current,
        endSession,
      });
    } catch {
      pendingDeltaRef.current += delta;
    }
  }, [consent]);

  const markFeedbackStatus = useCallback(
    async (status: FeedbackStatus) => {
      feedbackStatusRef.current = status;
      writeStorage(STORAGE_KEYS.feedbackStatus, status);
      if (consent !== "accepted") return;
      try {
        await postAnalytics({
          action: "feedback_status",
          visitorId: visitorIdRef.current,
          feedbackStatus: status,
        });
      } catch {
        /* local persistence still applies */
      }
    },
    [consent],
  );

  // Start session after consent
  useEffect(() => {
    if (!ready || consent !== "accepted" || startedRef.current) return;
    startedRef.current = true;
    visitorIdRef.current = ensureId(STORAGE_KEYS.visitorId);
    sessionIdRef.current = newUuid();
    writeStorage(STORAGE_KEYS.sessionId, sessionIdRef.current);

    void postAnalytics({
      action: "session_start",
      visitorId: visitorIdRef.current,
      sessionId: sessionIdRef.current,
      path: pathname,
    })
      .then((res) => {
        if (res.visitNumber) {
          visitNumberRef.current = res.visitNumber;
          writeStorage(STORAGE_KEYS.visitCount, String(res.visitNumber));
        }
        if (res.feedbackStatus === "submitted" || res.feedbackStatus === "dismissed") {
          feedbackStatusRef.current = res.feedbackStatus;
          writeStorage(STORAGE_KEYS.feedbackStatus, res.feedbackStatus);
        }
      })
      .catch(() => {
        /* offline / not configured */
      });
  }, [ready, consent, pathname]);

  // Active time ticks (visibility-aware)
  useEffect(() => {
    if (consent !== "accepted") return;

    function isActiveNow() {
      if (typeof document === "undefined") return false;
      return document.visibilityState === "visible" && document.hasFocus();
    }

    visibleRef.current = isActiveNow();
    lastTickRef.current = Date.now();

    const onVis = () => {
      const now = Date.now();
      if (visibleRef.current) {
        const add = Math.min(TICK_MS * 2, Math.max(0, now - lastTickRef.current));
        activeMsRef.current += add;
        pendingDeltaRef.current += add;
      }
      visibleRef.current = isActiveNow();
      lastTickRef.current = now;
    };

    const tick = window.setInterval(() => {
      const now = Date.now();
      if (isActiveNow()) {
        const add = Math.min(TICK_MS * 2, Math.max(0, now - lastTickRef.current));
        activeMsRef.current += add;
        pendingDeltaRef.current += add;
        writeStorage(STORAGE_KEYS.activeMs, String(activeMsRef.current));

        if (
          activeMsRef.current >= ACTIVE_THRESHOLD_MS &&
          (feedbackStatusRef.current === "pending" || feedbackStatusRef.current === "eligible")
        ) {
          void markFeedbackStatus("eligible");
        }
      }
      lastTickRef.current = now;
      visibleRef.current = isActiveNow();
    }, TICK_MS);

    const heartbeat = window.setInterval(() => {
      void flushHeartbeat(false);
    }, HEARTBEAT_MS);

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    window.addEventListener("blur", onVis);

    const onHide = () => {
      void flushHeartbeat(true);
    };
    window.addEventListener("pagehide", onHide);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      window.removeEventListener("blur", onVis);
      window.removeEventListener("pagehide", onHide);
      void flushHeartbeat(true);
    };
  }, [consent, flushHeartbeat, markFeedbackStatus]);

  // Game path tracking
  useEffect(() => {
    if (consent !== "accepted" || !startedRef.current) return;
    const pathGame = gameIdFromPath(pathname);
    const nextGame = funQuizInGame ? funQuizGameId || pathGame || "funquiz-session" : pathGame;

    const prev = currentGameRef.current;
    if (prev && prev !== nextGame) {
      const playedMs =
        gameActiveStartedRef.current != null ? Math.max(0, Date.now() - gameActiveStartedRef.current) : null;
      void postAnalytics({
        action: "game_event",
        visitorId: visitorIdRef.current,
        sessionId: sessionIdRef.current,
        eventType: "game_end",
        gameId: prev,
        activeMsDelta: playedMs,
      }).catch(() => undefined);
      gameActiveStartedRef.current = null;
    }
    if (nextGame && nextGame !== prev) {
      void postAnalytics({
        action: "game_event",
        visitorId: visitorIdRef.current,
        sessionId: sessionIdRef.current,
        eventType: "game_launch",
        gameId: nextGame,
      }).catch(() => undefined);
      gameActiveStartedRef.current = Date.now();
    }
    if (!nextGame) {
      gameActiveStartedRef.current = null;
    }
    currentGameRef.current = nextGame;
  }, [pathname, funQuizInGame, funQuizGameId, consent]);

  // Show popup only on selection surface after eligible / already shown
  useEffect(() => {
    if (consent !== "accepted") return;
    const status = feedbackStatusRef.current;
    if (status === "submitted" || status === "dismissed" || status === "pending") {
      setShowPopup(false);
      return;
    }
    if (status !== "eligible" && status !== "shown") return;
    if (!isSelectionSurface(pathname, funQuizInGame)) {
      setShowPopup(false);
      return;
    }
    setShowPopup(true);
    if (status === "eligible") {
      void markFeedbackStatus("shown");
    }
  }, [pathname, funQuizInGame, consent, markFeedbackStatus]);

  const onAccept = () => {
    writeStorage(STORAGE_KEYS.consent, "accepted");
    setConsent("accepted");
  };
  const onDecline = () => {
    writeStorage(STORAGE_KEYS.consent, "declined");
    setConsent("declined");
  };

  const currentGame = currentGameRef.current;

  return (
    <>
      {children}
      {ready && consent == null ? (
        <Games311ConsentBanner onAccept={onAccept} onDecline={onDecline} />
      ) : null}
      {showPopup && consent === "accepted" ? (
        <Games311FeedbackPopup
          gameId={currentGame}
          busy={popupBusy}
          onDismiss={() => {
            setShowPopup(false);
            void markFeedbackStatus("dismissed");
          }}
          onSubmit={({ wouldPay, feedbackText }) => {
            setPopupBusy(true);
            void postAnalytics({
              action: "feedback",
              visitorId: visitorIdRef.current,
              sessionId: sessionIdRef.current,
              wouldPay,
              feedbackText,
              gameId: currentGame,
            })
              .then(() => {
                feedbackStatusRef.current = "submitted";
                writeStorage(STORAGE_KEYS.feedbackStatus, "submitted");
                setShowPopup(false);
              })
              .catch(() => {
                // Still remember locally so we don't spam if the server is down mid-submit retry later
              })
              .finally(() => setPopupBusy(false));
          }}
        />
      ) : null}
    </>
  );
}
