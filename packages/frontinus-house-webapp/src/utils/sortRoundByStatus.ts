import { StoredAuctionBase } from '@nouns/frontinus-house-wrapper/dist/builders';
import { AuctionStatus, auctionStatus } from './auctionStatus';
import { isInfAuction, isTimedAuction } from './auctionType';

/**
 * Sort rounds, or groups of rounds, by their status.
 * Custom order: Proposing, Voting, Not Started, Ended
 */
export const sortRoundByStatus = (rounds: StoredAuctionBase[]) => [
  ...rounds.filter(
    round => auctionStatus(round) === AuctionStatus.AuctionAcceptingProps && isInfAuction(round),
  ),
  ...rounds.filter(
    round => auctionStatus(round) === AuctionStatus.AuctionAcceptingProps && isTimedAuction(round),
  ),
  ...rounds.filter(round => auctionStatus(round) === AuctionStatus.AuctionVoting),
  ...rounds.filter(round => auctionStatus(round) === AuctionStatus.AuctionNotStarted),
  ...rounds.filter(round => auctionStatus(round) === AuctionStatus.AuctionEnded),
  ...rounds.filter(round => auctionStatus(round) === AuctionStatus.Pending)
    .sort((a, b) => (a.startTime > b.startTime ? -1 : 1)),
];
