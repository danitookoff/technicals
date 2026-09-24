Deck.add([
  {
    id: "re-debt-001",
    track: "re",
    module: "re-debt",
    topic: "Capital stack and loan sizing",
    level: 1,
    type: "primer",
    q: "Primer: the capital stack and how lenders size loans",
    a: "A deal is funded in layers. Senior mortgage debt is the cheapest and is repaid first. Mezzanine debt or preferred equity can sit above it, costing more for more risk. Common equity sits on top: paid last, but it keeps the upside. Lenders cap the senior loan with a few ratios (LTV, LTC, DSCR and debt yield) and lend the lowest amount any of them allows.",
    why: "LTV: loan ÷ property value. LTC: loan ÷ total project cost, used for construction and heavy renovations. DSCR: NOI ÷ annual debt service. Debt yield: NOI ÷ loan. Mezzanine debt: a loan secured by the ownership interests in the company that owns the property. Preferred equity: equity with a priority return, paid after all debt but before common equity.",
    visual: { kind: "stack", unit: "%", items: [
      { label: "Common equity", value: 20 },
      { label: "Mezzanine or preferred equity", value: 15 },
      { label: "Senior mortgage", value: 65, highlight: true }
    ], caption: "Illustrative stack: cost and risk rise toward the top, repayment priority toward the bottom." }
  },
  {
    id: "re-debt-002",
    track: "re",
    module: "re-debt",
    topic: "Loan sizing",
    level: 2,
    type: "qa",
    classic: true,
    q: "A lender quotes 65% LTV, 1.25x DSCR and a 9% debt yield. How do you size the loan?",
    a: "Calculate the maximum loan under each test and take the smallest. The test that produces the lowest number is the binding constraint, and it sets the loan.",
    why: "Each test protects the lender from a different risk. LTV guards against the value falling. DSCR checks that today's NOI covers the payments at this rate and amortization. Debt yield is the lender's cash return if it had to take the property back, and it ignores interest rates and cap rates entirely. The lender only lends what every test allows.",
    formula: "LTV loan = value × LTV\nDSCR loan = (NOI ÷ DSCR) ÷ mortgage constant\nDebt yield loan = NOI ÷ debt yield",
    example: "NOI [[$1.8M]], value [[$30M]], [[6.5%]] interest-only. LTV: [[65%]] × [[$30M]] = $19.5M. DSCR: [[$1.8M]] ÷ [[1.25]] = $1.44M of debt service ÷ [[6.5%]] = $22.15M. Debt yield: [[$1.8M]] ÷ [[9%]] = $20.0M. Loan = $19.5M, so LTV binds.",
    trap: "With amortization the mortgage constant is higher than the interest rate, so the DSCR loan shrinks. A common follow-up switches the loan from interest-only to amortizing.",
    visual: { kind: "bars", unit: "$M", items: [
      { label: "LTV", value: 19.5, highlight: true },
      { label: "DSCR", value: 22.15 },
      { label: "Debt yield", value: 20.0 }
    ]}
  },
  {
    id: "re-debt-003",
    track: "re",
    module: "re-debt",
    topic: "DSCR vs debt yield",
    level: 1,
    type: "qa",
    classic: true,
    q: "What's the difference between DSCR and debt yield, and why do lenders like debt yield?",
    a: "DSCR is NOI divided by annual debt service: can today's income pay the loan? Debt yield is NOI divided by the loan amount: what would the lender earn on its money if it took the property? Lenders like debt yield because interest rates, amortization and cap rates can't flatter it.",
    why: "DSCR depends on loan terms. With a low rate or long amortization, the same loan shows a comfortable DSCR, so DSCR can be managed through structure. LTV depends on the appraisal, which moves with cap rates. Debt yield uses only NOI and the loan balance, so it answers a blunt question: if the lender ends up owning the building, how much income does it get per dollar lent? That's why CMBS lenders lean on it.",
    formula: "DSCR = NOI ÷ annual debt service\nDebt yield = NOI ÷ loan amount",
    example: "NOI [[$1.5M]], loan [[$18M]] at [[6.0%]] interest-only. Debt service is $1.08M, so DSCR is 1.39x; debt yield is $1.5M ÷ $18M = 8.3%. If the rate fell to [[5.0%]], DSCR would rise to 1.67x while the debt yield stayed at 8.3%.",
    trap: "On an amortizing loan, debt service includes principal. Dividing NOI by interest alone overstates DSCR."
  },
  {
    id: "re-debt-004",
    track: "re",
    module: "re-debt",
    topic: "Mezzanine vs preferred equity",
    level: 2,
    type: "qa",
    classic: true,
    q: "What's the difference between mezzanine debt and preferred equity?",
    a: "Both fill the gap between the senior loan and common equity. Mezzanine debt is a loan to the owner of the property-owning company, secured by a pledge of its ownership interests; if it isn't repaid, the lender forecloses on those interests. Preferred equity is an ownership stake with a priority return, enforced through rights in the partnership agreement.",
    why: "The difference is the remedy. A mezz lender can foreclose on the pledged equity under the UCC (the Uniform Commercial Code), usually far faster than a mortgage foreclosure, and it signs an intercreditor agreement with the senior lender. A preferred equity investor isn't a creditor: if the sponsor misses the pref, its remedy is usually to take control of the partnership or force a sale. Economically the two often look alike, but they rank and enforce differently.",
    trap: "Some senior loans prohibit mezzanine debt but allow preferred equity, which is one reason sponsors use pref. The follow-up: in a sale at a loss, who's paid first? The senior loan, then mezz or pref, then common equity.",
    visual: { kind: "table", headers: ["", "Mezzanine debt", "Preferred equity"], rows: [
      ["What it is", "Loan to the owner entity", "Equity with a priority return"],
      ["Secured by", "Pledge of ownership interests", "Rights in the partnership agreement"],
      ["If unpaid", "UCC foreclosure on the equity", "Take control or force a sale"],
      ["Senior lender's view", "Needs an intercreditor agreement", "Often treated as equity"]
    ]}
  },
  {
    id: "re-debt-005",
    track: "re",
    module: "re-debt",
    topic: "Prepayment",
    level: 3,
    type: "qa",
    q: "What's the difference between yield maintenance and defeasance?",
    a: "Both compensate a fixed-rate lender when a loan is paid off early. Yield maintenance is a cash penalty: roughly the present value of the interest the lender loses, based on the gap between the loan rate and Treasury yields. Defeasance swaps the property collateral for a portfolio of Treasuries that makes the remaining payments, so the loan stays outstanding.",
    why: "A fixed-rate lender, or a CMBS trust whose bondholders expect a fixed stream, loses money if it must reinvest the payoff at lower rates. Yield maintenance charges the borrower for that shortfall directly. Defeasance keeps the promised payments intact by substituting risk-free bonds, which suits securitized loans that can't simply be prepaid. Both get cheaper when rates have risen since the loan was made, because reinvesting is more attractive.",
    trap: "When rates have risen, yield maintenance often shrinks to its floor (commonly around 1% of the balance), and defeasance can even cost less than the loan balance. Expect the question: which gets cheaper when rates rise? Both."
  }
]);
