"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";


type DialogTone =
  | "default"
  | "warning"
  | "danger"
  | "success";


type DialogChoice = {
  value: string;
  label: string;
  tone?: DialogTone;
};


type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: DialogTone;
};


type AlertOptions = {
  title: string;
  description?: string;
  buttonLabel?: string;
  tone?: DialogTone;
};


type ChooseOptions = {
  title: string;
  description?: string;
  choices: DialogChoice[];
  cancelLabel?: string;
  tone?: DialogTone;
};


type DialogRequest = {
  id: number;
  kind: "confirm" | "alert" | "choose";
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  buttonLabel?: string;
  tone: DialogTone;
  choices?: DialogChoice[];
  resolve: (value: boolean | string | null) => void;
};


type AppDialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
  choose: (options: ChooseOptions) => Promise<string | null>;
};


const AppDialogContext =
  createContext<AppDialogContextValue | null>(null);


export function AppDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [queue, setQueue] =
    useState<DialogRequest[]>([]);

  const nextIdRef =
    useRef(1);

  const active =
    queue[0] ?? null;


  const enqueue =
    useCallback(
      (
        request: Omit<DialogRequest, "id">
      ) => {
        setQueue((current) => [
          ...current,
          {
            ...request,
            id: nextIdRef.current++,
          },
        ]);
      },
      []
    );


  const close =
    useCallback(
      (value: boolean | string | null) => {
        setQueue((current) => {
          const currentDialog =
            current[0];

          if (!currentDialog) {
            return current;
          }

          currentDialog.resolve(value);

          return current.slice(1);
        });
      },
      []
    );


  const confirm =
    useCallback(
      (options: ConfirmOptions) =>
        new Promise<boolean>((resolve) => {
          enqueue({
            kind: "confirm",
            title: options.title,
            description: options.description,
            confirmLabel:
              options.confirmLabel ?? "Confirm",
            cancelLabel:
              options.cancelLabel ?? "Cancel",
            tone:
              options.tone ?? "default",
            resolve: (value) =>
              resolve(value === true),
          });
        }),
      [enqueue]
    );


  const alert =
    useCallback(
      (options: AlertOptions) =>
        new Promise<void>((resolve) => {
          enqueue({
            kind: "alert",
            title: options.title,
            description: options.description,
            buttonLabel:
              options.buttonLabel ?? "OK",
            tone:
              options.tone ?? "default",
            resolve: () => resolve(),
          });
        }),
      [enqueue]
    );


  const choose =
    useCallback(
      (options: ChooseOptions) =>
        new Promise<string | null>((resolve) => {
          enqueue({
            kind: "choose",
            title: options.title,
            description: options.description,
            choices: options.choices,
            cancelLabel:
              options.cancelLabel ?? "Cancel",
            tone:
              options.tone ?? "default",
            resolve: (value) =>
              resolve(
                typeof value === "string"
                  ? value
                  : null
              ),
          });
        }),
      [enqueue]
    );


  useEffect(() => {
    if (!active) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key !== "Escape") {
        return;
      }

      if (active.kind === "alert") {
        close(true);
      } else {
        close(null);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [active, close]);


  return (
    <AppDialogContext.Provider
      value={{
        confirm,
        alert,
        choose,
      }}
    >
      {children}

      {active && (
        <AppDialog
          request={active}
          onClose={close}
        />
      )}
    </AppDialogContext.Provider>
  );
}


function AppDialog({
  request,
  onClose,
}: {
  request: DialogRequest;
  onClose: (
    value: boolean | string | null
  ) => void;
}) {
  const toneStyles = {
    default: {
      border: "border-white/15",
      badge: "border-white/15 bg-white/5 text-white",
      icon: "✦",
      button: "bg-white text-black hover:bg-zinc-200",
    },
    warning: {
      border: "border-yellow-400/25",
      badge: "border-yellow-400/30 bg-yellow-400/10 text-yellow-200",
      icon: "⚠️",
      button: "bg-yellow-400 text-black hover:bg-yellow-300",
    },
    danger: {
      border: "border-red-500/30",
      badge: "border-red-500/30 bg-red-500/10 text-red-200",
      icon: "⚠️",
      button: "bg-red-600 text-white hover:bg-red-500",
    },
    success: {
      border: "border-green-500/25",
      badge: "border-green-500/25 bg-green-500/10 text-green-200",
      icon: "✓",
      button: "bg-green-400 text-black hover:bg-green-300",
    },
  } satisfies Record<
    DialogTone,
    {
      border: string;
      badge: string;
      icon: string;
      button: string;
    }
  >;

  const style =
    toneStyles[request.tone];

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target !==
          event.currentTarget
        ) {
          return;
        }

        if (request.kind === "alert") {
          onClose(true);
        } else {
          onClose(null);
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`app-dialog-${request.id}`}
        className={`w-full max-w-md rounded-t-[2rem] border bg-zinc-950 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white shadow-[0_30px_100px_rgba(0,0,0,.7)] sm:rounded-3xl sm:p-6 ${style.border}`}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl ${style.badge}`}
          >
            {style.icon}
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id={`app-dialog-${request.id}`}
              className="text-2xl font-black"
            >
              {request.title}
            </h2>

            {request.description && (
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-400">
                {request.description}
              </p>
            )}
          </div>
        </div>

        {request.kind === "choose" ? (
          <div className="mt-6 space-y-3">
            {request.choices?.map(
              (choice) => {
                const choiceStyle =
                  toneStyles[
                    choice.tone ??
                      request.tone
                  ];

                return (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() =>
                      onClose(choice.value)
                    }
                    className={`w-full rounded-xl px-4 py-3 text-left font-black transition ${choiceStyle.button}`}
                  >
                    {choice.label}
                  </button>
                );
              }
            )}

            <button
              type="button"
              onClick={() => onClose(null)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 font-bold text-zinc-300 transition hover:border-white/25 hover:text-white"
            >
              {request.cancelLabel}
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            {request.kind === "confirm" && (
              <button
                type="button"
                onClick={() => onClose(false)}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-black px-4 py-3 font-bold text-zinc-300 transition hover:border-white/25 hover:text-white sm:w-auto"
              >
                {request.cancelLabel}
              </button>
            )}

            <button
              type="button"
              autoFocus
              onClick={() => onClose(true)}
              className={`min-h-12 w-full rounded-xl px-5 py-3 font-black transition sm:w-auto ${style.button}`}
            >
              {request.kind === "alert"
                ? request.buttonLabel
                : request.confirmLabel}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}


export function useAppDialog() {
  const context =
    useContext(AppDialogContext);

  if (!context) {
    throw new Error(
      "useAppDialog must be used inside AppDialogProvider"
    );
  }

  return context;
}
