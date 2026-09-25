import {
  defaultAttributes,
} from "@/data/categories";


export type PlayerState = {
  name: string;

  totalXP: number;

  dailyTaskXP: number;

  skillTreeXP: number;

  attributes: {
    [attributeId: string]: number;
  };
};


export const initialPlayer:
  PlayerState = {
  name: "Norman",

  totalXP: 0,

  dailyTaskXP: 0,

  skillTreeXP: 0,

  attributes:
    Object.fromEntries(
      defaultAttributes.map(
        (
          attribute
        ) => [
          attribute.id,
          0,
        ]
      )
    ),
};
