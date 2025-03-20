import { send as resendProvider } from "@/provider/resend";
import type { SendEmailHandler } from "@/types";

export const send: SendEmailHandler = resendProvider;