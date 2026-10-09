export type Locale = "zh" | "en";

export type MessageKey =
  | "appTitle"
  | "searchPlaceholder"
  | "searchEmpty"
  | "searchNoResults"
  | "loading"
  | "retry"
  | "errorGeneric"
  | "errorNetwork"
  | "errorInvalidParams"
  | "errorLocationNotFound"
  | "errorUpstream"
  | "feelsLike"
  | "humidity"
  | "wind"
  | "hourly"
  | "daily"
  | "today"
  | "now"
  | "precip"
  | "recent"
  | "language";

export type Messages = Record<MessageKey, string>;
