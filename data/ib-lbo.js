Deck.add([
  {
    id: "ib-lbo-001",
    track: "ib",
    module: "ib-lbo",
    topic: "What an LBO is",
    level: 1,
    type: "primer",
    q: "Primer: what an LBO is",
    a: "In a leveraged buyout, a private equity firm buys a company with a lot of borrowed money, often half or more of the price, plus a smaller equity check. The company's own cash flow pays the interest and repays the debt. After several years the sponsor sells. Returns come from growing EBITDA, selling at a higher multiple and paying down debt, all magnified by the small equity base.",
    why: "Sponsor: the private equity firm. Sources and uses: where the money comes from (debt, equity) and where it goes (purchase price, refinancing, fees). MOIC: multiple of invested capital, cash out ÷ cash in. IRR: the annualized return. Senior debt: cheapest, secured and repaid first; subordinated debt and high-yield bonds cost more and rank behind it.",
    visual: { kind: "stack", unit: "$M", dp: 0, columns: [
      { title: "Uses", items: [
        { label: "Purchase enterprise value", value: 1000 },
        { label: "Fees", value: 20 }
      ]},
      { title: "Sources", items: [
        { label: "Sponsor equity", value: 420, highlight: true },
        { label: "Senior notes", value: 200 },
        { label: "Term loan", value: 400 }
      ]}
    ], caption: "Buying $100M of EBITDA at 10.0x with 6.0x of debt" }
  },
  {
    id: "ib-lbo-002",
    track: "ib",
    module: "ib-lbo",
    topic: "Returns drivers",
    level: 2,
    type: "qa",
    classic: true,
    q: "What drives returns in an LBO?",
    a: "Three things: EBITDA growth, multiple expansion (selling at a higher multiple than you paid), and debt paydown, which shifts value from lenders to the equity. Leverage magnifies all three because the equity check is small relative to enterprise value. Sponsors prefer to underwrite growth and paydown, not multiple expansion.",
    why: "Equity at exit = exit EV − remaining net debt. Exit EV rises with EBITDA and the multiple; net debt falls as free cash flow repays it. Every dollar of EV gained or debt repaid belongs entirely to the equity, so on a $400M check, $250M of paydown alone adds about 0.6x to the multiple. Multiple expansion depends on markets the sponsor can't control, so leaning on it reads as speculation rather than skill.",
    example: "Buy [[$100M]] of EBITDA at [[10.0x]] with [[$600M]] of debt: equity $400M. Exit after [[5]] years with EBITDA of [[$130M]] at [[10.0x]] ($1,300M) and debt paid down to [[$350M]]: equity $950M. MOIC 2.4x, IRR about 19%.",
    trap: "Fees raise the equity check and lower returns; paper LBOs often ignore them. Know the rule of thumb: 2x over five years is about a 15% IRR, 3x about 25%.",
    visual: { kind: "waterfall", unit: "$M", dp: 0, start: { label: "Equity at entry", value: 400 }, steps: [
      { label: "EBITDA growth", delta: 300 },
      { label: "Multiple expansion", delta: 0 },
      { label: "Debt paydown", delta: 250 }
    ], end: { label: "Equity at exit", value: 950 } }
  }
]);
