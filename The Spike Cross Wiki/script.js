//! Variáveis globais do sistema
let players = []; //! Array que armazena todos os jogadores carregados do JSON
let currentOpenedPlayerIndex = null; //! Índice do jogador atualmente aberto no modal

//! Função assíncrona para carregar dados dos jogadores
async function load() { 
    try {
        // * Busca o arquivo data.json que contém todos os dados dos jogadores
        const res = await fetch('data.json');
        // * Converte a resposta para JSON e armazena no array global
        players = await res.json();
        // * Renderiza a grade inicial com todos os jogadores
        renderGrid(players);
    } catch (error) {
        // ! Trata erros de carregamento do arquivo JSON
        console.error("Erro ao carregar dados:", error);
    }
}

//! Função principal que renderiza a grade de jogadores na tela
function renderGrid(data) {
    // * Obtém o elemento container da grade de jogadores
    const grid = document.getElementById('playerGrid');
    // * Limpa o conteúdo atual da grade
    grid.innerHTML = "";

    // * Define as posições possíveis dos jogadores
    const positions = ["WS", "MB", "SE"];
    // * Mapeamento dos códigos de posição para nomes completos
    const positionNames = { "WS": "WING SPIKER", "MB": "MIDDLE BLOCKER", "SE": "SETTER" };

    // * Itera sobre cada posição para criar seções organizadas
    positions.forEach(pos => {
        // * Filtra jogadores por posição atual
        const playersInPos = data.filter(p => p.position === pos);
        // * Verifica se existem jogadores nesta posição
        if (playersInPos.length > 0) {
            // * Cria o cabeçalho da seção da posição
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'position-section';
            sectionHeader.innerHTML = `
                <div class="position-header">
                    <h2 class="position-title">${pos} <span style="font-size: 0.6em; color: var(--text-secondary); opacity: 0.7;">| ${positionNames[pos]}</span></h2>
                    <div class="position-line"></div>
                </div>
            `;
            // * Adiciona o cabeçalho à grade
            grid.appendChild(sectionHeader);

            // * Itera sobre cada jogador da posição atual
            playersInPos.forEach(p => {
                // * Encontra o índice original do jogador no array global
                const originalIndex = players.findIndex(player => player.name === p.name && player.position === p.position);
                // * Cria o card do jogador
                const card = document.createElement('div');
                card.className = 'player-card';
                // * Define o evento de clique para abrir detalhes
                card.onclick = () => openDetailsModal(originalIndex);
                // * Monta o HTML do card com imagem e informações básicas
                card.innerHTML = `
                    <img src="${p.image_main}" class="player-img-main" alt="${p.name}">
                    <div style="padding: 15px">
                        <h2 style="margin:0">${p.name}</h2>
                        <p style="color:var(--accent-color); margin:0">${p.rank}</p>
                    </div>
                `;
                // * Adiciona o card à grade
                grid.appendChild(card);
            });
        }
    });
}

