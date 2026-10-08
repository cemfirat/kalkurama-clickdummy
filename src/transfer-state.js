export const transferState = Object.freeze({
  schemaVersion: 1,

  // Initial Kalkurama clickdummy foundation baseline:
  // Billings-like customer/project workspace + UIkit themes + Styleguide + local Theme Studio.
  uiBaselineClickdummyCommit: "5f36146c4faf9ddd63a8ad9e2c207bcb6730d2bc",

  // Set only after a later clickdummy UI delta has been intentionally ported
  // to productive Kalkurama and the resulting Kalkurama commit is known.
  lastPromotion: null
});
