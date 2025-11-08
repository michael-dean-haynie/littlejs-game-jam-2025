/** How high to shift a cell of terrain for the top-down-oblique perspective */
export const cliffHeightObliqueOffsets: { [index: number]: number } = {
  0: 0, // water does not shift
  1: 0, // base level ground does not shift
  2: 1,
  3: 2,
  4: 3,
  5: 4,
};
