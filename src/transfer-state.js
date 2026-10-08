export const transferState = Object.freeze({
  schemaVersion: 1,

  // Invoice Line Discounts UI-lab baseline aligned with Kalkurama issue #85.
  uiBaselineClickdummyCommit: "fd39664fc00620f8c137455beedfcbfaf48bfab1",

  // Set only after a later clickdummy UI delta has been intentionally ported
  // to productive Kalkurama and the resulting Kalkurama commit is known.
  lastPromotion: null
});
