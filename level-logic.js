(function(root){
  function defaultCellKey(q, r){
    return q + ',' + r;
  }

  function rotateCell([q, r]){ return [q + r, -q]; }
  function flipCell([q, r]){ return [q, -q - r]; }

  function currentCells(piece){
    return piece.base.map(c => {
      let cell = c;
      if(piece.flip) cell = flipCell(cell);
      for(let i = 0; i < piece.rotation; i++) cell = rotateCell(cell);
      return cell;
    });
  }

  function getPieceCells(piece){
    if(!piece || !piece.placed || !piece.anchor) return [];
    return currentCells(piece).map(([dq, dr]) => [piece.anchor.q + dq, piece.anchor.r + dr]);
  }

  function isLevelSolved(level, pieces, solution, cellKeyFn = defaultCellKey){
    if(!level || !Array.isArray(pieces) || !solution || typeof solution.get !== 'function') return false;
    if(!Array.isArray(level.cells) || level.cells.length === 0) return false;

    const covered = new Map();
    for(const piece of pieces){
      const cells = getPieceCells(piece);
      for(const [q, r] of cells){
        const key = cellKeyFn(q, r);
        if(!level.cells.some(([cellQ, cellR]) => cellQ === q && cellR === r)) return false;
        if(covered.has(key)) return false;
        covered.set(key, piece.id);
      }
    }

    if(covered.size !== level.cells.length) return false;

    for(const [q, r] of level.cells){
      const key = cellKeyFn(q, r);
      if(!covered.has(key)) return false;
      if(covered.get(key) !== solution.get(key)) return false;
    }

    return true;
  }

  function normalizeSharedGameState(raw, fallback = {}){
    const fallbackPieces = Array.isArray(fallback.pieces) ? fallback.pieces : [];
    const sourcePieces = Array.isArray(raw && raw.pieces) ? raw.pieces : fallbackPieces;
    const levelIdx = Number.isInteger(raw && raw.levelIdx) ? raw.levelIdx : (Number.isInteger(fallback.levelIdx) ? fallback.levelIdx : 0);
    const selectedId = Number.isInteger(raw && raw.selectedId) ? raw.selectedId : (Number.isInteger(fallback.selectedId) ? fallback.selectedId : null);
    const screen = raw && raw.screen === 'game' || raw && raw.gameStarted === true
      ? 'game'
      : (raw && raw.screen === 'home' || raw && raw.gameStarted === false ? 'home' : (fallback.screen === 'game' ? 'game' : 'home'));
    const won = !!(raw && raw.won !== undefined ? raw.won : fallback.won);

    return {
      levelIdx,
      screen,
      won,
      selectedId,
      pieces: sourcePieces.map(pd => ({
        rotation: typeof pd && typeof pd.rotation === 'number' ? pd.rotation : 0,
        flip: !!(pd && pd.flip),
        placed: !!(pd && pd.placed),
        anchor: pd && pd.anchor ? pd.anchor : null
      }))
    };
  }

  const api = { defaultCellKey, isLevelSolved, normalizeSharedGameState };
  if(typeof module !== 'undefined' && module.exports){
    module.exports = api;
  }
  root.levelLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
