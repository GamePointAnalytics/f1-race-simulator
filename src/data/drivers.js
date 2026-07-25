export const TEAMS = {
    // Hand-estimated from general season narrative (McLaren dominant, Mercedes/Williams
    // resurgent, Red Bull carried by Verstappen individually, Alpine/Sauber at the back).
    // Not fit against final championship data — treat as approximate.
    "2025": {
        MCLAREN: { name: "McLaren", color: "#FF8000", performance: 1.000 },
        MERCEDES: { name: "Mercedes", color: "#6CD3BF", performance: 0.965 },
        FERRARI: { name: "Ferrari", color: "#F91536", performance: 0.955 },
        RED_BULL: { name: "Red Bull Racing", color: "#3671C6", performance: 0.950 },
        WILLIAMS: { name: "Williams", color: "#64C4FF", performance: 0.930 },
        RB: { name: "Racing Bulls", color: "#6692FF", performance: 0.910 },
        HAAS: { name: "Haas", color: "#B6BABD", performance: 0.905 },
        ASTON_MARTIN: { name: "Aston Martin", color: "#229971", performance: 0.900 },
        ALPINE: { name: "Alpine", color: "#FF87BC", performance: 0.880 },
        SAUBER: { name: "Sauber", color: "#52E252", performance: 0.870 }
    },
    "2024": {
        RED_BULL: { name: "Red Bull Racing", color: "#3671C6", performance: 0.985 },
        MCLAREN: { name: "McLaren", color: "#FF8000", performance: 0.995 },
        FERRARI: { name: "Ferrari", color: "#F91536", performance: 0.990 },
        MERCEDES: { name: "Mercedes", color: "#6CD3BF", performance: 0.975 },
        ASTON_MARTIN: { name: "Aston Martin", color: "#229971", performance: 0.940 },
        HAAS: { name: "Haas", color: "#B6BABD", performance: 0.920 },
        RB: { name: "RB", color: "#6692FF", performance: 0.915 },
        WILLIAMS: { name: "Williams", color: "#64C4FF", performance: 0.910 },
        ALPINE: { name: "Alpine", color: "#FF87BC", performance: 0.890 },
        SAUBER: { name: "Sauber", color: "#52E252", performance: 0.875 }
    },
    "2023": {
        RED_BULL: { name: "Red Bull Racing", color: "#3671C6", performance: 1.000 }, // Dominant
        MCLAREN: { name: "McLaren", color: "#FF8000", performance: 0.950 },
        FERRARI: { name: "Ferrari", color: "#F91536", performance: 0.965 },
        MERCEDES: { name: "Mercedes", color: "#6CD3BF", performance: 0.960 },
        ASTON_MARTIN: { name: "Aston Martin", color: "#229971", performance: 0.955 },
        HAAS: { name: "Haas", color: "#B6BABD", performance: 0.890 },
        RB: { name: "AlphaTauri", color: "#2B4562", performance: 0.900 },
        WILLIAMS: { name: "Williams", color: "#64C4FF", performance: 0.910 },
        ALPINE: { name: "Alpine", color: "#FF87BC", performance: 0.920 },
        SAUBER: { name: "Alfa Romeo", color: "#900000", performance: 0.880 }
    },
    // New ground-effect regulations reset the order: Red Bull overcame early
    // reliability trouble to dominate, Ferrari led early but faded, Mercedes
    // struggled with porpoising all year. Hand-estimated, not fit to standings.
    "2022": {
        RED_BULL: { name: "Red Bull Racing", color: "#3671C6", performance: 1.000 },
        FERRARI: { name: "Ferrari", color: "#F91536", performance: 0.965 },
        MERCEDES: { name: "Mercedes", color: "#6CD3BF", performance: 0.960 },
        ALPINE: { name: "Alpine", color: "#0090FF", performance: 0.920 },
        MCLAREN: { name: "McLaren", color: "#FF8700", performance: 0.915 },
        ASTON_MARTIN: { name: "Aston Martin", color: "#229971", performance: 0.895 },
        SAUBER: { name: "Alfa Romeo", color: "#900000", performance: 0.893 },
        HAAS: { name: "Haas", color: "#B6BABD", performance: 0.880 },
        RB: { name: "AlphaTauri", color: "#2B4562", performance: 0.875 },
        WILLIAMS: { name: "Williams", color: "#005AFF", performance: 0.860 }
    },
    "2021": {
        RED_BULL: { name: "Red Bull Racing", color: "#0600EF", performance: 0.995 },
        MERCEDES: { name: "Mercedes", color: "#00D2BE", performance: 0.995 }, // Even fight
        MCLAREN: { name: "McLaren", color: "#FF8700", performance: 0.950 },
        FERRARI: { name: "Ferrari", color: "#DC0000", performance: 0.940 },
        ASTON_MARTIN: { name: "Aston Martin", color: "#006F62", performance: 0.910 },
        HAAS: { name: "Haas", color: "#FFFFFF", performance: 0.850 }, // Terrible 2021
        RB: { name: "AlphaTauri", color: "#2B4562", performance: 0.930 },
        WILLIAMS: { name: "Williams", color: "#005AFF", performance: 0.880 },
        ALPINE: { name: "Alpine", color: "#0090FF", performance: 0.920 },
        SAUBER: { name: "Alfa Romeo", color: "#900000", performance: 0.890 }
    }
};

