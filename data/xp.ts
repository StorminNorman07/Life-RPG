import { PlayerState } from "./playerState";

export function addXP(
  player: PlayerState,
  attribute: string,
  amount: number
) {
  if (attribute in player.attributes) {
    player.attributes[attribute] += amount;
  }

  player.totalXP += amount;
}