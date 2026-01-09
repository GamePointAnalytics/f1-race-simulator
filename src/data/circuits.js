export const TYRE_COMPOUNDS = {
    SOFT: { name: "Soft", color: "#FF3333", speedParams: { base: 0.0, deg: 0.12 }, life: 20 },
    MEDIUM: { name: "Medium", color: "#FFFF33", speedParams: { base: 0.5, deg: 0.06 }, life: 35 },
    HARD: { name: "Hard", color: "#FFFFFF", speedParams: { base: 1.0, deg: 0.02 }, life: 65 }, // Durable
    INTER: { name: "Inter", color: "#33CC33", speedParams: { base: 2.0, deg: 0.05 }, life: 30 },
    WET: { name: "Wet", color: "#3333FF", speedParams: { base: 5.0, deg: 0.05 }, life: 30 }
};

export const CIRCUITS = [
    {
        id: "monza",
        name: "Monza",
        country: "Italy",
        laps: 53,
        baseLapTime: 81.0,
        overtakeDifficulty: 0.3,
        tyreWearFactor: 0.9,
        weatherBias: 0.2,
        pitTimeLoss: 26.0,
        drsZones: [[0.0, 0.15], [0.45, 0.55]],
        path: "M 100,250 C 100,200 150,50 300,50 L 500,50 C 650,50 700,200 700,250 L 700,400 C 700,500 600,550 400,550 L 200,550 C 100,550 100,450 100,250 Z"
    },
    {
        id: "monaco",
        name: "Monaco",
        country: "Monaco",
        laps: 78,
        baseLapTime: 71.0,
        overtakeDifficulty: 0.95,
        tyreWearFactor: 0.6,
        weatherBias: 0.1,
        pitTimeLoss: 24.0,
        drsZones: [[0.0, 0.08]],
        path: "M 200,100 L 500,100 L 500,200 L 300,200 L 300,300 L 600,300 L 600,500 L 200,500 L 100,300 Z"
    },
    {
        id: "spa",
        name: "Spa-Francorchamps",
        country: "Belgium",
        laps: 44,
        baseLapTime: 104.0,
        overtakeDifficulty: 0.4,
        tyreWearFactor: 1.2,
        weatherBias: 0.6,
        pitTimeLoss: 28.0,
        path: "M 200,450 L 240,420 Q 270,380 300,300 L 550,150 L 600,140 Q 640,140 650,180 L 660,220 Q 680,260 620,280 L 550,330 Q 500,360 550,400 L 620,440 Q 660,460 640,500 L 500,530 Q 300,550 250,500 L 220,510 L 200,450 Z",
        drsZones: [[0.18, 0.30], [0.92, 1.0]]
    },
    {
        id: "silverstone",
        name: "Silverstone",
        country: "UK",
        laps: 52,
        baseLapTime: 87.0,
        overtakeDifficulty: 0.4,
        tyreWearFactor: 1.3,
        weatherBias: 0.5,
        pitTimeLoss: 29.0,
        drsZones: [[0.2, 0.3], [0.55, 0.65]],
        path: "M 300,50 L 500,50 L 700,200 L 600,500 L 200,500 L 100,200 Z"
    },
    {
        id: "interlagos",
        name: "Interlagos",
        country: "Brazil",
        laps: 71,
        baseLapTime: 70.0,
        overtakeDifficulty: 0.5,
        tyreWearFactor: 1.0,
        weatherBias: 0.4,
        pitTimeLoss: 25.0,
        drsZones: [[0.9, 1.0], [0.0, 0.1], [0.4, 0.5]],
        path: "M 400,300 C 300,300 100,300 100,200 C 100,100 300,100 400,100 C 600,100 700,300 600,500 L 300,500 Z"
    }
];
