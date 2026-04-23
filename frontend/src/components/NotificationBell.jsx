import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api.js";

// The localStorage key where we keep the list of notification IDs the user
// has already dismissed.
const READ_KEY = "flashmaster_read_notifications";

// Tailwind classes for each priority level.
const PRIORITY_STYLES = {
  high: "border-red-800 bg-red-950/40",
  medium: "border-amber-800 bg-amber-950/40",
  low: "border-indigo-800 bg-indigo-950/40",
  info: "border-slate-800 bg-slate-900/60",
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(getReadIds());
  const dropdownRef = useRef(null);

  // Load notifications from the backend.
  function load() {
    api.get("/api/notifications")
      .then(function (data) {
        setNotifications(data);
      })
      .catch(function () {
        setNotifications([]);
      });
  }

  // On mount: load once, then refresh every minute.
  useEffect(function () {
    load();
    const interval = setInterval(load, 60000);
    return function cleanup() {
      clearInterval(interval);
    };
  }, []);

  // When the dropdown is open, close it if the user clicks outside of it.
  useEffect(function () {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return function cleanup() {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  // Count how many notifications the user has NOT read yet.
  let unreadCount = 0;
  for (let i = 0; i < notifications.length; i++) {
    if (!readIds.has(notifications[i].id)) {
      unreadCount++;
    }
  }

  // Mark one notification as read.
  function markRead(id) {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    saveReadIds(next);
  }

  // Mark everything as read.
  function markAllRead() {
    const all = new Set();
    for (let i = 0; i < notifications.length; i++) {
      all.add(notifications[i].id);
    }
    setReadIds(all);
    saveReadIds(all);
  }

  // Dismiss a single notification (click the x button).
  function dismiss(id, e) {
    e.stopPropagation();
    markRead(id);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={function () {
          setOpen(!open);
        }}
        className="relative rounded-lg p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-0.5 -mr-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="font-semibold text-white">Notifications</div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map(function (n) {
                const isRead = readIds.has(n.id);
                let cardClass = "px-4 py-3 border-b border-slate-800 last:border-b-0 cursor-pointer hover:bg-slate-800/50 border-l-2 ";
                if (isRead) {
                  cardClass += "opacity-60 border-l-transparent";
                } else {
                  cardClass += PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.info;
                }
                return (
                  <div
                    key={n.id}
                    onClick={function () {
                      markRead(n.id);
                    }}
                    className={cardClass}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm">
                          {n.title}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">
                          {n.message}
                        </div>
                      </div>
                      {!isRead && (
                        <button
                          onClick={function (e) {
                            dismiss(n.id, e);
                          }}
                          className="text-slate-500 hover:text-slate-300 text-sm flex-shrink-0"
                          aria-label="Dismiss"
                        >
                          x
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Read the set of already-dismissed notification IDs from localStorage.
function getReadIds() {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(arr);
  } catch (err) {
    return new Set();
  }
}

// Save the set back to localStorage so dismissals persist across refreshes.
function saveReadIds(ids) {
  try {
    const arr = [];
    ids.forEach(function (id) {
      arr.push(id);
    });
    localStorage.setItem(READ_KEY, JSON.stringify(arr));
  } catch (err) {
    // Ignore localStorage errors (e.g. in private browsing).
  }
}
