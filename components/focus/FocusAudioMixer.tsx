"use client";

import type {
  ReactNode,
} from "react";

import {
  environmentAudioOptions,
  focusAudioOptions,
  type AudioOption,
  useFocusAudio,
} from "@/context/FocusAudioContext";

import type {
  SceneId,
} from "@/context/FocusTimerContext";


export default function FocusAudioMixer({
  sceneId,
}: {
  sceneId: SceneId;
}) {
  void sceneId;

  const {
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
  } = useFocusAudio();


  const playlistMode =
    focusAudioId ===
      "lofi" ||
    focusAudioId ===
      "liked";


  return (
    <>
      <section
        className="
          h-full
          rounded-2xl
          border
          border-white/10
          bg-zinc-950/75
          p-5
          shadow-[0_18px_60px_rgba(0,0,0,.22)]
          backdrop-blur-xl
        "
      >
        <div>
          <h2
            className="
              text-xl
              font-black
            "
          >
            🎚️ Audio Mixer
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-zinc-500
            "
          >
            Combine one environmental sound with optional focus audio.
          </p>
        </div>


        <div
          className="
            mt-5
            space-y-5
          "
        >
          <AudioLayerControl
            label="Environment Audio"
            value={
              environmentAudioId
            }
            options={
              environmentAudioOptions
            }
            volume={
              environmentVolume
            }
            playing={
              environmentPlaying
            }
            disabled={
              environmentAudioId ===
              "none"
            }
            onValueChange={
              setEnvironmentAudioId
            }
            onVolumeChange={
              setEnvironmentVolume
            }
            onTogglePlayback={
              toggleEnvironmentPlayback
            }
          />

          <AudioLayerControl
            label="Focus Audio"
            value={
              focusAudioId
            }
            options={
              focusAudioOptions
            }
            volume={
              focusVolume
            }
            playing={
              focusPlaying
            }
            disabled={
              focusAudioId ===
                "none" ||
              (
                focusAudioId ===
                  "liked" &&
                likedSongs.length ===
                  0
              )
            }
            onValueChange={
              setFocusAudioId
            }
            onVolumeChange={
              setFocusVolume
            }
            onTogglePlayback={
              toggleMusicPlayback
            }
          />
        </div>


        {focusAudioId ===
          "liked" &&
        likedSongs.length ===
          0 && (
          <p
            className="
              mt-4
              rounded-xl
              border
              border-zinc-800
              bg-black
              p-3
              text-sm
              text-zinc-400
            "
          >
            You have no liked songs yet. Heart songs in the player to build this playlist.
          </p>
        )}


        {missingFile && (
          <div
            className="
              mt-5
              rounded-xl
              border
              border-amber-800
              bg-amber-950/30
              p-3
              text-sm
              text-amber-200
            "
          >
            Audio file missing:{" "}
            <code>
              {missingFile}
            </code>
          </div>
        )}
      </section>


      {playlistMode &&
        currentSong && (
        <div
          className={`
            fixed
            z-[1100]

            bottom-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom)+0.75rem)]
            md:bottom-5

            rounded-[1.4rem]
            border
            border-white/10
            bg-zinc-950/95
            shadow-[0_24px_90px_rgba(0,0,0,.72)]
            backdrop-blur-2xl

            transition-all
            duration-300

            ${
              playerMinimized
                ? "left-3 right-auto w-auto translate-x-0 p-2 md:left-5"
                : "left-1/2 right-auto w-[calc(100%-1.5rem)] max-w-4xl -translate-x-1/2 p-3 md:w-[calc(100%-2rem)] md:p-4"
            }
          `}
        >
          {playerMinimized ? (
            <button
              type="button"
              onClick={() =>
                setPlayerMinimized(
                  false
                )
              }
              className="
                flex
                h-12
                items-center
                gap-2
                rounded-full
                bg-gradient-to-br
                from-indigo-600
                via-violet-600
                to-fuchsia-600
                px-4
                font-black
                text-white
                shadow-[0_8px_24px_rgba(99,102,241,.38)]
                transition

                hover:brightness-110
              "
              title={`${currentSong.title} — expand player`}
              aria-label="Expand audio player"
            >
              <span
                aria-hidden="true"
              >
                🎵
              </span>

              <span>
                Open player
              </span>
            </button>
          ) : (
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
                md:gap-4
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  flex-1
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-indigo-600
                    via-violet-600
                    to-fuchsia-600
                    text-xl
                    shadow-[0_10px_30px_rgba(99,102,241,.28)]

                    md:h-12
                    md:w-12
                  "
                >
                  🎵
                </div>

                <div
                  className="
                    min-w-0
                  "
                >
                  <p
                    className="
                      truncate
                      font-black
                    "
                  >
                    {currentSong.title}
                  </p>

                  <p
                    className="
                      truncate
                      text-xs
                      text-zinc-500

                      md:text-sm
                    "
                  >
                    {currentSong.artist} ·{" "}
                    {focusAudioId ===
                    "liked"
                      ? "Liked Songs"
                      : "Lofi"}
                  </p>
                </div>
              </div>


              <div
                className="
                  grid
                  w-full
                  grid-cols-5
                  items-center
                  gap-1

                  sm:w-[340px]
                  sm:gap-3
                "
              >
                <PlayerButton
                  label="Minimize player"
                  onClick={() =>
                    setPlayerMinimized(
                      true
                    )
                  }
                >
                  －
                </PlayerButton>

                <PlayerButton
                  label="Previous song"
                  onClick={
                    playPreviousSong
                  }
                  disabled={
                    songHistory.length ===
                    0
                  }
                >
                  ⏮
                </PlayerButton>

                <PlayerButton
                  label={
                    musicPlaying
                      ? "Pause"
                      : "Play"
                  }
                  onClick={
                    toggleMusicPlayback
                  }
                  primary
                >
                  {musicPlaying
                    ? "⏸"
                    : "▶"}
                </PlayerButton>

                <PlayerButton
                  label="Next song"
                  onClick={
                    playRandomSong
                  }
                  disabled={
                    activePlaylist.length ===
                    0
                  }
                >
                  ⏭
                </PlayerButton>

                <PlayerButton
                  label={
                    currentSongLiked
                      ? "Unlike song"
                      : "Like song"
                  }
                  onClick={
                    toggleCurrentSongLike
                  }
                >
                  {currentSongLiked
                    ? "❤️"
                    : "♡"}
                </PlayerButton>
              </div>


              <div
                className="
                  hidden
                  basis-full

                  sm:block
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      w-10
                      text-right
                      font-mono
                      text-xs
                      text-zinc-500
                    "
                  >
                    {formatPlayerTime(
                      currentTime
                    )}
                  </span>

                  <input
                    type="range"
                    min="0"
                    max={
                      duration ||
                      0
                    }
                    step="0.1"
                    value={
                      Math.min(
                        currentTime,
                        duration ||
                          0
                      )
                    }
                    onChange={(event) =>
                      seekFocus(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="
                      min-w-0
                      flex-1
                      accent-white
                    "
                    aria-label="Song progress"
                  />

                  <span
                    className="
                      w-10
                      font-mono
                      text-xs
                      text-zinc-500
                    "
                  >
                    {formatPlayerTime(
                      duration
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}


function AudioLayerControl<
  T extends string
>({
  label,
  value,
  options,
  volume,
  playing,
  disabled,
  onValueChange,
  onVolumeChange,
  onTogglePlayback,
}: {
  label: string;
  value: T;
  options: AudioOption<T>[];
  volume: number;
  playing: boolean;
  disabled: boolean;
  onValueChange: (
    value: T
  ) => void;
  onVolumeChange: (
    value: number
  ) => void;
  onTogglePlayback: () => void;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-gradient-to-b
        from-white/[0.045]
        to-white/[0.015]
        p-4
        shadow-[inset_0_1px_0_rgba(255,255,255,.04)]
      "
    >
      <label
        className="
          block
        "
      >
        <span
          className="
            text-[11px]
            font-black
            uppercase
            tracking-[0.18em]
            text-zinc-500
          "
        >
          {label}
        </span>

        <select
          value={
            value
          }
          onChange={(event) =>
            onValueChange(
              event.target.value as T
            )
          }
          className="
            mt-2
            w-full
            appearance-none
            rounded-xl
            border
            border-white/10
            bg-zinc-900/90
            px-4
            py-3
            pr-10
            font-semibold
            text-white
            outline-none
            transition

            hover:border-white/20
            focus:border-white/30
            focus:ring-2
            focus:ring-white/10
          "
        >
          {options.map(
            (option) => (
              <option
                key={
                  option.id
                }
                value={
                  option.id
                }
              >
                {option.icon} {option.name}
              </option>
            )
          )}
        </select>
      </label>


      <div
        className="
          mt-3
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-black/35
          p-2.5
          backdrop-blur

          sm:gap-3
        "
      >
        <button
          type="button"
          onClick={
            onTogglePlayback
          }
          disabled={
            disabled
          }
          className={`
            min-w-[5.25rem]
            rounded-full
            border
            px-3
            py-2
            text-sm
            font-black
            shadow-sm
            transition

            disabled:cursor-not-allowed
            disabled:opacity-35

            ${
              playing
                ? "border-white/15 bg-white text-black hover:bg-zinc-200"
                : "border-white/10 bg-zinc-900 text-white hover:border-white/25 hover:bg-zinc-800"
            }
          `}
        >
          {playing
            ? "■ Stop"
            : "▶ Play"}
        </button>

        <span
          className="
            hidden
            shrink-0
            text-xs
            font-bold
            text-zinc-500

            sm:inline
          "
          aria-hidden="true"
        >
          🔊
        </span>

        <input
          type="range"
          min="0"
          max="100"
          value={
            volume
          }
          onChange={(event) =>
            onVolumeChange(
              Number(
                event.target.value
              )
            )
          }
          className="
            min-w-0
            flex-1
            accent-white
          "
          aria-label={`${label} volume`}
        />

        <span
          className="
            w-9
            shrink-0
            text-right
            text-xs
            font-bold
            text-zinc-500
          "
        >
          {volume}%
        </span>
      </div>
    </div>
  );
}


function PlayerButton({
  label,
  onClick,
  children,
  disabled = false,
  primary = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={
        label
      }
      title={
        label
      }
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className={`
        mx-auto
        flex
        items-center
        justify-center
        rounded-full
        border
        text-lg
        shadow-sm
        transition

        disabled:cursor-not-allowed
        disabled:opacity-30

        ${
          primary
            ? "h-12 w-12 border-white bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,.16)] hover:bg-zinc-200"
            : "h-10 w-10 border-white/10 bg-white/[0.035] text-white hover:border-white/25 hover:bg-white/[0.08]"
        }
      `}
    >
      {children}
    </button>
  );
}


function formatPlayerTime(
  seconds: number
) {
  if (
    !Number.isFinite(
      seconds
    ) ||
    seconds < 0
  ) {
    return "0:00";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remaining =
    Math.floor(
      seconds % 60
    );

  return `${minutes}:${String(
    remaining
  ).padStart(2, "0")}`;
}
