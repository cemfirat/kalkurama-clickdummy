export const transferState = Object.freeze({
  schemaVersion: 1,

  // Latest audited clickdummy checkpoint synchronized from productive Kalkurama.
  // Product -> clickdummy re-anchoring updates this value and is not a promotion.
  uiBaselineClickdummyCommit: "e0ca4ad7075a85671dc8919d3805cd044f537de2",

  // Set only after a clickdummy-originated UI delta has been intentionally
  // ported to productive Kalkurama and the resulting Kalkurama commit is known.
  lastPromotion: null
});
