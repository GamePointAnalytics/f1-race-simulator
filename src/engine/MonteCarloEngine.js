import { HeadlessRaceEngine } from "./HeadlessRaceEngine.js";
import { CIRCUITS } from "../data/circuits.js";
import { DRIVERS } from "../data/drivers.js";

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
            const engine = new HeadlessRaceEngine(DRIVERS, circuit, config.driverId, strategy);
            
            // Randomize grid positions slightly to simulate qualifying variance
            // (In a real quant model, you'd use a separate qualifying distribution)
            // For now, we'll just shuffle the non-target drivers
            const grid = [...engine.drivers].sort((a,b) => Math.random() - 0.5);
            // Put target driver in a realistic spot (e.g., P5)
            const target = grid.find(d => d.id === config.driverId);
            grid.splice(grid.indexOf(target), 1);
            grid.splice(4, 0, target); // Force P5 for target driver to see strategy impact
            
            engine.drivers = grid;

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
