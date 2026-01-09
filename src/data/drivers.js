export const TEAMS = {
    RED_BULL: { name: "Red Bull Racing", color: "#3671C6", performance: 0.98 },
    MCLAREN: { name: "McLaren", color: "#FF8000", performance: 0.99 },
    FERRARI: { name: "Ferrari", color: "#F91536", performance: 0.99 },
    MERCEDES: { name: "Mercedes", color: "#6CD3BF", performance: 0.97 },
    ASTON_MARTIN: { name: "Aston Martin", color: "#229971", performance: 0.94 },
    RB: { name: "RB", color: "#6692FF", performance: 0.92 },
    HAAS: { name: "Haas", color: "#B6BABD", performance: 0.91 },
    ALPINE: { name: "Alpine", color: "#FF87BC", performance: 0.90 }, // Keeping pink mainly
    WILLIAMS: { name: "Williams", color: "#64C4FF", performance: 0.90 },
    SAUBER: { name: "Sauber", color: "#52E252", performance: 0.88 }
};

export const DRIVERS = [
    { id: "ver", name: "Max Verstappen", team: "RED_BULL", speed: 99, tyreMgmt: 98, consistency: 98 },
    { id: "nor", name: "Lando Norris", team: "MCLAREN", speed: 97, tyreMgmt: 94, consistency: 95 },
    { id: "lec", name: "Charles Leclerc", team: "FERRARI", speed: 98, tyreMgmt: 92, consistency: 93 },
    { id: "ham", name: "Lewis Hamilton", team: "FERRARI", speed: 96, tyreMgmt: 99, consistency: 96 },
    { id: "pia", name: "Oscar Piastri", team: "MCLAREN", speed: 95, tyreMgmt: 93, consistency: 94 },
    { id: "rus", name: "George Russell", team: "MERCEDES", speed: 96, tyreMgmt: 90, consistency: 92 },
    { id: "sai", name: "Carlos Sainz", team: "WILLIAMS", speed: 94, tyreMgmt: 95, consistency: 94 }, // 2025 move
    { id: "alo", name: "Fernando Alonso", team: "ASTON_MARTIN", speed: 93, tyreMgmt: 98, consistency: 97 },
    { id: "gas", name: "Pierre Gasly", team: "ALPINE", speed: 89, tyreMgmt: 88, consistency: 89 },
    { id: "tsu", name: "Yuki Tsunoda", team: "RB", speed: 88, tyreMgmt: 85, consistency: 84 },
    { id: "alb", name: "Alex Albon", team: "WILLIAMS", speed: 90, tyreMgmt: 91, consistency: 89 },
    { id: "hul", name: "Nico Hulkenberg", team: "SAUBER", speed: 88, tyreMgmt: 92, consistency: 90 },
    { id: "oco", name: "Esteban Ocon", team: "HAAS", speed: 88, tyreMgmt: 89, consistency: 88 },
    { id: "str", name: "Lance Stroll", team: "ASTON_MARTIN", speed: 86, tyreMgmt: 84, consistency: 82 },
    { id: "law", name: "Liam Lawson", team: "RB", speed: 87, tyreMgmt: 86, consistency: 85 },
    { id: "bea", name: "Oliver Bearman", team: "HAAS", speed: 86, tyreMgmt: 85, consistency: 83 },
    { id: "ant", name: "Kimi Antonelli", team: "MERCEDES", speed: 88, tyreMgmt: 82, consistency: 80 }, // Rookie
    { id: "doo", name: "Jack Doohan", team: "ALPINE", speed: 85, tyreMgmt: 83, consistency: 82 },
    { id: "bor", name: "Gabriel Bortoleto", team: "SAUBER", speed: 85, tyreMgmt: 84, consistency: 81 },
    { id: "had", name: "Isack Hadjar", team: "RED_BULL", speed: 84, tyreMgmt: 82, consistency: 80 } // Speculative 2nd seat
];
