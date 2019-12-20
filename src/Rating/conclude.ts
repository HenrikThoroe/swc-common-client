import Rating from ".";

export default function conclude(rating: Rating): number {
    return rating.mobility.me - rating.mobility.opponent + (rating.surrounding.me - rating.surrounding.opponent)
}