export const TYRE_COMPOUNDS = {
    SOFT: { name: "Soft", color: "#FF3333", speedParams: { base: 0.0, deg: 0.10 }, life: 25 }, // Slightly improved life/deg
    MEDIUM: { name: "Medium", color: "#FFFF33", speedParams: { base: 0.5, deg: 0.05 }, life: 40 }, // Improved life/deg
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
        // Monza: High speed, chicanes
        path: "M 100,300 L 400,300 Q 420,300 430,280 L 440,250 Q 450,230 480,230 L 600,230 Q 650,230 660,280 L 670,400 Q 680,450 630,450 L 500,450 L 200,450 Q 150,450 140,400 L 120,350 Q 110,320 100,300 Z"
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
        // Monaco: Tight, twists, tunnel
        path: "M 250,500 L 250,450 Q 250,400 300,400 L 400,380 Q 420,380 430,420 L 440,480 Q 450,500 500,500 L 550,500 L 580,450 L 600,300 Q 610,250 550,250 L 450,250 Q 400,250 400,200 L 400,150 Q 400,100 350,100 L 200,100 Q 150,100 150,150 L 150,300 Q 150,350 200,350 L 220,350 L 250,500 Z"
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
        // Silverstone: Complex high speed
        path: "M 350,500 L 250,480 Q 200,470 200,420 L 220,300 Q 230,250 280,250 L 350,260 Q 400,260 420,200 L 450,100 Q 460,50 500,50 L 600,50 Q 650,50 660,100 L 670,300 L 600,450 Q 550,500 450,500 L 350,500 Z"
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
        // Interlagos: Anti-clockwise, Senna S
        path: "M 300,500 L 500,480 L 600,400 Q 650,350 600,300 L 400,250 Q 300,230 350,150 L 400,100 Q 450,50 350,50 L 250,100 Q 200,150 250,200 L 300,250 L 250,350 Q 200,400 250,450 L 300,500 Z"
    },
    {
        id: "test",
        name: "Testing (Barcelona)",
        country: "Spain",
        laps: 5, // Short for testing
        baseLapTime: 78.0,
        overtakeDifficulty: 0.4,
        tyreWearFactor: 1.1,
        weatherBias: 0.1,
        pitTimeLoss: 22.0,
        drsZones: [[0.0, 0.15], [0.45, 0.55]],
        // Barcelona layout approx
        path: "M 150,500 L 550,500 Q 600,500 600,450 L 600,400 Q 600,350 550,350 L 450,350 Q 400,350 400,300 L 420,200 Q 430,150 480,150 L 550,150 Q 600,150 600,100 L 600,50 L 300,50 Q 250,50 250,100 L 250,150 L 150,250 Q 100,300 150,500 Z"
    }
];
