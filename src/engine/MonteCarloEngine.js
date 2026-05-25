import { HeadlessRaceEngine } from "./HeadlessRaceEngine.js";
import { CIRCUITS } from "../data/circuits.js";
import { DRIVERS, TEAMS } from "../data/drivers.js";

/**
 * MonteCarloEngine
 * Runs N headless simulations testing various pit strategies to find the optimal outcome.
 */
export class MonteCarloEngine {
    /**
     * @param {Object} config 
     * @param {string} config.circuitId 
     * @param {string} config.driverId
     * @param {number} config.numSims 
     */
    static async run(config, onProgress) {
        const circuit = CIRCUITS.find(c => c.id === config.circuitId);
        const targetDriver = DRIVERS.find(d => d.id === config.driverId);
        const N = config.numSims || 1000;
        const season = config.season || "2024";

        if (!circuit || !targetDriver) throw new Error("Invalid Config");

        // Base Strategy Matrix (Common F1 Strategies)
        const strategies = [
            ['SOFT', 'HARD'],
            ['MEDIUM', 'HARD'],
            ['SOFT', 'MEDIUM', 'SOFT'],
            ['SOFT', 'HARD', 'SOFT'],
            ['MEDIUM', 'HARD', 'MEDIUM']
        ];

        let results = [];
        let completed = 0;

        // Run simulations in batches to avoid freezing UI (if run in main thread)
        const BATCH_SIZE = 50;
        
        for (let i = 0; i < N; i++) {
            // Randomly select a strategy to test for this iteration
            const stratIdx = i % strategies.length;
            const strategy = strategies[stratIdx];

            // Initialize headless engine
            const engine = new HeadlessRaceEngine(DRIVERS, circuit, config.driverId, strategy, season);
            
            // Stochastic Qualifying Model
            // Realistic qualifying spread based on actual F1 performance gaps
            const seasonTeams = TEAMS[season] || TEAMS["2024"];
            engine.drivers.forEach(d => {
                const teamData = seasonTeams[d.team];
                const teamPerf = teamData ? teamData.performance : 0.90;
                const affinity = d.affinities && d.affinities[circuit.id] ? d.affinities[circuit.id] : 1.0;
                
                // Base qualifying time scaled to circuit (e.g., ~90s for Spa, ~70s for Austria)
                const baseQTime = circuit.baseLapTime * 0.98; // Quali is ~2% faster than race pace
                
                // Team performance gap: the dominant factor
                // In real F1, the gap from P1 to P20 in qualifying is typically 3-5 seconds
                // Performance range is 0.875 (Sauber) to 0.995 (McLaren) = 0.12 spread
                // We need 0.12 spread -> ~4s of lap time difference
                // So multiplier = (1.0 - teamPerf) * 35 gives: Sauber +4.4s, McLaren +0.2s
                const teamPenalty = (1.0 - teamPerf) * 35;
                
                // Driver skill: secondary factor (~0.3s between best and worst teammate)
                // Speed range 80-99, so (speed-80)*0.02 gives 0 to 0.38s advantage
                const skillBonus = (d.speed - 80) * 0.02;
                
                // Track affinity: small but meaningful (~0.1-0.2s)
                const affinityBonus = (affinity - 1.0) * 10;
                
                // Random variance: small enough to not override car performance
                // Consistency 80 -> variance 0.3s, consistency 98 -> variance 0.03s
                const variance = (100 - d.consistency) * 0.015;
                const randomDelta = (Math.random() - 0.5) * variance;
                
                d.qTime = baseQTime + teamPenalty - skillBonus - affinityBonus + randomDelta;
            });
            
            // Sort by qTime ascending (fastest first)
            engine.drivers.sort((a, b) => a.qTime - b.qTime);

            // Run simulation
            const simResult = engine.simulateRace();
            
            const targetResult = simResult.drivers.find(d => d.id === config.driverId);
            
            results.push({
                strategy: strategy.join('-'),
                finishPosition: targetResult.position,
                totalTime: targetResult.finishTime,
                stops: targetResult.stops
            });

            completed++;
            if (completed % BATCH_SIZE === 0 && onProgress) {
                // Yield to main thread and update progress
                await new Promise(resolve => setTimeout(resolve, 0));
                onProgress(completed / N);
            }
        }

        return this.aggregateResults(results);
    }

    static aggregateResults(results) {
        // Group by strategy
        const grouped = {};
        results.forEach(r => {
            if (!grouped[r.strategy]) grouped[r.strategy] = { positions: [], times: [], count: 0 };
            grouped[r.strategy].positions.push(r.finishPosition);
            grouped[r.strategy].times.push(r.totalTime);
            grouped[r.strategy].count++;
        });

        // Compute stats per strategy
        const stats = Object.keys(grouped).map(strat => {
            const data = grouped[strat];
            const avgPos = data.positions.reduce((a, b) => a + b, 0) / data.count;
            const avgTime = data.times.reduce((a, b) => a + b, 0) / data.count;
            const bestPos = Math.min(...data.positions);
            const podiums = data.positions.filter(p => p <= 3).length;
            const wins = data.positions.filter(p => p === 1).length;

            return {
                strategy: strat,
                count: data.count,
                avgPos: avgPos.toFixed(2),
                bestPos,
                podiumPct: ((podiums / data.count) * 100).toFixed(1),
                winPct: ((wins / data.count) * 100).toFixed(1),
                avgTime: avgTime.toFixed(1)
            };
        });

        // Sort by average finishing position
        stats.sort((a, b) => a.avgPos - b.avgPos);

        return {
            raw: results,
            aggregated: stats,
            optimalStrategy: stats[0]
        };
    }
}
