/**
 * Wording shared by the dumb.co/mobile quiz and /activate. /mobile's script
 * reads these from window.QUIZ_COPY (see src/pages/mobile.astro); the
 * components below render them directly.
 */

// The phone-number recommendation for someone who won't keep a smartphone
// (/mobile result card, /activate "we recommend transferring…").
export const TRANSFER_HEADLINE = "transfer your current phone number";
export const TRANSFER_BODY_HTML =
  "<p>since your dumbphone will become your primary device, transferring your current number lets you continue using the same number everyone already knows.</p>" +
  "<p>you still have the option to get a brand new number, if you'd like!</p>";
