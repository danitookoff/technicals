Deck.add([
  {
    id: "ib-acct-001",
    track: "ib",
    module: "ib-acct",
    topic: "The three statements",
    level: 1,
    type: "walk",
    classic: true,
    q: "Walk me through the three financial statements.",
    a: "The income statement shows revenue, expenses and net income over a period. The balance sheet shows assets, liabilities and equity at a point in time, and assets always equal liabilities plus equity. The cash flow statement starts with net income, adjusts for non-cash items and working capital, adds investing and financing flows, and shows the change in cash.",
    why: "The statements answer three questions: did the company make a profit, what does it own and owe, and where did the cash actually go. They're linked. Net income flows to the top of the cash flow statement and into retained earnings. Ending cash on the cash flow statement becomes cash on the balance sheet. Balance sheet changes like depreciation, working capital and debt show up as lines on the cash flow statement.",
    trap: "Keep it to about 30 seconds, then name the links. The next question is almost always a walk-through: \"Depreciation goes up by $10…\"",
    visual: { kind: "flow", steps: [
      { label: "Income statement", note: "Revenue − expenses = net income" },
      { label: "Cash flow statement", note: "Net income adjusted to the change in cash" },
      { label: "Balance sheet", note: "Cash and retained earnings update; it balances" }
    ]}
  },
  {
    id: "ib-acct-002",
    track: "ib",
    module: "ib-acct",
    topic: "Only one statement",
    level: 1,
    type: "qa",
    classic: true,
    q: "If you could use only one financial statement to judge a company, which would you pick?",
    a: "The cash flow statement. It shows whether the business actually generates cash, which net income can obscure through accruals and non-cash items, and it shows what the company spends on capex and how it's financed. A business that consistently produces cash is healthy, whatever its reported earnings.",
    why: "Net income depends on accounting choices: depreciation schedules, revenue timing, write-downs. Cash is harder to dress up. The cash flow statement also carries a lot of balance sheet information in its changes: working capital build-ups, capex, and debt raised or repaid. You lose the full balance sheet, but you keep the most decision-relevant fact: can this company fund itself?",
    trap: "The standard follow-up: what if you could use two? The income statement and balance sheet, because with beginning and ending balance sheets you can rebuild the cash flow statement."
  },
  {
    id: "ib-acct-003",
    track: "ib",
    module: "ib-acct",
    topic: "Profit vs cash",
    level: 2,
    type: "qa",
    q: "How can a profitable company run out of cash?",
    a: "Profit isn't cash. A growing company can book sales before collecting them, build inventory before selling it, and spend heavily on capex, all of which consume cash that net income doesn't show. Add debt repayments, and a company with healthy earnings can still run dry. Watch working capital and capex, not just margins.",
    why: "Accrual accounting records revenue when it's earned and expenses when they're incurred, not when cash moves. As a company grows, receivables and inventory grow with it, and every dollar tied up there is profit that hasn't turned into cash. Capex hits the income statement slowly as depreciation, but the cash goes out on day one. Principal repayments never touch the income statement at all.",
    example: "Revenue grows from [[$100M]] to [[$150M]] with receivables at [[20%]] of revenue, so AR rises $10M: $10M of the new revenue is uncollected. With net income of [[$8M]] and capex [[$5M]] above depreciation, the company burns $7M of cash despite its profit, before any debt payments.",
    trap: "The reverse happens too: a loss-making company can be cash-rich if customers prepay (deferred revenue) or if the losses come from non-cash charges like impairments or stock comp."
  }
]);
