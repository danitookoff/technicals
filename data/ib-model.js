Deck.add([
  {
    id: "ib-model-001",
    track: "ib",
    module: "ib-model",
    topic: "How an integrated model works",
    level: 1,
    type: "primer",
    q: "Primer: modeling mechanics and Excel",
    a: "An integrated model projects the income statement, balance sheet and cash flow statement from a small set of drivers, with schedules for working capital, PP&E and debt. Cash comes from the cash flow statement; the revolver draws when cash would fall below its minimum and is repaid from any surplus. Interest on average balances makes the model circular, so it iterates behind a circuit breaker. Around that core sit the Excel skills that modeling tests reward: clear formatting, date-based returns, lookups, data tables and checks that catch errors early.",
    why: "Driver: an assumption that sets a line, such as revenue growth. Schedule: a supporting calculation that feeds the statements. DSO, DIO and DPO: receivable, inventory and payable days. Minimum cash: the balance the business keeps to operate. Revolver: a credit line drawn and repaid as needed, the model's balancing source of cash. Mandatory amortization: scheduled principal repayment. Cash sweep: excess cash used to prepay debt. Circularity: a formula that depends on its own result. Circuit breaker: a switch that cuts the loop. Hard-code: a typed number, not a formula. XNPV and XIRR: NPV and IRR on actual dates. Data table: Excel's grid that reruns the model for each input value.",
    visual: { kind: "table", headers: ["Tool", "What it does", "Watch for"], rows: [
      ["Revolver", "Keeps cash at its minimum", "Draws beyond the commitment"],
      ["Iteration", "Solves interest on average debt", "Errors stuck in the loop"],
      ["XNPV and XIRR", "Discount on actual dates", "The first date is time zero"],
      ["Lookups", "Pull values by label", "Approximate matches by default"],
      ["Data tables", "Rerun the model across a grid", "Slow; inputs on the same sheet"]
    ]}
  },
  {
    id: "ib-model-002",
    track: "ib",
    module: "ib-model",
    topic: "Three-statement build order",
    level: 1,
    type: "walk",
    classic: true,
    q: "Walk me through building a three-statement model. What do you build first, and why in that order?",
    a: "Start with three years of historicals and a driver block: growth, margins, working-capital days, capex and tax. Project the income statement to operating income, then schedules for working capital and PP&E. Fill the balance sheet from them, except cash and debt. Build the cash flow statement from net income and each balance sheet change. The debt schedule comes last: it sets the revolver and repayments, and interest links back to the income statement. Finish with a balance check.",
    why: "Build in the order information flows, so each block reads only from blocks already built and errors trace back to one place. Operations come first because they don't depend on financing. The cash flow statement explains every balance sheet change, and its ending cash becomes the balance sheet's cash, so a correctly linked model balances by itself. Financing comes last because it depends on everything above: the cash left sets how much debt is drawn or repaid, which sets interest and so net income. That loop is the one intended circularity. Some build the cash flow statement first; either order works if every balance sheet line has one source.",
    trap: "Never make cash the balancing figure, total liabilities and equity minus every other asset. The balance sheet then balances whatever is wrong underneath, and the check can never catch an error. Cash must come from the cash flow statement.",
    visual: { kind: "flow", steps: [
      { label: "Historicals and drivers", note: "Growth, margins, days, capex, tax" },
      { label: "Income statement", note: "Revenue down to operating income" },
      { label: "Schedules", note: "Working capital, PP&E and D&A" },
      { label: "Balance sheet", note: "Every line except cash and debt" },
      { label: "Cash flow statement", note: "Net income plus balance sheet changes" },
      { label: "Debt schedule", note: "Revolver, repayments, interest back to the income statement" },
      { label: "Balance check", note: "Assets − liabilities − equity = 0 every year" }
    ]}
  },
  {
    id: "ib-model-003",
    track: "ib",
    module: "ib-model",
    topic: "The revolver as the plug",
    level: 2,
    type: "qa",
    classic: true,
    q: "What's the plug in a three-statement model, and how do you write the revolver's draw or repayment as one Excel formula?",
    a: "The revolver. Cash comes from the cash flow statement, and the revolver draws whenever cash would fall below its minimum and is repaid from any surplus. One cell: MIN(MAX(minimum cash − cash before the revolver, −opening revolver), commitment − opening revolver). MAX stops a repayment at the balance owed; MIN stops a draw at the commitment.",
    why: "A projected balance sheet balances because cash is whatever the cash flow statement leaves, so something must respond when that runs short, the way a treasurer draws on the line. The inner term is the shortfall: positive means draw, negative means a surplus. MAX against the negative opening balance turns a surplus into a repayment no larger than what's owed, so the balance can't go negative. MIN against the undrawn commitment caps the draw. Cash before the revolver must already include interest, mandatory amortization and dividends, so the revolver fills only what's left. Surplus beyond the revolver stays as cash or goes to a sweep.",
    formula: "Cash before the revolver = opening cash + the year's other cash flows\nShortfall = minimum cash − cash before the revolver\nDraw (+) or repayment (−) = MIN(MAX(shortfall, −opening revolver), commitment − opening revolver)",
    example: "Minimum cash [[$20M]], commitment [[$50M]], opening cash [[$50M]] and nothing drawn. Year 1's cash flow before the revolver is [[−$45M]], leaving $5M: the shortfall is $15M, so draw $15M and end at $20M. Year 2 brings [[+$40M]]: cash before the revolver is $60M, a $40M surplus, so repay the full $15M and end with $45M.",
    trap: "Don't point the formula at ending cash: ending cash already includes the draw, so the cell depends on itself, an accidental circularity. Build cash before the revolver as its own row and let ending cash add the draw.",
    visual: { kind: "table", headers: ["", "Year 1", "Year 2"], rows: [
      ["Opening cash", "[[$50M]]", "$20M"],
      ["Cash flow before the revolver", "[[−$45M]]", "[[+$40M]]"],
      ["Cash before the revolver", "$5M", "$60M"],
      ["Shortfall vs [[$20M]] minimum", "$15M", "−$40M"],
      ["Draw (+) or repayment (−)", "$15M", "−$15M"],
      ["Ending cash", "$20M", "$45M"],
      ["Revolver balance", "$15M", "$0"]
    ], caption: "Commitment [[$50M]]: the cap never binds." }
  },
  {
    id: "ib-model-004",
    track: "ib",
    module: "ib-model",
    topic: "Circuit breakers",
    level: 2,
    type: "qa",
    q: "Interest on average debt makes your model circular. How do you set up iteration and a circuit breaker, and how do you clear an error stuck in the loop?",
    a: "Turn on iterative calculation in Excel's formula options, then add a circuit-breaker cell: a 1 or 0 that switches interest between average and opening balances. If an error appears and won't clear, set the switch to 0, fix the cause, let the model recalculate cleanly, then set it back to 1.",
    why: "Iteration makes Excel rerun the loop, by default up to 100 times or until values change by less than 0.001, so interest and debt converge. The weakness is that an error like #DIV/0! or #REF! travels the loop too: interest becomes an error, then net income, cash and debt follow. Interest stays an error even after you fix the cause, because its own inputs still are. Only cutting the loop lets it recalculate from clean values. Opening balances make a good off position, since the model still works, with interest only slightly off. Keep the switch beside the checks: a model left at 0 still balances, but interest is off.",
    formula: "Interest = rate × IF(switch = 1, (opening + closing balance) ÷ 2, opening balance)\nSwitch: 1 to iterate, 0 to cut the loop",
    trap: "The follow-up: why do circular warnings appear when the model opens alongside other files? Iteration applies to the whole Excel session and is generally set by the first workbook opened, so open the model first or turn iteration back on.",
    visual: { kind: "flow", steps: [
      { label: "Interest", note: "On the average debt balance" },
      { label: "Net income", note: "Falls as interest rises" },
      { label: "Cash available", note: "For repayment or the sweep" },
      { label: "Debt repaid", note: "Sweep or revolver repayment" },
      { label: "Closing debt", note: "Sets the average balance, and so interest" }
    ], caption: "The switch cuts the loop at interest." }
  },
  {
    id: "ib-model-005",
    track: "ib",
    module: "ib-model",
    topic: "Finding a balance sheet error",
    level: 2,
    type: "walk",
    classic: true,
    q: "Your projected balance sheet doesn't balance. Walk me through how you'd find the error.",
    a: "Start with the pattern of the gap. If a historical year is off, fix the inputs. A constant gap from the first projected year points to a one-off error, like an opening balance; a gap that grows each year, to a flow missing or signed wrong. A gap of twice a line's change means that line's sign is flipped. Then tie every balance sheet change to one cash flow line and check retained earnings and the cash link.",
    why: "A projected balance sheet balances only if every balance's change has one matching cash flow line with the right sign, and cash links from the cash flow statement. So each error leaves a fingerprint. A change missing from the cash flow statement leaves a gap equal to that change; a flipped sign leaves twice it; a flow error repeats every year, so the gap accumulates. Find the first year the gap appears and compare it with each line's change that year. Cut the circularity first, with the switch at 0 and iteration off: every number stays fixed while you trace it, and Excel will flag any accidental second loop.",
    example: "The gap is [[$30M]], [[$60M]] and [[$90M]] in years 1 to 3, growing $30M a year, so a flow is wrong every year. Capex is [[$15M]] a year, and $30M is exactly twice that: capex is being added to cash instead of subtracted. Fix the sign and all three years balance.",
    trap: "Never plug the gap into cash or another liability to make the check read zero. The error still flows through cash, interest and returns; you've only hidden it, and a grader who opens the formula will find it.",
    visual: { kind: "table", headers: ["Pattern of the gap", "Likely cause"], rows: [
      ["Historical year is off", "Input or data entry error"],
      ["Constant from the first projected year", "Opening balance or a one-off link"],
      ["Grows every year", "A flow missing or signed wrong"],
      ["Twice a line's change", "That line's sign is flipped"],
      ["Moves on every recalculation", "The circular loop isn't converging"]
    ]}
  },
  {
    id: "ib-model-006",
    track: "ib",
    module: "ib-model",
    topic: "Projecting working capital",
    level: 2,
    type: "qa",
    classic: true,
    q: "How do you project working capital? Revenue grows from $365M to $438M and COGS is 60% of revenue; DSO, DIO and DPO are 45, 50 and 40 days.",
    a: "Project each balance from its days, then take the change. Receivables are revenue × DSO ÷ 365; inventory and payables use COGS. Net working capital rises from $51.0M to $61.2M, so the cash flow statement shows a $10.2M outflow. Growth ties up cash even though the days haven't changed.",
    why: "Days tie each balance to the flow that creates it, so balances grow with the business and any change in days is a visible assumption you can defend. Receivables are carried at selling price, so they scale with revenue; inventory and payables are carried at cost, so they scale with COGS. Smaller items, such as prepaid and accrued expenses or deferred revenue, usually run as a percentage of revenue or operating costs. On the cash flow statement, a rise in an operating asset uses cash and a rise in a liability provides it. Start from historical days, and change them only for a reason you can explain.",
    formula: "Receivables = revenue × DSO ÷ 365\nInventory = COGS × DIO ÷ 365\nPayables = COGS × DPO ÷ 365\nCash flow from working capital = −(this year's NWC − last year's NWC)",
    trap: "In a quarterly model, divide by the days in the quarter, about 91, not 365. Otherwise every balance comes out a quarter of its true size, and the first projected quarter shows a large, fake cash inflow.",
    visual: { kind: "table", headers: ["", "Year 1", "Year 2"], rows: [
      ["Revenue", "[[$365.0M]]", "[[$438.0M]]"],
      ["COGS at [[60%]]", "$219.0M", "$262.8M"],
      ["Receivables at [[45]] days", "$45.0M", "$54.0M"],
      ["Inventory at [[50]] days", "$30.0M", "$36.0M"],
      ["Payables at [[40]] days", "$24.0M", "$28.8M"],
      ["Net working capital", "$51.0M", "$61.2M"]
    ], caption: "The $10.2M increase is a year-2 cash outflow." }
  },
  {
    id: "ib-model-007",
    track: "ib",
    module: "ib-model",
    topic: "Debt schedule",
    level: 2,
    type: "walk",
    classic: true,
    q: "Walk me through building a debt schedule for a company with a revolver, a term loan and senior notes.",
    a: "Give each tranche a block, in order of seniority: opening balance, mandatory amortization, optional prepayment, closing balance, rate and interest. Above them, calculate cash available for debt repayment: opening cash plus the year's cash flow before repayments, less minimum cash. Mandatory amortization comes out first; what's left repays the revolver, then the term loan. Notes usually stay outstanding to maturity. Interest goes to the income statement, repayments to financing cash flow and closing balances to the balance sheet.",
    why: "The layout mirrors the credit agreements. Mandatory amortization is contractual, often about 1% of the original principal a year for a term loan B and more for a term loan A, so it's paid whatever cash does. Optional prepayment is discretionary, and models assume spare cash goes first to the revolver, which can be redrawn, then to term loans, which are prepayable at or near par; bonds usually carry call protection. Interest on the average balance reflects repayments spread through the year but creates the circularity; opening balances avoid it and overstate interest slightly while debt is falling. Say which you use.",
    example: "A [[$500M]] term loan at [[8%]] amortizes [[1%]] a year and receives a [[$95M]] sweep. Mandatory amortization is $5M, so the closing balance is $500M − $5M − $95M = $400M. Interest on the opening balance: $40.0M. On the average balance of $450M: $36.0M. The $4.0M gap is why you state your convention.",
    trap: "Know the terms: amortization is a fixed schedule, while mandatory prepayments are triggered by events in the credit agreement, such as an excess cash flow sweep or asset sale proceeds. Optional prepayments are whatever the company repays voluntarily on top.",
    visual: { kind: "flow", steps: [
      { label: "Cash available for debt repayment", note: "Opening cash + cash flow before repayments − minimum cash" },
      { label: "Mandatory amortization", note: "Contractual, paid first" },
      { label: "Revolver", note: "Repaid first from what's left, or drawn if short" },
      { label: "Term loans", note: "Swept in order of seniority" },
      { label: "Senior notes", note: "Usually held to maturity" },
      { label: "Links", note: "Interest, repayments and balances to the three statements" }
    ]}
  },
  {
    id: "ib-model-008",
    track: "ib",
    module: "ib-model",
    topic: "Sweep formulas across tranches",
    level: 3,
    type: "qa",
    q: "How do you write the sweep so excess cash repays the revolver, then term loan A, then term loan B, without any balance going negative?",
    a: "Chain MIN functions down the tranches. Each tranche takes the smaller of the cash still available and its balance after mandatory amortization; the next starts with what's left. Mandatory amortization gets its own cap, MIN(scheduled amount, opening balance). With a partial sweep, apply the percentage to the year's excess cash flow before the cascade.",
    why: "MIN is what keeps the schedule honest. Without it, a tranche can be repaid more than it owes, turning its balance negative and spending cash that doesn't exist. A row of cash left after each tranche makes the order explicit and easy to audit, and whatever remains after the last one stays on the balance sheet. Mandatory amortization needs the same cap because sweeps shrink a balance faster than the original schedule assumed, so later scheduled payments can exceed what's owed. Everything then runs off one number, cash available, which makes a mistake in it easy to trace.",
    formula: "Mandatory amortization = MIN(scheduled amount, opening balance)\nSweep to a tranche = MIN(cash left before it, opening balance − mandatory amortization)\nCash left after it = cash left before it − sweep to it",
    example: "After minimum cash and mandatory amortization, [[$75M]] is available. Balances before the sweep: revolver [[$15M]], term loan A [[$40M]] and term loan B [[$195M]]. The revolver takes $15M, leaving $60M. Term loan A takes $40M and is gone, leaving $20M. Term loan B takes the last $20M and closes at $175M.",
    trap: "A credit agreement's excess cash flow sweep applies its percentage to the year's excess cash flow, not to cash on hand. Applying 50% to the cash balance sweeps part of last year's retained cash again every year.",
    visual: { kind: "table", headers: ["Tranche", "Balance before sweep", "Sweep", "Cash left", "Closing balance"], rows: [
      ["Revolver", "[[$15M]]", "$15M", "$60M", "$0"],
      ["Term loan A", "[[$40M]]", "$40M", "$20M", "$0"],
      ["Term loan B", "[[$195M]]", "$20M", "$0", "$175M"]
    ], caption: "[[$75M]] of cash available, applied in order of priority" }
  },
  {
    id: "ib-model-009",
    track: "ib",
    module: "ib-model",
    topic: "Formatting and sign conventions",
    level: 1,
    type: "qa",
    q: "What do blue, black and green fonts mean in a banking model, and which sign conventions should you follow?",
    a: "Blue is a hard-coded input, including historical figures; black is a formula; green is a link from another sheet. Keep one consistent formula across each row and never type numbers into formulas. Pick one sign convention and label it: commonly, costs positive and subtracted on the income statement, cash outflows negative on the cash flow statement.",
    why: "Colors tell a reviewer which cells are assumptions to challenge and which are calculations to trust. A number typed into a formula, such as last year's revenue × 1.05, is an assumption hiding in black: it won't show up when someone reviews the inputs, and a sensitivity table can't flex it. One formula across a row's projection years means you can check the row by checking one cell, and a break in the pattern flags an error. Signs matter because SUM only works when every line in a block follows the same rule. Practice varies: some banks use green for links to other files, or red for external links.",
    trap: "The classic error is subtracting a number already shown as negative, which adds it. Label the sign in the row name, such as 'Less: capex' or '(Capex)', so a reader knows how the line enters the total.",
    visual: { kind: "table", headers: ["Font", "Means", "Example"], rows: [
      ["[[Blue]]", "Hard-coded input", "Historical revenue; [[5.0%]] growth"],
      ["Black", "Formula on the same sheet", "Revenue × (1 + growth)"],
      ["Green", "Link from another sheet", "Interest from the debt schedule"]
    ]}
  },
  {
    id: "ib-model-010",
    track: "ib",
    module: "ib-model",
    topic: "NPV vs XNPV",
    level: 2,
    type: "qa",
    q: "What's the difference between Excel's NPV and XNPV? Value $100 received each December 31 from 2025 to 2027 at 10%, from a June 30, 2025 valuation date.",
    a: "NPV counts positions, not dates: it discounts the first value a full period and each later value one more. XNPV discounts each flow by its actual days from the first date in the range, divided by 365. NPV gives $248.7 here, treating the first flow as a year away; XNPV gives $260.7, because it's only 184 days away.",
    why: "NPV is right only when the first flow is exactly one period after the valuation date and the rest follow at equal intervals. Otherwise every flow is discounted for the wrong length of time, which is why deal models with stub periods or mid-year closings use XNPV. Three mechanics trip people up. XNPV's rate is always annual, while NPV's is per period, so a monthly model needs a monthly rate. XNPV treats the first date as time zero and doesn't discount that flow, so put the valuation date first, with a zero if nothing is paid then. And it always divides by 365, even across a leap year.",
    formula: "NPV = Σ value in position t ÷ (1 + rate)^t, for t = 1, 2, 3…\nXNPV = Σ value ÷ (1 + annual rate)^((date − first date) ÷ 365)",
    trap: "In a DCF, XNPV can apply the mid-year convention for you if you date each year's cash flow at mid-year. Then don't also apply a half-year adjustment, or the convention is counted twice.",
    visual: { kind: "table", headers: ["Cash flow", "Days out", "Years in NPV", "Years in XNPV"], rows: [
      ["[[$100]] on Dec 31, 2025", "184", "1", "0.504"],
      ["[[$100]] on Dec 31, 2026", "549", "2", "1.504"],
      ["[[$100]] on Dec 31, 2027", "914", "3", "2.504"],
      ["Value at [[10%]]", "", "$248.7", "$260.7"]
    ], caption: "Valuation date [[June 30, 2025]]. XNPV is 4.8% higher: about half a year less discounting." }
  },
  {
    id: "ib-model-011",
    track: "ib",
    module: "ib-model",
    topic: "IRR vs XIRR",
    level: 2,
    type: "qa",
    q: "A sponsor invests $100M on June 30, 2025 and receives $200M on December 31, 2029. Why do IRR and XIRR give different answers?",
    a: "IRR counts periods and XIRR counts days. In annual columns, entry in 2025 and exit in 2029 sit four periods apart, so IRR gives 18.9%. XIRR measures the actual 1,645 days, about 4.5 years, and gives 16.6%. Whenever flows aren't exactly one period apart, trust XIRR.",
    why: "IRR assumes equally spaced flows and returns a rate per period: monthly columns give a monthly rate. XIRR works from dates and always returns an annual rate, compounding over days ÷ 365, so it handles a mid-year close, a dividend recap in March or an exit that slips a quarter. That's why deal and fund returns are usually calculated on actual dates. The error from forcing flows into columns is largest on short holds, where half a year is a big share of the total. Both need at least one negative and one positive flow, and can fail or give several answers when signs change more than once.",
    formula: "XIRR solves Σ cash flow ÷ (1 + r)^((date − first date) ÷ 365) = 0\nHere: 2.0x over 1,645 ÷ 365 = 4.51 years, so r = 2.0^(1 ÷ 4.51) − 1 = 16.6%",
    trap: "IRR can't take fractional periods, so don't patch a mid-year close by hand. Add a row of real dates, starting with the closing date, and run XIRR on it; the exit date then becomes an input you can flex.",
    visual: { kind: "bars", unit: "%", dp: 1, items: [
      { label: "IRR, annual columns", value: 18.9 },
      { label: "XIRR, actual dates", value: 16.6, highlight: true }
    ], caption: "[[$100M]] in on [[June 30, 2025]]; [[$200M]] out on [[December 31, 2029]]" }
  },
  {
    id: "ib-model-012",
    track: "ib",
    module: "ib-model",
    topic: "PMT, IPMT and PPMT",
    level: 1,
    type: "qa",
    q: "How do PMT, IPMT and PPMT work? Take a $10M loan at 6%, repaid in equal annual payments over five years.",
    a: "PMT gives the level payment: $2.37M a year. IPMT gives the interest part of a chosen period, $600K in year 1, and PPMT the principal part, $1.77M; the two always sum to PMT. Interest falls and principal rises as the balance shrinks. Excel shows all three as negatives, since a positive loan amount is cash received.",
    why: "All three solve the same annuity: the constant payment that repays the loan exactly over the term at the rate. The arguments must match the payment frequency: monthly payments need the rate ÷ 12 and the term × 12, or the answer is badly wrong. Excel treats cash received as positive and cash paid as negative, so either enter the loan as negative or put a minus sign in front of the function. In corporate models, PMT fits mortgages, equipment loans and leases. Leveraged loans usually amortize a fixed percentage of original principal, with most of the balance due at maturity, so PMT would misstate their repayments.",
    formula: "PMT = loan × rate ÷ (1 − (1 + rate)^−periods)\nIPMT for a period = that period's opening balance × rate\nPPMT = PMT − IPMT for the same period",
    example: "[[$10M]] at [[6%]] over [[5]] years: PMT is $2,373,964. Year 1: interest $600,000, principal $1,773,964, leaving $8,226,036. Year 2: interest $493,562 on that balance, principal $1,880,402. By year 5 the balance is zero.",
    trap: "The follow-up: what's the balance after year 3? Not the loan minus three payments, since those include interest. It's the present value of the two remaining payments at 6%: about $4.35M."
  },
  {
    id: "ib-model-013",
    track: "ib",
    module: "ib-model",
    topic: "SUMIFS, INDEX/MATCH and XLOOKUP",
    level: 1,
    type: "qa",
    q: "When do you use SUMIFS, INDEX/MATCH or XLOOKUP in a model?",
    a: "Use SUMIFS for totals that meet conditions, such as one segment's revenue in one fiscal year or quarters rolled up into years. Use INDEX/MATCH to pull a single value by row and column label; it works in every Excel version. XLOOKUP does the same job more simply but needs Microsoft 365 or Excel 2021 onward.",
    why: "Ask whether you want a total or one value. SUMIFS always adds, so duplicate rows add up and a missing match quietly returns zero, which is dangerous in a lookup. INDEX/MATCH returns the first match, can look left and survives inserted columns, unlike VLOOKUP's hard-coded column number. XLOOKUP defaults to an exact match, can search from the bottom and takes a value to show when nothing matches. It returns #NAME? in older versions, so avoid it if a test or client might open the file there. Whichever you use, look up on a unique key, such as segment plus year, or the first match may be the wrong row.",
    trap: "MATCH and VLOOKUP default to an approximate match. Leave off the final 0 or FALSE on unsorted data and they return a wrong value with no error. Always ask for an exact match.",
    visual: { kind: "table", headers: ["Function", "Returns", "Best for", "Watch for"], rows: [
      ["SUMIFS", "A total", "Roll-ups by segment or period", "No match returns 0"],
      ["INDEX/MATCH", "One value", "Two-way lookups in any version", "MATCH defaults to approximate"],
      ["XLOOKUP", "One value", "Simple exact lookups", "#NAME? in older Excel"]
    ]}
  },
  {
    id: "ib-model-014",
    track: "ib",
    module: "ib-model",
    topic: "Scenario switches",
    level: 1,
    type: "qa",
    q: "How do you build a base, upside and downside case switch into a model, and why avoid OFFSET for it?",
    a: "Put each case's assumptions in parallel rows on the inputs sheet, add a case cell (1, 2 or 3) and a live row that picks the active case with CHOOSE or INDEX. The model reads only the live row. Avoid OFFSET and INDIRECT: they're volatile, recalculating on every change, and the cells they read don't show when you trace precedents.",
    why: "A switch changes the whole story with one cell while keeping every case's assumptions visible and consistent: a real downside moves growth, margins and working capital together. Routing everything through one live row means formulas across the model never change, so there's one place to audit. CHOOSE is simplest for a few cases; INDEX scales to many and can pull a whole row. Volatility matters in big models, because every recalculation reruns volatile functions and everything that depends on them, which slows iteration and data tables. Show the active case's name on every output page so no one mistakes the downside for the base case.",
    formula: "Live assumption = CHOOSE(case, base, upside, downside)\nor = INDEX(the three case rows, case)",
    trap: "Don't build the downside by copying the model into a second file. The versions drift apart and every fix must be made twice. Keep one model and one switch, and run a data table on the case cell to see all three side by side.",
    visual: { kind: "table", headers: ["", "Year 1", "Year 2", "Year 3"], rows: [
      ["Base (1)", "[[5.0%]]", "[[5.0%]]", "[[4.0%]]"],
      ["Upside (2)", "[[8.0%]]", "[[7.0%]]", "[[6.0%]]"],
      ["Downside (3)", "[[1.0%]]", "[[0.0%]]", "[[2.0%]]"],
      ["Live: case [[2]]", "8.0%", "7.0%", "6.0%"]
    ], caption: "Revenue growth by case. The model reads only the live row." }
  },
  {
    id: "ib-model-015",
    track: "ib",
    module: "ib-model",
    topic: "Data tables",
    level: 3,
    type: "qa",
    q: "How does an Excel data table work, why does it slow a model down and why must its input cells sit on the same sheet?",
    a: "A data table reruns the model once per cell: Excel writes each grid value into the input cells, recalculates and records the output, so a 5 × 5 table costs 25 recalculations whenever anything changes. Input cells must sit on the table's sheet, so build the table beside the assumptions or point the assumption to a cell there.",
    why: "The table is an array formula, TABLE(row input, column input), that Excel evaluates by brute force, which is also why you can't edit one of its cells. Every recalculation of the workbook reruns every table, and in a circular model each rerun also iterates, so a few tables can make every keystroke lag. The usual fix is setting calculation to automatic except for data tables, then pressing F9 when you want them refreshed. The same-sheet rule is simply how Excel built the feature: it substitutes values only into cells on the table's own sheet and rejects an input cell anywhere else.",
    trap: "Hard-code the row and column values, or link them to cells other than the input cells. Axis values that are formulas of the input cell can shift as Excel substitutes values, and the grid comes out wrong with no warning.",
    visual: { kind: "flow", steps: [
      { label: "Take one grid value", note: "From the table's top row and left column" },
      { label: "Write it into the input cell", note: "Which must sit on the table's sheet" },
      { label: "Recalculate the whole model", note: "Iterating too, if the model is circular" },
      { label: "Record the output", note: "In that cell of the grid" },
      { label: "Repeat for every cell", note: "25 recalculations for a 5 × 5 table" }
    ]}
  },
  {
    id: "ib-model-016",
    track: "ib",
    module: "ib-model",
    topic: "Paper, timed and take-home tests",
    level: 1,
    type: "qa",
    q: "What's the difference between a paper LBO, a timed LBO modeling test and a take-home case study, and what does each test?",
    a: "A paper LBO takes minutes with pen and paper: entry, debt paydown, exit and returns, done in round numbers. A timed test gives one to three hours to build an LBO in Excel from a prompt, sometimes with full three statements. A take-home case allows days and adds a memo or slides with a recommendation.",
    why: "Think about what each grader is really asking. A paper LBO asks whether you understand how debt paydown and exit value create equity returns, with numbers simple enough to do in your head. A timed test asks whether you can turn a prompt into a correct, clean model under time pressure, often from a blank sheet. A take-home asks what you'd actually recommend and why, so the memo and the risks it names count heavily alongside the model. Firms differ: some supply a template, and many review your model with you afterward, so be ready to defend every assumption. Ask the recruiter what to expect.",
    trap: "Paper LBOs often come up mid-interview without warning, so practice until the math is automatic: entry equity, cumulative paydown, exit equity, then MOIC to IRR with anchors such as 2.0x over five years ≈ 15%.",
    visual: { kind: "table", headers: ["", "Paper LBO", "Timed test", "Take-home case"], rows: [
      ["Time", "Minutes", "1–3 hours", "Days"],
      ["Tools", "Pen and paper", "Excel", "Excel plus memo or slides"],
      ["Output", "MOIC and IRR", "Model and returns", "Model and recommendation"],
      ["Tests", "Intuition", "Speed and accuracy", "Judgment"]
    ]}
  },
  {
    id: "ib-model-017",
    track: "ib",
    module: "ib-model",
    topic: "Running a timed modeling test",
    level: 3,
    type: "qa",
    q: "You have two hours to build an LBO from a three-page prompt. What do you build first, and how do you manage the clock?",
    a: "Read the prompt first and list every required output. Then build the simplest complete model in order: sources and uses, projections to free cash flow, a debt schedule charging interest on opening balances, then returns. Aim to have an IRR by about halfway, then add what else the prompt asks for, such as a balance sheet or sensitivities. Format last.",
    why: "Graders start from the outputs, so a simple model with the right returns beats a detailed one that never reaches an IRR, and outputs make errors easier to spot. Opening-balance interest avoids a circularity that can eat twenty minutes if an error gets stuck; switch to average balances only once everything ties, if the prompt wants it. Keep inputs in one block and stay on the keyboard: write each formula once, then copy it across. Save numbered versions as you go, so a crash costs minutes, not the test. Keep the last ten to fifteen minutes for checks, a returns summary and a line on the main risks.",
    trap: "Ambiguity in a prompt is often deliberate. Choose a reasonable assumption, note it beside the input and keep going; modeling both readings burns time that graders won't credit.",
    visual: { kind: "flow", steps: [
      { label: "Read and plan", note: "Outputs, timeline, where inputs go" },
      { label: "Sources and uses", note: "Price, debt, fees, equity plug" },
      { label: "Projections", note: "Revenue down to free cash flow" },
      { label: "Debt schedule", note: "Opening-balance interest, then the sweep" },
      { label: "Returns", note: "Exit equity, MOIC and IRR, by about halfway" },
      { label: "Extras", note: "Balance sheet, circularity, sensitivities" },
      { label: "Checks and summary", note: "The last 10 to 15 minutes" }
    ]}
  },
  {
    id: "ib-model-018",
    track: "ib",
    module: "ib-model",
    topic: "Model checks",
    level: 2,
    type: "qa",
    q: "Which checks would you build into a three-statement or LBO model, and how do you make a failure impossible to miss?",
    a: "Check that the balance sheet balances every year, cash matches the cash flow statement, cash stays at or above its minimum, no debt balance goes negative, the revolver stays within its commitment and sources equal uses. Sum the checks' absolute values into one master check, shown atop every output page and red whenever it isn't zero.",
    why: "Checks turn silent errors into visible ones. Each targets a mistake that doesn't break any formula: a sweep that overpays a loan still calculates, and a revolver drawn beyond its commitment still balances. Write every check to return zero when it passes, for example MAX(0, minimum cash − cash), so they can be added together. Use absolute values, or a +5 in one check and a −5 in another would net to zero. Allow a small tolerance, such as 0.001, for iteration rounding. A master check in view means you notice a break the moment you cause it, when it's easiest to trace.",
    trap: "Checks catch broken mechanics, not bad judgment. Also sense-check the outputs: does IRR fit MOIC and the hold? Is interest close to rate × debt? Are margins and leverage within ranges the business has achieved?",
    visual: { kind: "table", headers: ["Check", "Passes when"], rows: [
      ["Assets − liabilities − equity", "= 0 every year"],
      ["Balance sheet cash − cash flow statement cash", "= 0"],
      ["MAX(0, minimum cash − cash)", "= 0"],
      ["Each closing debt balance", "≥ 0"],
      ["Revolver drawn − commitment", "≤ 0"],
      ["Sources − uses", "= 0"]
    ]}
  },
  {
    id: "ib-model-019",
    track: "ib",
    module: "ib-model",
    topic: "Checking someone else's model",
    level: 3,
    type: "qa",
    q: "You're handed a model someone else built. How do you check it before relying on its numbers?",
    a: "Start with the outputs and checks: does it balance, and do the results make sense? Then hunt for common problems: numbers typed into formulas, a year whose formula differs from its row, links to other files and hidden rows or sheets. Trace the key outputs back to their inputs, and change an input to confirm everything moves as it should.",
    why: "Most model errors look consistent: a formula overwritten with a number in one year, a SUM that stops a row short, a link to last quarter's file. Excel finds many of them. Go To Special selects every constant, so hard-codes in black stand out. Trace Precedents shows what feeds a cell. Edit Links lists external files, and the inconsistent-formula flag marks cells that differ from their neighbors. Changing inputs is the fastest logic test: raise revenue growth, and cash, debt paydown and returns should all rise. Anything that doesn't move isn't linked.",
    trap: "Don't trust a check just because it reads zero. It may be hard-coded, or compare a cell with itself. Open the formula: a balance sheet balanced by a plug is the classic hidden problem."
  },
  {
    id: "ib-model-020",
    track: "ib",
    module: "ib-model",
    topic: "Projecting D&A",
    level: 2,
    type: "qa",
    q: "How do you project D&A? Existing PP&E of $240M has 8 years of life left, and capex is $60M a year on assets with 10-year lives.",
    a: "Build a depreciation waterfall: depreciate existing PP&E over its remaining life and each year's capex over its useful life, then sum the layers. Here existing assets give $30M a year and each capex layer $6M, half in its first year, so D&A is $33M, $39M and $45M in years 1 to 3.",
    why: "D&A should follow the assets being depreciated. A percentage of revenue is quick and common in timed tests, but it ignores how much PP&E exists, so over a long forecast D&A can drift away from capex and net PP&E can shrink toward zero or balloon. The waterfall keeps the roll-forward honest: ending PP&E equals opening PP&E plus capex minus D&A, and each layer stops when its asset is fully depreciated. It also shows why D&A lags capex in a growing company: this year's spending is written off over a decade. Practice varies on the first year: a full year, half a year or none.",
    formula: "Layer depreciation = capex ÷ useful life, while the asset has life left\nD&A = existing PP&E depreciation + all capex layers\nEnding net PP&E = opening net PP&E + capex − D&A",
    example: "Existing PP&E: [[$240M]] ÷ [[8]] years = $30M a year. Each [[$60M]] capex layer: $60M ÷ [[10]] years = $6M a year, half in its first year. Year 1: $30M + $3M = $33M. Year 2: $30M + $6M + $3M = $39M. Year 3: $30M + $12M + $3M = $45M. Net PP&E grows from $240M to $267M, $288M and $303M, because capex runs ahead of D&A.",
    trap: "Stop each layer when its life ends. The common formula error lets old capex keep depreciating forever, so D&A climbs without limit and net PP&E eventually turns negative.",
    visual: { kind: "table", headers: ["", "Year 1", "Year 2", "Year 3"], rows: [
      ["Existing PP&E", "$30M", "$30M", "$30M"],
      ["Year 1 capex", "$3M", "$6M", "$6M"],
      ["Year 2 capex", "", "$3M", "$6M"],
      ["Year 3 capex", "", "", "$3M"],
      ["Total D&A", "$33M", "$39M", "$45M"]
    ], caption: "Half a year of depreciation in each layer's first year" }
  }
]);
