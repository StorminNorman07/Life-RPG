"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import {
  lofiSongs,
  type LofiSong,
} from "@/data/lofiSongs";


export type EnvironmentAudioId =
  | "none"
  | "thunderstorm"
  | "ocean"
  | "forest"
  | "fireplace"
  | "downtown"
  | "river";


export type FocusAudioId =
  | "none"
  | "lofi"
  | "liked";


export type AudioOption<
  T extends string
> = {
  id: T;
  name: string;
  icon: string;
  src: string;
};


export const environmentAudioOptions:
  AudioOption<EnvironmentAudioId>[] = [
  {
    id: "none",
    name: "None",
    icon: "🔇",
    src: "",
  },
  {
    id: "thunderstorm",
    name: "Thunderstorm",
    icon: "⛈️",
    src: "/audio/focus/environment/thunderstorm.mp3",
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    icon: "🌊",
    src: "/audio/focus/environment/ocean-waves.mp3",
  },
  {
    id: "forest",
    name: "Forest and Birds",
    icon: "🌲",
    src: "/audio/focus/environment/forest.mp3",
  },
  {
    id: "fireplace",
    name: "Fireplace",
    icon: "🔥",
    src: "/audio/focus/environment/fireplace.mp3",
  },
  {
    id: "downtown",
    name: "Downtown Streets",
    icon: "🌆",
    src: "/audio/focus/environment/downtown.mp3",
  },
  {
    id: "river",
    name: "River",
    icon: "🏞️",
    src: "/audio/focus/environment/river.mp3",
  },
];


export const focusAudioOptions:
  AudioOption<FocusAudioId>[] = [
  {
    id: "none",
    name: "None",
    icon: "🔇",
    src: "",
  },
  {
    id: "lofi",
    name: "Lofi",
    icon: "🎧",
    src: "",
  },
  {
    id: "liked",
    name: "Liked Songs",
    icon: "❤️",
    src: "",
  },
];


type SavedAudio = {
  environmentAudioId?: EnvironmentAudioId;
  focusAudioId?: FocusAudioId;
  environmentVolume?: number;
  focusVolume?: number;
  currentSongId?: string;
  likedSongIds?: string[];
  playerMinimized?: boolean;
};


type FocusAudioContextValue = {
  environmentAudioId: EnvironmentAudioId;
  setEnvironmentAudioId: (
    value: EnvironmentAudioId
  ) => void;
  focusAudioId: FocusAudioId;
  setFocusAudioId: (
    value: FocusAudioId
  ) => void;
  environmentVolume: number;
  setEnvironmentVolume: Dispatch<SetStateAction<number>>;
  focusVolume: number;
  setFocusVolume: Dispatch<SetStateAction<number>>;
  environmentPlaying: boolean;
  focusPlaying: boolean;
  musicPlaying: boolean;
  currentSong: LofiSong | null;
  currentSongLiked: boolean;
  likedSongs: LofiSong[];
  activePlaylist: LofiSong[];
  songHistory: LofiSong[];
  currentTime: number;
  duration: number;
  missingFile: string;
  playerMinimized: boolean;
  setPlayerMinimized: Dispatch<SetStateAction<boolean>>;
  toggleEnvironmentPlayback: () => void;
  toggleMusicPlayback: () => void;
  playPreviousSong: () => void;
  playRandomSong: () => void;
  toggleCurrentSongLike: () => void;
  seekFocus: (seconds: number) => void;
};


type WebkitAudioWindow =
  Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };


const AUDIO_STORAGE_KEY =
  "life-rpg-focus-audio";


const FocusAudioContext =
  createContext<FocusAudioContextValue | null>(
    null
  );


function chooseRandomSong(
  songs: LofiSong[],
  excludedId?: string
) {
  if (
    songs.length === 0
  ) {
    return null;
  }

  const available =
    songs.length > 1
      ? songs.filter(
          (song) =>
            song.id !== excludedId
        )
      : songs;

  return available[
    Math.floor(
      Math.random() *
        available.length
    )
  ];
}


