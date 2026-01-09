export const TYRE_COMPOUNDS = {
    SOFT: { name: "Soft", color: "#FF3333", speedParams: { base: -0.6, deg: 0.08 }, life: 35 }, // Fast, Moderate Deg
    MEDIUM: { name: "Medium", color: "#FFFF33", speedParams: { base: 0.2, deg: 0.05 }, life: 40 }, // Balanced
    HARD: { name: "Hard", color: "#FFFFFF", speedParams: { base: 1.5, deg: 0.02 }, life: 65 }, // Durable
    INTER: { name: "Inter", color: "#33CC33", speedParams: { base: 6.0, deg: 0.05 }, life: 30 },
    WET: { name: "Wet", color: "#3333FF", speedParams: { base: 12.0, deg: 0.05 }, life: 30 }
};

export const CIRCUITS = [
    {
        id: "monza",
        name: "Monza",
        country: "Italy",
        laps: 53,
        baseLapTime: 81.0,
        rainProbability: 0.1,
        tyreWearFactor: 0.9,
        pitTimeLoss: 26.0,
        drsZones: [[0.1, 0.3], [0.7, 0.9]],
        path: "M 100 250 L 500 250 Q 600 250 650 200 L 700 100 Q 720 50 750 50 L 780 50 Q 800 50 800 100 L 800 300 Q 800 350 750 350 L 200 350 Q 150 350 100 300 Z"
    },
    {
        id: "spa",
        name: "Spa-Francorchamps",
        country: "Belgium",
        laps: 44,
        baseLapTime: 104.0,
        rainProbability: 0.4,
        tyreWearFactor: 1.2,
        pitTimeLoss: 28.0,
        drsZones: [[0.05, 0.2], [0.8, 0.95]],
        path: "M 50 300 L 150 350 L 300 350 L 400 300 L 500 320 L 600 300 L 700 250 L 750 150 L 650 100 L 550 50 L 400 50 L 250 100 L 100 200 Z"
    },
    {
        id: "silverstone",
        name: "Silverstone",
        country: "UK",
        laps: 52,
        baseLapTime: 87.0,
        rainProbability: 0.25,
        tyreWearFactor: 1.3,
        pitTimeLoss: 29.0,
        drsZones: [[0.2, 0.35], [0.6, 0.75]],
        path: "M 300 350 L 500 350 L 600 300 L 700 250 L 750 150 L 650 100 L 500 50 L 300 50 L 150 100 L 100 200 L 150 300 Z"
    },
    {
        id: "monaco",
        name: "Monaco",
        country: "Monaco",
        laps: 78,
        baseLapTime: 71.0,
        rainProbability: 0.15,
        tyreWearFactor: 0.6,
        pitTimeLoss: 24.0,
        drsZones: [[0.0, 0.15]],
        path: "M 200 300 L 300 300 L 350 250 L 400 250 L 450 300 L 550 300 L 600 250 L 600 150 L 500 100 L 400 100 L 300 150 L 200 200 Z"
    },
    {
        id: "interlagos",
        name: "Interlagos",
        country: "Brazil",
        laps: 71,
        baseLapTime: 70.0,
        rainProbability: 0.3,
        tyreWearFactor: 1.0,
        pitTimeLoss: 25.0,
        drsZones: [[0.1, 0.25], [0.9, 1.0]],
        path: "M 200 300 L 300 350 L 500 350 L 600 300 L 650 200 L 550 100 L 400 100 L 300 150 L 150 200 Z"
    },
    {
        id: "suzuka",
        name: "Suzuka",
        country: "Japan",
        laps: 53,
        baseLapTime: 90.0,
        rainProbability: 0.2,
        tyreWearFactor: 1.3,
        pitTimeLoss: 26.0,
        drsZones: [[0.05, 0.2]],
        path: "M 200 300 Q 250 350 300 300 T 400 300 T 500 300 L 600 300 L 700 200 L 600 100 L 400 100 L 300 150 L 200 200 Z"
    },
    {
        id: "barcelona",
        name: "Barcelona",
        country: "Spain",
        laps: 66,
        baseLapTime: 78.0,
        rainProbability: 0.05,
        tyreWearFactor: 1.4,
        pitTimeLoss: 22.0,
        drsZones: [[0.0, 0.15], [0.45, 0.55]],
        path: "M 100 300 L 450 300 L 500 250 L 550 200 L 600 150 L 500 100 L 300 100 L 200 150 L 150 250 Z"
    },
    {
        id: "barcelona_test",
        name: "Barcelona (Test)",
        country: "Spain",
        laps: 5,
        baseLapTime: 78.0,
        rainProbability: 0.05,
        tyreWearFactor: 1.4,
        pitTimeLoss: 22.0,
        drsZones: [[0.0, 0.15], [0.45, 0.55]],
        path: "M 100 300 L 450 300 L 500 250 L 550 200 L 600 150 L 500 100 L 300 100 L 200 150 L 150 250 Z"
    }
];
