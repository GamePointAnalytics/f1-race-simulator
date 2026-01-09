
import { TEAMS } from "../data/drivers.js";

export class QualifyingSession {
    static simulate(drivers, circuit, difficulty) {
        // Base variability (0.3s) - reduced from 1.5% to minimize random upsets
        const baseVar = circuit.baseLapTime * 0.005;

        // Shuffle slightly first to break default order if identical speeds
        const shuffled = [...drivers].sort(() => Math.random() - 0.5);

        const results = shuffled.map(d => {
            // Team Performance (Dominant Factor)
            // 0.995 vs 0.875 -> 12% diff in raw stat
            const teamData = TEAMS[d.team];
            const teamPerf = teamData ? teamData.performance : 0.90;
            // Map 0.995 -> -0.8s. 0.875 -> +0.8s.
            // Delta = 1.6s spread.
            const teamDelta = (0.94 - teamPerf) * 15.0; // Seconds relative to mid-field (0.94)

            // Driver Speed (Secondary Factor)
            // 99 vs 85 -> 14 diff.
            // Map 99 -> -0.3s. 85 -> +0.3s.
            const speedDelta = (90 - d.speed) * 0.04;

            // Random "Perfect Lap" vs "Mistake"
            // Range +/- 0.3s
            const lapVar = (Math.random() - 0.5) * 0.6;

            // Calculated Lap Time
            const time = circuit.baseLapTime + teamDelta + speedDelta + lapVar;

            return {
                id: d.id,
                name: d.name,
                team: d.team,
                time: time,
                formattedTime: this.formatTime(time)
            };
        });

        // Sort by Time Ascending
        results.sort((a, b) => a.time - b.time);

        return results;
    }

    static formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = (seconds % 60).toFixed(3);
        const ms = s.split('.')[1];
        return `${m}:${s.split('.')[0]}.${ms}`;
    }
}
