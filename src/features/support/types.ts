export type SupportReference = {
  label: string;
  url: string;
};

export type SupportOpening = {
  greeting: string;
  starters: string[];
};

export type SupportReply = {
  answer: string;
  matched: boolean;
  suggestions: string[];
  references: SupportReference[];
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  references?: SupportReference[];
};