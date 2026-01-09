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
    }

    showScreen(name) {
        Object.values(this.screens).forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });
        this.screens[name].classList.remove('hidden');
        this.screens[name].classList.add('active');
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
            const gap = d.position === 1 ? 'Interval' : `+${d.gapToLeader.toFixed(1)}s`;
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
