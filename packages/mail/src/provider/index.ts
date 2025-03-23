import { send as resendProvider } from "./resend";
import type { SendEmailHandler } from "../../types";

export const send: SendEmailHandler = resendProvider;