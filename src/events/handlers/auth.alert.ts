import { sendTemplateEmail } from "#src/lib/email/email";
import generic from "#src/lib/email/mail-templates/generic";
import prisma from "#src/lib/prisma/prisma";
import logger from "#src/utils/logger";

export type OnPasswordChangeAlertData = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};
export async function onPasswordChange({ user }: OnPasswordChangeAlertData) {
  const subject = "Change of Password";
  const sections = {
    greeting: `Hello ${user.name}!`,
    info: "Your password has been changed successfully.",
    note: "If you did not initiate this change, please contact support immediately as your account may have been compromised."
  };
  const mailReason = "This email was sent because your password was changed.";

  try {
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          title: subject,
          description: sections.info
        }
      }),

      sendTemplateEmail(
        {
          email: user.email,
          subject,
          mailReason,
          sections
        },
        generic
      )
    ]);
  } catch (error) {
    logger.error(`Alerts failed for password change: ${user.id}`, error as Error);
  }
}