//! Função que abre o modal com detalhes completos do jogador
function openDetailsModal(playerIndex) {
    // * Obtém os dados do jogador pelo índice
    const p = players[playerIndex];
    // * Armazena o índice do jogador atualmente aberto
    currentOpenedPlayerIndex = playerIndex;
    // * Obtém referências aos elementos do modal
    const modal = document.getElementById('detailsModal');
    const body = document.getElementById('detailsBody');
    const modalContent = modal.querySelector('.details-content');
    // * Reseta o scroll do modal para o topo
    if (modalContent) modalContent.scrollTop = 0;

    // * Verifica se o jogador possui atributos e cria o HTML correspondente
    const attributesHTML = p.atributes ? `
        <div class="attributes-grid">
            <div class="attr-item"><strong>ATQ:</strong> ${p.atributes.Attack || '--'}</div>
            <div class="attr-item"><strong>DEF:</strong> ${p.atributes.Defense || '--'}</div>
            <div class="attr-item"><strong>VEL:</strong> ${p.atributes.Velocity || '--'}</div>
            <div class="attr-item"><strong>SALTO:</strong> ${p.atributes.Salto || '--'}</div>
        </div>
    ` : '';

    // * Monta o HTML completo do corpo do modal com todas as informações do jogador
    body.innerHTML = `
        <div class="modal-player-header">
            <img src="${p.image_main}" class="modal-player-img">
            <div>
                <h1 style="margin:0; color:var(--text-primary)">${p.name}</h1>
                <p style="color:var(--accent-color); margin:0; font-size:1.2em">${p.rank} | ${p.position}</p>
                <div class="info-row" style="margin-top:10px; gap: 15px; justify-content: flex-start;">
                    <span>Altura: ${p.height}</span>
                    <span>Nº Camisa: ${p.number}</span>
                </div>
            </div>
        </div>
        <div class="modal-main-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h3>Resumo</h3>
                <p style="color:var(--text-secondary); line-height:1.6">${p.summary}</p>
                <p><strong>Aniversário:</strong> ${p.birthday || 'Não informado'}</p>
                <p style="text-align:center; font-style:italic; border-top:1px solid #333; padding-top:10px">"${p.phrase}"</p>
                ${attributesHTML}
                <img src="${p.image_status}" class="status-img" onclick="openStatusImage('${p.image_status}')" title="Clique para ampliar">
            </div>
            <div>
                <h3>Habilidades</h3>
                <div style="background: #222; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    ${p.skills.length > 0 ? p.skills.map(s => `
                        <div style="margin-bottom:8px;"><strong style="color: var(--accent-color)">${s.name}:</strong> ${s.desc}</div>
                    `).join('') : 'Nenhuma habilidade cadastrada.'}
                </div>
                <h3>Ascensão</h3>
                <div class="ascension-tabs">
                    ${[0,1,2,3,4,5].map(lv => `<button class="asc-btn ${lv===0?'active':''}" onclick="updateAscensionInModal(${lv}, this)">${lv}</button>`).join('')}
                </div>
                <div class="ascension-box" id="modal-asc-box" style="margin-bottom: 20px;">
                    <strong>Melhoria (Nível 0):</strong><br>${p.ascension_levels && p.ascension_levels[0] ? p.ascension_levels[0].upgrade_details : 'Base'}
                </div>
            </div>
            <div class="combos-section" style="grid-column: 1 / -1;">
                <h3>Combinações</h3>
                ${p.combos.length > 0 ? p.combos.map(combo => `
                    <div class="combo-item">
                        <strong style="color:var(--accent-color)">${combo.name}</strong>
                        <div class="team-simulation">
                            ${combo.team_images.map(imgUrl => {
                                // * Passa o link completo da imagem para evitar conflitos de nomes
                                return `<img src="${imgUrl}" class="team-img" 
                                onclick="navigateToPlayerByImage('${imgUrl}')" 
                                title="Clique para ver detalhes">`;
                            }).join('')}
                        </div>
                        <div style="font-size:0.95em; color: var(--text-secondary);">${combo.benefits}</div>
                    </div>
                `).join('') : '<p>Nenhuma combinação disponível.</p>'}
            </div>
        </div>
    `;
    // * Ativa o modal e bloqueia o scroll da página
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

//! Função para navegar até um jogador usando o caminho da imagem (único para cada carta)
function navigateToPlayerByImage(imgUrl) {
    // * Procura o jogador que possui EXATAMENTE essa imagem principal
    const index = players.findIndex(p => p.image_main === imgUrl);
    
    if (index !== -1) {
        // * Se encontrar, abre o modal de detalhes do jogador
        openDetailsModal(index);
    } else {
        // ? Fallback: se não achar pela imagem exata, tenta encontrar o nome do arquivo dentro da URL
        const fileName = imgUrl.split('/').pop().toLowerCase();
        const fallbackIndex = players.findIndex(p => {
            return p.image_main.toLowerCase().includes(fileName) || fileName.includes(p.name.toLowerCase());
        });

        if (fallbackIndex !== -1) {
            openDetailsModal(fallbackIndex);
        } else {
            // ! Registra aviso se não conseguir encontrar o jogador
            console.warn("Não foi possível encontrar o jogador para o arquivo: " + imgUrl);
        }
    }
}

//! Funções de controle do modal de status (ampliação de imagem)
function openStatusImage(src) {
    // * Obtém referências aos elementos do modal de status
    const modal = document.getElementById('statusModal');
    const modalImg = document.getElementById('statusImgExpanded');
    // * Define a fonte da imagem e ativa o modal
    modalImg.src = src;
    modal.classList.add('active');
}

function closeStatusModal(e) {
    // * Fecha o modal se clicar no overlay ou se não houver evento
    if(!e || e.target.id === 'statusModal') {
        document.getElementById('statusModal').classList.remove('active');
    }
}

//! Função para fechar o modal de detalhes ao clicar no overlay
function closeDetailsModal(e) {
    // * Verifica se o clique foi no overlay e força o fechamento
    if(e.target.classList.contains('details-overlay')) forceCloseDetailsModal();
}

//! Função que força o fechamento do modal de detalhes
function forceCloseDetailsModal() {
    // * Obtém referência ao modal e remove a classe ativa
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('active');
    // * Restaura o scroll da página e limpa o índice do jogador atual
    document.body.style.overflow = '';
    currentOpenedPlayerIndex = null;
}

//! Função para atualizar a exibição de ascensão no modal
function updateAscensionInModal(level, btn) {
    // * Remove a classe active de todos os botões de ascensão
    const parent = btn.parentElement;
    parent.querySelectorAll('.asc-btn').forEach(b => b.classList.remove('active'));
    // * Adiciona a classe active ao botão clicado
    btn.classList.add('active');
    // * Obtém referência à caixa de ascensão e ao jogador atual
    const box = document.getElementById('modal-asc-box');
    const p = players[currentOpenedPlayerIndex];
    // * Verifica se existe nível de ascensão para o nível selecionado
    if (p.ascension_levels && p.ascension_levels[level]) {
        // * Atualiza o conteúdo com os detalhes da melhoria do nível
        box.innerHTML = `<strong>Melhoria (Nível ${level}):</strong><br>${p.ascension_levels[level].upgrade_details}`;
    }
}

//! Função principal de filtragem de jogadores
function filterPlayers() {
    // * Verifica se os jogadores foram carregados
    if (!players || players.length === 0) {
        console.warn("Nenhum jogador carregado para filtrar");
        return;
    }
    
    // * Obtém os valores dos filtros da interface
    const searchTerm = document.getElementById('searchBar').value.trim().toLowerCase(); 
    const pos = document.getElementById('filterPosition').value;
    const rank = document.getElementById('filterRank').value;
    
    // * Filtra os jogadores baseado nos critérios
    const filtered = players.filter(p => {
        // * Verifica se o jogador tem todas as propriedades necessárias
        if (!p || !p.name) return false;
        
        // * Verifica correspondência do nome (case insensitive)
        const matchName = p.name.toLowerCase().includes(searchTerm); 
        // * Verifica correspondência da posição
        const matchPos = (pos === 'ALL' || p.position === pos);
        // * Verifica correspondência do rank
        const matchRank = (rank === 'ALL' || p.rank === rank);
        // * Retorna apenas jogadores que correspondem a todos os critérios
        return matchName && matchPos && matchRank;
    });
    
    // * Renderiza a grade com os jogadores filtrados
    renderGrid(filtered); 
}

//! Event listener global para teclas de atalho
document.addEventListener('keydown', (e) => {
    // * Verifica se a tecla ESC foi pressionada
    if (e.key === 'Escape') {
        // * Fecha ambos os modais (detalhes e status)
        forceCloseDetailsModal();
        closeStatusModal();
    }
});

//! Inicialização da aplicação - carrega os dados ao iniciar
load();