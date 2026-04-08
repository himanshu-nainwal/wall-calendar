export type NoteScope =
  | { kind: "month"; key: string }
  | { kind: "day"; key: string }
  | { kind: "range"; start: string; end: string };

export type NoteEntry = {
  id: string;
  body: string;
  voiceUrl?: string; // base64 data URL of recorded audio
  updatedAt: string;
  scope: NoteScope;
};

export type SelectionState = {
  start: string | null;
  end: string | null;
};
