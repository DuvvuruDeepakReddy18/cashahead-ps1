export function extraDemoStatements(date) {
  const header = 'Date,Narration,Ref No,Withdrawal,Deposit';
  const statement = (...rows) => [header, ...rows].join('\r\n');

  return [
    {
      filename: 'CashAhead-small-payment.csv',
      label: 'Smaller payment of ₹2,000',
      csv: statement([date, 'UPI Kiran & Divya INV-101', 'JUDGE-KD-2000', '', 2000].join(','))
    },
    {
      filename: 'CashAhead-review.csv',
      label: 'Transfers that need review',
      csv: statement(
        [date, 'INV-101 Mehta Infotech', 'JUDGE-CONFLICT', '', 1250].join(','),
        [date, 'Personal transfer', 'JUDGE-IGNORE', '', 275].join(','),
        [date, 'Studio supplies', 'JUDGE-DEBIT', 300, ''].join(','),
        ['31/02/2026', 'Invalid date example', 'JUDGE-BAD-DATE', '', 100].join(',')
      )
    },
    {
      filename: 'CashAhead-overpayment.csv',
      label: 'Overpayment of ₹10,000',
      csv: statement([date, 'UPI Kiran & Divya INV-101', 'JUDGE-KD-10000', '', 10000].join(','))
    }
  ];
}
