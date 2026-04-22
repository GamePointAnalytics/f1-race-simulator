import { MonteCarloEngine } from "../engine/MonteCarloEngine.js";

export class AnalyticsUI {
    constructor() {
        this.container = document.getElementById('analytics-screen');
        this.resultsContainer = document.getElementById('analytics-results');
        this.progressContainer = document.getElementById('analytics-progress');
        this.progressBar = document.getElementById('analytics-progress-bar');
        
        this.btnRun = document.getElementById('btn-run-analytics');
        if (this.btnRun) {
            this.btnRun.addEventListener('click', () => this.runSimulation());
        }

        this.chartInstances = {};
    }

    async runSimulation() {
        const circuitId = document.getElementById('analytics-circuit').value;
        const driverId = document.getElementById('analytics-driver').value;
        const numSims = parseInt(document.getElementById('analytics-sims').value) || 1000;

        if (!circuitId || !driverId) {
            alert("Select circuit and driver first.");
            return;
        }

        // UI Reset
        this.btnRun.disabled = true;
        this.btnRun.textContent = "SIMULATING...";
        this.progressContainer.style.display = 'block';
        this.progressBar.style.width = '0%';
        this.resultsContainer.style.opacity = '0.5';

        try {
            const results = await MonteCarloEngine.run({
                circuitId,
                driverId,
                numSims
            }, (progress) => {
                this.progressBar.style.width = `${progress * 100}%`;
            });

            this.renderResults(results);
        } catch (e) {
            console.error(e);
            alert("Error running simulation: " + e.message);
        } finally {
            this.btnRun.disabled = false;
            this.btnRun.textContent = "RUN ANALYSIS";
            setTimeout(() => { this.progressContainer.style.display = 'none'; }, 500);
            this.resultsContainer.style.opacity = '1';
        }
    }

    renderResults(data) {
        // 1. Summary Stats
        const summaryDiv = document.getElementById('analytics-summary');
        const opt = data.optimalStrategy;
        summaryDiv.innerHTML = `
            <div class="stat-box">
                <div class="stat-label">Optimal Strategy</div>
                <div class="stat-val" style="color:var(--success)">${opt.strategy}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Expected Pos</div>
                <div class="stat-val">P${opt.avgPos}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Podium Prob</div>
                <div class="stat-val">${opt.podiumPct}%</div>
            </div>
        `;

        // 2. Position Distribution Chart (Chart.js)
        this.renderDistributionChart(data);
    }

    renderDistributionChart(data) {
        const ctx = document.getElementById('distribution-chart');
        if (!ctx) return;

        if (this.chartInstances.dist) {
            this.chartInstances.dist.destroy();
        }

        // Compare top 2 strategies
        const strats = data.aggregated.slice(0, 2);
        
        const datasets = strats.map((stratData, i) => {
            // Count positions 1-20
            const counts = Array(20).fill(0);
            const rawRuns = data.raw.filter(r => r.strategy === stratData.strategy);
            rawRuns.forEach(r => {
                if (r.finishPosition >= 1 && r.finishPosition <= 20) {
                    counts[r.finishPosition - 1]++;
                }
            });

            // Convert to percentages
            const pcts = counts.map(c => (c / rawRuns.length) * 100);

            return {
                label: stratData.strategy,
                data: pcts,
                backgroundColor: i === 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)',
                borderColor: i === 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                borderWidth: 1
            };
        });

        // @ts-ignore
        this.chartInstances.dist = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 20}, (_, i) => `P${i+1}`),
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Finishing Position Distribution (Top 2 Strategies)', color: '#fff' },
                    legend: { labels: { color: '#fff' } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Probability (%)', color: '#8b9bb4' },
                        ticks: { color: '#8b9bb4' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: '#8b9bb4' },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}
