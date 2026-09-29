// greedy debt simplification: minimizes number of transactions

interface Debt {
  from: string;
  to: string;
  amount: number;
}

// takes pairwise balances and returns simplified transactions
export function simplifyDebts(balances: Map<string, number>): Debt[] {
  // separate into creditors (positive) and debtors (negative)
  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];

  for (const [userId, balance] of balances) {
    if (balance > 0.01) {
      creditors.push({ userId, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ userId, amount: -balance }); // store as positive
    }
  }

  // sort descending by amount for greedy matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: Debt[] = [];
  let ci = 0;
  let di = 0;

  // match largest creditor with largest debtor
  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci]!;
    const debt = debtors[di]!;
    const amount = Math.min(credit.amount, debt.amount);

    if (amount > 0.01) {
      transactions.push({
        from: debt.userId,
        to: credit.userId,
        amount: Math.round(amount * 100) / 100,
      });
    }

    credit.amount -= amount;
    debt.amount -= amount;

    if (credit.amount < 0.01) ci++;
    if (debt.amount < 0.01) di++;
  }

  return transactions;
}

// compute net balances for a group from expense shares + settlements
export function computeNetBalances(
  expenseData: { paidById: string; shares: { userId: string; amount: number }[] }[],
  settlements: { payerId: string; payeeId: string; amount: number }[],
): Map<string, number> {
  const balances = new Map<string, number>();

  const addBalance = (userId: string, amount: number) => {
    balances.set(userId, (balances.get(userId) ?? 0) + amount);
  };

  // process expenses: payer gets credit, each share holder gets debit
  for (const expense of expenseData) {
    for (const share of expense.shares) {
      if (share.userId !== expense.paidById) {
        addBalance(expense.paidById, share.amount);  // payer is owed
        addBalance(share.userId, -share.amount);      // participant owes
      }
    }
  }

  // process settlements: payer reduces their debt to payee
  for (const s of settlements) {
    addBalance(s.payerId, s.amount);   // payer settled
    addBalance(s.payeeId, -s.amount);  // payee received
  }

  return balances;
}
