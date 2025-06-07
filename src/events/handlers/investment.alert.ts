import { sendTemplateEmail } from "#src/lib/email/email";
import generic from "#src/lib/email/mail-templates/generic";
import prisma from "#src/lib/prisma/prisma";
import { Investment } from "#src/prisma-gen/index";
import env from "#src/utils/env";
import logger from "#src/utils/logger";

export interface InvestmentAlertData {
  user: { id: string; name: string; email: string };
  investment: Investment;
}

export async function onInvestmentCreate({ user, investment }: InvestmentAlertData) {
  const subject = "New Investment";

  const message = (name?: string) => {
    return {
      greeting: `Hello ${name ? name : "Admin"}!`,
      info: `${name ? "You" : user.name} started a new investment`,
      details: {
        "Investment Name": investment.investmentName,
        "Investment Tier": investment.investmentTier,
        "Initial Deposit": `$${investment.initialDeposit.toLocaleString()}`,
        Duration: `${investment.duration} days`
      },
      ...(investment.autocompounded && {
        more: `This investment is autocompounded. The returns from this investment will only be added to ${name ? "your" : "the client's"} account balance upon completion or termination of the investment.`
      }),
      ...(!investment.autocompounded && {
        more: `This investment is not autocompounded. The daily returns from this investment will be added to ${name ? "your" : "the client's"} account balance daily.`
      }),
      footer: `This message was sent to you because ${name ? "you" : "a client"} started a new investment.`
    };
  };

  try {
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          title: subject,
          description: message(user.name).info + " " + message(user.name).more
        }
      }),

      sendTemplateEmail({ email: user.email, subject, sections: message(user.name) }, generic),

      sendTemplateEmail(
        { email: env.get("SUPPORT_EMAIL_USER"), subject, sections: message() },
        generic
      )
    ]);
  } catch (error) {
    logger.error(`Alerts failed for investment creation: ${investment.id}`, error as Error);
  }
}

export async function onInvestmentClose({ user, investment }: InvestmentAlertData) {
  const subject = "Investment Closure";

  const mailReason = "This message was sent to you because an investment was closed.";

  const message = (name?: string) => {
    return {
      greeting: `Hello ${name ? name : "Admin"}!`,
      info: `${name ? "Your" : `${user.name}'s`} investment on ${investment.investmentName} plan, ${investment.investmentTier} tier has completed its duration and is now closed.`,
      details: {
        "Investment Name": investment.investmentName,
        Tier: investment.investmentTier,
        Deposit: `$${investment.initialDeposit.toLocaleString()}`,
        Duration: `${investment.duration} days`,
        "Total Returns": `$${investment.currentTotalReturns.toLocaleString()}`
      },
      more: investment.autocompounded
        ? `This investment was autocompounded. The returns from this investment have been added to ${name ? "your" : "the client's"} account balance.`
        : `This investment was not autocompounded. The returns from this investment were added daily to ${name ? "your" : "the client's"} account balance.`
    };
  };

  try {
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          title: subject,
          description: message(user.name).info
        }
      }),

      sendTemplateEmail(
        {
          email: user.email,
          subject,
          mailReason,
          sections: message(user.name)
        },
        generic
      ),

      sendTemplateEmail(
        {
          email: env.get("SUPPORT_EMAIL_USER"),
          subject,
          mailReason,
          sections: message()
        },
        generic
      )
    ]);
  } catch (error) {
    logger.error(`Alerts failed for investment closure: ${investment.id}`, error as Error);
  }
}

export async function onInvestmentPauseToggle({ user, investment }: InvestmentAlertData) {
  const conditional = (
    str1: string,
    str2: string,
    condition: boolean = investment.investmentStatus === "PAUSED"
  ) => {
    return condition ? str1 : str2;
  };

  const subject = conditional("Pause of Investment", "Resumption of Investment");
  const mailReason = `This message was sent because an investment was ${conditional("paused", "resumed")}`;

  const message = (name?: string) => {
    return {
      greeting: `Hello ${name ? name : "Admin"}!`,
      info: "The investment "
        .concat(`${investment.investmentName} (${investment.investmentTier} Tier) `)
        .concat(conditional(`was paused by the ${env.get("APP_NAME")} admin `, "has been resumed"))
        .concat(conditional(`with reason ${investment.pausedReason}`, "")),
      details: {
        "Investment Name": investment.investmentName,
        "Investment Tier": investment.investmentTier,
        Status: conditional("Paused", "Open"),
        ...(investment.investmentStatus === "PAUSED" &&
          !!investment.pausedReason && { "Reason for Pause": investment.pausedReason }),
        "Total Returns": `$${investment.currentTotalReturns.toLocaleString()}`
      }
    };
  };

  try {
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          title: subject,
          description: message(user.name).info
        }
      }),

      sendTemplateEmail(
        {
          email: user.email,
          subject,
          mailReason,
          sections: message(user.name)
        },
        generic
      ),

      sendTemplateEmail(
        {
          email: env.get("SUPPORT_EMAIL_USER"),
          subject,
          mailReason,
          sections: message()
        },
        generic
      )
    ]);
  } catch (error) {
    logger.error(`Alerts failed for investment pause toggle: ${investment.id}`, error as Error);
  }
}

export async function onInvestmentTerminate({ user, investment }: InvestmentAlertData) {
  const subject = "Termination of Investment";

  const message = (name?: string) => {
    const info = `The investment ${investment.investmentName} (${investment.investmentTier} Tier) was terminated by ${investment.terminator === "USER" && name ? "you" : investment.terminator === "USER" && !name ? user.name : `the ${env.get("APP_NAME")} admin`} ${!investment.terminationReason ? "without reason." : "with reason: " + investment.terminationReason}.`;

    return {
      greeting: `Hello ${name ? name : "Admin"}!`,
      info,
      details: {
        "Investment Name": investment.investmentName,
        "Investment Tier": investment.investmentTier,
        "Termination Fee": `$${investment.terminationFee.toLocaleString()}`,
        "Reason for Termination": investment.terminationReason,
        "Current Total Returns": `$${investment.currentTotalReturns.toLocaleString()}`
      },
      footer: `This message was sent to you an investment was terminated.`
    };
  };

  try {
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          title: subject,
          description: message(user.name).info
        }
      }),

      sendTemplateEmail({ email: user.email, subject, sections: message(user.name) }, generic),

      sendTemplateEmail(
        { email: env.get("SUPPORT_EMAIL_USER"), subject, sections: message() },
        generic
      )
    ]);
  } catch (error) {
    logger.error(`Alerts failed for investment termination: ${investment.id}`, error as Error);
  }
}
