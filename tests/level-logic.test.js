const assert = require('node:assert/strict');
const path = require('node:path');

try {
  const { isLevelSolved, defaultCellKey, normalizeSharedGameState } = require(path.join(__dirname, '..', 'level-logic.js'));

  const level = { cells: [[0, 0], [1, 0], [0, 1]] };
  const solution = new Map([
    ['0,0', 0],
    ['1,0', 1],
    ['0,1', 2],
  ]);

  const solvedPieces = [
    { id: 0, base: [[0, 0]], rotation: 0, flip: false, placed: true, anchor: { q: 0, r: 0 } },
    { id: 1, base: [[0, 0]], rotation: 0, flip: false, placed: true, anchor: { q: 1, r: 0 } },
    { id: 2, base: [[0, 0]], rotation: 0, flip: false, placed: true, anchor: { q: 0, r: 1 } },
  ];

  assert.equal(isLevelSolved(level, solvedPieces, solution, defaultCellKey), true, 'A correctly placed set should resolve as solved');

  const wrongPieces = solvedPieces.map((piece, index) => (index === 1 ? { ...piece, anchor: { q: 0, r: 1 } } : piece));
  assert.equal(isLevelSolved(level, wrongPieces, solution, defaultCellKey), false, 'A board with a misplaced piece should not resolve as solved');

  const restored = normalizeSharedGameState({ levelIdx: 2, screen: 'game', won: true, selectedId: 1, pieces: [{ rotation: 3, flip: true, placed: true, anchor: { q: 1, r: 2 } }] }, { levelIdx: 0, screen: 'home', won: false, selectedId: null, pieces: [] });
  assert.equal(restored.levelIdx, 2, 'The shared state should preserve the remote level');
  assert.equal(restored.screen, 'game', 'The shared state should preserve the remote screen view');
  assert.equal(restored.pieces[0].rotation, 3, 'The shared state should preserve piece rotations');

  console.log('level logic tests passed');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
