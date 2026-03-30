let players = [];

async function load() { 
    try {
        const res = await fetch('data.json');
        players = await res.json();
        render(players);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

function render(data) {
    const grid = document.getElementById('playerGrid');
    grid.innerHTML = "";

    data.forEach((p, pIndex) => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON' && !e.target.classList.contains('status-img')) {
                card.classList.toggle('active');
            }
        };

        // Lógica para renderizar os atributos dinamicamente
        const attributesHTML = p.atributes ? `
            <div class="attributes-grid">
                <div class="attr-item"><strong>ATQ:</strong> ${p.atributes.Attack || '--'}</div>
                <div class="attr-item"><strong>DEF:</strong> ${p.atributes.Defense || '--'}</div>
                <div class="attr-item"><strong>VEL:</strong> ${p.atributes.Velocity || '--'}</div>
                <div class="attr-item"><strong>SALTO:</strong> ${p.atributes.Salto || '--'}</div>
            </div>
        ` : '';

        card.innerHTML = `
            <img src="${p.image_main}" class="player-img-main">
            <div style="padding: 15px">
                <h2 style="margin:0">${p.name}</h2>
                <p style="color:var(--accent-color); margin:0">${p.rank} | ${p.position}</p>
            </div>

            <div class="extra-info">
                <img src="${p.image_status}" class="status-img" onclick="openModal('${p.image_status}')">

                ${attributesHTML}
                
                <p style="font-size: 0.9em; color: var(--text-secondary); margin-top: 10px;">
                    <strong>Aniversário:</strong> ${p.birthday || 'Não informado'}
                </p>

                <p><strong>Resumo:</strong> ${p.summary}</p>
                <div class="info-row">
                    <span>Altura: ${p.height}</span>
                    <span>Nº Camisa: ${p.number}</span>
                </div>
                <p style="text-align:center; font-style:italic">"${p.phrase}"</p>
                
                <h3>Habilidades</h3>
                <div style="background: #222; padding: 15px; border-radius: 8px;">
                    ${p.skills.length > 0 ? p.skills.map(s => `
                        <div style="margin-bottom:8px;">
                            <strong style="color: var(--accent-color)">${s.name}:</strong> ${s.desc}
                        </div>
                    `).join('') : 'Nenhuma habilidade cadastrada.'}
                </div>

                <h3>Combinações</h3>
                <div class="combos-wrapper">
                    ${p.combos.map(combo => `
                        <div class="combo-item">
                            <strong style="color:var(--accent-color)">${combo.name}</strong>
                            <div class="team-simulation">
                                ${combo.team_images.map(img => `<img src="${img}" class="team-img">`).join('')}
                            </div>
                            <div style="font-size:0.85em">${combo.benefits}</div>
                        </div>
                    `).join('')}
                </div>

                <h3>Ascensão</h3>
                <div class="ascension-tabs">
                    ${[0,1,2,3,4,5].map(lv => `
                        <button class="asc-btn ${lv===0?'active':''}" onclick="updateAsc(${pIndex}, ${lv}, this)">${lv}</button>
                    `).join('')}
                </div>
                
                <div class="ascension-box" id="asc-box-${pIndex}">
                    <strong>Melhoria (Nível 0):</strong><br>
                    ${p.ascension_levels && p.ascension_levels[0] ? p.ascension_levels[0].upgrade_details : 'Base'}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateAsc(pIndex, level, btn) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.asc-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const box = document.getElementById(`asc-box-${pIndex}`);
    box.innerHTML = `<strong>Melhoria (Nível ${level}):</strong><br>${players[pIndex].ascension_levels[level].upgrade_details}`;
}

function filterPlayers() {
    const term = document.getElementById('searchBar').value.toUpperCase(); 
    const pos = document.getElementById('filterPosition').value;
    const rank = document.getElementById('filterRank').value;

    const filtered = players.filter(p => {
        const matchName = p.name.toUpperCase().includes(term); 
        const matchPos = (pos === 'ALL' || p.position === pos);
        const matchRank = (rank === 'ALL' || p.rank === rank);
        return matchName && matchPos && matchRank;
    });
    render(filtered);
}

function openModal(src) {
    const modal = document.getElementById('imageModal');
    document.getElementById('modalImg').src = src;
    modal.classList.add('active');
}

function closeModal(e) {
    if(e.target.id === 'imageModal') {
        document.getElementById('imageModal').classList.remove('active');
    }
}

load();