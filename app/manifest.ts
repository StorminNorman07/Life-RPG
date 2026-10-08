import type {
  MetadataRoute,
} from "next";


export default function manifest():
  MetadataRoute.Manifest {
  return {
    name:
      "Life RPG",

    short_name:
      "Life RPG",

    description:
      "Build better habits, grow your stats, and bring your progress to life.",

    start_url:
      "/",

    scope:
      "/",

    display:
      "standalone",

    background_color:
      "#000000",

    theme_color:
      "#000000",

    orientation:
      "portrait-primary",

    icons: [
      {
        src:
          "/icon-192x192.png",

        sizes:
          "192x192",

        type:
          "image/png",

        purpose:
          "any",
      },

      {
        src:
          "/icon-512x512.png",

        sizes:
          "512x512",

        type:
          "image/png",

        purpose:
          "any",
      },

      {
        src:
          "/icon-512x512.png",

        sizes:
          "512x512",

        type:
          "image/png",

        purpose:
          "maskable",
      },
    ],
  };
}
