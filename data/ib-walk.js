Deck.add([
  {
    id: "ib-walk-001",
    track: "ib",
    module: "ib-walk",
    topic: "Depreciation",
    level: 1,
    type: "walk",
    classic: true,
    q: "Depreciation goes up by $10. Walk me through the three statements.",
    a: "Assume a 25% tax rate. Income statement: pre-tax income falls $10, taxes fall $2.50, net income falls $7.50. Cash flow statement: net income down $7.50, add back the $10 of non-cash depreciation, so cash is up $2.50. Balance sheet: cash up $2.50 and PP&E down $10, so assets fall $7.50; retained earnings fall $7.50, and it balances.",
    why: "Depreciation is a non-cash expense, so its only real cash effect is the tax it saves: it cuts taxable income, which is why cash rises even though profit falls. PP&E drops because the asset's book value is being used up. Every walk-through ends the same way: check that assets and liabilities plus equity moved by the same amount.",
    trap: "Don't say cash is unchanged because depreciation is non-cash. The tax saving is real cash, and interviewers listen for it. The follow-up is often the same question for an impairment or an inventory write-down.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Depreciation", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "Depreciation add-back", value: 10 },
      { label: "Net change in cash", value: 2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 2.5 }, { label: "PP&E", value: -10 } ],
      le: [ { label: "Retained earnings", value: -7.5 } ]
    }}
  },
  {
    id: "ib-walk-002",
    track: "ib",
    module: "ib-walk",
    topic: "Stock-based compensation",
    level: 2,
    type: "walk",
    classic: true,
    q: "The company records $10 of stock-based compensation. Walk me through the three statements.",
    a: "At a 25% tax rate, treating it as deductible now (the usual interview convention): pre-tax income falls $10, taxes $2.50, net income $7.50. Cash flow: add back the $10 of non-cash SBC, so cash rises $2.50. Balance sheet: cash up $2.50; equity up $2.50, because common stock and APIC rise $10 while retained earnings fall $7.50.",
    why: "Stock comp is a real expense paid in shares instead of cash, so it lowers net income but not cash, and it's added back like depreciation. The difference is on the balance sheet: the shares issued add $10 to equity (common stock and APIC) instead of reducing an asset. Net result: equity rises by the tax saving, matched by the extra cash.",
    trap: "Strictly, under US GAAP the tax deduction usually comes when awards vest or are exercised, not when they're expensed. So book taxes fall now but cash taxes don't: a $2.50 deferred tax asset appears instead of cash. Mention it if pressed.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Stock-based comp", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "SBC add-back", value: 10 },
      { label: "Net change in cash", value: 2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 2.5 } ],
      le: [ { label: "Common stock and APIC", value: 10 }, { label: "Retained earnings", value: -7.5 } ]
    }}
  },
  {
    id: "ib-walk-003",
    track: "ib",
    module: "ib-walk",
    topic: "Debt and interest",
    level: 1,
    type: "walk",
    classic: true,
    q: "A company borrows $100 at 10% and pays one year of interest. Walk me through the three statements.",
    a: "At a 25% tax rate: the income statement shows $10 of interest, so pre-tax income falls $10, taxes $2.50 and net income $7.50. Cash flow: net income down $7.50, plus $100 of debt raised in financing, so cash is up $92.50. Balance sheet: cash up $92.50; debt up $100 and retained earnings down $7.50, also $92.50.",
    why: "Borrowing isn't income, so the $100 goes straight to financing cash flow and the debt line. Interest is an expense paid in cash and it's tax-deductible, so its after-tax cost ($7.50) reduces both net income and cash. Splitting the event in two makes it easy: raising the debt grows both sides of the balance sheet, paying the interest shrinks both.",
    trap: "If the loan also required $20 of principal repayment, net income wouldn't change: principal is a financing outflow that reduces cash and debt, never an expense.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Interest expense", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "Debt raised", value: 100 },
      { label: "Net change in cash", value: 92.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 92.5 } ],
      le: [ { label: "Debt", value: 100 }, { label: "Retained earnings", value: -7.5 } ]
    }}
  }
]);
