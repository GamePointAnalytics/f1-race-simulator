export const TEAMS = {
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

export const DRIVERS = [
    { id: "ver", name: "Max Verstappen", team: "RED_BULL", speed: 99, tyreMgmt: 98, consistency: 98, affinities: { 'austria': 1.015, 'zandvoort': 1.02, 'spa': 1.01 } },
    { id: "nor", name: "Lando Norris", team: "MCLAREN", speed: 97, tyreMgmt: 94, consistency: 95, affinities: { 'silverstone': 1.01, 'austin': 1.01 } },
    { id: "lec", name: "Charles Leclerc", team: "FERRARI", speed: 98, tyreMgmt: 92, consistency: 93, affinities: { 'monaco': 1.02, 'baku': 1.015, 'monza': 1.01 } },
    { id: "ham", name: "Lewis Hamilton", team: "FERRARI", speed: 96, tyreMgmt: 99, consistency: 96, affinities: { 'silverstone': 1.025, 'interlagos': 1.015, 'canada': 1.01 } },
    { id: "pia", name: "Oscar Piastri", team: "MCLAREN", speed: 95, tyreMgmt: 93, consistency: 94, affinities: { 'oz': 1.01, 'baku': 1.01 } },
    { id: "rus", name: "George Russell", team: "MERCEDES", speed: 96, tyreMgmt: 90, consistency: 92, affinities: { 'silverstone': 1.01, 'spa': 1.005 } },
    { id: "sai", name: "Carlos Sainz", team: "WILLIAMS", speed: 94, tyreMgmt: 95, consistency: 94, affinities: { 'singapore': 1.015, 'barcelona': 1.01 } },
    { id: "alo", name: "Fernando Alonso", team: "ASTON_MARTIN", speed: 93, tyreMgmt: 98, consistency: 97, affinities: { 'barcelona': 1.01, 'monaco': 1.01 } },
    { id: "gas", name: "Pierre Gasly", team: "ALPINE", speed: 89, tyreMgmt: 88, consistency: 89, affinities: { 'monza': 1.01, 'spa': 1.005 } },
    { id: "tsu", name: "Yuki Tsunoda", team: "RB", speed: 88, tyreMgmt: 85, consistency: 84, affinities: { 'suzuka': 1.015 } },
    { id: "alb", name: "Alex Albon", team: "WILLIAMS", speed: 90, tyreMgmt: 91, consistency: 89, affinities: { 'spa': 1.01 } },
    { id: "hul", name: "Nico Hulkenberg", team: "SAUBER", speed: 88, tyreMgmt: 92, consistency: 90, affinities: { 'silverstone': 1.005 } },
    { id: "oco", name: "Esteban Ocon", team: "HAAS", speed: 88, tyreMgmt: 89, consistency: 88, affinities: { 'hungary': 1.01, 'monaco': 1.01 } },
    { id: "str", name: "Lance Stroll", team: "ASTON_MARTIN", speed: 86, tyreMgmt: 84, consistency: 82, affinities: { 'baku': 1.01, 'canada': 1.01 } },
    { id: "law", name: "Liam Lawson", team: "RB", speed: 87, tyreMgmt: 86, consistency: 85, affinities: { 'singapore': 1.01 } },
    { id: "bea", name: "Oliver Bearman", team: "HAAS", speed: 86, tyreMgmt: 85, consistency: 83, affinities: { 'jeddah': 1.01, 'baku': 1.01 } },
    { id: "ant", name: "Kimi Antonelli", team: "MERCEDES", speed: 88, tyreMgmt: 82, consistency: 80, affinities: { 'monza': 1.01 } },
    { id: "doo", name: "Jack Doohan", team: "ALPINE", speed: 85, tyreMgmt: 83, consistency: 82, affinities: { 'oz': 1.01 } },
    { id: "bor", name: "Gabriel Bortoleto", team: "SAUBER", speed: 85, tyreMgmt: 84, consistency: 81, affinities: { 'interlagos': 1.015 } },
    { id: "per", name: "Sergio Perez", team: "RED_BULL", speed: 92, tyreMgmt: 96, consistency: 90, affinities: { 'baku': 1.025, 'jeddah': 1.015, 'monaco': 1.01 } }
];