// Master driver identity list — skill ratings are stable per person across seasons.
// `team` here is only a fallback default (2025 grid); actual per-season team
// assignment comes from SEASON_ROSTERS below, since drivers change teams year to year.
const DRIVERS_DB = {
    ver: { id: "ver", name: "Max Verstappen", team: "RED_BULL", speed: 99, tyreMgmt: 98, consistency: 98, affinities: { 'austria': 1.015, 'zandvoort': 1.02, 'spa': 1.01 } },
    nor: { id: "nor", name: "Lando Norris", team: "MCLAREN", speed: 97, tyreMgmt: 94, consistency: 95, affinities: { 'silverstone': 1.01, 'austin': 1.01 } },
    lec: { id: "lec", name: "Charles Leclerc", team: "FERRARI", speed: 98, tyreMgmt: 92, consistency: 93, affinities: { 'monaco': 1.02, 'baku': 1.015, 'monza': 1.01 } },
    ham: { id: "ham", name: "Lewis Hamilton", team: "FERRARI", speed: 96, tyreMgmt: 99, consistency: 96, affinities: { 'silverstone': 1.025, 'interlagos': 1.015, 'canada': 1.01 } },
    pia: { id: "pia", name: "Oscar Piastri", team: "MCLAREN", speed: 95, tyreMgmt: 93, consistency: 94, affinities: { 'oz': 1.01, 'baku': 1.01 } },
    rus: { id: "rus", name: "George Russell", team: "MERCEDES", speed: 96, tyreMgmt: 90, consistency: 92, affinities: { 'silverstone': 1.01, 'spa': 1.005 } },
    sai: { id: "sai", name: "Carlos Sainz", team: "WILLIAMS", speed: 94, tyreMgmt: 95, consistency: 94, affinities: { 'singapore': 1.015, 'barcelona': 1.01 } },
    alo: { id: "alo", name: "Fernando Alonso", team: "ASTON_MARTIN", speed: 93, tyreMgmt: 98, consistency: 97, affinities: { 'barcelona': 1.01, 'monaco': 1.01 } },
    gas: { id: "gas", name: "Pierre Gasly", team: "ALPINE", speed: 89, tyreMgmt: 88, consistency: 89, affinities: { 'monza': 1.01, 'spa': 1.005 } },
    tsu: { id: "tsu", name: "Yuki Tsunoda", team: "RB", speed: 88, tyreMgmt: 85, consistency: 84, affinities: { 'suzuka': 1.015 } },
    alb: { id: "alb", name: "Alex Albon", team: "WILLIAMS", speed: 90, tyreMgmt: 91, consistency: 89, affinities: { 'spa': 1.01 } },
    hul: { id: "hul", name: "Nico Hulkenberg", team: "SAUBER", speed: 88, tyreMgmt: 92, consistency: 90, affinities: { 'silverstone': 1.005 } },
    oco: { id: "oco", name: "Esteban Ocon", team: "HAAS", speed: 88, tyreMgmt: 89, consistency: 88, affinities: { 'hungary': 1.01, 'monaco': 1.01 } },
    str: { id: "str", name: "Lance Stroll", team: "ASTON_MARTIN", speed: 86, tyreMgmt: 84, consistency: 82, affinities: { 'baku': 1.01, 'canada': 1.01 } },
    law: { id: "law", name: "Liam Lawson", team: "RB", speed: 87, tyreMgmt: 86, consistency: 85, affinities: { 'singapore': 1.01 } },
    bea: { id: "bea", name: "Oliver Bearman", team: "HAAS", speed: 86, tyreMgmt: 85, consistency: 83, affinities: { 'jeddah': 1.01, 'baku': 1.01 } },
    ant: { id: "ant", name: "Kimi Antonelli", team: "MERCEDES", speed: 88, tyreMgmt: 82, consistency: 80, affinities: { 'monza': 1.01 } },
    doo: { id: "doo", name: "Jack Doohan", team: "ALPINE", speed: 85, tyreMgmt: 83, consistency: 82, affinities: { 'oz': 1.01 } },
    bor: { id: "bor", name: "Gabriel Bortoleto", team: "SAUBER", speed: 85, tyreMgmt: 84, consistency: 81, affinities: { 'interlagos': 1.015 } },
    per: { id: "per", name: "Sergio Perez", team: "RED_BULL", speed: 92, tyreMgmt: 96, consistency: 90, affinities: { 'baku': 1.025, 'jeddah': 1.015, 'monaco': 1.01 } },
    had: { id: "had", name: "Isack Hadjar", team: "RB", speed: 86, tyreMgmt: 84, consistency: 82, affinities: {} },

    // Historical-only drivers (not on the 2025 grid) needed for older season rosters
    ric: { id: "ric", name: "Daniel Ricciardo", team: "RB", speed: 90, tyreMgmt: 90, consistency: 87, affinities: { 'monza': 1.015, 'monaco': 1.01 } },
    mag: { id: "mag", name: "Kevin Magnussen", team: "HAAS", speed: 87, tyreMgmt: 84, consistency: 83, affinities: {} },
    sar: { id: "sar", name: "Logan Sargeant", team: "WILLIAMS", speed: 82, tyreMgmt: 80, consistency: 78, affinities: {} },
    bot: { id: "bot", name: "Valtteri Bottas", team: "SAUBER", speed: 91, tyreMgmt: 93, consistency: 92, affinities: { 'austria': 1.01 } },
    zho: { id: "zho", name: "Guanyu Zhou", team: "SAUBER", speed: 85, tyreMgmt: 86, consistency: 84, affinities: {} },
    vet: { id: "vet", name: "Sebastian Vettel", team: "ASTON_MARTIN", speed: 90, tyreMgmt: 93, consistency: 90, affinities: { 'canada': 1.01 } },
    lat: { id: "lat", name: "Nicholas Latifi", team: "WILLIAMS", speed: 80, tyreMgmt: 80, consistency: 78, affinities: {} },
    rai: { id: "rai", name: "Kimi Raikkonen", team: "SAUBER", speed: 88, tyreMgmt: 90, consistency: 90, affinities: { 'spa': 1.01 } },
    gio: { id: "gio", name: "Antonio Giovinazzi", team: "SAUBER", speed: 85, tyreMgmt: 85, consistency: 83, affinities: {} },
    mic: { id: "mic", name: "Mick Schumacher", team: "HAAS", speed: 84, tyreMgmt: 83, consistency: 80, affinities: {} },
    maz: { id: "maz", name: "Nikita Mazepin", team: "HAAS", speed: 78, tyreMgmt: 76, consistency: 74, affinities: {} }
};

