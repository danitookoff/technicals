Deck.add([
  {
    id: "ib-dcf-001",
    track: "ib",
    module: "ib-dcf",
    topic: "DCF steps",
    level: 1,
    type: "walk",
    classic: true,
    q: "Walk me through a DCF.",
    a: "Project the company's unlevered free cash flow for five to ten years. Estimate a terminal value for everything after, using a perpetual growth rate or an exit multiple. Discount the cash flows and terminal value back at WACC and add them up: that's enterprise value. Subtract net debt and other claims to get equity value, then divide by diluted shares for a share price.",
    why: "A company is worth the cash it will generate, adjusted for time and risk. Unlevered free cash flow is the cash available to all capital providers, so it's discounted at WACC, the blended cost of that capital, which produces enterprise value. The terminal value exists because you can't forecast forever, and it's usually most of the value, so its assumptions deserve the most scrutiny.",
    trap: "Pair unlevered cash flow with WACC and levered cash flow with the cost of equity. Mixing them is the classic slip. Expect the follow-up: which assumptions matter most?",
    visual: { kind: "flow", steps: [
      { label: "Project unlevered FCF", note: "EBIT × (1 − t) + D&A − capex − change in NWC" },
      { label: "Terminal value", note: "Gordon growth or exit multiple" },
      { label: "Discount at WACC", note: "Sum = enterprise value" },
      { label: "Bridge to equity value", note: "Less net debt and other claims" },
      { label: "Share price", note: "÷ diluted shares" }
    ]}
  },
  {
    id: "ib-dcf-002",
    track: "ib",
    module: "ib-dcf",
    topic: "Terminal value methods",
    level: 2,
    type: "qa",
    classic: true,
    q: "Gordon growth or exit multiple: which terminal value method is better?",
    a: "Neither is strictly better, so use both and cross-check. Gordon growth is grounded in fundamentals but very sensitive to the growth rate and WACC. The exit multiple is market-based and easy to explain, but it imports today's market pricing into the terminal year. Check the multiple each growth rate implies, and vice versa.",
    why: "Gordon growth assumes cash flow grows at a constant rate forever, so the rate must stay at or below long-run economic growth, and small changes swing value because the denominator is WACC − g. The exit multiple asks what a buyer would pay at the end of the forecast, which is intuitive but partly circular: relative value inside an intrinsic valuation. Cross-checking catches mistakes: a 3% growth rate that implies 20x EBITDA for a mature company is a red flag.",
    formula: "Gordon growth TV = final-year FCF × (1 + g) ÷ (WACC − g)\nImplied exit multiple = TV ÷ final-year EBITDA",
    example: "Final-year FCF [[$100M]], [[3%]] growth, [[9%]] WACC: TV = $103M ÷ 6% = $1,717M. With final-year EBITDA of [[$160M]], the implied exit multiple is 10.7x. If peers trade around 8x, the growth rate may be too high.",
    trap: "Under the mid-year convention, many banks discount a Gordon growth terminal value from the same mid-year point as the final cash flow, but an exit-multiple value from year-end. Know which your model does."
  }
]);
