import * as Candidate from "__CANDIDATE_DETAILS__";
import * as Reference from "__REFERENCE_DETAILS__";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type Sources = Assert<Equal<Candidate.ChangeSource, Reference.ChangeSource>>;
type DefaultChange = Assert<Equal<Candidate.ChangeDetails, Reference.ChangeDetails>>;
type DefaultCommit = Assert<Equal<Candidate.CommitDetails, Reference.CommitDetails>>;
type ResolveSource = Assert<Equal<typeof Candidate.resolveSource, typeof Reference.resolveSource>>;
type WithSource = Assert<Equal<typeof Candidate.withSource, typeof Reference.withSource>>;
type DismissalGuard = Assert<Equal<typeof Candidate.isDismissal, typeof Reference.isDismissal>>;
const constructor: typeof Reference.createDetails = Candidate.createDetails;
const referenceConstructor: typeof Candidate.createDetails = Reference.createDetails;

type Vocabulary = Assert<Equal<Candidate.ReasonVocabulary, Reference.ReasonVocabulary>>;
type Reasons = Assert<Equal<Candidate.ChangeReason, Reference.ChangeReason>>;
type Changes = Assert<Equal<Candidate.ChangeDetails<Reference.ChangeReason>, Reference.ChangeDetails<Reference.ChangeReason>>>;
type Commits = Assert<Equal<Candidate.CommitDetails<Reference.ChangeReason>, Reference.CommitDetails<Reference.ChangeReason>>>;
type Options = Assert<Equal<Candidate.ChangeOptions<Reference.ChangeReason>, Reference.ChangeOptions<Reference.ChangeReason>>>;
type Dismissals = Assert<Equal<Candidate.DismissReason, Reference.DismissReason>>;
type Attempts = Assert<Equal<Candidate.DismissAttemptDetails, Reference.DismissAttemptDetails>>;
type AttemptReasons = Assert<Equal<Candidate.DismissAttemptReason, Reference.DismissAttemptReason>>;

const change = Candidate.createDetails({reason:"escape-key", row:7}, "keyboard");
const row: 7 = change.row;
const event: KeyboardEvent | undefined = change.event;
const stopped: boolean = change.canceled;
change.cancel();
// @ts-expect-error the const generic preserves readonly extra fields
change.row = 9;
// @ts-expect-error canceled is a live readonly property
change.canceled = true;

const commit = Candidate.createDetails({reason:"input-commit", row:7}, "programmatic", false);
const commitEvent: FocusEvent | KeyboardEvent | undefined = commit.event;
// @ts-expect-error a commit created without cancellation has no cancel method
commit.cancel();
// @ts-expect-error a commit created without cancellation has no canceled property
commit.canceled;
const custom = Candidate.createDetails({reason:"custom-reason"}, "agent");
const customEvent: Event | undefined = custom.event;
// The original constructor trusts the reason/event pair; do not silently narrow its input.
Candidate.createDetails({reason:"escape-key", event:new MouseEvent("click")}, "mouse");
// @ts-expect-error invalid source
Candidate.createDetails({reason:"press"}, "invalid");
// @ts-expect-error a reason is required
Candidate.createDetails({}, "mouse");

declare const reason: string;
if (Candidate.isDismissal(reason)) {
  const narrowed: Candidate.DismissReason = reason;
}
declare const details: Candidate.ChangeDetails<Reference.ChangeReason>;
if (details.reason === "escape-key") {
  const key: string | undefined = details.event?.key;
}
if (details.reason === "drop") {
  const transfer: DataTransfer | null | undefined = details.event?.dataTransfer;
}