// Which driver drove for which team each season. This is what actually varies
// year to year — team pace (TEAMS above) varying alone isn't enough, since
// drivers themselves move teams (e.g. Hamilton: Mercedes in 2024 -> Ferrari in 2025).
const SEASON_ROSTERS = {
    "2025": [
        // Red Bull dropped Perez after 2024; Lawson took the seat for round 1-2, then swapped
        // back to Racing Bulls with Tsunoda promoted for the rest of the season. Modeled as
        // season-long Verstappen/Tsunoda + Lawson/Hadjar rather than tracking the mid-season swap.
        ['ver', 'RED_BULL'], ['tsu', 'RED_BULL'],
        ['nor', 'MCLAREN'], ['pia', 'MCLAREN'],
        ['lec', 'FERRARI'], ['ham', 'FERRARI'],
        ['rus', 'MERCEDES'], ['ant', 'MERCEDES'],
        ['alo', 'ASTON_MARTIN'], ['str', 'ASTON_MARTIN'],
        ['oco', 'HAAS'], ['bea', 'HAAS'],
        ['law', 'RB'], ['had', 'RB'],
        ['sai', 'WILLIAMS'], ['alb', 'WILLIAMS'],
        ['gas', 'ALPINE'], ['doo', 'ALPINE'],
        ['hul', 'SAUBER'], ['bor', 'SAUBER']
    ],
    "2024": [
        ['ver', 'RED_BULL'], ['per', 'RED_BULL'],
        ['nor', 'MCLAREN'], ['pia', 'MCLAREN'],
        ['lec', 'FERRARI'], ['sai', 'FERRARI'],
        ['ham', 'MERCEDES'], ['rus', 'MERCEDES'],
        ['alo', 'ASTON_MARTIN'], ['str', 'ASTON_MARTIN'],
        ['hul', 'HAAS'], ['mag', 'HAAS'],
        ['tsu', 'RB'], ['ric', 'RB'],
        ['alb', 'WILLIAMS'], ['sar', 'WILLIAMS'],
        ['gas', 'ALPINE'], ['oco', 'ALPINE'],
        ['bot', 'SAUBER'], ['zho', 'SAUBER']
    ],
    "2023": [
        ['ver', 'RED_BULL'], ['per', 'RED_BULL'],
        ['ham', 'MERCEDES'], ['rus', 'MERCEDES'],
        ['lec', 'FERRARI'], ['sai', 'FERRARI'],
        ['nor', 'MCLAREN'], ['pia', 'MCLAREN'],
        ['alo', 'ASTON_MARTIN'], ['str', 'ASTON_MARTIN'],
        ['gas', 'ALPINE'], ['oco', 'ALPINE'],
        ['alb', 'WILLIAMS'], ['sar', 'WILLIAMS'],
        ['tsu', 'RB'], ['ric', 'RB'],
        ['bot', 'SAUBER'], ['zho', 'SAUBER'],
        ['mag', 'HAAS'], ['hul', 'HAAS']
    ],
    "2022": [
        ['ver', 'RED_BULL'], ['per', 'RED_BULL'],
        ['lec', 'FERRARI'], ['sai', 'FERRARI'],
        ['ham', 'MERCEDES'], ['rus', 'MERCEDES'],
        ['alo', 'ALPINE'], ['oco', 'ALPINE'],
        ['nor', 'MCLAREN'], ['ric', 'MCLAREN'],
        ['vet', 'ASTON_MARTIN'], ['str', 'ASTON_MARTIN'],
        ['bot', 'SAUBER'], ['zho', 'SAUBER'],
        ['mag', 'HAAS'], ['mic', 'HAAS'],
        ['gas', 'RB'], ['tsu', 'RB'],
        ['alb', 'WILLIAMS'], ['lat', 'WILLIAMS']
    ],
    "2021": [
        ['ver', 'RED_BULL'], ['per', 'RED_BULL'],
        ['ham', 'MERCEDES'], ['bot', 'MERCEDES'],
        ['nor', 'MCLAREN'], ['ric', 'MCLAREN'],
        ['lec', 'FERRARI'], ['sai', 'FERRARI'],
        ['gas', 'RB'], ['tsu', 'RB'],
        ['alo', 'ALPINE'], ['oco', 'ALPINE'],
        ['vet', 'ASTON_MARTIN'], ['str', 'ASTON_MARTIN'],
        ['rus', 'WILLIAMS'], ['lat', 'WILLIAMS'],
        ['rai', 'SAUBER'], ['gio', 'SAUBER'],
        ['mic', 'HAAS'], ['maz', 'HAAS']
    ]
};

/**
 * Returns the driver grid for a given season: correct driver-to-team
 * assignment for that year, with each driver's stable skill ratings.
 */
export function getDriversForSeason(season) {
    const roster = SEASON_ROSTERS[season] || SEASON_ROSTERS["2025"];
    return roster.map(([id, team]) => ({ ...DRIVERS_DB[id], team }));
}

// Default export for callers that aren't yet season-aware.
export const DRIVERS = getDriversForSeason("2025");
