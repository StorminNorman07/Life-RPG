"use client";

import {
  useEffect,
  useRef,
} from "react";

import SkillMap from "@/components/SkillMap";


export default function SkillTreePage() {
  const mapViewportRef =
    useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    const viewport =
      mapViewportRef.current;

    if (!viewport) {
      return;
    }

    const activeViewport =
      viewport;

    const storageKey =
      "life-rpg-skill-map-position";

    const frame =
      window.requestAnimationFrame(() => {
        try {
          const saved =
            localStorage.getItem(
              storageKey
            );

          if (saved) {
            const position =
              JSON.parse(
                saved
              ) as {
                left?: number;
                top?: number;
              };

            activeViewport.scrollTo({
              left:
                Math.max(
                  0,
                  position.left ??
                    0
                ),

              top:
                Math.max(
                  0,
                  position.top ??
                    0
                ),

              behavior:
                "auto",
            });

            return;
          }
        } catch {}

        activeViewport.scrollTo({
          left:
            Math.max(
              0,
              (activeViewport.scrollWidth -
                activeViewport.clientWidth) /
                2
            ),

          top:
            Math.max(
              0,
              (activeViewport.scrollHeight -
                activeViewport.clientHeight) /
                2
            ),

          behavior:
            "auto",
        });
      });

    function savePosition() {
      localStorage.setItem(
        storageKey,

        JSON.stringify({
          left:
            activeViewport.scrollLeft,

          top:
            activeViewport.scrollTop,
        })
      );
    }

    activeViewport.addEventListener(
      "scroll",
      savePosition,
      {
        passive:
          true,
      }
    );

    return () => {
      window.cancelAnimationFrame(
        frame
      );

      activeViewport.removeEventListener(
        "scroll",
        savePosition
      );
    };
  }, []);


  return (
    <main
      className="
        min-h-screen
        bg-black
        pb-24
        text-white

        md:p-8
        md:pb-16
      "
    >
      <header
        className="
          px-4
          pb-4
          pt-3
          text-center

          md:px-0
          md:pb-8
          md:pt-0
        "
      >
        <h1
          className="
            text-3xl
            font-black

            md:text-4xl
          "
        >
          🌳 Skill Tree
        </h1>

        <p
          className="
            mx-auto
            mt-2
            max-w-3xl
            text-sm
            leading-6
            text-gray-400

            md:text-base
          "
        >
          Complete one-time milestones, customize the four paths, and decide which attributes each path develops.
        </p>
      </header>


      <div
        className="
          px-3

          md:px-0
        "
      >
        <div
          ref={mapViewportRef}
          className="
            h-[calc(100dvh-12.5rem)]
            min-h-[430px]
            w-full
            overflow-auto
            overscroll-contain
            rounded-3xl
            border
            border-white/10
            bg-zinc-950/70
            shadow-[inset_0_0_45px_rgba(0,0,0,.6)]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            md:h-auto
            md:min-h-0
            md:overflow-visible
            md:border-0
            md:bg-transparent
            md:shadow-none
          "
        >
          <div
            className="
              flex
              min-h-[550px]
              min-w-[550px]
              items-center
              justify-center

              md:min-h-0
              md:min-w-0
            "
          >
            <SkillMap />
          </div>
        </div>

        <p
          className="
            mt-3
            text-center
            text-xs
            font-bold
            uppercase
            tracking-[0.16em]
            text-zinc-600

            md:hidden
          "
        >
          Drag to explore the map
        </p>
      </div>
    </main>
  );
}
