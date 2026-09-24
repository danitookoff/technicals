Deck.add([
  {
    id: "hotel-basics-001",
    track: "hotel",
    module: "hotel-basics",
    topic: "Hotels as operating businesses",
    level: 1,
    type: "primer",
    q: "Primer: why a hotel is an operating business",
    a: "A hotel re-leases every room every night, so revenue reprices daily and can fall fast in a downturn. It also runs restaurants and events with a large staff. Usually three parties are involved: the owner provides the capital and keeps the profit, a brand supplies the name and reservations, and an operator runs the hotel day to day. The owner bears the operating risk, so hotel cash flow is more volatile than an office building's.",
    why: "Keys: the hotel's rooms. Occupancy: the share of available rooms sold. ADR: average daily rate, rooms revenue per room sold. RevPAR: rooms revenue per available room, which equals occupancy × ADR. HMA: the hotel management agreement with the operator. PIP: property improvement plan, the renovation a brand requires.",
    visual: { kind: "table", headers: ["Party", "Provides", "Earns"], rows: [
      ["Owner", "Capital", "What's left after all costs and fees"],
      ["Brand", "Name, loyalty program, reservations", "Franchise fees"],
      ["Operator", "Staff and day-to-day management", "Base and incentive management fees"]
    ], caption: "When the brand also manages the hotel, brand and operator are the same company." }
  },
  {
    id: "hotel-basics-002",
    track: "hotel",
    module: "hotel-basics",
    topic: "Why hotel cap rates are wider",
    level: 1,
    type: "qa",
    classic: true,
    q: "Why do hotels trade at higher cap rates than apartments or offices?",
    a: "Because hotel income is riskier. Rooms reprice every night, so revenue falls fast in a downturn, and high fixed costs (staff, brand fees, upkeep) magnify the swing in profit. Hotels also need heavy, recurring capital for renovations and brand-mandated upgrades. Investors demand a higher yield for that volatility and capital intensity.",
    why: "An office tenant signs a ten-year lease; a hotel guest signs for one night. With no lease cushion, hotel NOI tracks the economy, travel demand and new supply almost in real time. Operating leverage amplifies it: when revenue drops 10%, costs don't drop 10%, so NOI falls further. Add management and franchise fees that are paid before the owner, plus the FF&E reserve and PIPs, and the owner's cash flow is thinner and less predictable. A higher cap rate prices that.",
    trap: "Hotel cap rates are usually quoted on NOI after an FF&E reserve. If one side of a comparison deducts the reserve and the other doesn't, the cap rates aren't comparable."
  }
]);
