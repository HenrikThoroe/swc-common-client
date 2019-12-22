import Rating from ".";

export default function conclude(rating: Rating): number {
    return rating.mobility + rating.surrounding
}