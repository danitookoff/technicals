Deck.add([
  {
    id: "re-deals-001",
    track: "re",
    module: "re-deals",
    topic: "Two-tier waterfall",
    level: 2,
    type: "walk",
    classic: true,
    q: "Walk me through a two-tier waterfall with an 8% pref and a 20% promote.",
    a: "First, all cash goes to the partners pro rata until they've received their capital back plus an 8% preferred return. Everything above that hurdle is split 80% to the partners pro rata and 20% to the GP as promote. So the GP earns more than its capital share only after the LP has cleared the hurdle.",
    why: "The pref protects the LP: the sponsor earns a bonus only once investors get a baseline return. The promote ties the GP to performance, because a bigger outcome raises its share of the profit. Since the GP usually invests alongside the LP (say 10%), it's paid twice above the hurdle: its pro rata share of the 80% as an investor, plus the 20% promote as sponsor.",
    example: "[[$10M]] of equity, LP [[90%]] and GP [[10%]], one sale after [[3]] years for [[$14M]]. Hurdle: $10M × 1.08³ = $12.60M, paid pro rata. Excess: $1.40M. Promote: 20% × $1.40M = $0.28M to the GP; the other $1.12M splits 90/10. GP total $1.65M; LP total $12.35M.",
    trap: "Say whether the pref compounds and whether hurdles are IRR- or multiple-based. The next question is usually a catch-up: the GP takes most of the cash right after the pref until it has 20% of all profits.",
    visual: { kind: "table", headers: ["Tier", "Total", "LP", "GP"], rows: [
      ["Capital + 8% pref", "$12.60M", "$11.34M", "$1.26M"],
      ["20% promote", "$0.28M", "", "$0.28M"],
      ["80% split pro rata", "$1.12M", "$1.01M", "$0.11M"],
      ["Total", "$14.00M", "$12.35M", "$1.65M"]
    ], caption: "Sums may differ by $0.01M from rounding." }
  },
  {
    id: "re-deals-002",
    track: "re",
    module: "re-deals",
    topic: "Simple vs compounding pref",
    level: 2,
    type: "qa",
    q: "What's the difference between a simple and a compounding preferred return?",
    a: "A simple pref accrues on the original capital only: 8% of $10M is $800K every year. A compounding pref accrues on capital plus any unpaid pref, so the amount owed grows faster when distributions fall short. Either way, a cumulative pref carries unpaid amounts forward until they're paid.",
    why: "The difference only matters when the pref isn't paid currently. If a deal distributes 8% every year, simple and compounding give the same result. If cash is held back, as in a development or heavy renovation, a compounding pref behaves like an IRR hurdle and raises the bar the GP must clear before earning promote. That's why LPs in back-ended deals push for compounding and GPs prefer simple.",
    example: "[[$10M]] at [[8%]], nothing paid for [[3]] years. Simple: $800K × 3 = $2.40M owed. Compounding: $800K, then $864K, then $933K, for $2.60M owed. The extra $0.20M raises the hurdle before any promote is paid.",
    trap: "Cumulative isn't compounding. Cumulative means unpaid pref carries forward; compounding means the unpaid amount itself earns the pref rate. A pref can be cumulative without compounding.",
    visual: { kind: "table", headers: ["Year", "Simple pref", "Compounding pref"], rows: [
      ["1", "$800K", "$800K"],
      ["2", "$800K", "$864K"],
      ["3", "$800K", "$933K"],
      ["Total owed", "$2.40M", "$2.60M"]
    ]}
  }
]);
