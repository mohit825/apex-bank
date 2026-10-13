import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { accounts, accountTransactions, investmentHoldings } from "@/db/schema";

/** Pass the ID returned by requireAuthenticatedUser(), never a request-supplied ID. */
export async function getAccountSummaryForUser(userId: string) {
  return db
    .select({
      id: accounts.id,
      displayName: accounts.displayName,
      maskedIdentifier: accounts.maskedIdentifier,
      balancePaise: accounts.balancePaise,
    })
    .from(accounts)
    .where(eq(accounts.ownerUserId, userId))
    .orderBy(accounts.createdAt, accounts.id);
}

/** Return at most five transactions from accounts owned by this user. */
export async function getRecentTransactionsForUser(userId: string) {
  return db
    .select({
      id: accountTransactions.id,
      accountDisplayName: accounts.displayName,
      description: accountTransactions.description,
      direction: accountTransactions.direction,
      amountPaise: accountTransactions.amountPaise,
      createdAt: accountTransactions.createdAt,
    })
    .from(accountTransactions)
    .innerJoin(accounts, eq(accountTransactions.accountId, accounts.id))
    .where(eq(accounts.ownerUserId, userId))
    .orderBy(desc(accountTransactions.createdAt), desc(accountTransactions.id))
    .limit(5);
}

// TODO (Ticket 006B): Query investment_holdings with ownerUserId = userId.
export async function getInvestmentHoldingsForUser(userId: string) {
  return db
    .select({
      id: investmentHoldings.id,
      productName: investmentHoldings.productName,
      investedPaise: investmentHoldings.investedPaise,
      valuationPaise: investmentHoldings.valuationPaise,
    })
    .from(investmentHoldings)
    .where(eq(investmentHoldings.ownerUserId, userId));
}
