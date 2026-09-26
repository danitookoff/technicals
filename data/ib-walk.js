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
  },
  {
    id: "ib-walk-004",
    track: "ib",
    module: "ib-walk",
    topic: "How to answer a walk-through",
    level: 1,
    type: "primer",
    q: "Primer: how to answer any three-statement walk-through",
    a: "Take the statements in order. Income statement: does the event create revenue, an expense, a gain or a loss? If so, apply the tax rate (assume 25% if none is given) to find the change in net income; if not, skip it. Cash flow statement: start from net income, reverse non-cash items, adjust for working capital, then add investing and financing cash. Balance sheet: cash comes from the cash flow statement and retained earnings move by net income less dividends. Finish by checking that it balances.",
    why: "Pre-tax income: profit before tax; taxes move by the tax rate × its change. Tax shield: the tax a deductible expense saves; for a non-cash expense it's the only cash effect. Non-cash items: charges or gains with no cash this period, such as depreciation, impairments, stock comp and unrealized gains. Working capital: operating assets and liabilities such as AR, inventory, prepaids, AP, accruals and deferred revenue; a rise in an asset uses cash, a rise in a liability provides it. Retained earnings: cumulative net income less dividends. Deferred taxes: tax owed or saved later because book and tax timing differ.",
    visual: { kind: "flow", steps: [
      { label: "Income statement", note: "Pre-tax change × (1 − tax rate) = change in net income" },
      { label: "Cash flow statement", note: "Net income, reverse non-cash items, working capital, then investing and financing" },
      { label: "Balance sheet", note: "Cash from the cash flow statement; retained earnings move by net income less dividends" },
      { label: "Check", note: "Change in assets = change in liabilities + equity" }
    ] }
  },
  {
    id: "ib-walk-005",
    track: "ib",
    module: "ib-walk",
    topic: "Inventory bought with cash",
    level: 1,
    type: "walk",
    classic: true,
    q: "The company buys $10 of inventory with cash. Walk me through the three statements.",
    a: "Assume a 25% tax rate, though nothing here is taxed: the income statement doesn't change, because inventory isn't expensed until it's sold. Cash flow statement: the $10 increase in inventory uses cash in operating activities, so cash falls $10. Balance sheet: cash down $10 and inventory up $10, so total assets don't change; liabilities and equity don't move either, so it balances.",
    why: "Buying inventory swaps one asset for another. Its cost reaches the income statement only as cost of goods sold, when the goods are sold, so the expense lands in the same period as the revenue it produces. Inventory is working capital, so the cash spent shows up in operating cash flow. That's how a company building stock ahead of growth can report a profit and still burn cash.",
    trap: "Don't put the purchase in investing next to capex: inventory is working capital, so it sits in operating cash flow. The usual follow-up is to sell it, say for $20.",
    visual: { kind: "threeStatement", unit: "$", is: [], cfs: [
      { label: "Increase in inventory", value: -10 },
      { label: "Net change in cash", value: -10, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -10 }, { label: "Inventory", value: 10 } ],
      le: []
    }}
  },
  {
    id: "ib-walk-006",
    track: "ib",
    module: "ib-walk",
    topic: "Inventory bought on credit",
    level: 1,
    type: "walk",
    q: "The company buys $10 of inventory on credit from a supplier. Walk me through the three statements.",
    a: "At a 25% tax rate there's no tax effect yet: the income statement doesn't change until the inventory is sold. Cash flow statement: the $10 increase in inventory uses cash and the $10 increase in accounts payable provides it, so cash doesn't change. Balance sheet: inventory up $10 on the assets side and accounts payable up $10 on the liabilities side. Both sides rise $10, so it balances.",
    why: "Buying on credit means the supplier finances the inventory until the bill is paid. Both working-capital lines move, but they pull cash in opposite directions: more of an operating asset uses cash, more of an operating liability provides it. That's why stretching payables, paying suppliers later, gives operating cash flow a one-time lift.",
    trap: "When the company pays the supplier, cash and AP both fall $10 and the income statement still doesn't move. Paying a bill isn't an expense; the expense comes when the inventory is sold.",
    visual: { kind: "threeStatement", unit: "$", is: [], cfs: [
      { label: "Increase in inventory", value: -10 },
      { label: "Increase in accounts payable", value: 10 },
      { label: "Net change in cash", value: 0, total: true }
    ], bs: {
      assets: [ { label: "Inventory", value: 10 } ],
      le: [ { label: "Accounts payable", value: 10 } ]
    }}
  },
  {
    id: "ib-walk-007",
    track: "ib",
    module: "ib-walk",
    topic: "Inventory write-down",
    level: 1,
    type: "walk",
    q: "The company writes down $10 of obsolete inventory. Walk me through the three statements.",
    a: "At a 25% tax rate, treating the write-down as deductible now (the usual interview convention): pre-tax income falls $10, taxes $2.50, net income $7.50. Cash flow statement: net income down $7.50, add back the $10 non-cash write-down, so cash is up $2.50. Balance sheet: cash up $2.50 and inventory down $10, so assets fall $7.50; retained earnings fall $7.50, and it balances.",
    why: "A write-down admits inventory is worth less than it cost, usually because it's obsolete or damaged. Nothing is paid, so it works like depreciation: the charge, normally inside cost of goods sold, cuts profit, the add-back reverses it and the only cash effect is the tax saved. If it's a one-off, analysts often add it back when they normalize EBITDA.",
    trap: "For tax, write-downs often aren't deductible until the goods are sold or scrapped, so cash doesn't move yet: a $2.50 deferred tax asset appears instead. IFRS lets a write-down reverse if value recovers; US GAAP doesn't.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Inventory write-down", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "Write-down add-back", value: 10 },
      { label: "Net change in cash", value: 2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 2.5 }, { label: "Inventory", value: -10 } ],
      le: [ { label: "Retained earnings", value: -7.5 } ]
    }}
  },
  {
    id: "ib-walk-008",
    track: "ib",
    module: "ib-walk",
    topic: "Revenue on credit",
    level: 1,
    type: "walk",
    q: "The company books $10 of revenue on credit, with no associated costs, and the customer pays next quarter. Walk me through the three statements.",
    a: "At a 25% tax rate, with the tax paid now: revenue and pre-tax income rise $10, taxes $2.50, net income $7.50. Cash flow statement: net income up $7.50, less the $10 increase in AR, so cash falls $2.50. Balance sheet: AR up $10 and cash down $2.50; retained earnings up $7.50, so it balances. When the customer pays, cash rises $10 and AR falls $10, which also balances.",
    why: "Accrual accounting records revenue when it's earned, not when the cash arrives, so profit shows up before the money does. The cash flow statement corrects for that by subtracting the rise in receivables. Cash actually falls at first here, because tax is due on income not yet collected. Collection just swaps one asset for another, so across both steps cash rises by the after-tax $7.50.",
    trap: "If the tax isn't paid until later, income taxes payable rises $2.50 instead, and cash doesn't change at the sale. Don't record the revenue a second time when the customer pays.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Revenue", value: 10 },
      { label: "Pre-tax income", value: 10, total: true },
      { label: "Taxes at 25%", value: 2.5 },
      { label: "Net income", value: 7.5, total: true }
    ], cfs: [
      { label: "Net income", value: 7.5 },
      { label: "Increase in AR", value: -10 },
      { label: "Net change in cash", value: -2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -2.5 }, { label: "Accounts receivable", value: 10 } ],
      le: [ { label: "Retained earnings", value: 7.5 } ]
    }, caption: "Step one, the sale on credit. Collection later swaps $10 of AR for cash." }
  },
  {
    id: "ib-walk-009",
    track: "ib",
    module: "ib-walk",
    topic: "Prepaid expense",
    level: 2,
    type: "walk",
    q: "The company prepays $10 for next year's insurance policy. Walk me through the three statements when it pays, and next year when the policy is used up.",
    a: "Assume a 25% tax rate, with tax following the book timing. On payment, nothing hits the income statement: cash falls $10 in operating cash flow and prepaid expenses rise $10, so assets don't change. Next year, insurance expense cuts pre-tax income $10, taxes $2.50 and net income $7.50. Cash flow statement: add back the $10 fall in prepaids, so cash rises $2.50. Balance sheet: cash up $2.50, prepaids down $10; retained earnings down $7.50. Both steps balance.",
    why: "A prepaid expense is cash paid before the benefit arrives, so it sits on the balance sheet as an asset until the period it covers. As that period passes, the asset turns into an expense. The cash already left in step one, so step two only records the expense, and the cash flow statement adds back the drop in prepaids. Across both steps, cash falls by the after-tax $7.50, as if the bill were paid when incurred.",
    trap: "Don't reduce cash again in step two: the payment already happened. For tax, a prepaid policy of 12 months or less can often be deducted when paid, which moves the $2.50 saving into step one.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Insurance expense", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "Decrease in prepaid expenses", value: 10 },
      { label: "Net change in cash", value: 2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 2.5 }, { label: "Prepaid expenses", value: -10 } ],
      le: [ { label: "Retained earnings", value: -7.5 } ]
    }, caption: "Step two, when the prepaid insurance is expensed." }
  },
  {
    id: "ib-walk-010",
    track: "ib",
    module: "ib-walk",
    topic: "Deferred revenue",
    level: 2,
    type: "walk",
    classic: true,
    q: "A customer pays $10 up front for a service the company delivers next year. Walk me through the three statements when the cash arrives and when the service is delivered.",
    a: "Assume a 25% tax rate, with tax following the book timing. When the cash arrives, nothing hits the income statement: cash rises $10 in operating cash flow and deferred revenue, a liability, rises $10. On delivery, revenue and pre-tax income rise $10, taxes $2.50, net income $7.50. Cash flow statement: subtract the $10 fall in deferred revenue, so cash falls $2.50. Balance sheet: cash down $2.50; deferred revenue down $10, retained earnings up $7.50. Both steps balance.",
    why: "Deferred revenue is cash collected before it's earned, so the company owes the customer the service until it delivers; under ASC 606, revenue waits for delivery. That makes deferred revenue a source of cash, which is why subscription and software businesses often show operating cash flow running ahead of net income. Across both steps, cash rises by the after-tax $7.50.",
    trap: "US tax lets advance payments be deferred by one year at most, so on multi-year prepayments the tax is paid early and a deferred tax asset appears. And never book revenue when the cash arrives.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Revenue", value: 10 },
      { label: "Pre-tax income", value: 10, total: true },
      { label: "Taxes at 25%", value: 2.5 },
      { label: "Net income", value: 7.5, total: true }
    ], cfs: [
      { label: "Net income", value: 7.5 },
      { label: "Decrease in deferred revenue", value: -10 },
      { label: "Net change in cash", value: -2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -2.5 } ],
      le: [ { label: "Deferred revenue", value: -10 }, { label: "Retained earnings", value: 7.5 } ]
    }, caption: "Step two, when the service is delivered." }
  },
  {
    id: "ib-walk-011",
    track: "ib",
    module: "ib-walk",
    topic: "Accrued bonus",
    level: 2,
    type: "walk",
    classic: true,
    q: "The company accrues a $10 employee bonus this year and pays it in cash next year. Walk me through the three statements.",
    a: "At a 25% tax rate, deducting the bonus when accrued: pre-tax income falls $10, taxes $2.50, net income $7.50. Cash flow statement: net income down $7.50, add back the $10 increase in accrued liabilities, so cash rises $2.50. Balance sheet: cash up $2.50; accrued liabilities up $10 and retained earnings down $7.50, so it balances. Next year's payment cuts cash and accrued liabilities by $10 each, with no income statement effect, and it still balances.",
    why: "Accrual accounting records the expense in the year employees earn the bonus, not when it's paid. Until then it's an accrued liability, and the cash flow statement adds back its increase because no cash has left. US tax generally allows the deduction in the accrual year if the bonus is paid within two and a half months of year-end, so the tax saving comes first. Across both years, cash falls by the after-tax $7.50.",
    trap: "Payment isn't an expense; the income statement took the hit at accrual. If an accrual isn't deductible until paid, like a warranty reserve, the first-year tax saving is a deferred tax asset, not cash.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Bonus expense", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "Increase in accrued liabilities", value: 10 },
      { label: "Net change in cash", value: 2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 2.5 } ],
      le: [ { label: "Accrued liabilities", value: 10 }, { label: "Retained earnings", value: -7.5 } ]
    }, caption: "Step one, the accrual in year one." }
  },
  {
    id: "ib-walk-012",
    track: "ib",
    module: "ib-walk",
    topic: "Debt repayment",
    level: 1,
    type: "walk",
    q: "The company repays $100 of debt principal with cash. Walk me through the three statements.",
    a: "Assume a 25% tax rate, though it doesn't come into play: principal isn't an expense, so the income statement doesn't change. Cash flow statement: a $100 outflow in financing activities, so cash falls $100. Balance sheet: cash down $100 on the assets side and debt down $100 on the liabilities side. Both sides fall $100, so it balances.",
    why: "Principal is the return of borrowed money, not a cost of using it; only interest is an expense. So repaying debt shrinks both sides of the balance sheet and runs through financing. Net debt doesn't change, since cash and debt fall together, which is why paying down debt with cash on hand leaves enterprise value unchanged. The benefit comes later, as lower interest expense.",
    trap: "If the debt is repaid early at a premium, say $102 for $100 of debt, the $2 is a loss on extinguishment that hits the income statement, while the whole $102 still sits in financing.",
    visual: { kind: "threeStatement", unit: "$", is: [], cfs: [
      { label: "Debt repaid", value: -100 },
      { label: "Net change in cash", value: -100, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -100 } ],
      le: [ { label: "Debt", value: -100 } ]
    }}
  },
  {
    id: "ib-walk-013",
    track: "ib",
    module: "ib-walk",
    topic: "PIK interest",
    level: 2,
    type: "walk",
    q: "A company owes $10 of PIK interest this year, paid by adding it to the loan balance. Walk me through the three statements.",
    a: "At a 25% tax rate, assuming the PIK interest is deductible as it accrues: pre-tax income falls $10, taxes $2.50, net income $7.50. Cash flow statement: net income down $7.50, add back the $10 of non-cash interest, so cash is up $2.50. Balance sheet: cash up $2.50; debt up $10 and retained earnings down $7.50, so both sides rise $2.50 and it balances.",
    why: "PIK (paid-in-kind) interest is a real cost of borrowing settled with more debt instead of cash. It lowers net income like cash interest, but the cash flow statement adds it back, and the loan balance compounds. The company keeps cash today and owes more at maturity, which is why PIK is common in mezzanine debt, holding company notes and private credit.",
    trap: "Tax can delay the deduction: Section 163(j) caps net interest at 30% of adjusted taxable income, and the AHYDO rules can defer PIK deductions. Then the saving is a deferred tax asset, not cash. The $10 goes to debt, not equity.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "PIK interest", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "PIK interest add-back", value: 10 },
      { label: "Net change in cash", value: 2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 2.5 } ],
      le: [ { label: "Debt", value: 10 }, { label: "Retained earnings", value: -7.5 } ]
    }}
  },
  {
    id: "ib-walk-014",
    track: "ib",
    module: "ib-walk",
    topic: "Capex",
    level: 1,
    type: "walk",
    q: "The company spends $100 in cash on new equipment. Walk me through the three statements.",
    a: "The tax rate (assume 25%) doesn't matter yet: capex is capitalized, not expensed, so the income statement doesn't change today. Cash flow statement: a $100 capex outflow in investing activities, so cash falls $100. Balance sheet: cash down $100 and PP&E up $100, so total assets don't change; liabilities and equity don't move, so it balances.",
    why: "Equipment serves the business for years, so its cost is capitalized as PP&E and spread over its useful life through depreciation. The income statement feels it only through depreciation and the tax saving that comes with it. That timing gap is why capex drives a wedge between profit and free cash flow, and why EBITDA, which ignores capex entirely, flatters capital-intensive businesses.",
    trap: "Expect the follow-up: with a 10-year life, year one brings $10 of depreciation, which cuts net income $7.50 and adds $2.50 of cash. Bonus depreciation for tax can front-load deductions, creating a deferred tax liability.",
    visual: { kind: "threeStatement", unit: "$", is: [], cfs: [
      { label: "Capex", value: -100 },
      { label: "Net change in cash", value: -100, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -100 }, { label: "PP&E", value: 100 } ],
      le: []
    }}
  },
  {
    id: "ib-walk-015",
    track: "ib",
    module: "ib-walk",
    topic: "Asset sale at a gain",
    level: 2,
    type: "walk",
    classic: true,
    q: "The company sells equipment with a $100 book value for $110 in cash. Walk me through the three statements.",
    a: "At a 25% tax rate, with tax basis equal to book value: the $10 gain lifts pre-tax income $10, taxes $2.50 and net income $7.50. Cash flow statement: net income up $7.50, subtract the $10 gain from operating cash flow and add $110 of proceeds in investing, so cash rises $107.50. Balance sheet: cash up $107.50 and PP&E down $100; retained earnings up $7.50. Both sides rise $7.50, and it balances.",
    why: "Only the excess of price over book value is profit, so only the $10 gain hits the income statement. The cash flow statement must not count it twice: the full $110 belongs in investing, so the gain comes out of operating cash flow. Cash rises by the proceeds less the tax on the gain. Gains on asset sales are non-recurring, so they're excluded from EBITDA and adjusted earnings.",
    trap: "The classic mistake is leaving the gain in operating cash flow and adding the proceeds too, which double counts $10. If tax depreciation ran ahead of book, the taxable gain is bigger than the book gain.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Gain on sale", value: 10 },
      { label: "Pre-tax income", value: 10, total: true },
      { label: "Taxes at 25%", value: 2.5 },
      { label: "Net income", value: 7.5, total: true }
    ], cfs: [
      { label: "Net income", value: 7.5 },
      { label: "Less gain on sale", value: -10 },
      { label: "Sale proceeds (investing)", value: 110 },
      { label: "Net change in cash", value: 107.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 107.5 }, { label: "PP&E", value: -100 } ],
      le: [ { label: "Retained earnings", value: 7.5 } ]
    }}
  },
  {
    id: "ib-walk-016",
    track: "ib",
    module: "ib-walk",
    topic: "Asset sale at a loss",
    level: 2,
    type: "walk",
    q: "The company sells equipment with a $100 book value for $90 in cash. Walk me through the three statements.",
    a: "At a 25% tax rate, with tax basis equal to book value: the $10 loss cuts pre-tax income $10, taxes $2.50 and net income $7.50. Cash flow statement: net income down $7.50, add back the $10 non-cash loss and add $90 of proceeds in investing, so cash rises $92.50. Balance sheet: cash up $92.50 and PP&E down $100, so assets fall $7.50; retained earnings fall $7.50, and it balances.",
    why: "A loss means the equipment was carried above what it could fetch, so the book value that didn't come back as cash is expensed now. The loss is non-cash, so it's added back in operating cash flow, and the proceeds go in investing. The loss is deductible, so its tax saving is real cash, which is why cash rises by more than the $90 of proceeds.",
    trap: "Don't treat the $10 loss as cash leaving the business: the company received $90 and paid nothing. The loss only says the asset had been carried at more than it was worth.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Loss on sale", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "Loss add-back", value: 10 },
      { label: "Sale proceeds (investing)", value: 90 },
      { label: "Net change in cash", value: 92.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 92.5 }, { label: "PP&E", value: -100 } ],
      le: [ { label: "Retained earnings", value: -7.5 } ]
    }}
  },
  {
    id: "ib-walk-017",
    track: "ib",
    module: "ib-walk",
    topic: "PP&E impairment",
    level: 2,
    type: "walk",
    classic: true,
    q: "A plant's cash flows have collapsed, and the company writes its PP&E down by $10. Walk me through the three statements.",
    a: "At a 25% tax rate, treating the impairment as deductible now (the usual interview convention): pre-tax income falls $10, taxes $2.50, net income $7.50. Cash flow statement: net income down $7.50, add back the $10 non-cash impairment, so cash is up $2.50. Balance sheet: cash up $2.50 and PP&E down $10, so assets fall $7.50; retained earnings fall $7.50, and it balances.",
    why: "An impairment writes an asset down to fair value once it can't recover its carrying amount; under US GAAP the first test compares carrying value with undiscounted future cash flows. The mechanics match depreciation, but it's a one-off, so it's excluded from EBITDA and adjusted earnings. It also lowers future depreciation, because less book value is left to spread. US GAAP bars reversal for assets still in use; IFRS allows it if value recovers.",
    trap: "Strictly, tax usually allows the loss only when the asset is sold or scrapped, so cash taxes don't fall now: a $2.50 deferred tax asset appears instead of cash. Mention it if pressed.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "PP&E impairment", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "Impairment add-back", value: 10 },
      { label: "Net change in cash", value: 2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 2.5 }, { label: "PP&E", value: -10 } ],
      le: [ { label: "Retained earnings", value: -7.5 } ]
    }}
  },
  {
    id: "ib-walk-018",
    track: "ib",
    module: "ib-walk",
    topic: "Goodwill impairment",
    level: 2,
    type: "walk",
    classic: true,
    q: "The company records a $10 goodwill impairment. Walk me through the three statements.",
    a: "Assume a 25% tax rate, but goodwill impairment usually isn't tax-deductible, so taxes don't change: pre-tax income and net income both fall $10. Cash flow statement: net income down $10, add back the $10 non-cash impairment, so cash doesn't change. Balance sheet: goodwill down $10 on the assets side and retained earnings down $10 on the other, so both sides fall $10 and it balances.",
    why: "Goodwill is the premium an acquirer paid over the fair value of the net assets it bought, and an impairment admits the business is worth less than that. In a stock acquisition, buying the shares rather than the assets, the buyer gets no tax basis in goodwill, so writing it down saves no tax and net income takes the full $10. It's non-cash and non-recurring, so it's excluded from EBITDA and adjusted earnings.",
    trap: "If the goodwill came from an asset deal, it's amortized for tax over 15 years, so an impairment gives a $2.50 deferred tax benefit: net income falls $7.50, and cash still doesn't change.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Goodwill impairment", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes (not deductible)", value: 0 },
      { label: "Net income", value: -10, total: true }
    ], cfs: [
      { label: "Net income", value: -10 },
      { label: "Impairment add-back", value: 10 },
      { label: "Net change in cash", value: 0, total: true }
    ], bs: {
      assets: [ { label: "Goodwill", value: -10 } ],
      le: [ { label: "Retained earnings", value: -10 } ]
    }}
  },
  {
    id: "ib-walk-019",
    track: "ib",
    module: "ib-walk",
    topic: "Dividends",
    level: 1,
    type: "walk",
    q: "The company pays a $10 cash dividend. Walk me through the three statements.",
    a: "Taxes (assume 25%) don't change: a dividend is a distribution of profit, not an expense, so the income statement doesn't move. Cash flow statement: a $10 outflow in financing activities, so cash falls $10. Balance sheet: cash down $10; retained earnings down $10, so both sides fall $10 and it balances.",
    why: "Dividends return profit that was already earned and taxed, so they reduce retained earnings directly instead of passing through net income. They aren't deductible for the company, one reason debt, with its deductible interest, is cheaper than equity. Retained earnings move by net income less dividends, the link between the income statement and the balance sheet.",
    trap: "When a dividend is declared but not yet paid, retained earnings fall and a dividends payable liability rises; cash moves only on the payment date. Net income is unchanged either way.",
    visual: { kind: "threeStatement", unit: "$", is: [], cfs: [
      { label: "Dividends paid", value: -10 },
      { label: "Net change in cash", value: -10, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -10 } ],
      le: [ { label: "Retained earnings", value: -10 } ]
    }}
  },
  {
    id: "ib-walk-020",
    track: "ib",
    module: "ib-walk",
    topic: "Share buyback",
    level: 1,
    type: "walk",
    q: "The company buys back $10 of its own stock. Walk me through the three statements.",
    a: "At a 25% tax rate nothing changes on the income statement, because a buyback isn't an expense. Cash flow statement: a $10 outflow in financing activities, so cash falls $10. Balance sheet: cash down $10; treasury stock, a contra-equity account, grows by $10, so equity falls $10. Both sides fall $10, and it balances.",
    why: "A buyback returns cash to shareholders by shrinking the share count instead of paying a dividend. Net income is unchanged but spread over fewer shares, so EPS usually rises, though the company also gives up the interest the cash was earning. Repurchased shares are either held as treasury stock at cost, a negative line inside equity, or retired, which reduces common stock and APIC instead.",
    trap: "Retained earnings don't change under the treasury stock method; the reduction sits in its own equity line. A higher EPS isn't automatically value created: that depends on the price paid versus what the shares are worth.",
    visual: { kind: "threeStatement", unit: "$", is: [], cfs: [
      { label: "Share buyback", value: -10 },
      { label: "Net change in cash", value: -10, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -10 } ],
      le: [ { label: "Treasury stock", value: -10 } ]
    }}
  },
  {
    id: "ib-walk-021",
    track: "ib",
    module: "ib-walk",
    topic: "Equity issuance",
    level: 1,
    type: "walk",
    q: "The company issues $100 of new shares for cash. Walk me through the three statements.",
    a: "Taxes (assume 25%) don't come into it: raising capital isn't income, so the income statement doesn't change. Cash flow statement: a $100 inflow in financing activities, so cash rises $100. Balance sheet: cash up $100; common stock and APIC up $100, so equity rises $100. Both sides rise $100, and it balances.",
    why: "Issuing shares sells part of the company for cash, so it's financing, not revenue. The proceeds split between common stock at par value and additional paid-in capital (APIC) for the rest, but in a walk-through they move as one. The cost is indirect: existing owners are diluted, and future profit is shared across more shares, so EPS falls unless the new cash earns enough.",
    trap: "Underwriting fees and other issuance costs aren't expensed; they reduce the amount recorded in APIC. Raise $100 with $3 of fees, and cash and equity each rise $97.",
    visual: { kind: "threeStatement", unit: "$", is: [], cfs: [
      { label: "Shares issued", value: 100 },
      { label: "Net change in cash", value: 100, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 100 } ],
      le: [ { label: "Common stock and APIC", value: 100 } ]
    }}
  },
  {
    id: "ib-walk-022",
    track: "ib",
    module: "ib-walk",
    topic: "Operating lease payment",
    level: 2,
    type: "walk",
    q: "Under ASC 842, a company pays $10 of flat annual rent on an operating lease. This year's implied interest on the lease liability is $4. Walk me through the three statements.",
    a: "At a 25% tax rate: a single $10 lease cost in operating expenses cuts pre-tax income $10, taxes $2.50 and net income $7.50. Cash flow statement: net income down $7.50; add back $6 of right-of-use (ROU) asset amortization and subtract the $6 drop in the lease liability, both in operating, so cash falls $7.50. Balance sheet: cash down $7.50, ROU asset down $6; lease liability down $6, retained earnings down $7.50. It balances.",
    why: "ASC 842 puts operating leases on the balance sheet but keeps the income statement simple: one straight-line lease cost, above EBITDA, like rent. Behind it, the $10 payment covers $4 of interest and $6 of principal on the liability, and the ROU asset amortizes by whatever keeps total cost flat: $10 − $4 = $6. For tax, the rent itself is the deduction, and the whole payment stays in operating cash flow.",
    trap: "Don't split the cost into depreciation and interest: that's a finance lease, or any lease under IFRS 16, where the principal moves to financing cash flow and EBITDA is higher.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Operating lease cost", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "ROU asset amortization", value: 6 },
      { label: "Decrease in lease liability", value: -6 },
      { label: "Net change in cash", value: -7.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -7.5 }, { label: "ROU asset", value: -6 } ],
      le: [ { label: "Lease liability", value: -6 }, { label: "Retained earnings", value: -7.5 } ]
    }}
  },
  {
    id: "ib-walk-023",
    track: "ib",
    module: "ib-walk",
    topic: "Finance lease payment",
    level: 3,
    type: "walk",
    q: "Under ASC 842, a company makes a $10 finance lease payment: $4 of interest and $6 of principal. The ROU asset amortizes $8. Walk me through the three statements.",
    a: "At a 25% tax rate, assuming tax follows the book expense: $8 of amortization and $4 of interest cut pre-tax income $12, taxes $3 and net income $9. Cash flow statement: net income down $9, add back the $8 of amortization and show the $6 of principal in financing, so cash falls $7. Balance sheet: cash down $7, ROU asset down $8; lease liability down $6, retained earnings down $9. Both sides fall $15, and it balances.",
    why: "A finance lease is accounted for like buying the asset with a loan: the ROU asset is amortized like PP&E, and the liability accrues interest like debt. Both sit below EBITDA, and total expense is front-loaded, above the payment early on, because interest is highest while the balance is largest. Interest stays in operating cash flow and principal goes to financing, so operating cash flow looks better than under an operating lease.",
    trap: "Operating cash flow falls only $1 here, the interest less the tax saved, not by the full payment. IFRS 16 treats nearly every lease this way, which is why IFRS companies report higher EBITDA.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "ROU asset amortization", value: 8 },
      { label: "Interest expense", value: 4 },
      { label: "Pre-tax income", value: -12, total: true },
      { label: "Taxes at 25%", value: -3 },
      { label: "Net income", value: -9, total: true }
    ], cfs: [
      { label: "Net income", value: -9 },
      { label: "Amortization add-back", value: 8 },
      { label: "Lease principal repaid (financing)", value: -6 },
      { label: "Net change in cash", value: -7, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -7 }, { label: "ROU asset", value: -8 } ],
      le: [ { label: "Lease liability", value: -6 }, { label: "Retained earnings", value: -9 } ]
    }}
  },
  {
    id: "ib-walk-024",
    track: "ib",
    module: "ib-walk",
    topic: "Deferred tax liability",
    level: 3,
    type: "walk",
    q: "A new machine brings $10 of straight-line book depreciation this year but $20 of accelerated tax depreciation. Walk me through the three statements.",
    a: "At a 25% tax rate: book pre-tax income falls $10 and tax expense falls $2.50, so net income falls $7.50. Cash taxes fall $5, on $20 of tax depreciation; the $2.50 difference is deferred. Cash flow statement: net income down $7.50, add back $10 of depreciation and $2.50 of deferred tax, so cash rises $5. Balance sheet: cash up $5, PP&E down $10; deferred tax liability up $2.50, retained earnings down $7.50. It balances.",
    why: "Book and tax follow different rules. Faster tax depreciation means the company pays less tax now than its income statement shows and more later, once book depreciation overtakes tax depreciation. Tax expense is based on book income; the gap between it and the tax actually paid becomes a deferred tax liability, in effect an interest-free loan from the government until it reverses.",
    trap: "Don't put the $5 cash saving on the income statement: for timing differences, tax expense follows book pre-tax income. The DTL unwinds when book depreciation catches up or the asset is sold.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Depreciation", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Current taxes", value: -5 },
      { label: "Deferred taxes", value: 2.5 },
      { label: "Taxes at 25%", value: -2.5, total: true },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "Depreciation add-back", value: 10 },
      { label: "Deferred taxes", value: 2.5 },
      { label: "Net change in cash", value: 5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 5 }, { label: "PP&E", value: -10 } ],
      le: [ { label: "Deferred tax liability", value: 2.5 }, { label: "Retained earnings", value: -7.5 } ]
    }}
  },
  {
    id: "ib-walk-025",
    track: "ib",
    module: "ib-walk",
    topic: "Using an NOL",
    level: 3,
    type: "walk",
    q: "The company uses $10 of NOLs, already on its balance sheet as a deferred tax asset, to shelter this year's taxable income. Walk me through the three statements.",
    a: "At a 25% tax rate the income statement doesn't change: tax expense is still 25% of pre-tax income, but $2.50 of it shifts from current tax to deferred tax. Cash flow statement: that $2.50 of deferred tax is non-cash, so it's added back, and cash rises $2.50. Balance sheet: cash up $2.50 and the deferred tax asset down $2.50, so total assets don't change; liabilities and equity don't either, and it balances.",
    why: "A net operating loss (NOL) carryforward lets past losses offset future taxable income. Under US GAAP, the future tax saving is recorded as a deferred tax asset when the loss occurs, so the benefit already went through earnings then. Using the NOL converts that asset into cash: cash taxes fall, book tax expense doesn't. US NOLs from 2018 on carry forward indefinitely but can offset only 80% of taxable income.",
    trap: "If a valuation allowance covered the asset, common after years of losses, using the NOL releases it: book taxes fall too, so net income and cash both rise $2.50. Section 382 caps NOL use after an ownership change.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Current taxes", value: -2.5 },
      { label: "Deferred taxes", value: 2.5 },
      { label: "Net income", value: 0, total: true }
    ], cfs: [
      { label: "Net income", value: 0 },
      { label: "Deferred taxes (DTA used)", value: 2.5 },
      { label: "Net change in cash", value: 2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 2.5 }, { label: "Deferred tax asset", value: -2.5 } ],
      le: []
    }}
  },
  {
    id: "ib-walk-026",
    track: "ib",
    module: "ib-walk",
    topic: "Paying down AP",
    level: 1,
    type: "walk",
    q: "The company pays a supplier $10 it owed in accounts payable. Walk me through the three statements.",
    a: "Assume a 25% tax rate, but nothing is taxed: the cost was recorded when the goods or services arrived, so paying the bill doesn't touch the income statement. Cash flow statement: the $10 decrease in accounts payable uses cash in operating activities, so cash falls $10. Balance sheet: cash down $10 and accounts payable down $10, so both sides fall $10 and it balances.",
    why: "Accounts payable is money owed to suppliers for things already received. Paying it settles a liability with an asset, so only the balance sheet and operating cash flow move. It's the reverse of stretching payables: paying suppliers faster uses cash even though profit is unchanged, one reason operating cash flow can swing from quarter to quarter.",
    trap: "Don't book an expense on payment. The expense, or the inventory, was recorded when the supplier delivered; paying later only settles the debt.",
    visual: { kind: "threeStatement", unit: "$", is: [], cfs: [
      { label: "Decrease in accounts payable", value: -10 },
      { label: "Net change in cash", value: -10, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -10 } ],
      le: [ { label: "Accounts payable", value: -10 } ]
    }}
  },
  {
    id: "ib-walk-027",
    track: "ib",
    module: "ib-walk",
    topic: "Bad debt write-off",
    level: 2,
    type: "walk",
    q: "A customer that owes the company $10 goes bankrupt, and the company writes off the receivable. Walk me through the three statements.",
    a: "It depends on whether the loss was already reserved. At a 25% tax rate, if not: $10 of bad debt expense cuts pre-tax income $10 and net income $7.50. Cash flow statement: add back the $10 drop in AR, so cash rises $2.50. Balance sheet: cash up $2.50, AR down $10; retained earnings down $7.50. If an allowance already covered it, the write-off only nets gross AR against the allowance, leaving net income unchanged. Either way it balances.",
    why: "US GAAP uses the allowance method: companies estimate expected credit losses up front, expense them and hold an allowance, a contra-asset netted against AR. The write-off then removes a receivable that was already reserved. Expensing losses only when they happen, the direct write-off method, isn't GAAP for material amounts, but it's how US tax works: the deduction comes at write-off.",
    trap: "Even with an allowance, the write-off saves $2.50 of cash tax now, since tax deducts bad debts only at write-off. That reverses the deferred tax asset booked with the allowance.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Bad debt expense", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25%", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "Decrease in AR", value: 10 },
      { label: "Net change in cash", value: 2.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 2.5 }, { label: "Accounts receivable", value: -10 } ],
      le: [ { label: "Retained earnings", value: -7.5 } ]
    }, caption: "With no allowance booked beforehand (direct write-off)." }
  },
  {
    id: "ib-walk-028",
    track: "ib",
    module: "ib-walk",
    topic: "Convertible conversion",
    level: 2,
    type: "walk",
    q: "Holders convert $100 of the company's convertible bonds into common shares. Walk me through the three statements.",
    a: "Assume a 25% tax rate, but conversion creates no income or expense: under US GAAP the bonds' carrying value simply moves into equity, with no gain or loss. Cash flow statement: nothing, since no cash changes hands; it's disclosed as a non-cash financing activity. Balance sheet: debt down $100; common stock and APIC up $100. Assets don't change, and neither do total liabilities and equity, so it balances.",
    why: "A convertible is debt the holder can swap for a fixed number of shares, which makes sense once the share price is above the conversion price. Conversion trades a liability for ownership: leverage falls, the share count rises and interest stops. From then on, net income rises by the after-tax interest saved, and EPS reflects both that and the new shares, which is what the if-converted method anticipates.",
    trap: "Don't run the $100 through the cash flow statement: no cash moved. Any unamortized discount or issuance costs move to equity with the bonds' carrying value, and a sweetener paid to induce early conversion is expensed.",
    visual: { kind: "threeStatement", unit: "$", is: [], cfs: [], bs: {
      assets: [],
      le: [ { label: "Debt", value: -100 }, { label: "Common stock and APIC", value: 100 } ]
    }}
  },
  {
    id: "ib-walk-029",
    track: "ib",
    module: "ib-walk",
    topic: "Unrealized investment gain",
    level: 3,
    type: "walk",
    q: "The company owns a small stake in a listed company, and the shares gain $10 in value by year-end. It hasn't sold them. Walk me through the three statements.",
    a: "Under US GAAP (ASC 321), at a 25% tax rate: the $10 unrealized gain lifts pre-tax income $10, and tax expense rises $2.50, deferred until the shares are sold, so net income rises $7.50. Cash flow statement: subtract the $10 non-cash gain and add back the $2.50 of deferred tax, so cash doesn't change. Balance sheet: investment up $10; deferred tax liability up $2.50 and retained earnings up $7.50. It balances.",
    why: "Since 2018, US GAAP has marked equity securities with a readily determinable fair value to market through net income, sold or not. Tax counts the gain only when it's realized, so the tax is expensed now but owed later: a deferred tax liability. IFRS 9 lets companies elect to send such gains to other comprehensive income instead, as US GAAP does for available-for-sale debt securities; then equity rises through AOCI and net income doesn't move.",
    trap: "Don't show $2.50 of cash tax: unrealized gains aren't taxed until the shares are sold. A stake with significant influence, roughly 20% to 50%, uses the equity method instead and isn't marked to market.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Unrealized gain on investment", value: 10 },
      { label: "Pre-tax income", value: 10, total: true },
      { label: "Taxes at 25% (deferred)", value: 2.5 },
      { label: "Net income", value: 7.5, total: true }
    ], cfs: [
      { label: "Net income", value: 7.5 },
      { label: "Less unrealized gain", value: -10 },
      { label: "Deferred taxes", value: 2.5 },
      { label: "Net change in cash", value: 0, total: true }
    ], bs: {
      assets: [ { label: "Equity investment", value: 10 } ],
      le: [ { label: "Deferred tax liability", value: 2.5 }, { label: "Retained earnings", value: 7.5 } ]
    }}
  },
  {
    id: "ib-walk-030",
    track: "ib",
    module: "ib-walk",
    topic: "Buying and selling inventory",
    level: 2,
    type: "walk",
    q: "The company buys $10 of inventory with cash, then sells it for $20 in cash. Walk me through the three statements for both steps.",
    a: "Assume a 25% tax rate. The purchase: no income statement effect; cash falls $10 and inventory rises $10, so it balances. The sale: $20 of revenue less $10 of COGS lifts pre-tax income $10, taxes $2.50 and net income $7.50. Cash flow statement: add back the $10 decrease in inventory, so cash rises $17.50. Balance sheet: cash up $17.50 and inventory down $10; retained earnings up $7.50. It balances.",
    why: "Cost of goods sold is the inventory's cost moving from the balance sheet to the income statement at the moment of sale, so the expense lands with the revenue it produced. The cash for the goods left in step one, which is why step two adds back the fall in inventory. Over the full cycle, cash rises $7.50, exactly net income, because the working-capital swing has unwound.",
    trap: "Don't subtract the $10 cost from cash again at the sale; it was paid in step one. Had the goods been bought on credit, paying the supplier would be a third step.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Revenue", value: 20 },
      { label: "Cost of goods sold", value: 10 },
      { label: "Pre-tax income", value: 10, total: true },
      { label: "Taxes at 25%", value: 2.5 },
      { label: "Net income", value: 7.5, total: true }
    ], cfs: [
      { label: "Net income", value: 7.5 },
      { label: "Decrease in inventory", value: 10 },
      { label: "Net change in cash", value: 17.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 17.5 }, { label: "Inventory", value: -10 } ],
      le: [ { label: "Retained earnings", value: 7.5 } ]
    }, caption: "Step two, the sale." }
  },
  {
    id: "ib-walk-031",
    track: "ib",
    module: "ib-walk",
    topic: "Equipment bought with debt",
    level: 2,
    type: "walk",
    classic: true,
    q: "The company borrows $100 at 10% to buy equipment with a 10-year life. Walk me through the three statements at purchase and after the first year.",
    a: "Assume a 25% tax rate. At purchase: no income statement effect; $100 of debt raised and $100 of capex net to zero cash; PP&E and debt both rise $100. After year one: $10 of depreciation and $10 of interest cut pre-tax income $20, taxes $5 and net income $15. Cash flow statement: add back $10 of depreciation, so cash falls $5. Balance sheet: cash down $5, PP&E down $10; retained earnings down $15. It balances.",
    why: "The purchase is two balance sheet entries funded through two cash flow sections: investing for the equipment, financing for the loan. The income statement feels the deal only over time, through depreciation and interest. Both are tax-deductible, but only interest is paid in cash, so cash falls by the $10 of interest less the $5 of tax the two expenses save.",
    trap: "Classic follow-up: early in year two the equipment is written off and the loan repaid. Treating the $90 write-off as deductible, net income falls $67.50 and cash falls $77.50: the $100 repayment less $22.50 of tax saved.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Depreciation", value: 10 },
      { label: "Interest expense", value: 10 },
      { label: "Pre-tax income", value: -20, total: true },
      { label: "Taxes at 25%", value: -5 },
      { label: "Net income", value: -15, total: true }
    ], cfs: [
      { label: "Net income", value: -15 },
      { label: "Depreciation add-back", value: 10 },
      { label: "Capex", value: -100 },
      { label: "Debt raised", value: 100 },
      { label: "Net change in cash", value: -5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -5 }, { label: "PP&E", value: 90 } ],
      le: [ { label: "Debt", value: 100 }, { label: "Retained earnings", value: -15 } ]
    }, caption: "Both steps combined: the purchase and year one." }
  },
  {
    id: "ib-walk-032",
    track: "ib",
    module: "ib-walk",
    topic: "Debt repurchased at a discount",
    level: 3,
    type: "walk",
    q: "The company buys back $100 of its bonds in the market for $90. Walk me through the three statements.",
    a: "At a 25% tax rate, treating the gain as taxable, since cancelled debt counts as income for tax: the $10 gain on extinguishment lifts pre-tax income $10, taxes $2.50 and net income $7.50. Cash flow statement: net income up $7.50, subtract the $10 non-cash gain and show the $90 repurchase in financing, so cash falls $92.50. Balance sheet: cash down $92.50; debt down $100 and retained earnings up $7.50. Both sides fall $92.50, and it balances.",
    why: "Bonds trade below face value when rates rise or credit weakens. Retiring them removes the full $100 carrying value for $90, and the difference is a gain. For tax, the discount is cancellation-of-debt income, taxable unless an exception such as bankruptcy or insolvency applies, so the gain can cost real cash. It's non-recurring, so it's excluded from EBITDA and adjusted earnings.",
    trap: "The gain isn't cash coming in: cash falls by the $90 paid plus the tax. Any unamortized issuance costs or discount on the bonds are written off at the same time, shrinking the gain.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Gain on debt extinguishment", value: 10 },
      { label: "Pre-tax income", value: 10, total: true },
      { label: "Taxes at 25%", value: 2.5 },
      { label: "Net income", value: 7.5, total: true }
    ], cfs: [
      { label: "Net income", value: 7.5 },
      { label: "Less gain on extinguishment", value: -10 },
      { label: "Bonds repurchased (financing)", value: -90 },
      { label: "Net change in cash", value: -92.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: -92.5 } ],
      le: [ { label: "Debt", value: -100 }, { label: "Retained earnings", value: 7.5 } ]
    }}
  },
  {
    id: "ib-walk-033",
    track: "ib",
    module: "ib-walk",
    topic: "Deferred tax asset from a reserve",
    level: 3,
    type: "walk",
    q: "The company accrues a $10 warranty reserve. Tax allows the deduction only when claims are paid. Walk me through the three statements.",
    a: "At a 25% tax rate: $10 of warranty expense cuts pre-tax income $10; tax expense falls $2.50, all of it deferred, so net income falls $7.50. Cash flow statement: net income down $7.50, add back the $10 rise in the warranty liability and subtract the $2.50 new deferred tax asset, so cash doesn't change. Balance sheet: deferred tax asset up $2.50; warranty liability up $10 and retained earnings down $7.50. Both sides rise $2.50, and it balances.",
    why: "The expense hits the books now, but tax waits until claims are paid. So book taxes fall today while cash taxes don't: the company has, in effect, prepaid tax, and the deferred tax asset records the $2.50 it will save later. When claims are paid, cash falls $10, the deduction saves $2.50 of cash tax and the asset unwinds. Reserves, accruals and NOLs are the usual sources of deferred tax assets.",
    trap: "Contrast the accrued bonus, usually deductible when accrued, where the tax saving is cash right away. A deferred tax asset is only worth something if there's future taxable income; if that's doubtful, a valuation allowance writes it down.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Warranty expense", value: 10 },
      { label: "Pre-tax income", value: -10, total: true },
      { label: "Taxes at 25% (deferred)", value: -2.5 },
      { label: "Net income", value: -7.5, total: true }
    ], cfs: [
      { label: "Net income", value: -7.5 },
      { label: "Increase in warranty liability", value: 10 },
      { label: "Increase in deferred tax asset", value: -2.5 },
      { label: "Net change in cash", value: 0, total: true }
    ], bs: {
      assets: [ { label: "Deferred tax asset", value: 2.5 } ],
      le: [ { label: "Warranty liability", value: 10 }, { label: "Retained earnings", value: -7.5 } ]
    }}
  },
  {
    id: "ib-walk-034",
    track: "ib",
    module: "ib-walk",
    topic: "Asset sale with a DTL",
    level: 3,
    type: "walk",
    q: "The company sells equipment for $110. Its book value is $100, but accelerated tax depreciation has cut its tax basis to $60. Walk me through the three statements.",
    a: "At a 25% tax rate: the $10 book gain lifts pre-tax income $10, tax expense $2.50 and net income $7.50. But the taxable gain is $50, so cash tax is $12.50, and the $10 deferred tax liability reverses. Cash flow statement: net income $7.50, less the $10 gain, less $10 of deferred tax, plus $110 of proceeds: cash up $97.50. Balance sheet: cash up $97.50, PP&E down $100; DTL down $10, retained earnings up $7.50. It balances.",
    why: "Accelerated tax depreciation left a $40 gap between book value and tax basis, carried as a $10 deferred tax liability. The sale closes the gap: the tax deferred over the years comes due now, and it's exactly the liability that was set aside. Tax expense still reflects only the book gain, so net income matches a sale with equal bases; the difference is all in cash, $10 less.",
    trap: "Don't compute income statement tax on the $50 taxable gain. Tax expense follows the book gain; the extra $10 of cash tax settles a liability already on the balance sheet.",
    visual: { kind: "threeStatement", unit: "$", is: [
      { label: "Gain on sale", value: 10 },
      { label: "Pre-tax income", value: 10, total: true },
      { label: "Current taxes", value: 12.5 },
      { label: "Deferred taxes", value: -10 },
      { label: "Taxes at 25%", value: 2.5, total: true },
      { label: "Net income", value: 7.5, total: true }
    ], cfs: [
      { label: "Net income", value: 7.5 },
      { label: "Less gain on sale", value: -10 },
      { label: "Deferred taxes (DTL reverses)", value: -10 },
      { label: "Sale proceeds (investing)", value: 110 },
      { label: "Net change in cash", value: 97.5, total: true }
    ], bs: {
      assets: [ { label: "Cash", value: 97.5 }, { label: "PP&E", value: -100 } ],
      le: [ { label: "Deferred tax liability", value: -10 }, { label: "Retained earnings", value: 7.5 } ]
    }}
  },
  {
    id: "ib-walk-035",
    track: "ib",
    module: "ib-walk",
    topic: "Signing a lease",
    level: 2,
    type: "walk",
    q: "The company signs a 10-year operating lease, and the present value of the rent is $100. Walk me through the three statements on the day it signs.",
    a: "Assume a 25% tax rate, but nothing is expensed or taxed yet, since no rent has been incurred: the income statement doesn't change. Cash flow statement: no cash moves, so nothing; the lease is disclosed as a non-cash item. Balance sheet: a $100 right-of-use asset on the assets side and a $100 lease liability on the other. Both sides rise $100, so it balances.",
    why: "Since ASC 842, lessees record almost every lease longer than 12 months on the balance sheet. The liability is the present value of the payments, discounted at the rate implicit in the lease or, more often, the company's incremental borrowing rate; the ROU asset starts at the same amount, adjusted for prepaid rent, incentives and initial direct costs. IFRS 16 does the same. Expenses begin only as the lease runs.",
    trap: "Reported leverage rises even though no money moved. Whether lease liabilities count as debt in EV and leverage varies; stay consistent with whether EBITDA is before or after rent.",
    visual: { kind: "threeStatement", unit: "$", is: [], cfs: [], bs: {
      assets: [ { label: "Right-of-use asset", value: 100 } ],
      le: [ { label: "Lease liability", value: 100 } ]
    }}
  }
]);