function clampVolume(
  value: unknown,
  fallback: number
) {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed)
  ) {
    return fallback;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(parsed)
    )
  );
}


function isEnvironmentAudioId(
  value: unknown
): value is EnvironmentAudioId {
  return environmentAudioOptions.some(
    (option) =>
      option.id === value
  );
}


function isFocusAudioId(
  value: unknown
): value is FocusAudioId {
  return focusAudioOptions.some(
    (option) =>
      option.id === value
  );
}


export function FocusAudioProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    environmentAudioId,
    setEnvironmentAudioIdState,
  ] = useState<EnvironmentAudioId>(
    "none"
  );

  const [
    focusAudioId,
    setFocusAudioIdState,
  ] = useState<FocusAudioId>(
    "none"
  );

  const [
    environmentVolume,
    setEnvironmentVolume,
  ] = useState(65);

  const [
    focusVolume,
    setFocusVolume,
  ] = useState(28);

  const [
    environmentPlaying,
    setEnvironmentPlaying,
  ] = useState(false);

  const [
    focusPlaying,
    setFocusPlaying,
  ] = useState(false);

  const [
    musicPlaying,
    setMusicPlaying,
  ] = useState(false);

  const [
    currentSong,
    setCurrentSong,
  ] = useState<LofiSong | null>(
    lofiSongs[0] ?? null
  );

  const [
    songHistory,
    setSongHistory,
  ] = useState<LofiSong[]>([]);

  const [
    likedSongIds,
    setLikedSongIds,
  ] = useState<string[]>([]);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    duration,
    setDuration,
  ] = useState(0);

  const [
    missingFile,
    setMissingFile,
  ] = useState("");

  const [
    playerMinimized,
    setPlayerMinimized,
  ] = useState(false);

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  const environmentRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const focusRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const audioContextRef =
    useRef<AudioContext | null>(
      null
    );

  const environmentGainRef =
    useRef<GainNode | null>(
      null
    );

  const focusGainRef =
    useRef<GainNode | null>(
      null
    );

  const graphConnectedRef =
    useRef(false);


  const environmentAudio =
    useMemo(
      () =>
        environmentAudioOptions.find(
          (option) =>
            option.id ===
            environmentAudioId
        ) ??
        environmentAudioOptions[0],
      [
        environmentAudioId,
      ]
    );


  const likedSongs =
    useMemo(
      () =>
        lofiSongs.filter(
          (song) =>
            likedSongIds.includes(
              song.id
            )
        ),
      [
        likedSongIds,
      ]
    );


  const activePlaylist =
    useMemo(
      () =>
        focusAudioId ===
        "liked"
          ? likedSongs
          : lofiSongs,
      [
        focusAudioId,
        likedSongs,
      ]
    );


  const isPlaylistMode =
    focusAudioId ===
      "lofi" ||
    focusAudioId ===
      "liked";


  const focusSource =
    isPlaylistMode
      ? currentSong?.src ?? ""
      : "";


  const setGain =
    useCallback(
      (
        audio: HTMLAudioElement | null,
        gain: GainNode | null,
        volume: number
      ) => {
        const normalized =
          clampVolume(
            volume,
            0
          ) / 100;

        if (
          gain &&
          audioContextRef.current
        ) {
          gain.gain.setTargetAtTime(
            normalized,
            audioContextRef.current.currentTime,
            0.015
          );

          return;
        }

        if (
          audio
        ) {
          audio.volume =
            normalized;
        }
      },
      []
    );


  const ensureAudioGraph =
    useCallback(
      async () => {
        const environmentAudioElement =
          environmentRef.current;

        const focusAudioElement =
          focusRef.current;

        if (
          !environmentAudioElement ||
          !focusAudioElement
        ) {
          return;
        }

        if (
          !audioContextRef.current
        ) {
          const AudioContextClass =
            window.AudioContext ??
            (window as WebkitAudioWindow)
              .webkitAudioContext;

          if (
            !AudioContextClass
          ) {
            return;
          }

          audioContextRef.current =
            new AudioContextClass();
        }

        const audioContext =
          audioContextRef.current;

        if (
          !graphConnectedRef.current
        ) {
          const environmentSource =
            audioContext.createMediaElementSource(
              environmentAudioElement
            );

          const focusSourceNode =
            audioContext.createMediaElementSource(
              focusAudioElement
            );

          const environmentGain =
            audioContext.createGain();

          const focusGain =
            audioContext.createGain();

          environmentSource.connect(
            environmentGain
          );

          environmentGain.connect(
            audioContext.destination
          );

          focusSourceNode.connect(
            focusGain
          );

          focusGain.connect(
            audioContext.destination
          );

          environmentAudioElement.volume =
            1;

          focusAudioElement.volume =
            1;

          environmentGainRef.current =
            environmentGain;

          focusGainRef.current =
            focusGain;

          graphConnectedRef.current =
            true;

          setGain(
            environmentAudioElement,
            environmentGain,
            environmentVolume
          );

          setGain(
            focusAudioElement,
            focusGain,
            focusVolume
          );
        }

        if (
          audioContext.state ===
          "suspended"
        ) {
          await audioContext.resume();
        }
      },
      [
        environmentVolume,
        focusVolume,
        setGain,
      ]
    );


  useEffect(() => {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            AUDIO_STORAGE_KEY
          ) ?? "{}"
        ) as SavedAudio;

      if (
        isEnvironmentAudioId(
          saved.environmentAudioId
        )
      ) {
        setEnvironmentAudioIdState(
          saved.environmentAudioId
        );
      }

      if (
        isFocusAudioId(
          saved.focusAudioId
        )
      ) {
        setFocusAudioIdState(
          saved.focusAudioId
        );
      }

      setEnvironmentVolume(
        clampVolume(
          saved.environmentVolume,
          65
        )
      );

      setFocusVolume(
        clampVolume(
          saved.focusVolume,
          28
        )
      );

      if (
        Array.isArray(
          saved.likedSongIds
        )
      ) {
        setLikedSongIds(
          saved.likedSongIds.filter(
            (id): id is string =>
              typeof id ===
              "string"
          )
        );
      }

      const savedSong =
        lofiSongs.find(
          (song) =>
            song.id ===
            saved.currentSongId
        );

      if (
        saved.focusAudioId ===
        "lofi"
      ) {
        setCurrentSong(
          chooseRandomSong(
            lofiSongs,
            savedSong?.id
          ) ??
            savedSong ??
            lofiSongs[0] ??
            null
        );
      } else if (
        savedSong
      ) {
        setCurrentSong(
          savedSong
        );
      }

      setPlayerMinimized(
        Boolean(
          saved.playerMinimized
        )
      );
    } catch {
      // Keep defaults if saved state is damaged.
    } finally {
      setHydrated(
        true
      );
    }
  }, []);


  useEffect(() => {
    if (
      !hydrated
    ) {
      return;
    }

    const saved:
      SavedAudio = {
      environmentAudioId,
      focusAudioId,
      environmentVolume,
      focusVolume,
      currentSongId:
        currentSong?.id,
      likedSongIds,
      playerMinimized,
    };

    localStorage.setItem(
      AUDIO_STORAGE_KEY,
      JSON.stringify(
        saved
      )
    );
  }, [
    hydrated,
    environmentAudioId,
    focusAudioId,
    environmentVolume,
    focusVolume,
    currentSong,
    likedSongIds,
    playerMinimized,
  ]);


  useEffect(() => {
    setGain(
      environmentRef.current,
      environmentGainRef.current,
      environmentVolume
    );
  }, [
    environmentVolume,
    setGain,
  ]);


  useEffect(() => {
    setGain(
      focusRef.current,
      focusGainRef.current,
      focusVolume
    );
  }, [
    focusVolume,
    setGain,
  ]);


  useEffect(() => {
    const audio =
      environmentRef.current;

    if (
      !audio
    ) {
      return;
    }

    if (
      !environmentPlaying ||
      !environmentAudio.src
    ) {
      audio.pause();
      return;
    }

    void audio
      .play()
      .catch(() => {
        setEnvironmentPlaying(
          false
        );
      });
  }, [
    environmentAudio.src,
    environmentPlaying,
  ]);


  useEffect(() => {
    const audio =
      focusRef.current;

    if (
      !audio
    ) {
      return;
    }

    if (
      !focusPlaying ||
      !focusSource
    ) {
      audio.pause();
      return;
    }

    void audio
      .play()
      .then(() => {
        setMusicPlaying(
          true
        );
      })
      .catch(() => {
        setFocusPlaying(
          false
        );

        setMusicPlaying(
          false
        );
      });
  }, [
    focusPlaying,
    focusSource,
  ]);


  const playRandomSong =
    useCallback(
      () => {
        const next =
          chooseRandomSong(
            activePlaylist,
            currentSong?.id
          );

        if (
          !next
        ) {
          return;
        }

        if (
          currentSong
        ) {
          setSongHistory(
            (history) => [
              ...history.slice(-19),
              currentSong,
            ]
          );
        }

        setCurrentSong(
          next
        );
      },
      [
        activePlaylist,
        currentSong,
      ]
    );


  const playPreviousSong =
    useCallback(
      () => {
        const previous =
          songHistory[
            songHistory.length - 1
          ];

        if (
          !previous
        ) {
          return;
        }

        setSongHistory(
          (history) =>
            history.slice(
              0,
              -1
            )
        );

        setCurrentSong(
          previous
        );
      },
      [
        songHistory,
      ]
    );


  const toggleCurrentSongLike =
    useCallback(
      () => {
        if (
          !currentSong
        ) {
          return;
        }

        setLikedSongIds(
          (ids) =>
            ids.includes(
              currentSong.id
            )
              ? ids.filter(
                  (id) =>
                    id !==
                    currentSong.id
                )
              : [
                  ...ids,
                  currentSong.id,
                ]
        );
      },
      [
        currentSong,
      ]
    );


  const setEnvironmentAudioId =
    useCallback(
      (
        value: EnvironmentAudioId
      ) => {
        setEnvironmentAudioIdState(
          value
        );

        if (
          value ===
          "none"
        ) {
          setEnvironmentPlaying(
            false
          );
        }
      },
      []
    );


  const setFocusAudioId =
    useCallback(
      (
        value: FocusAudioId
      ) => {
        setFocusAudioIdState(
          value
        );

        if (
          value ===
          "none"
        ) {
          setFocusPlaying(
            false
          );

          return;
        }

        if (
          value ===
          "liked"
        ) {
          const nextLiked =
            chooseRandomSong(
              likedSongs,
              currentSong?.id
            );

          if (
            nextLiked
          ) {
            setCurrentSong(
              nextLiked
            );
          }

          return;
        }

        const nextLofi =
          chooseRandomSong(
            lofiSongs,
            currentSong?.id
          );

        if (
          nextLofi
        ) {
          setSongHistory(
            []
          );

          setCurrentSong(
            nextLofi
          );
        }
      },
      [
        currentSong,
        likedSongs,
      ]
    );


  const toggleEnvironmentPlayback =
    useCallback(
      () => {
        const audio =
          environmentRef.current;

        if (
          !audio ||
          !environmentAudio.src
        ) {
          return;
        }

        if (
          environmentPlaying
        ) {
          audio.pause();
          setEnvironmentPlaying(
            false
          );
          return;
        }

        void ensureAudioGraph()
          .catch(() => {
            // The media element still provides the desktop fallback.
          });

        void audio
          .play()
          .then(() => {
            setEnvironmentPlaying(
              true
            );
            setMissingFile("");
          })
          .catch(() => {
            setEnvironmentPlaying(
              false
            );
            setMissingFile(
              environmentAudio.src
            );
          });
      },
      [
        ensureAudioGraph,
        environmentAudio.src,
        environmentPlaying,
      ]
    );


  const toggleMusicPlayback =
    useCallback(
      () => {
        const audio =
          focusRef.current;

        if (
          !audio ||
          focusAudioId ===
            "none" ||
          !focusSource
        ) {
          return;
        }

        if (
          focusPlaying
        ) {
          audio.pause();
          setFocusPlaying(
            false
          );
          setMusicPlaying(
            false
          );
          return;
        }

        void ensureAudioGraph()
          .catch(() => {
            // The media element still provides the desktop fallback.
          });

        void audio
          .play()
          .then(() => {
            setFocusPlaying(
              true
            );
            setMusicPlaying(
              true
            );
            setMissingFile("");
          })
          .catch(() => {
            setFocusPlaying(
              false
            );
            setMusicPlaying(
              false
            );
            setMissingFile(
              focusSource
            );
          });
      },
      [
        ensureAudioGraph,
        focusAudioId,
        focusPlaying,
        focusSource,
      ]
    );


  const seekFocus =
    useCallback(
      (
        seconds: number
      ) => {
        const audio =
          focusRef.current;

        if (
          !audio ||
          !Number.isFinite(
            seconds
          )
        ) {
          return;
        }

        audio.currentTime =
          Math.max(
            0,
            Math.min(
              seconds,
              audio.duration ||
                seconds
            )
          );
      },
      []
    );


  const currentSongLiked =
    currentSong
      ? likedSongIds.includes(
          currentSong.id
        )
      : false;


  const value =
    useMemo<FocusAudioContextValue>(
      () => ({
        environmentAudioId,
        setEnvironmentAudioId,
        focusAudioId,
        setFocusAudioId,
        environmentVolume,
        setEnvironmentVolume,
        focusVolume,
        setFocusVolume,
        environmentPlaying,
        focusPlaying,
        musicPlaying,
        currentSong,
        currentSongLiked,
        likedSongs,
        activePlaylist,
        songHistory,
        currentTime,
        duration,
        missingFile,
        playerMinimized,
        setPlayerMinimized,
        toggleEnvironmentPlayback,
        toggleMusicPlayback,
        playPreviousSong,
        playRandomSong,
        toggleCurrentSongLike,
        seekFocus,
      }),
      [
        environmentAudioId,
        setEnvironmentAudioId,
        focusAudioId,
        setFocusAudioId,
        environmentVolume,
        focusVolume,
        environmentPlaying,
        focusPlaying,
        musicPlaying,
        currentSong,
        currentSongLiked,
        likedSongs,
        activePlaylist,
        songHistory,
        currentTime,
        duration,
        missingFile,
        playerMinimized,
        toggleEnvironmentPlayback,
        toggleMusicPlayback,
        playPreviousSong,
        playRandomSong,
        toggleCurrentSongLike,
        seekFocus,
      ]
    );


  return (
    <FocusAudioContext.Provider
      value={
        value
      }
    >
      {children}

      <audio
        ref={
          environmentRef
        }
        src={
          environmentAudio.src ||
          undefined
        }
        loop
        preload="auto"
        className="hidden"
        onCanPlay={() =>
          setMissingFile("")
        }
        onError={() => {
          if (
            environmentAudio.src
          ) {
            setMissingFile(
              environmentAudio.src
            );
          }
        }}
      />

      <audio
        ref={
          focusRef
        }
        src={
          focusSource ||
          undefined
        }
        preload="metadata"
        className="hidden"
        onEnded={
          playRandomSong
        }
        onPlay={() => {
          setFocusPlaying(
            true
          );

          setMusicPlaying(
            true
          );
        }}
        onPause={() =>
          setMusicPlaying(
            false
          )
        }
        onTimeUpdate={(event) =>
          setCurrentTime(
            event.currentTarget.currentTime
          )
        }
        onLoadedMetadata={(event) => {
          setDuration(
            event.currentTarget.duration ||
              0
          );

          setMissingFile("");
        }}
        onCanPlay={() =>
          setMissingFile("")
        }
        onError={() => {
          if (
            focusSource
          ) {
            setMissingFile(
              focusSource
            );
          }
        }}
      />
    </FocusAudioContext.Provider>
  );
}


export function useFocusAudio() {
  const context =
    useContext(
      FocusAudioContext
    );

  if (
    !context
  ) {
    throw new Error(
      "useFocusAudio must be used inside FocusAudioProvider."
    );
  }

  return context;
}
