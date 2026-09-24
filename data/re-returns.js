Deck.add([
  {
    id: "re-returns-001",
    track: "re",
    module: "re-returns",
    topic: "Unlevered vs levered IRR",
    level: 1,
    type: "qa",
    classic: true,
    q: "What's the difference between unlevered and levered IRR?",
    a: "Unlevered IRR uses the property's cash flows before any debt: the price paid, NOI less capital costs each year, and the sale. Levered IRR uses the equity's cash flows: the equity invested, cash flow after debt service, and sale proceeds after repaying the loan. Leverage raises IRR when the property earns more than the debt costs.",
    why: "Unlevered IRR measures the asset, what you'd earn paying all cash, so it's the fair way to compare properties. Levered IRR measures the deal as financed: with less of your own money in, every dollar of profit above the cost of debt is spread over a smaller equity check. The same leverage magnifies losses, so a higher levered IRR isn't automatically a better deal.",
    example: "Buy for [[$10.0M]], NOI [[$600K]] a year, sell after [[5]] years for [[$11.0M]]. Unlevered IRR ≈ 7.7%. Add a [[$6.0M]] interest-only loan at [[5.0%]]: equity $4.0M, annual cash flow $300K, equity back at sale $5.0M. Levered IRR ≈ 11.5%.",
    trap: "The follow-up: so why not borrow 90%? Debt gets more expensive as leverage rises, cash flow can turn negative, and a small drop in value can wipe out the equity."
  },
  {
    id: "re-returns-002",
    track: "re",
    module: "re-returns",
    topic: "Positive and negative leverage",
    level: 2,
    type: "qa",
    classic: true,
    q: "What is positive leverage, and when does leverage turn negative?",
    a: "Leverage is positive when the property's yield beats the cost of debt, measured by the loan constant (annual debt service ÷ loan). Each borrowed dollar then earns more than it costs, lifting the equity's cash yield. When the loan constant is above the cap rate, leverage is negative: borrowing lowers cash-on-cash.",
    why: "Cash-on-cash is cash flow after debt service divided by equity. The borrowed money earns the property's yield but costs the loan constant, and the spread between the two goes to the equity. If the spread is negative, the equity subsidizes the lender. Buyers sometimes accept negative leverage on day one because they expect NOI growth to turn it positive, but that's a bet on growth.",
    formula: "Loan constant = annual debt service ÷ loan\nPositive leverage when cap rate > loan constant",
    example: "Buy for [[$10.0M]] at a [[6.0%]] cap ($600K NOI) with a [[$6.0M]] interest-only loan. At [[5.0%]], debt service is $300K and cash-on-cash is $300K ÷ $4.0M = 7.5%. At [[7.0%]], debt service is $420K and cash-on-cash falls to 4.5%, below the 6.0% unlevered yield.",
    trap: "Compare the cap rate with the loan constant, not the interest rate. Amortization pushes the constant above the rate, so a loan can look like positive leverage on rate and still be negative on cash flow.",
    visual: { kind: "bars", unit: "%", dp: 1, items: [
      { label: "All cash", value: 6.0 },
      { label: "Debt at 5.0%", value: 7.5, highlight: true },
      { label: "Debt at 7.0%", value: 4.5 }
    ], caption: "Year-one cash-on-cash on the same property" }
  },
  {
    id: "re-returns-003",
    track: "re",
    module: "re-returns",
    topic: "IRR vs equity multiple",
    level: 2,
    type: "qa",
    q: "When can IRR and the equity multiple point in different directions?",
    a: "When timing differs. IRR rewards getting money back fast, while the equity multiple only counts how much comes back. A quick flip can post a high IRR on a small profit; a long hold can produce a big multiple at a modest IRR. Look at both, plus the dollar profit.",
    why: "IRR is an annualized rate, so a small gain over a short time compounds into a big number, and early distributions (say, from a refinance) push it up even if total profit doesn't change. The multiple ignores time entirely. An investor with money to deploy often cares about the multiple, because a fast IRR on a 1.3x deal leaves it hunting for the next deal sooner. That's why LPs ask for both.",
    example: "Deal A: [[$10M]] in, [[$13M]] back after [[2]] years: 1.30x and a 14.0% IRR. Deal B: [[$10M]] in, [[$20M]] back after [[7]] years: 2.00x and a 10.4% IRR. A wins on IRR; B makes $7M more.",
    trap: "A refinance that returns capital early raises IRR but can lower the multiple, because the new loan's interest eats into total cash. Know which metric a fund's promote hurdles use.",
    visual: { kind: "table", headers: ["", "Deal A", "Deal B"], rows: [
      ["Equity in", "[[$10M]]", "[[$10M]]"],
      ["Cash back", "[[$13M]]", "[[$20M]]"],
      ["Years", "[[2]]", "[[7]]"],
      ["Equity multiple", "1.30x", "2.00x"],
      ["IRR", "14.0%", "10.4%"]
    ]}
  }
]);
