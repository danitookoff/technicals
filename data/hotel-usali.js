Deck.add([
  {
    id: "hotel-usali-001",
    track: "hotel",
    module: "hotel-usali",
    topic: "How the hotel P&L is laid out",
    level: 1,
    type: "primer",
    q: "Primer: how a hotel P&L is laid out (USALI)",
    a: "Hotels report on the Uniform System of Accounts for the Lodging Industry, so every P&L reads the same way. Each operated department (rooms, food and beverage, other) shows its revenue, direct costs and departmental profit. Next come undistributed expenses that serve the whole hotel, leaving gross operating profit (GOP). Below GOP: management fees, then fixed charges like property taxes and insurance, then the FF&E reserve.",
    why: "Departmental profit: a department's revenue minus its own labor and costs. Undistributed expenses: administrative and general, sales and marketing, IT, maintenance and utilities. GOP: the profit the operator controls, a common base for incentive fees. EBITDA: after management fees and fixed charges. FF&E reserve: cash set aside to replace furniture, fixtures and equipment.",
    visual: { kind: "flow", steps: [
      { label: "Departmental revenue", note: "Rooms, food and beverage, other" },
      { label: "Departmental profit", note: "Less each department's direct costs" },
      { label: "Gross operating profit (GOP)", note: "Less undistributed expenses" },
      { label: "EBITDA", note: "Less management fees and fixed charges" },
      { label: "EBITDA less FF&E reserve", note: "Roughly the NOI a buyer capitalizes" }
    ]}
  },
  {
    id: "hotel-usali-002",
    track: "hotel",
    module: "hotel-usali",
    topic: "Flow-through",
    level: 2,
    type: "qa",
    classic: true,
    q: "What is flow-through, and what's a good number?",
    a: "Flow-through is the change in GOP divided by the change in revenue: how much of each extra revenue dollar reaches profit. Rate-led growth can flow through well above 50%; occupancy-led growth usually less. On the way down the mirror metric is flex: how much of the lost revenue the operator saved in costs.",
    why: "Revenue growth only helps the owner if profit follows. Flow-through shows whether the operator is controlling costs as revenue grows, and it's a standard line in the monthly P&L review. Because costs follow occupied rooms, the source of growth matters: from rate, costs barely move and flow-through should be high; from occupancy or F&B, extra labor and cost of sales absorb more. Judge it against where the growth came from, not a single benchmark.",
    formula: "Flow-through = change in GOP ÷ change in total revenue\nFlex = expenses cut ÷ revenue lost",
    example: "Revenue grows from [[$40.0M]] to [[$42.0M]]; GOP from [[$12.0M]] to [[$13.1M]]. Flow-through = $1.1M ÷ $2.0M = 55%. GOP margin rises from 30.0% to 31.2%.",
    trap: "Flow-through isn't margin. A hotel with a 30% GOP margin should flow through well above 30% of new revenue, because fixed costs don't grow with it; flow-through at or below the margin is a red flag."
  }
]);
