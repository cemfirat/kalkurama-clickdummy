export const transferState = Object.freeze({
  schemaVersion: 1,

  // Initial Kalkurama clickdummy foundation baseline:
  // Billings-like customer/project workspace + UIkit themes + Styleguide + local Theme Studio.
  uiBaselineClickdummyCommit: "6a6a494e759b366e103045645e7e1143e75eabad",

  // Set only after a later clickdummy UI delta has been intentionally ported
  // to productive Kalkurama and the resulting Kalkurama commit is known.
  lastPromotion: null
});
