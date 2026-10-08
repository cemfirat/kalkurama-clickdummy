export const transferState = Object.freeze({
  schemaVersion: 1,

  // Audited non-time Work corrections UI-lab baseline aligned with Kalkurama issue #86.
  uiBaselineClickdummyCommit: "552f3215d4fe3b9119ddea84de74c77f55fef543",

  // Set only after a later clickdummy UI delta has been intentionally ported
  // to productive Kalkurama and the resulting Kalkurama commit is known.
  lastPromotion: null
});
