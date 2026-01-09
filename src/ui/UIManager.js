import { TEAMS } from "../data/drivers.js";

export class UIManager {
    constructor() {
        this.screens = {
            start: document.getElementById('start-screen'),
            race: document.getElementById('race-screen'),
            post: document.getElementById('post-race-screen')
        };

        this.elements = {
            driverGrid: document.getElementById('driver-grid'),
            circuitGrid: document.getElementById('circuit-grid'),
            tyreGrid: document.getElementById('tyre-grid'),
            startBtn: document.getElementById('start-race-btn'),
            leaderboard: document.getElementById('leaderboard-list'),
            messages: document.getElementById('message-log'),

            // Telemetry
            tyreLabel: document.getElementById('telemetry-tyre'),
            wearBar: document.getElementById('telemetry-wear'),

            // Header
            lapCounter: document.getElementById('race-lap-counter'),
            circuitName: document.getElementById('race-circuit-name'),

            // Map
            trackPath: document.getElementById('track-path'),
            playerMarker: document.getElementById('player-marker')
        };

        this.selection = { driverId: null, circuitId: null, tyreId: 'SOFT' }; // Default to Soft if needed, but we'll force selection
        this.showInterval = false; // Toggle state

        // Bind Toggle
        const toggleBtn = document.getElementById('gap-toggle-btn');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                this.showInterval = !this.showInterval;
                toggleBtn.textContent = this.showInterval ? "[INTERVAL]" : "[LEADER]";
            };
        }
    }

    showScreen(name) {
        Object.values(this.screens).forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });
        this.screens[name].classList.remove('hidden');
        this.screens[name].classList.add('active');
    }

    renderPostRace(drivers, onRestart) {
        this.showScreen('post');
        const podium = document.getElementById('podium-display');
        podium.innerHTML = '';

        // Top 3 Podium
        const top3 = drivers.slice(0, 3);
        const podiumContainer = document.createElement('div');
        podiumContainer.className = 'podium-container';

        top3.forEach((d, i) => {
            const posClass = i === 0 ? 'p1' : (i === 1 ? 'p2' : 'p3');
            const posLabel = i === 0 ? 'WINNER' : (i === 1 ? 'P2' : 'P3');

            const spot = document.createElement('div');
            spot.className = `podium-spot ${posClass}`;
            spot.innerHTML = `
                <div class="driver-name">${d.name}</div>
                <div class="team-name" style="color:${TEAMS[d.team].color}">${TEAMS[d.team].name}</div>
                <div class="podium-bar">
                    <div style="font-size:2rem">${posLabel}</div>
                </div>
            `;
            podiumContainer.appendChild(spot);
        });
        podium.appendChild(podiumContainer);

        // Classification Table
        const table = document.createElement('table');
        table.className = 'classification-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Driver</th>
                    <th>Team</th>
                    <th>Gap</th>
                    <th>Pts</th>
                </tr>
            </thead>
            <tbody>
                ${drivers.map((d, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${d.name}</td>
                        <td style="color:${TEAMS[d.team].color}">${TEAMS[d.team].name}</td>
                        <td class="points-col">${this.getPoints(i + 1) > 0 ? '+' + this.getPoints(i + 1) : ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        podium.appendChild(table);

        document.getElementById('restart-btn').onclick = onRestart;
    }

    getPoints(pos) {
        const pts = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
        return pts[pos - 1] || 0;
    }

    renderSelectionGrids(drivers, circuits, onSelect) {
        // Render Drivers
        this.elements.driverGrid.innerHTML = '';
        drivers.forEach(d => {
            const card = document.createElement('div');
            card.className = 'driver-card';
            card.innerHTML = `
                <div style="font-weight:bold">${d.name}</div>
                <div style="font-size:0.8em; color:${TEAMS[d.team].color}">${TEAMS[d.team].name}</div>
            `;
            card.onclick = () => {
                this.elements.driverGrid.querySelectorAll('.driver-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selection.driverId = d.id;
                this.checkStartReady(onSelect);
            };
            this.elements.driverGrid.appendChild(card);
        });

        // Render Circuits
        this.elements.circuitGrid.innerHTML = '';
        circuits.forEach(c => {
            const card = document.createElement('div');
            card.className = 'track-card';
            card.innerHTML = `
                <div style="font-weight:bold">${c.name}</div>
                <div style="font-size:0.8em">${c.laps} Laps</div>
            `;
            card.onclick = () => {
                this.elements.circuitGrid.querySelectorAll('.track-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selection.circuitId = c.id;
                this.checkStartReady(onSelect);
            };
            this.elements.circuitGrid.appendChild(card);
        });

        // Render Tyres (Soft, Medium, Hard only)
        const startTyres = ['SOFT', 'MEDIUM', 'HARD'];
        this.elements.tyreGrid.innerHTML = '';
        startTyres.forEach(t => {
            const card = document.createElement('div');
            card.className = 'track-card'; // Reuse style
            card.innerHTML = `
                <div style="font-weight:bold; color:${this.getTyreColor(t)}">${t}</div>
                <div style="font-size:0.8em">Start on ${t}</div>
            `;
            card.onclick = () => {
                this.elements.tyreGrid.querySelectorAll('.track-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selection.tyreId = t;
                this.checkStartReady(onSelect);
            };
            this.elements.tyreGrid.appendChild(card);
        });
    }

    checkStartReady(onSelect) {
        if (this.selection.driverId && this.selection.circuitId && this.selection.tyreId) {
            this.elements.startBtn.disabled = false;
            this.elements.startBtn.onclick = () => onSelect(this.selection.driverId, this.selection.circuitId, this.selection.tyreId);
        }
    }

    initRaceView(circuitName, totalLaps, circuitPath) {
        this.showScreen('race');
        this.elements.circuitName.textContent = circuitName;
        this.elements.lapCounter.textContent = `Lap 1 / ${totalLaps}`;

        // Draw Track
        this.elements.trackPath.setAttribute('d', circuitPath);
    }

    updateTrackMap(driver, trackLength) {
        if (!driver) return;

        // Normalize progress (0 to 1)
        // distance can be > trackLength (laps), so modulus
        const progress = (driver.distance % trackLength) / trackLength;

        // Get Point
        const path = this.elements.trackPath;
        const len = path.getTotalLength();
        const point = path.getPointAtLength(progress * len);

        this.elements.playerMarker.setAttribute('cx', point.x);
        this.elements.playerMarker.setAttribute('cy', point.y);
    }

    updateLeaderboard(drivers, userDriverId) {
        // Assume drivers are sorted by position
        this.elements.leaderboard.innerHTML = drivers.map(d => {
            const isMe = d.id === userDriverId;
            let gap = '';

            if (d.position === 1) {
                gap = 'Leader';
            } else {
                if (this.showInterval) {
                    // Interval (Gap to ahead)
                    const g = d.gapToAhead; // Seconds
                    gap = (g > 200 || g < 0) ? '>1L' : `+${g.toFixed(1)}s`;
                } else {
                    // Gap to Leader
                    gap = `+${d.gapToLeader.toFixed(1)}s`;
                }
            }

            // Override if finished (Show actual finish gap relative to leader, or just static)
            if (d.hasFinished && d.position > 1) {
                // We don't have easy access to leader finish time here unless we find P1.
                // UIManager optimization: Pass P1 explicitly? Or just finding it.
                const leader = drivers.find(dr => dr.position === 1);
                if (leader && leader.finishTime && d.finishTime) {
                    const timeDiff = d.finishTime - leader.finishTime;
                    gap = `+${timeDiff.toFixed(1)}s`;
                } else if (d.hasFinished) {
                    gap = 'FIN';
                }
            }
            // Logic for Leader finish
            if (d.position === 1 && d.hasFinished) gap = 'WINNER';

            const teamColor = TEAMS[d.team].color;
            const pitStatus = d.isInPit ? ' [PIT]' : '';

            return `
                <div class="lb-row ${isMe ? 'player' : ''}">
                    <div class="lb-pos">${d.position}</div>
                    <div class="lb-name" style="border-left: 3px solid ${teamColor}; padding-left:5px;">
                        ${d.name} ${pitStatus}
                    </div>
                    <div class="lb-gap">${gap}</div>
                    <div class="lb-tyre" style="background:${this.getTyreColor(d.tyre)}">${d.tyre[0]}</div>
                </div>
            `;
        }).join('');
    }

    updateTelemetry(userDriver) {
        const wearPct = userDriver.tyreHealth * 100;
        this.elements.wearBar.style.width = `${wearPct}%`;

        let color = '#22c55e'; // Green
        if (wearPct < 60) color = '#eab308'; // Yellow
        if (wearPct < 30) color = '#ef4444'; // Red
        this.elements.wearBar.style.backgroundColor = color;

        this.elements.tyreLabel.textContent = userDriver.tyre;
        this.elements.tyreLabel.style.color = this.getTyreColor(userDriver.tyre);
    }

    addMessage(text, isUrgent = false) {
        const msg = document.createElement('div');
        msg.className = `msg ${isUrgent ? 'urgent' : ''}`;
        msg.textContent = text;
        this.elements.messages.prepend(msg); // Newest top
    }

    getTyreColor(tyre) {
        const map = {
            SOFT: '#FF3333',
            MEDIUM: '#FFFF33',
            HARD: '#FFFFFF',
            INTER: '#33CC33',
            WET: '#3333FF'
        };
        return map[tyre] || '#FFF';
    }
}
