// Global Application State - Enhanced
var appState = {
    selectedWells: [],
    selectedIntervals: [],
    savedSets: [],
    currentModule: null,
    plotData: null,
    parameters: [],
    isLoading: false,
    currentDataset: null,
    availableWells: [],
    availableIntervals: [],
    plotType: 'default',
    currentStructure: null,
    selectedFilePath: null, // Added for file-based plots
    plotFigure: { data: [], layout: {} }, // Added for plot state
    error: null, // Added for error handling
    wellColumns: {} // Added for well columns
};

// Mock data untuk testing ketika backend tidak tersedia
var mockData = {
    wells: ['WELL-001', 'WELL-002', 'WELL-003', 'WELL-004', 'WELL-005'],
    markers: ['MARKER-A', 'MARKER-B', 'MARKER-C', 'MARKER-D'],
    plotData: {
        data: [
            {
                x: [50, 60, 70, 80, 90, 100, 110, 120],
                y: [3000, 3010, 3020, 3030, 3040, 3050, 3060, 3070],
                type: 'scatter',
                mode: 'lines',
                name: 'Gamma Ray',
                line: { color: 'green', width: 2 }
            },
            {
                x: [1, 2, 5, 10, 20, 50, 100, 200],
                y: [3000, 3010, 3020, 3030, 3040, 3050, 3060, 3070],
                type: 'scatter',
                mode: 'lines',
                name: 'Resistivity',
                line: { color: 'red', width: 2 },
                xaxis: 'x2'
            }
        ],
        layout: {
            title: 'Mock Well Log Plot',
            height: 600,
            xaxis: {
                title: 'Gamma Ray (API)',
                domain: [0, 0.45]
            },
            xaxis2: {
                title: 'Resistivity (ohm.m)',
                domain: [0.55, 1],
                type: 'log'
            },
            yaxis: {
                title: 'Depth (ft)',
                autorange: 'reversed'
            },
            showlegend: true
        }
    }
};

// Structures Mock Data - Restored original rich mock for structures UI
var structuresData = {
    fields: [
        {
            field_name: "Adera",
            structures_count: 4,
            structures: [
                { structure_name: "Abab", field_name: "Adera", file_path: "/data/structures/Adera/Abab.xlsx", wells_count: 12, wells: ["ABB-001","ABB-002","ABB-003","ABB-004","ABB-005","ABB-006","ABB-007","ABB-008","ABB-009","ABB-010","ABB-011","ABB-012"], total_records: 1200, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["ABAB-TOP","ABAB-MID","ABAB-BOTTOM","ABAB-RESERVOIR"] },
                { structure_name: "Benuang", field_name: "Adera", file_path: "/data/structures/Adera/Benuang.xlsx", wells_count: 8, wells: ["BNG-001","BNG-002","BNG-003","BNG-004","BNG-005","BNG-006","BNG-007","BNG-008"], total_records: 850, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["BNG-UPPER","BNG-LOWER","BNG-MAIN"] },
                { structure_name: "Dewa", field_name: "Adera", file_path: "/data/structures/Adera/Dewa.xlsx", wells_count: 15, wells: ["DEW-001","DEW-002","DEW-003","DEW-004","DEW-005","DEW-006","DEW-007","DEW-008","DEW-009","DEW-010","DEW-011","DEW-012","DEW-013","DEW-014","DEW-015"], total_records: 1600, columns: ["DEPTH","GR","NPHI","RHOB","RT","SP"], intervals: ["DEWA-A","DEWA-B","DEWA-C","DEWA-RESERVOIR","DEWA-SEAL"] },
                { structure_name: "Raja", field_name: "Adera", file_path: "/data/structures/Adera/Raja.xlsx", wells_count: 10, wells: ["RJA-001","RJA-002","RJA-003","RJA-004","RJA-005","RJA-006","RJA-007","RJA-008","RJA-009","RJA-010"], total_records: 980, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["RAJA-TOP","RAJA-MIDDLE","RAJA-BOTTOM"] }
            ]
        },
        {
            field_name: "Limau",
            structures_count: 5,
            structures: [
                { structure_name: "Belimbing", field_name: "Limau", file_path: "/data/structures/Limau/Belimbing.xlsx", wells_count: 18, wells: ["LIM-BLB-001","LIM-BLB-002","LIM-BLB-003","LIM-BLB-004","LIM-BLB-005","LIM-BLB-006","LIM-BLB-007","LIM-BLB-008","LIM-BLB-009","LIM-BLB-010","LIM-BLB-011","LIM-BLB-012","LIM-BLB-013","LIM-BLB-014","LIM-BLB-015","LIM-BLB-016","LIM-BLB-017","LIM-BLB-018"], total_records: 2100, columns: ["DEPTH","GR","NPHI","RHOB","RT","SP"], intervals: ["BLB-ZONE-1","BLB-ZONE-2","BLB-ZONE-3","BLB-MAIN"] },
                { structure_name: "Karangan", field_name: "Limau", file_path: "/data/structures/Limau/Karangan.xlsx", wells_count: 7, wells: ["LIM-KRG-001","LIM-KRG-002","LIM-KRG-003","LIM-KRG-004","LIM-KRG-005","LIM-KRG-006","LIM-KRG-007"], total_records: 750, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["KRG-UPPER","KRG-LOWER"] },
                { structure_name: "Limau Barat", field_name: "Limau", file_path: "/data/structures/Limau/Limau Barat.xlsx", wells_count: 22, wells: ["LIM-LB-001","LIM-LB-002","LIM-LB-003","LIM-LB-004","LIM-LB-005","LIM-LB-006","LIM-LB-007","LIM-LB-008","LIM-LB-009","LIM-LB-010","LIM-LB-011","LIM-LB-012","LIM-LB-013","LIM-LB-014","LIM-LB-015","LIM-LB-016","LIM-LB-017","LIM-LB-018","LIM-LB-019","LIM-LB-020","LIM-LB-021","LIM-LB-022"], total_records: 2800, columns: ["DEPTH","GR","NPHI","RHOB","RT","SP","CALI"], intervals: ["LB-A","LB-B","LB-C","LB-D","LB-MAIN"] },
                { structure_name: "Limau Tengah", field_name: "Limau", file_path: "/data/structures/Limau/Limau Tengah.xlsx", wells_count: 16, wells: ["LIM-LT-001","LIM-LT-002","LIM-LT-003","LIM-LT-004","LIM-LT-005","LIM-LT-006","LIM-LT-007","LIM-LT-008","LIM-LT-009","LIM-LT-010","LIM-LT-011","LIM-LT-012","LIM-LT-013","LIM-LT-014","LIM-LT-015","LIM-LT-016"], total_records: 1950, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["LT-ZONE-1","LT-ZONE-2","LT-ZONE-3"] },
                { structure_name: "Tanjung Miring Barat", field_name: "Limau", file_path: "/data/structures/Limau/Tanjung Miring Barat.xlsx", wells_count: 14, wells: ["LIM-TMB-001","LIM-TMB-002","LIM-TMB-003","LIM-TMB-004","LIM-TMB-005","LIM-TMB-006","LIM-TMB-007","LIM-TMB-008","LIM-TMB-009","LIM-TMB-010","LIM-TMB-011","LIM-TMB-012","LIM-TMB-013","LIM-TMB-014"], total_records: 1650, columns: ["DEPTH","GR","NPHI","RHOB","RT","SP"], intervals: ["TMB-TOP","TMB-MIDDLE","TMB-BOTTOM"] }
            ]
        },
        {
            field_name: "Pendopo",
            structures_count: 5,
            structures: [
                // Benakat Barat, Betung, Musi Timur, Sopa, Talang Akar
                { structure_name: "Benakat Barat", field_name: "Pendopo", file_path: "/data/structures/Pendopo/Benakat Barat.xlsx", wells_count: 11, wells: ["PDP-BKB-001","PDP-BKB-002","PDP-BKB-003","PDP-BKB-004","PDP-BKB-005","PDP-BKB-006","PDP-BKB-007","PDP-BKB-008","PDP-BKB-009","PDP-BKB-010","PDP-BKB-011"], total_records: 1100, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["BKB-TOP","BKB-MID","BKB-BOTTOM"] },
                { structure_name: "Betung", field_name: "Pendopo", file_path: "/data/structures/Pendopo/Betung.xlsx", wells_count: 9, wells: ["PDP-BTG-001","PDP-BTG-002","PDP-BTG-003","PDP-BTG-004","PDP-BTG-005","PDP-BTG-006","PDP-BTG-007","PDP-BTG-008","PDP-BTG-009"], total_records: 900, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["BTG-UPPER","BTG-LOWER"] },
                { structure_name: "Musi Timur", field_name: "Pendopo", file_path: "/data/structures/Pendopo/Musi Timur.xlsx", wells_count: 13, wells: ["PDP-MST-001","PDP-MST-002","PDP-MST-003","PDP-MST-004","PDP-MST-005","PDP-MST-006","PDP-MST-007","PDP-MST-008","PDP-MST-009","PDP-MST-010","PDP-MST-011","PDP-MST-012","PDP-MST-013"], total_records: 1300, columns: ["DEPTH","GR","NPHI","RHOB","RT","SP"], intervals: ["MST-ZONE-1","MST-ZONE-2","MST-ZONE-3"] },
                { structure_name: "Sopa", field_name: "Pendopo", file_path: "/data/structures/Pendopo/Sopa.xlsx", wells_count: 7, wells: ["PDP-SPA-001","PDP-SPA-002","PDP-SPA-003","PDP-SPA-004","PDP-SPA-005","PDP-SPA-006","PDP-SPA-007"], total_records: 700, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["SPA-TOP","SPA-BOTTOM"] },
                { structure_name: "Talang Akar", field_name: "Pendopo", file_path: "/data/structures/Pendopo/Talang Akar.xlsx", wells_count: 10, wells: ["PDP-TLA-001","PDP-TLA-002","PDP-TLA-003","PDP-TLA-004","PDP-TLA-005","PDP-TLA-006","PDP-TLA-007","PDP-TLA-008","PDP-TLA-009","PDP-TLA-010"], total_records: 1000, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["TLA-TOP","TLA-MID","TLA-BOTTOM"] }
            ]
        },
        {
            field_name: "Prabumulih",
            structures_count: 17,
            structures: [
                // Beringin-A, Beringin-C, Beringin-D, Beringin-E, Beringin-F, Beringin-H, Gunung Kemala Barag, Gunung Kemala Tengah, Gunung Kemala Timur, Lembak, Ogan Timur, Prabumenang, Prabumulih Barat, Talang Jimar Barat, Talang Jimar Tengah, Talang Jimar Timur, Tanjung Tiga Barat
                { structure_name: "Beringin-A", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Beringin-A.xlsx", wells_count: 8, wells: ["PRB-BGA-001","PRB-BGA-002","PRB-BGA-003","PRB-BGA-004","PRB-BGA-005","PRB-BGA-006","PRB-BGA-007","PRB-BGA-008"], total_records: 800, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["BGA-TOP","BGA-MID","BGA-BOTTOM"] },
                { structure_name: "Beringin-C", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Beringin-C.xlsx", wells_count: 6, wells: ["PRB-BGC-001","PRB-BGC-002","PRB-BGC-003","PRB-BGC-004","PRB-BGC-005","PRB-BGC-006"], total_records: 600, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["BGC-UPPER","BGC-LOWER"] },
                { structure_name: "Beringin-D", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Beringin-D.xlsx", wells_count: 7, wells: ["PRB-BGD-001","PRB-BGD-002","PRB-BGD-003","PRB-BGD-004","PRB-BGD-005","PRB-BGD-006","PRB-BGD-007"], total_records: 700, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["BGD-TOP","BGD-MID","BGD-BOTTOM"] },
                { structure_name: "Beringin-E", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Beringin-E.xlsx", wells_count: 5, wells: ["PRB-BGE-001","PRB-BGE-002","PRB-BGE-003","PRB-BGE-004","PRB-BGE-005"], total_records: 500, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["BGE-UPPER","BGE-LOWER"] },
                { structure_name: "Beringin-F", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Beringin-F.xlsx", wells_count: 4, wells: ["PRB-BGF-001","PRB-BGF-002","PRB-BGF-003","PRB-BGF-004"], total_records: 400, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["BGF-TOP","BGF-BOTTOM"] },
                { structure_name: "Beringin-H", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Beringin-H.xlsx", wells_count: 3, wells: ["PRB-BGH-001","PRB-BGH-002","PRB-BGH-003"], total_records: 300, columns: ["DEPTH","GR","NPHI"], intervals: ["BGH-ZONE"] },
                { structure_name: "Gunung Kemala Barat", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Gunung Kemala Barat.xlsx", wells_count: 9, wells: ["PRB-GKB-001","PRB-GKB-002","PRB-GKB-003","PRB-GKB-004","PRB-GKB-005","PRB-GKB-006","PRB-GKB-007","PRB-GKB-008","PRB-GKB-009"], total_records: 900, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["GKB-TOP","GKB-MID","GKB-BOTTOM"] },
                { structure_name: "Gunung Kemala Tengah", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Gunung Kemala Tengah.xlsx", wells_count: 7, wells: ["PRB-GKT-001","PRB-GKT-002","PRB-GKT-003","PRB-GKT-004","PRB-GKT-005","PRB-GKT-006","PRB-GKT-007"], total_records: 700, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["GKT-UPPER","GKT-LOWER"] },
                { structure_name: "Gunung Kemala Timur", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Gunung Kemala Timur.xlsx", wells_count: 6, wells: ["PRB-GKM-001","PRB-GKM-002","PRB-GKM-003","PRB-GKM-004","PRB-GKM-005","PRB-GKM-006"], total_records: 600, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["GKM-TOP","GKM-BOTTOM"] },
                { structure_name: "Lembak", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Lembak.xlsx", wells_count: 12, wells: ["PRB-LBK-001","PRB-LBK-002","PRB-LBK-003","PRB-LBK-004","PRB-LBK-005","PRB-LBK-006","PRB-LBK-007","PRB-LBK-008","PRB-LBK-009","PRB-LBK-010","PRB-LBK-011","PRB-LBK-012"], total_records: 1200, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["LBK-TOP","LBK-MID","LBK-BOTTOM"] },
                { structure_name: "Ogan Timur", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Ogan Timur.xlsx", wells_count: 8, wells: ["PRB-OGT-001","PRB-OGT-002","PRB-OGT-003","PRB-OGT-004","PRB-OGT-005","PRB-OGT-006","PRB-OGT-007","PRB-OGT-008"], total_records: 800, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["OGT-ZONE-1","OGT-ZONE-2"] },
                { structure_name: "Prabumenang", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Prabumenang.xlsx", wells_count: 10, wells: ["PRB-PBM-001","PRB-PBM-002","PRB-PBM-003","PRB-PBM-004","PRB-PBM-005","PRB-PBM-006","PRB-PBM-007","PRB-PBM-008","PRB-PBM-009","PRB-PBM-010"], total_records: 1000, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["PBM-TOP","PBM-BOTTOM"] },
                { structure_name: "Prabumulih Barat", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Prabumulih Barat.xlsx", wells_count: 11, wells: ["PRB-PBB-001","PRB-PBB-002","PRB-PBB-003","PRB-PBB-004","PRB-PBB-005","PRB-PBB-006","PRB-PBB-007","PRB-PBB-008","PRB-PBB-009","PRB-PBB-010","PRB-PBB-011"], total_records: 1100, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["PBB-TOP","PBB-MID","PBB-BOTTOM"] },
                { structure_name: "Talang Jimar Barat", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Talang Jimar Barat.xlsx", wells_count: 5, wells: ["PRB-TJB-001","PRB-TJB-002","PRB-TJB-003","PRB-TJB-004","PRB-TJB-005"], total_records: 500, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["TJB-ZONE"] },
                { structure_name: "Talang Jimar Tengah", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Talang Jimar Tengah.xlsx", wells_count: 6, wells: ["PRB-TJT-001","PRB-TJT-002","PRB-TJT-003","PRB-TJT-004","PRB-TJT-005","PRB-TJT-006"], total_records: 600, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["TJT-UPPER","TJT-LOWER"] },
                { structure_name: "Talang Jimar Timur", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Talang Jimar Timur.xlsx", wells_count: 7, wells: ["PRB-TJM-001","PRB-TJM-002","PRB-TJM-003","PRB-TJM-004","PRB-TJM-005","PRB-TJM-006","PRB-TJM-007"], total_records: 700, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["TJM-TOP","TJM-BOTTOM"] },
                { structure_name: "Tanjung Tiga Barat", field_name: "Prabumulih", file_path: "/data/structures/Prabumulih/Tanjung Tiga Barat.xlsx", wells_count: 8, wells: ["PRB-TTB-001","PRB-TTB-002","PRB-TTB-003","PRB-TTB-004","PRB-TTB-005","PRB-TTB-006","PRB-TTB-007","PRB-TTB-008"], total_records: 800, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["TTB-TOP","TTB-MID","TTB-BOTTOM"] }
            ]
        },
        {
            field_name: "Ramba",
            structures_count: 3,
            structures: [
                //Bentayan, Mangunjaya, Ramba
                { structure_name: "Bentayan", field_name: "Ramba", file_path: "/data/structures/Ramba/Bentayan.xlsx", wells_count: 4, wells: ["RMB-BTN-001","RMB-BTN-002","RMB-BTN-003","RMB-BTN-004"], total_records: 400, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["BTN-TOP","BTN-BOTTOM"] },
                { structure_name: "Mangunjaya", field_name: "Ramba", file_path: "/data/structures/Ramba/Mangunjaya.xlsx", wells_count: 5, wells: ["RMB-MNJ-001","RMB-MNJ-002","RMB-MNJ-003","RMB-MNJ-004","RMB-MNJ-005"], total_records: 500, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["MNJ-TOP","MNJ-BOTTOM"] },
                { structure_name: "Ramba", field_name: "Ramba", file_path: "/data/structures/Ramba/Ramba.xlsx", wells_count: 6, wells: ["RMB-RMB-001","RMB-RMB-002","RMB-RMB-003","RMB-RMB-004","RMB-RMB-005","RMB-RMB-006"], total_records: 600, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["RMB-TOP","RMB-BOTTOM"] }
            ]
        }
    ],
    total_fields: 5,
    total_structures: 35
};

// Structures State
var structuresState = {
    selectedField: null,
    selectedStructure: null,
    fieldDetails: null,
    structureDetails: null,
    isLoadingField: false,
    isLoadingStructure: false
};

// Current page state
var currentPage = 'structures'; // 'structures' or 'dashboard'

// Structures Functions
function showPage(pageName) {
    console.log('Switching to page:', pageName);
    var structuresPage = document.getElementById('structuresPage');
    var dashboardPage = document.getElementById('dashboardPage');
    var dataPreparation = document.getElementById('dataPreparationPage');

    if (pageName === 'structures') {
        if (structuresPage) structuresPage.classList.remove('hidden');
        if (dashboardPage) dashboardPage.classList.add('hidden');
        if (dataPreparation) dataPreparation.classList.add('hidden');
        currentPage = 'structures';
    } else if (pageName === 'dashboard') {
        if (structuresPage) structuresPage.classList.add('hidden');
        if (dashboardPage) dashboardPage.classList.remove('hidden');
        if (dataPreparation) dataPreparation.classList.add('hidden');
        currentPage = 'dashboard';
    } else if (pageName === 'data-preparation') {
        if (structuresPage) structuresPage.classList.add('hidden');
        if (dashboardPage) dashboardPage.classList.add('hidden');
        if (dataPreparation) dataPreparation.classList.remove('hidden');
        currentPage = 'data-preparation';
        // Initialize data prep page when shown
        initializeDataPrepPage();
    }
}

function initializeStructuresPage() {
    console.log('Initializing structures page...');
    // Try loading structures from local data first
    loadStructuresFromFolder()
        .then(function(loaded) {
            if (!loaded) {
                // Fallback to bundled mock data
                console.warn('Using embedded structuresData mock');
            }
            renderFieldsList();
            showEmptyStructuresState();
            showEmptyDetailsState();
        });
}

// Load structures definition from /data/structures/index.json (served statically)
function loadStructuresFromFolder() {
    // Candidate static paths (relative + absolute variants) then backend endpoint
    var candidates = [
        'data/structures/index.json',
        'structures/index.json',
        '/webapps/webappv1/data/structures/index.json',
        '/webapps/webappv1/structures/index.json'
    ];
    var tried = [];
    function tryNext() {
        if (candidates.length === 0) {
            // Try backend endpoint before giving up
            return fetchJson('/get_structures_index')
                .then(function(resp){
                    if (resp && resp.status === 'success' && resp.data && Array.isArray(resp.data.fields)) {
                        structuresData = resp.data;
                        console.log('Loaded structures via backend endpoint fallback');
                        return true;
                    }
                    return false;
                })
                .catch(function(){ return false; });
        }
        var url = candidates.shift();
        tried.push(url);
        return fetch(url, { cache: 'no-cache' })
            .then(function(res){ if(!res.ok) throw new Error('HTTP '+res.status); return res.json(); })
            .then(function(json){
                if (json && json.fields && Array.isArray(json.fields)) {
                    structuresData = json;
                    console.log('Loaded structures from', url);
                    return true;
                }
                return tryNext();
            })
            .catch(function(err){
                console.warn('Fail path', url, '-', err.message || err);
                return tryNext();
            });
    }
    return tryNext();
}
// Original fields/structures rendering
function renderFieldsList() {
    var fieldsList = document.getElementById('fieldsList');
    fieldsList.innerHTML = '';
    
    structuresData.fields.forEach(function(field) {
        var fieldItem = document.createElement('button');
        fieldItem.className = 'field-item';
        fieldItem.setAttribute('data-field', field.field_name);
        
        fieldItem.innerHTML = 
            '<div class="field-info">' +
                '<svg class="field-icon" viewBox="0 0 24 24" fill="currentColor">' +
                    '<path d="M10 4H4c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm10 0h-6c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2 .89 2 2v6c0 1.11-.89 2-2 2z"/>' +
                '</svg>' +
                '<div class="field-details">' +
                    '<div class="field-name">' + field.field_name + '</div>' +
                    '<div class="field-count">' + field.structures.length + ' structures</div>' +
                '</div>' +
            '</div>';
        
        fieldItem.addEventListener('click', function() {
            handleFieldSelect(field.field_name);
        });
        
        fieldsList.appendChild(fieldItem);
    });
}

function handleFieldSelect(fieldName) {
    console.log('Field selected:', fieldName);
    
    // Update UI state
    structuresState.selectedField = fieldName;
    structuresState.selectedStructure = null;
    structuresState.structureDetails = null;
    
    // Update field selection UI
    var fieldItems = document.querySelectorAll('.field-item');
    fieldItems.forEach(function(item) {
        item.classList.remove('selected');
        if (item.getAttribute('data-field') === fieldName) {
            item.classList.add('selected');
        }
    });
    
    // Find field data
    var fieldData = structuresData.fields.find(function(f) {
        return f.field_name === fieldName;
    });
    
    if (fieldData) {
        structuresState.fieldDetails = {
            field_name: fieldName,
            structures: fieldData.structures,
            total_wells: fieldData.structures.reduce(function(sum, s) { return sum + s.wells_count; }, 0),
            total_records: fieldData.structures.reduce(function(sum, s) { return sum + s.total_records; }, 0)
        };
        
        renderStructuresList(fieldData.structures);
        showEmptyDetailsState();
        showMessage('Loaded ' + fieldData.structures.length + ' structures from ' + fieldName, 'success');
    }
}

function renderStructuresList(structures) {
    var structuresTitle = document.getElementById('structuresTitle');
    var structuresList = document.getElementById('structuresList');
    
    structuresTitle.textContent = 'Structures in "' + structuresState.selectedField + '"';
    
    var tableHTML = 
        '<div class="structures-table">' +
            '<table>' +
                '<thead>' +
                    '<tr>' +
                        '<th>Structure Name</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>';
    
    structures.forEach(function(structure) {
        tableHTML += 
            '<tr data-structure="' + structure.structure_name + '">' +
                '<td>' +
                    '<div class="structure-info">' +
                        '<svg class="structure-icon" viewBox="0 0 24 24" fill="currentColor">' +
                            '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>' +
                        '</svg>' +
                        '<div class="structure-details">' +
                            '<div class="structure-name">' + structure.structure_name + '</div>' +
                            (structure.error ? '<div class="structure-error">(Error loading)</div>' : '') +
                        '</div>' +
                    '</div>' +
                '</td>' +
            '</tr>';
    });
    
    tableHTML += '</tbody></table></div>';
    structuresList.innerHTML = tableHTML;
    
    // Add click handlers
    var structureRows = structuresList.querySelectorAll('tr[data-structure]');
    structureRows.forEach(function(row) {
        row.addEventListener('click', function() {
            var structureName = row.getAttribute('data-structure');
            handleStructureSelect(structureName);
        });
    });
}

// Handle selecting a structure in the table
function handleStructureSelect(structureName) {
    console.log('Structure selected:', structureName);
    structuresState.selectedStructure = structureName;

    // Highlight selected row
    var rows = document.querySelectorAll('#structuresList tr[data-structure]');
    rows.forEach(function(row) {
        if (row.getAttribute('data-structure') === structureName) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });

    // Find selected structure details
    var fieldData = structuresData.fields.find(function(f) { return f.field_name === structuresState.selectedField; });
    if (!fieldData) {
        showError('Field data not found');
        return;
    }
    var structure = fieldData.structures.find(function(s) { return s.structure_name === structureName; });
    if (!structure) {
        showError('Structure details not found');
        return;
    }

    structuresState.structureDetails = structure;
    renderStructureDetails(structure);

    // Persist selection for dashboard navigation
    var selectedInfo = {
        fieldName: structuresState.selectedField,
        structureName: structure.structure_name,
        filePath: structure.file_path,
        wells: structure.wells || [],
        columns: structure.columns || []
    };
    localStorage.setItem('selectedStructure', JSON.stringify(selectedInfo));
    console.log('Saved selectedStructure to localStorage:', selectedInfo);
}

function handleFieldSelect(fieldName) {
    console.log('Field selected:', fieldName);
    
    // Update UI state
    structuresState.selectedField = fieldName;
    structuresState.selectedStructure = null;
    structuresState.structureDetails = null;
    
    // Update field selection UI
    var fieldItems = document.querySelectorAll('.field-item');
    fieldItems.forEach(function(item) {
        item.classList.remove('selected');
        if (item.getAttribute('data-field') === fieldName) {
            item.classList.add('selected');
        }
    });
    
    // Find field data
    var fieldData = structuresData.fields.find(function(f) {
        return f.field_name === fieldName;
    });
    
    if (fieldData) {
        structuresState.fieldDetails = {
            field_name: fieldName,
            structures: fieldData.structures,
            total_wells: fieldData.structures.reduce(function(sum, s) { return sum + s.wells_count; }, 0),
            total_records: fieldData.structures.reduce(function(sum, s) { return sum + s.total_records; }, 0)
        };
        
        renderStructuresList(fieldData.structures);
        showEmptyDetailsState();
        showMessage('Loaded ' + fieldData.structures.length + ' structures from ' + fieldName, 'success');
    }
}

function renderStructureDetails(structure) {
    var detailsTitle = document.getElementById('detailsTitle');
    var structureDetails = document.getElementById('structureDetails');
    
    detailsTitle.textContent = 'Details for "' + structure.structure_name + '"';
    
    var detailsHTML = 
        '<div class="details-sections">' +
            // Basic Information
            '<div class="detail-section">' +
                '<h3>Basic Information</h3>' +
                '<div class="detail-grid">' +
                    '<div class="detail-item">' +
                        '<span>Field:</span>' +
                        '<span>' + structure.field_name + '</span>' +
                    '</div>' +
                    '<div class="detail-item">' +
                        '<span>Structure:</span>' +
                        '<span>' + structure.structure_name + '</span>' +
                    '</div>' +
                    '<div class="detail-item">' +
                        '<span>Wells Count:</span>' +
                        '<span>' + structure.wells_count + '</span>' +
                    '</div>' +
                    '<div class="detail-item">' +
                        '<span>Total Records:</span>' +
                        '<span>' + structure.total_records.toLocaleString() + '</span>' +
                    '</div>' +
                    '<div class="detail-item full-width">' +
                        '<span>File Path:</span>' +
                        '<span class="file-path">' + structure.file_path + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
    
    // Wells section
    if (structure.wells && structure.wells.length > 0) {
        detailsHTML += 
            '<div class="detail-section">' +
                '<h3>Wells (' + structure.wells_count + ')</h3>' +
                '<div class="wells-grid">';
        
        structure.wells.forEach(function(well) {
            detailsHTML += '<div class="well-item">' + well + '</div>';
        });
        
        detailsHTML += '</div></div>';
    }
    
    // Columns section
    detailsHTML += 
        '<div class="detail-section">' +
            '<h3>Available Columns (' + structure.columns.length + ')</h3>' +
            '<div class="columns-grid">';
    
    structure.columns.forEach(function(column) {
        var dataType = structure.data_types && structure.data_types[column] ? structure.data_types[column] : 'Unknown';
        detailsHTML += 
            '<div class="column-item">' +
                '<div class="column-name">' + column + '</div>' +
                '<div class="column-type">Type: ' + dataType + '</div>' +
            '</div>';
    });
    
    detailsHTML += '</div></div>';
    
    // Statistics section
    if (structure.statistics && Object.keys(structure.statistics).length > 0) {
        detailsHTML += 
            '<div class="detail-section">' +
                '<h3>Column Statistics</h3>' +
                '<div class="statistics-grid">';
        
        Object.entries(structure.statistics).forEach(function(entry) {
            var column = entry[0];
            var stats = entry[1];
            
            detailsHTML += 
                '<div class="statistic-item">' +
                    '<h4>' + column + '</h4>' +
                    '<div class="statistic-details">' +
                        '<div class="statistic-row">' +
                            '<span>Count:</span>' +
                            '<span>' + stats.count + '</span>' +
                        '</div>';
            
            if (stats.mean !== null && stats.mean !== undefined) {
                detailsHTML += 
                    '<div class="statistic-row">' +
                        '<span>Mean:</span>' +
                        '<span>' + stats.mean.toFixed(2) + '</span>' +
                    '</div>';
            }
            
            if (stats.min !== null && stats.min !== undefined) {
                detailsHTML += 
                    '<div class="statistic-row">' +
                        '<span>Min:</span>' +
                        '<span>' + stats.min + '</span>' +
                    '</div>';
            }
            
            if (stats.max !== null && stats.max !== undefined) {
                detailsHTML += 
                    '<div class="statistic-row">' +
                        '<span>Max:</span>' +
                        '<span>' + stats.max + '</span>' +
                    '</div>';
            }
            
            detailsHTML += '</div></div>';
        });
        
        detailsHTML += '</div></div>';
    }
    
    // Navigation button
    detailsHTML += 
        '<div class="detail-section">' +
            '<button class="btn-primary" onclick="navigateToDashboard()" style="width: 100%; padding: 1rem; font-size: 1rem;">' +
                'Go to Dashboard for Analysis' +
            '</button>' +
        '</div>';
    
    detailsHTML += '</div>';
    
    structureDetails.innerHTML = detailsHTML;
}

// Lightweight details panel for CSV-driven structures
// keep original detailed renderer

//Navigate To DataPreparationPage
function navigateToDataPreparation() {
    console.log('🚀 Navigating to data preparation from structures...');

    var savedStructure = localStorage.getItem('selectedStructure');
    if (savedStructure) {
        var info = JSON.parse(savedStructure);
        // Load wells into data preparation state
        appState.availableWells = info.wells || [];
        appState.selectedWells = [];
        appState.availableIntervals = [];
        appState.selectedIntervals = [];
    } else {
        console.error('🚀 No structure details available for navigation');
        showError('No structure selected. Please select a structure first.');
    }
}

// Navigete to DashbaordPage
function navigateToDashboard() {
    console.log('🚀 Navigating to dashboard from structures...');
    
    var savedStructure = localStorage.getItem('selectedStructure');
    if (savedStructure) {
        var info = JSON.parse(savedStructure);
        // Load wells into dashboard state
        appState.availableWells = info.wells || [];
        appState.selectedWells = [];
        appState.availableIntervals = [];
        appState.selectedIntervals = [];

        // Minimal structure context
        appState.currentStructure = {
            fieldName: info.fieldName,
            structureName: info.structureName,
            filePath: info.filePath,
            wells: info.wells,
            columns: info.columns || []
        };

        // Switch to dashboard
        showPage('dashboard');
        handleNavigation('/dashboard');
        
        // Initialize dashboard dengan data dari structure
        setTimeout(function() {
            renderWellList(appState.availableWells);
            clearIntervals();
            updateBadges();
            clearPlot();
            showSuccess('Dashboard loaded with ' + appState.availableWells.length + ' wells from ' + info.structureName);
        }, 100);
        
    } else {
        console.error('🚀 No structure details available for navigation');
        showError('No structure selected. Please select a structure first.');
    }
}

// Empty states for structures UI
function showEmptyStructuresState() {
    var structuresList = document.getElementById('structuresList');
    if (structuresList) {
        structuresList.innerHTML = '<div class="empty-state">Select a field to view structures</div>';
    }
}
function showEmptyDetailsState() {
    var details = document.getElementById('structureDetails');
    if (details) {
        details.innerHTML = '<div class="empty-state">Select a structure to view details</div>';
    }
}

// Navigation Functions
function handleNavigation(path) {
    console.log('Navigating to:', path);
    
    // Update active states
    var navButtons = document.querySelectorAll('.nav-btn, .mobile-nav-btn');
    navButtons.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.getAttribute('data-path') === path) {
            btn.classList.add('active');
        }
    });
    
    // Close mobile menu
    closeMobileMenu();
    
    // Handle different routes
    switch(path) {
        case '/structures':
            showPage('structures');
            showMessage('Structures page loaded', 'success');
            break;
        case '/datapreparation':
            showPage('data-preparation');
            showSuccess('Data preparation page loaded');
            break;
        case '/dashboard':
            showPage('dashboard');
            // Check if we have structure data to load
            if (!appState.currentStructure) {
                var savedStructure = localStorage.getItem('selectedStructure');
                if (savedStructure) {
                    var structureInfo = JSON.parse(savedStructure);
                    appState.currentStructure = {
                        fieldName: structureInfo.fieldName,
                        structureName: structureInfo.structureName,
                        filePath: structureInfo.filePath,
                        wells: structureInfo.wells || [],
                        columns: structureInfo.columns || []
                    };
                }
            }
            if (appState.currentStructure && (!appState.availableWells || appState.availableWells.length === 0)) {
                appState.availableWells = (appState.currentStructure.wells || []);
                renderWellList(appState.availableWells);
                updateBadges();
                showSuccess('Dashboard loaded with data from ' + appState.currentStructure.structureName);
            } else if (!appState.currentStructure) {
                showMessage('Dashboard loaded - select a structure first to load well data', 'info');
            } else {
                showSuccess('Dashboard page loaded');
            }
            break;
        default:
            showMessage('Page not implemented: ' + path, 'warning');
    }
}

function setupNavigation() {
    console.log('Setting up navigation...');
    
    // Desktop navigation
    var navButtons = document.querySelectorAll('.nav-btn');
    console.log('Found', navButtons.length, 'navigation buttons');
    
    navButtons.forEach(function(button, index) {
        var path = button.getAttribute('data-path');
        
        button.addEventListener('click', function(e) {
            console.log('Navigation clicked:', path);
            e.preventDefault();
            if (path) {
                handleNavigation(path);
            }
        });
    });
    
    // Mobile navigation
    var mobileNavButtons = document.querySelectorAll('.mobile-nav-btn');
    mobileNavButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var path = button.getAttribute('data-path');
            if (path) {
                handleNavigation(path);
            }
        });
    });
    
    // Mobile menu toggle
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var mobileMenuClose = document.getElementById('mobileMenuClose');
    var mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function(e) {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });
    }
}

function openMobileMenu() {
    var overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function closeMobileMenu() {
    var overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Dropdown Functions
function setupDropdowns() {
    var dropdownButtons = document.querySelectorAll('.dropdown-btn');
    dropdownButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var moduleName = button.getAttribute('data-module');
            var dropdownContent = document.querySelector('.dropdown-content[data-parent="' + moduleName + '"]');
            
            if (dropdownContent) {
                var isHidden = dropdownContent.classList.contains('hidden');
                
                // Close all other dropdowns
                var allDropdowns = document.querySelectorAll('.dropdown-content');
                allDropdowns.forEach(function(dropdown) {
                    dropdown.classList.add('hidden');
                });
                
                var allDropdownBtns = document.querySelectorAll('.dropdown-btn');
                allDropdownBtns.forEach(function(btn) {
                    btn.classList.remove('expanded');
                });
                
                // Toggle current dropdown
                if (isHidden) {
                    dropdownContent.classList.remove('hidden');
                    button.classList.add('expanded');
                } else {
                    dropdownContent.classList.add('hidden');
                    button.classList.remove('expanded');
                }
            }
        });
    });
    
    // Handle sub-module clicks
    var subModuleButtons = document.querySelectorAll('.sub-module-btn');
    subModuleButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var moduleName = button.getAttribute('data-module');
            if (moduleName) {
                // Update active states
                subModuleButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                loadModule(moduleName);
            }
        });
    });
}

// Update badge counts
function updateBadges() {
    var wellsBadge = document.getElementById('wellsBadge');
    var intervalsBadge = document.getElementById('intervalsBadge');
    var selectedWellsCount = document.getElementById('selectedWellsCount');
    var selectedIntervalsCount = document.getElementById('selectedIntervalsCount');
    
    if (wellsBadge) {
        wellsBadge.textContent = appState.selectedWells.length + '/' + appState.availableWells.length;
    }
    
    if (intervalsBadge) {
        intervalsBadge.textContent = appState.selectedIntervals.length + '/' + appState.availableIntervals.length;
    }
    
    if (selectedWellsCount) {
        selectedWellsCount.textContent = appState.selectedWells.length;
    }
    
    if (selectedIntervalsCount) {
        selectedIntervalsCount.textContent = appState.selectedIntervals.length;
    }
}

// Plot type handling
function setupPlotTypeSelect() {
    var plotTypeSelect = document.getElementById('plotTypeSelect');
    if (plotTypeSelect) {
        plotTypeSelect.addEventListener('change', function() {
            appState.plotType = plotTypeSelect.value;
            showMessage('Plot type changed to: ' + plotTypeSelect.value, 'info');
        });
    }
}

// Analysis tools handling
function setupAnalysisTools() {
    var toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var tool = button.getAttribute('data-tool');
            if (tool) {
                showMessage('Opening ' + tool + ' tool...', 'info');
                // Add tool-specific logic here
            }
        });
    });
}

// Improved fetchJson with Dataiku backend URL support, better error handling, and fallback
function fetchJson(endpoint, options) {
    options = options || {};
    
    var defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    };
    
    // Merge options
    var finalOptions = {
        method: options.method || 'GET',
        headers: Object.assign({}, defaultOptions.headers, options.headers || {}),
        credentials: defaultOptions.credentials
    };
    
    if (options.body) {
        finalOptions.body = options.body;
    }

    // Use Dataiku helper when available to build the correct backend URL
    var useDataiku = (typeof window !== 'undefined') && window.dataiku && typeof window.dataiku.getWebAppBackendUrl === 'function';
    var url = useDataiku ? window.dataiku.getWebAppBackendUrl(endpoint) : endpoint;

    console.log('Making API call to:', url, '(raw endpoint:', endpoint + ') with options:', finalOptions);
    
    return fetch(url, finalOptions)
        .then(function(response) {
            console.log('Response status:', response.status, 'OK:', response.ok);
            
            // If response is not OK (e.g., 404, 500), try to use mock data
            if (!response.ok) {
                console.warn('Server responded with status ' + response.status + ' for ' + endpoint + '. Attempting to use mock data.');
                // For 404 or other server errors, directly return mock data
                return getMockResponse(endpoint, options); 
            }
            
            // If response is OK, parse JSON
            return response.text().then(function(text) {
                console.log('Response text:', text.substring(0, 200) + '...');
                try {
                    return JSON.parse(text);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Invalid JSON response from server');
                }
            });
        })
        .catch(function(error) {
            console.error('Fetch error for', endpoint, ':', error);
            
            // This catch block is primarily for network errors (e.g., server unreachable)
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                console.warn('Backend not available (network error), using mock data for:', endpoint);
                return getMockResponse(endpoint, options);
            }
            
            throw error; // Re-throw other unexpected errors
        });
}

// Mock response generator - Updated to match actual backend
function getMockResponse(endpoint, options) {
    console.log('Generating mock response for:', endpoint);
    
    switch (endpoint) {
        case '/first_api_call':
            return {
                status: 'success',
                message: 'Well Log Analysis backend is running',
                timestamp: new Date().toISOString(),
                backend_version: '1.0.0-mock',
                current_dataset: 'fix_pass_qc',
                dataset_loaded: true,
                wells: mockData.wells,
                well_count: mockData.wells.length,
                total_rows: 1000
            };
            
        case '/get_wells':
            return {
                status: 'success',
                wells: mockData.wells,
                count: mockData.wells.length
            };
            
        case '/get_markers':
            // Return structure-specific intervals if we have structure context
            if (appState.currentStructure) {
                var structureData = findStructureData(appState.currentStructure.fieldName, appState.currentStructure.structureName);
                if (structureData && structureData.intervals) {
                    return {
                        status: 'success',
                        markers: structureData.intervals,
                        count: structureData.intervals.length
                    };
                }
            }
            return {
                status: 'success',
                markers: mockData.markers,
                count: mockData.markers.length
            };
            
        case '/get_well_plot':
            var requestData = options.body ? JSON.parse(options.body) : {};
            return {
                status: 'success',
                figure: mockData.plotData,
                well_name: requestData.well_name || 'MOCK-WELL'
            };
            
        case '/select_dataset':
            return {
                status: 'success',
                dataset_name: 'fix_pass_qc',
                wells: mockData.wells,
                markers: mockData.markers,
                columns: ['WELL_NAME', 'DEPTH', 'GR', 'RT', 'NPHI', 'RHOB', 'MARKER'],
                total_rows: 1000,
                message: 'Mock dataset selected successfully'
            };
            
        case '/get_calculation_params':
            var requestData = options.body ? JSON.parse(options.body) : {};
            var calculationType = requestData.calculation_type;
            return getMockCalculationParams(calculationType);
            
        case '/run_calculation_endpoint':
            var requestData = options.body ? JSON.parse(options.body) : {};
            return {
                status: 'success',
                message: requestData.calculation_type + ' calculation completed (mock)',
                calculation_type: requestData.calculation_type,
                rows_processed: 1000
            };
            
        case '/get_plot_for_calculation':
            var requestData = options.body ? JSON.parse(options.body) : {};
            return {
                status: 'success',
                figure: mockData.plotData,
                calculation_type: requestData.calculation_type
            };
            
        case '/get_dataset_info':
            return {
                status: 'success',
                info: {
                    dataset_name: 'fix_pass_qc',
                    total_rows: 1000,
                    columns: ['WELL_NAME', 'DEPTH', 'GR', 'RT', 'NPHI', 'RHOB', 'MARKER'],
                    wells: mockData.wells,
                    markers: mockData.markers,
                    depth_range: { min: 3000, max: 4000 }
                }
            };
            
        case '/get_available_columns':
            return {
                status: 'success',
                columns: ['WELL_NAME', 'DEPTH', 'GR', 'RT', 'NPHI', 'RHOB', 'MARKER', 'VSH_GR', 'PHIE', 'SW']
            };
            
        case '/validate_calculation':
            var requestData = options.body ? JSON.parse(options.body) : {};
            return {
                status: 'success',
                message: 'All required columns available for ' + requestData.calculation_type,
                required_columns: getRequiredColumns(requestData.calculation_type)
            };
            
        case '/get_current_status':
            return {
                status: 'success',
                dataset_loaded: true,
                current_dataset: 'fix_pass_qc',
                wells: mockData.wells,
                well_count: mockData.wells.length,
                markers: mockData.markers,
                marker_count: mockData.markers.length,
                total_rows: 1000
            };
            
        default:
            return {
                status: 'error',
                message: 'Mock endpoint not implemented: ' + endpoint
            };
    }
}

// Helper function for mock calculation parameters
function getMockCalculationParams(calculationType) {
    var parameterDefinitions = {
        "vsh": {
            "title": "VSH Calculation Parameters",
            "parameters": [
                {"name": "GR_MA", "type": "float", "default": 30, "label": "GR Matrix Value", "min": 0, "max": 200},
                {"name": "GR_SH", "type": "float", "default": 120, "label": "GR Shale Value", "min": 0, "max": 300},
                {"name": "input_log", "type": "select", "default": "GR", "label": "Input Log", "options": ["GR", "CGR", "SGR"]},
                {"name": "output_log", "type": "text", "default": "VSH_GR", "label": "Output Log Name"}
            ]
        },
        "porosity": {
            "title": "Porosity Calculation Parameters",
            "parameters": [
                {"name": "PHIE_METHOD", "type": "select", "default": "density", "label": "Porosity Method", "options": ["density", "neutron", "combined"]},
                {"name": "RHO_MA", "type": "float", "default": 2.65, "label": "Matrix Density", "min": 1.0, "max": 4.0},
                {"name": "RHO_FL", "type": "float", "default": 1.0, "label": "Fluid Density", "min": 0.5, "max": 2.0},
                {"name": "NPHI_MA", "type": "float", "default": 0.0, "label": "Matrix Neutron", "min": 0.0, "max": 1.0}
            ]
        },
        "gsa": {
            "title": "GSA Calculation Parameters",
            "parameters": [
                {"name": "window_size", "type": "int", "default": 50, "label": "Window Size", "min": 10, "max": 200},
                {"name": "overlap", "type": "int", "default": 25, "label": "Overlap", "min": 5, "max": 100},
                {"name": "min_samples", "type": "int", "default": 10, "label": "Minimum Samples", "min": 5, "max": 50}
            ]
        },
        "sw": {
            "title": "Water Saturation Calculation Parameters",
            "parameters": [
                {"name": "rw", "type": "float", "default": 0.1, "label": "Water Resistivity", "min": 0.001, "max": 10},
                {"name": "a", "type": "float", "default": 1.0, "label": "Archie's 'a'", "min": 0.1, "max": 10},
                {"name": "m", "type": "float", "default": 2.0, "label": "Archie's 'm'", "min": 1.0, "max": 5.0},
                {"name": "n", "type": "float", "default": 2.0, "label": "Archie's 'n'", "min": 1.0, "max": 5.0}
            ]
        },
        "normalization": {
            "title": "Interval Normalization Parameters",
            "parameters": [
                {"name": "LOG_IN", "type": "select", "default": "GR", "label": "Input Log", "options": ["GR", "CGR", "SGR", "NPHI", "RHOB"]},
                {"name": "LOG_OUT", "type": "text", "default": "GR_NORM", "label": "Output Log Name"},
                {"name": "LOW_REF", "type": "float", "default": 40, "label": "Low Reference", "min": 0, "max": 1000},
                {"name": "HIGH_REF", "type": "float", "default": 140, "label": "High Reference", "min": 0, "max": 1000},
                {"name": "LOW_IN", "type": "int", "default": 3, "label": "Low Percentile", "min": 0, "max": 50},
                {"name": "HIGH_IN", "type": "int", "default": 97, "label": "High Percentile", "min": 50, "max": 100},
                {"name": "CUTOFF_MIN", "type": "float", "default": 0.0, "label": "Cutoff Min", "min": -1000, "max": 1000},
                {"name": "CUTOFF_MAX", "type": "float", "default": 250.0, "label": "Cutoff Max", "min": -1000, "max": 1000}
            ]
        }
    };
    
    if (calculationType && parameterDefinitions[calculationType]) {
        return {
            status: 'success',
            calculation_type: calculationType,
            parameters: parameterDefinitions[calculationType]
        };
    } else {
        return {
            status: 'error',
            message: 'Unknown calculation type: ' + calculationType
        };
    }
}

// Helper function for required columns
function getRequiredColumns(calculationType) {
    var requirements = {
        "vsh": ["GR"],
        "porosity": ["NPHI", "RHOB"],
        "gsa": ["GR", "RT", "NPHI", "RHOB"],
        "sw": ["RT", "PHIE"],
        "normalization": ["GR", "MARKER"]
    };
    
    return requirements[calculationType] || [];
}

// Add connection test function
function testBackendConnection() {
    console.log('Testing backend connection...');
    updateStatus('Testing connection...');

    // Try a simple fetch to test connectivity using the same helper
    return fetchJson('/first_api_call')
        .then(function(response) {
            if (response && response.status === 'success') {
                console.log('✅ Backend connection successful');
                updateStatus('Backend connected');
                showSuccess('Backend connection established');
                return true;
            }
            throw new Error('Unexpected response');
        })
        .catch(function(error) {
            console.log('❌ Backend connection failed:', error.message);
            updateStatus('Using mock data');
            showWarning('Backend not available - using mock data for testing');
            return false;
        });
}

// UI Management Functions
function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
    updateStatus('Processing...');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
    updateStatus('Ready');
}

function updateStatus(message) {
    document.getElementById('statusText').textContent = message;
}

function showMessage(message, type, allowHtml) {
    type = type || 'info';
    var mainContent = document.getElementById('mainContent') || document.getElementById('dataPrepMainContent');
    if (!mainContent) return;
    
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + type + '-message';
    
    if (allowHtml && message.includes('<br>')) {
        messageDiv.innerHTML = message;
    } else {
        messageDiv.textContent = message;
    }
    
    // Insert at the top of main content
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(function() {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showWarning(message) {
    showMessage(message, 'warning');
}

// Well Management Functions
function loadWells() {
    showLoading();
    
    fetchJson('/get_wells')
        .then(function(response) {
            if (response.status === 'success') {
                appState.availableWells = response.wells;
                renderWellList(response.wells);
                updateBadges();
                showSuccess('Loaded ' + response.wells.length + ' wells');
            } else {
                throw new Error(response.message || 'Failed to load wells');
            }
        })
        .catch(function(error) {
            console.error('Error loading wells:', error);
            showError('Failed to load wells: ' + error.message);
        })
        .finally(function() {
            hideLoading();
        });
}

function renderWellList(wells) {
    var wellList = document.getElementById('wellList');
    wellList.innerHTML = '';
    
    if (wells.length === 0) {
        wellList.innerHTML = '<div class="empty-state">No wells available</div>';
        return;
    }
    
    wells.forEach(function(wellName) {
        var wellItem = document.createElement('div');
        wellItem.className = 'list-item';
        wellItem.setAttribute('data-id', wellName);
        
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'well-' + wellName;
        checkbox.checked = appState.selectedWells.indexOf(wellName) !== -1;
        
        var label = document.createElement('label');
        label.htmlFor = 'well-' + wellName;
        label.textContent = wellName;
        
        var statusDot = document.createElement('div');
        statusDot.className = 'status-dot';
        statusDot.style.display = checkbox.checked ? 'block' : 'none';
        
        wellItem.appendChild(checkbox);
        wellItem.appendChild(label);
        wellItem.appendChild(statusDot);
        
        // Add click event listener
        wellItem.addEventListener('click', function(e) {
            var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            // If the click originated from the checkbox or its label, let the checkbox change handler manage it
            if (e.target === checkbox || tag === 'label') {
                return;
            }
            // Toggle manually when clicking the row
            checkbox.checked = !checkbox.checked;
            toggleWell(wellName);
        });
        
        checkbox.addEventListener('change', function(e) {
            // Prevent bubbling to parent click handler to avoid double toggling
            e.stopPropagation();
            toggleWell(wellName);
        });
        
        wellList.appendChild(wellItem);
    });
}

function toggleWell(wellId) {
    console.log('Toggling well:', wellId);
    
    var index = appState.selectedWells.indexOf(wellId);
    if (index === -1) {
        appState.selectedWells.push(wellId);
        loadWellPlot(wellId);
    } else {
        appState.selectedWells.splice(index, 1);
        if (appState.selectedWells.length === 0) {
            clearPlot();
            clearIntervals();
        } else {
            // Load plot for the last selected well
            var lastWell = appState.selectedWells[appState.selectedWells.length - 1];
            loadWellPlot(lastWell);
        }
    }
    
    updateWellSelection();
    updateIntervalsForSelectedWells();
    updateBadges();
}

// Enhanced plot loading dengan structure context
function loadWellPlot(wellName) {
    console.log('🚀 Loading plot for well:', wellName);
    setIsLoading(true);
    setError(null);
    
    // Prepare request data with structure context
    var requestData = {
        well_name: wellName
    };
    
    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = {
            field_name: appState.currentStructure.fieldName,
            structure_name: appState.currentStructure.structureName,
            file_path: appState.currentStructure.filePath,
            wells: appState.currentStructure.wells,
            columns: appState.currentStructure.columns
        };
        console.log('🚀 Adding structure context:', requestData.structure_context);
    }
    
    fetchJson('/get_well_plot', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        console.log('🚀 Plot response received:', response);
        if (response.status === 'success' && response.figure) {
            // Handle different response formats
            var plotObject;
            if (typeof response.figure === 'string') {
                plotObject = JSON.parse(response.figure);
            } else {
                plotObject = response.figure;
            }
            
            // Update plot state
            appState.plotFigure = {
                data: plotObject.data || [],
                layout: plotObject.layout || {}
            };
            
            createPlot(plotObject);
            
            var contextMsg = appState.currentStructure ? 
                ' from ' + appState.currentStructure.structureName : '';
            showSuccess('Plot loaded for well: ' + wellName + contextMsg);
        } else {
            throw new Error(response.message || 'Failed to load plot');
        }
    })
    .catch(function(error) {
        console.error('🚀 Error loading well plot:', error);
        setError(error.message);
        showError('Error loading well plot: ' + error.message);
    })
    .finally(function() {
        setIsLoading(false);
    });
}

// Helper function untuk menentukan endpoint berdasarkan plot type
function getPlotEndpoint(plotType) {
    switch (plotType) {
        case 'normalization':
            return '/api/get-normalization-plot';
        case 'smoothing':
            return '/api/get-smoothing-plot';
        case 'splicing':
            return '/api/get-splicing-plot';
        case 'porosity':
            return '/api/get-porosity-plot';
        case 'gsa':
            return '/api/get-gsa-plot';
        case 'vsh':
            return '/api/get-vsh-plot';
        case 'sw':
            return '/api/get-sw-plot';
        case 'rwa':
            return '/api/get-rwa-plot';
        case 'module2':
            return '/api/get-module2-plot';
        case 'rpbe-rgbe':
            return '/api/get-rgbe-rpbe-plot';
        case 'iqual':
            return '/api/get-iqual';
        case 'swgrad':
            return '/api/get-swgrad-plot';
        case 'dns-dnsv':
            return '/api/get-dns-dnsv-plot';
        case 'rt-ro':
            return '/api/get-rt-r0-plot';
        case 'get-module1-plot':
            return '/api/get-module1-plot';
        case 'default':
        default:
            return '/get_well_plot';
    }
}

// Enhanced error handling functions
function setError(message) {
    appState.error = message;
    if (message) {
        showError(message);
    }
}

function setIsLoading(loading) {
    appState.isLoading = loading;
    if (loading) {
        showLoading();
    } else {
        hideLoading();
    }
}

function updateWellSelection() {
    var wellItems = document.querySelectorAll('#wellList .list-item');
    wellItems.forEach(function(item) {
        var wellId = item.getAttribute('data-id');
        var checkbox = item.querySelector('input[type="checkbox"]');
        var statusDot = item.querySelector('.status-dot');
        
        if (appState.selectedWells.indexOf(wellId) !== -1) {
            item.classList.add('selected');
            if (checkbox) checkbox.checked = true;
            if (statusDot) statusDot.style.display = 'block';
        } else {
            item.classList.remove('selected');
            if (checkbox) checkbox.checked = false;
            if (statusDot) statusDot.style.display = 'none';
        }
    });
    
    // Update select all checkbox
    var selectAllCheckbox = document.getElementById('selectAllWells');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = appState.selectedWells.length === appState.availableWells.length;
    }
}

function toggleAllWells() {
    var checkbox = document.getElementById('selectAllWells');
    
    if (checkbox.checked) {
        // Select all wells
        appState.selectedWells = appState.availableWells.slice(); // Copy array
        if (appState.selectedWells.length > 0) {
            loadWellPlot(appState.selectedWells[0]);
        }
    } else {
        // Deselect all wells
        appState.selectedWells = [];
        clearPlot();
        clearIntervals();
    }
    
    updateWellSelection();
    updateIntervalsForSelectedWells();
    updateBadges();
}

// Update intervals berdasarkan structure yang dipilih
function updateIntervalsForSelectedWells() {
    console.log('📋 Updating intervals for selected wells:', appState.selectedWells);
    if (appState.selectedWells.length === 0) {
        console.log('📋 No wells selected, clearing intervals');
        clearIntervals();
        return;
    }

    // Always load intervals/markers from CSV via backend
    fetchJson('/get_markers')
    .then(function(response) {
        if (response.status === 'success') {
            appState.availableIntervals = response.markers;
            renderIntervalList(response.markers);
            updateBadges();
        } else {
            throw new Error(response.message || 'Failed to load intervals');
        }
    })
    .catch(function(error) {
        console.error('Error loading intervals:', error);
        showError('Error loading intervals: ' + error.message);
    });
}

// Helper function untuk mencari structure data pada mock
function findStructureData(fieldName, structureName) {
    if (!fieldName || !structureName) return null;
    var field = structuresData.fields.find(function(f) { return f.field_name === fieldName; });
    if (!field) return null;
    var structure = field.structures.find(function(s) { return s.structure_name === structureName; });
    return structure || null;
}

function renderIntervalList(intervals) {
    var intervalList = document.getElementById('intervalList');
    intervalList.innerHTML = '';
    
    if (intervals.length === 0) {
        intervalList.innerHTML = '<div class="empty-state">No intervals available</div>';
        return;
    }
    
    intervals.forEach(function(intervalName) {
        var intervalItem = document.createElement('div');
        intervalItem.className = 'list-item';
        intervalItem.setAttribute('data-id', intervalName);
        
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'interval-' + intervalName;
        checkbox.checked = appState.selectedIntervals.indexOf(intervalName) !== -1;
        
        var label = document.createElement('label');
        label.htmlFor = 'interval-' + intervalName;
        label.textContent = intervalName;
        
        var statusDot = document.createElement('div');
        statusDot.className = 'status-dot';
        statusDot.style.display = checkbox.checked ? 'block' : 'none';
        
        intervalItem.appendChild(checkbox);
        intervalItem.appendChild(label);
        intervalItem.appendChild(statusDot);
        
        // Add click event listener
        intervalItem.addEventListener('click', function(e) {
            var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (e.target === checkbox || tag === 'label') {
                return;
            }
            checkbox.checked = !checkbox.checked;
            toggleInterval(intervalName);
        });
        
        checkbox.addEventListener('change', function(e) {
            e.stopPropagation();
            toggleInterval(intervalName);
        });
        
        intervalList.appendChild(intervalItem);
    });
}

function toggleInterval(intervalId) {
    console.log('Toggling interval:', intervalId);
    
    var index = appState.selectedIntervals.indexOf(intervalId);
    if (index === -1) {
        appState.selectedIntervals.push(intervalId);
    } else {
        appState.selectedIntervals.splice(index, 1);
    }
    
    updateIntervalSelection();
    updateBadges();
}

function updateIntervalSelection() {
    var intervalItems = document.querySelectorAll('#intervalList .list-item');
    intervalItems.forEach(function(item) {
        var intervalId = item.getAttribute('data-id');
        var checkbox = item.querySelector('input[type="checkbox"]');
        var statusDot = item.querySelector('.status-dot');
        
        if (appState.selectedIntervals.indexOf(intervalId) !== -1) {
            item.classList.add('selected');
            if (checkbox) checkbox.checked = true;
            if (statusDot) statusDot.style.display = 'block';
        } else {
            item.classList.remove('selected');
            if (checkbox) checkbox.checked = false;
            if (statusDot) statusDot.style.display = 'none';
        }
    });
    
    // Update select all checkbox
    var selectAllCheckbox = document.getElementById('selectAllIntervals');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = appState.selectedIntervals.length === appState.availableIntervals.length;
    }
}

function toggleAllIntervals() {
    var checkbox = document.getElementById('selectAllIntervals');
    
    if (checkbox.checked) {
        appState.selectedIntervals = appState.availableIntervals.slice(); // Copy array
    } else {
        appState.selectedIntervals = [];
    }
    
    updateIntervalSelection();
    updateBadges();
}

function clearIntervals() {
    var intervalList = document.getElementById('intervalList');
    intervalList.innerHTML = '<div class="empty-state">Select wells to view intervals</div>';
    appState.selectedIntervals = [];
    appState.availableIntervals = [];
    updateBadges();
}

// Plot Management Functions
function createPlot(figureData) {
    var plotArea = document.getElementById('plotArea');
    
    if (!plotArea) {
        console.error('Plot area not found');
        return;
    }
    
    // Clear existing content
    plotArea.innerHTML = '';
    
    try {
        // Normalize layout to fit container height
        figureData = figureData || { data: [], layout: {} };
        figureData.layout = figureData.layout || {};
        // Remove any fixed width/height from backend
        if (figureData.layout.height) delete figureData.layout.height;
        if (figureData.layout.width) delete figureData.layout.width;
        figureData.layout.autosize = true;
        // Optional margins to avoid clipping modebar/title
        figureData.layout.margin = Object.assign({ t: 40, r: 20, b: 40, l: 50 }, figureData.layout.margin || {});
        
        var config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            toImageButtonOptions: {
                format: 'png',
                filename: 'well_log_plot',
                height: 1200,
                width: 1000,
                scale: 1
            }
        };
        // Set height to container height to ensure full visibility
        var containerHeight = plotArea.clientHeight || plotArea.getBoundingClientRect().height;
        if (containerHeight && containerHeight > 0) {
            figureData.layout.height = containerHeight;
        }
        
        Plotly.newPlot(plotArea, figureData.data, figureData.layout, config).then(function(){
            // Keep plot fitting on resize
            function handleResize() {
                var h = plotArea.clientHeight || plotArea.getBoundingClientRect().height;
                if (h && h > 0) {
                    Plotly.relayout(plotArea, { height: h });
                } else {
                    Plotly.Plots.resize(plotArea);
                }
            }
            window.addEventListener('resize', handleResize);
        });
        console.log('Plot created successfully');
    } catch (error) {
        console.error('Error creating plot:', error);
        showError('Error creating plot: ' + error.message);
    }
}

function clearPlot() {
    var plotArea = document.getElementById('plotArea');
    if (plotArea) {
        plotArea.innerHTML = '<div class="empty-plot-state"><h3>Select a well to view log data</h3><p>Choose one or more wells from the left sidebar to begin analysis</p></div>';
    }
}

// Get calculation parameters from backend
function getCalculationParameters(calculationType) {
    console.log('Getting calculation parameters for:', calculationType);
    
    // Mock parameters for different calculation types
    var mockParameters = {
        'normalization': {
            title: 'Normalization Parameters',
            parameters: [
                { name: 'NORMALIZATION_METHOD', label: 'Normalization Method', type: 'select', options: ['Min-Max', 'Z-Score', 'Robust'], default_value: 'Min-Max', required: true },
                { name: 'TARGET_COLUMN', label: 'Target Column', type: 'select', options: ['GR', 'NPHI', 'RHOB', 'RT'], default_value: 'GR', required: true }
            ]
        },
        'gsa': {
            title: 'Gamma Ray Shale Analysis (GSA) Parameters',
            parameters: [
                { name: 'GR_COLUMN', label: 'Gamma Ray Column', type: 'select', options: ['GR', 'CGR'], default_value: 'GR', required: true },
                { name: 'GR_CLEAN', label: 'Clean Gamma Ray Value', type: 'number', default_value: 30, required: true },
                { name: 'GR_SHALE', label: 'Shale Gamma Ray Value', type: 'number', default_value: 150, required: true }
            ]
        },
        'rgsa': {
            title: 'Resistivity Gamma Ray Shale Analysis (RGSA) Parameters', 
            parameters: [
                { name: 'GR_COLUMN', label: 'Gamma Ray Column', type: 'select', options: ['GR', 'CGR'], default_value: 'GR', required: true },
                { name: 'RT_COLUMN', label: 'Resistivity Column', type: 'select', options: ['RT', 'ILD', 'RD'], default_value: 'RT', required: true },
                { name: 'GR_CLEAN', label: 'Clean GR Value', type: 'number', default_value: 30, required: true },
                { name: 'GR_SHALE', label: 'Shale GR Value', type: 'number', default_value: 150, required: true },
                { name: 'RT_CLEAN', label: 'Clean RT Value', type: 'number', default_value: 100, required: true },
                { name: 'RT_SHALE', label: 'Shale RT Value', type: 'number', default_value: 2, required: true }
            ]
        },
        'dgsa': {
            title: 'Density Gamma Ray Shale Analysis (DGSA) Parameters',
            parameters: [
                { name: 'GR_COLUMN', label: 'Gamma Ray Column', type: 'select', options: ['GR', 'CGR'], default_value: 'GR', required: true },
                { name: 'RHOB_COLUMN', label: 'Density Column', type: 'select', options: ['RHOB', 'RHOZ'], default_value: 'RHOB', required: true },
                { name: 'GR_CLEAN', label: 'Clean GR Value', type: 'number', default_value: 30, required: true },
                { name: 'GR_SHALE', label: 'Shale GR Value', type: 'number', default_value: 150, required: true },
                { name: 'RHOB_CLEAN', label: 'Clean Density Value', type: 'number', default_value: 2.65, required: true },
                { name: 'RHOB_SHALE', label: 'Shale Density Value', type: 'number', default_value: 2.2, required: true }
            ]
        },
        'ngsa': {
            title: 'Neutron Gamma Ray Shale Analysis (NGSA) Parameters',
            parameters: [
                { name: 'GR_COLUMN', label: 'Gamma Ray Column', type: 'select', options: ['GR', 'CGR'], default_value: 'GR', required: true },
                { name: 'NPHI_COLUMN', label: 'Neutron Column', type: 'select', options: ['NPHI', 'TNPH'], default_value: 'NPHI', required: true },
                { name: 'GR_CLEAN', label: 'Clean GR Value', type: 'number', default_value: 30, required: true },
                { name: 'GR_SHALE', label: 'Shale GR Value', type: 'number', default_value: 150, required: true },
                { name: 'NPHI_CLEAN', label: 'Clean Neutron Value', type: 'number', default_value: 0.05, required: true },
                { name: 'NPHI_SHALE', label: 'Shale Neutron Value', type: 'number', default_value: 0.35, required: true }
            ]
        },
        'vsh_calculation': {
            title: 'Volume of Shale (Vsh) Parameters',
            parameters: [
                { name: 'GR_COLUMN', label: 'Gamma Ray Column', type: 'select', options: ['GR', 'CGR'], default_value: 'GR', required: true },
                { name: 'VSH_METHOD', label: 'Vsh Method', type: 'select', options: ['Linear', 'Larionov-Older', 'Larionov-Tertiary', 'Clavier'], default_value: 'Linear', required: true },
                { name: 'GR_CLEAN', label: 'Clean GR Value', type: 'number', default_value: 30, required: true },
                { name: 'GR_SHALE', label: 'Shale GR Value', type: 'number', default_value: 150, required: true }
            ]
        },
        'porosity_calculation': {
            title: 'Porosity Calculation Parameters',
            parameters: [
                { name: 'POROSITY_METHOD', label: 'Porosity Method', type: 'select', options: ['Density', 'Neutron', 'Neutron-Density'], default_value: 'Neutron-Density', required: true },
                { name: 'RHOB_COLUMN', label: 'Density Column', type: 'select', options: ['RHOB', 'RHOZ'], default_value: 'RHOB', required: false },
                { name: 'NPHI_COLUMN', label: 'Neutron Column', type: 'select', options: ['NPHI', 'TNPH'], default_value: 'NPHI', required: false },
                { name: 'MATRIX_DENSITY', label: 'Matrix Density', type: 'number', default_value: 2.65, required: true },
                { name: 'FLUID_DENSITY', label: 'Fluid Density', type: 'number', default_value: 1.0, required: true }
            ]
        },
        'sw_calculation': {
            title: 'Water Saturation (Sw) Parameters',
            parameters: [
                { name: 'SW_METHOD', label: 'Sw Method', type: 'select', options: ['Archie', 'Simandoux', 'Indonesian'], default_value: 'Archie', required: true },
                { name: 'RT_COLUMN', label: 'Resistivity Column', type: 'select', options: ['RT', 'ILD', 'RD'], default_value: 'RT', required: true },
                { name: 'POROSITY_COLUMN', label: 'Porosity Column', type: 'select', options: ['PHIE', 'NPHI', 'PHID'], default_value: 'PHIE', required: true },
                { name: 'RW', label: 'Formation Water Resistivity (Rw)', type: 'number', default_value: 0.05, required: true },
                { name: 'A', label: 'Tortuosity Factor (a)', type: 'number', default_value: 1.0, required: true },
                { name: 'M', label: 'Cementation Exponent (m)', type: 'number', default_value: 2.0, required: true },
                { name: 'N', label: 'Saturation Exponent (n)', type: 'number', default_value: 2.0, required: true }
            ]
        }
    };
    
    // Return mock parameters
    var params = mockParameters[calculationType];
    if (!params) {
        params = {
            title: calculationType.toUpperCase() + ' Parameters',
            parameters: [
                { name: 'COLUMN_SELECT', label: 'Select Column', type: 'select', options: ['GR', 'NPHI', 'RHOB', 'RT'], default_value: 'GR', required: true },
                { name: 'METHOD', label: 'Method', type: 'select', options: ['Standard', 'Advanced'], default_value: 'Standard', required: true }
            ]
        };
    }
    
    return Promise.resolve(params);
}

// Show parameter form for calculations
function showParameterForm(calculationType, parameters) {
    var parameterForm = document.getElementById('parameterForm');
    var parameterRows = document.getElementById('parameterRows');
    
    if (!parameterForm || !parameterRows) {
        showError('Parameter form not found in DOM');
        return;
    }
    
    // Clear existing parameters
    parameterRows.innerHTML = '';
    
    // Set form title
    var formTitle = document.querySelector('#parameterForm .form-header h3');
    if (formTitle) {
        formTitle.textContent = parameters.title || (calculationType.toUpperCase() + ' Parameters');
    }
    
    // Create parameter rows
    parameters.parameters.forEach(function(param, index) {
        var row = document.createElement('tr');
        
        var cellHtml = '<td>' + (index + 1) + '</td>' +
                      '<td>' + param.label + '</td>' +
                      '<td>';
        
        if (param.type === 'select') {
            cellHtml += '<select name="' + param.name + '" class="select-input">';
            param.options.forEach(function(option) {
                var selected = option === param.default_value ? 'selected' : '';
                cellHtml += '<option value="' + option + '" ' + selected + '>' + option + '</option>';
            });
            cellHtml += '</select>';
        } else if (param.type === 'number') {
            var step = '0.01';
            var min = param.min !== undefined ? 'min="' + param.min + '"' : '';
            var max = param.max !== undefined ? 'max="' + param.max + '"' : '';
            var defaultVal = param.default_value !== undefined ? param.default_value : '';
            cellHtml += '<input type="number" name="' + param.name + '" value="' + defaultVal + '" step="' + step + '" ' + min + ' ' + max + ' class="select-input">';
        } else {
            var defaultVal = param.default_value !== undefined ? param.default_value : '';
            cellHtml += '<input type="text" name="' + param.name + '" value="' + defaultVal + '" class="select-input">';
        }
        
        cellHtml += '</td>' +
                   '<td>' + (param.description || '') + '</td>' +
                   '<td>' + (param.unit || '') + '</td>' +
                   '<td>' + param.name + '</td>' +
                   '<td><input type="checkbox" ' + (param.required ? 'checked' : '') + '></td>';
        
        row.innerHTML = cellHtml;
        parameterRows.appendChild(row);
    });
    
    // Show the form
    parameterForm.classList.remove('hidden');
    
    // Store current calculation type
    appState.currentCalculationType = calculationType;
    
    console.log('Parameter form shown for:', calculationType);
}

// Submit calculation parameters
function submitCalculationParameters() {
    var parameterForm = document.getElementById('parameterForm');
    var formData = new FormData(parameterForm.querySelector('form') || parameterForm);
    
    var params = {};
    var inputs = parameterForm.querySelectorAll('input, select');
    
    inputs.forEach(function(input) {
        if (input.name && input.type !== 'checkbox') {
            var value = input.value;
            if (input.type === 'number') {
                value = input.step === '1' ? parseInt(value) : parseFloat(value);
            }
            params[input.name] = value;
        }
    });
    
    // Add intervals for normalization
    if (appState.currentCalculationType === 'normalization') {
        params.intervals = appState.selectedIntervals;
    }
    
    console.log('🚀 Running calculation with params:', params);
    console.log('Calculation type:', appState.currentCalculationType);
    
    setIsLoading(true);
    
    // Mock calculation execution
    setTimeout(function() {
        try {
            var calculationType = appState.currentCalculationType;
            var successMessages = {
                'gsa': 'Gamma Ray Shale Analysis completed successfully',
                'rgsa': 'Resistivity-Gamma Ray Shale Analysis completed successfully', 
                'dgsa': 'Density-Gamma Ray Shale Analysis completed successfully',
                'ngsa': 'Neutron-Gamma Ray Shale Analysis completed successfully',
                'normalization': 'Data normalization completed successfully',
                'vsh_calculation': 'Volume of Shale calculation completed successfully',
                'porosity_calculation': 'Porosity calculation completed successfully',
                'sw_calculation': 'Water Saturation calculation completed successfully'
            };
            
            var message = successMessages[calculationType] || (calculationType.toUpperCase() + ' calculation completed successfully');
            
            showSuccess(message);
            parameterForm.classList.add('hidden');
            
            // Simulate creating calculation plot
            console.log('Creating plot for calculation:', calculationType);
            showSuccess('Plot generated for ' + calculationType.toUpperCase());
            
        } catch (error) {
            showError('Calculation error: ' + error.message);
        }
        
        setIsLoading(false);
    }, 1500); // Simulate 1.5 second calculation time
}

// Module Management Functions
function loadModule(moduleName) {
    if (appState.selectedWells.length === 0) {
        showError('Please select at least one well');
        return;
    }
    
    appState.currentModule = moduleName;
    showLoading();
    var wellName = appState.selectedWells[0];
    
    switch (moduleName) {
        case 'log-plot':
            handleLogPlot(wellName);
            break;
        case 'vsh-calculation':
        case 'vsh-gr':
            handleVshCalculation();
            break;
        case 'vsh-dn':
            handleVshDnCalculation();
            break;
        case 'porosity-calculation':
            handlePorosityCalculation();
            break;
        case 'sw-calculation':
        case 'sw-indonesia':
            handleSwCalculation();
            break;
        case 'sw-simandoux':
            handleSwSimandouxCalculation();
            break;
        case 'rgsa':
            handleRgsaCalculation();
            break;
        case 'dgsa':
            handleDgsaCalculation();
            break;
        case 'ngsa':
            handleNgsaCalculation();
            break;
        case 'gsa':
        case 'rgsa-ngsa-dgsa':
            handleGsaCalculation();
            break;
        case 'normalization':
            handleNormalization();
            break;
        case 'histogram':
            handleHistogram();
            break;
        default:
            showWarning('Module "' + moduleName + '" is not implemented yet');
            hideLoading();
    }
}

function handleLogPlot(wellName) {
    var requestData = {
        calculation_type: 'default',
        well_name: wellName
    };
    
    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = appState.currentStructure;
    }
    
    fetchJson('/get_plot_for_calculation', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        if (response.status === 'success' && response.figure) {
            createPlot(response.figure);
            showSuccess('Log plot created for ' + wellName);
        } else {
            throw new Error(response.message || 'Failed to create log plot');
        }
    })
    .catch(function(error) {
        showError('Error in log plot: ' + error.message);
    })
    .finally(function() {
        hideLoading();
    });
}

// Enhanced module handlers with parameter forms
function handleVshCalculation() {
    getCalculationParameters('vsh')
        .then(function(parameters) {
            showParameterForm('vsh', parameters);
        })
        .catch(function(error) {
            showError('Error getting VSH parameters: ' + error.message);
        });
}

function handlePorosityCalculation() {
    getCalculationParameters('porosity')
        .then(function(parameters) {
            showParameterForm('porosity', parameters);
        })
        .catch(function(error) {
            showError('Error getting porosity parameters: ' + error.message);
        });
}

function handleSwCalculation() {
    getCalculationParameters('sw')
        .then(function(parameters) {
            showParameterForm('sw', parameters);
        })
        .catch(function(error) {
            showError('Error getting SW parameters: ' + error.message);
        });
}

function handleNormalization() {
    if (appState.selectedIntervals.length === 0) {
        showError('Please select at least one interval for normalization');
        return;
    }
    
    getCalculationParameters('normalization')
        .then(function(parameters) {
            showParameterForm('normalization', parameters);
        })
        .catch(function(error) {
            showError('Error getting normalization parameters: ' + error.message);
        });
}

function handleGsaCalculation() {
    getCalculationParameters('gsa')
        .then(function(parameters) {
            showParameterForm('gsa', parameters);
        })
        .catch(function(error) {
            showError('Error getting GSA parameters: ' + error.message);
        });
}

function handleRgsaCalculation() {
    getCalculationParameters('rgsa')
        .then(function(parameters) {
            showParameterForm('rgsa', parameters);
        })
        .catch(function(error) {
            showError('Error getting RGSA parameters: ' + error.message);
        });
}

function handleDgsaCalculation() {
    getCalculationParameters('dgsa')
        .then(function(parameters) {
            showParameterForm('dgsa', parameters);
        })
        .catch(function(error) {
            showError('Error getting DGSA parameters: ' + error.message);
        });
}

function handleNgsaCalculation() {
    getCalculationParameters('ngsa')
        .then(function(parameters) {
            showParameterForm('ngsa', parameters);
        })
        .catch(function(error) {
            showError('Error getting NGSA parameters: ' + error.message);
        });
}

function handleVshDnCalculation() {
    var defaultParams = {
        RHOB_MA: 2.65,
        RHOB_SH: 2.2,
        input_log: 'RHOB',
        output_log: 'VSH_DN'
    };
    
    var requestData = {
        calculation_type: 'vsh',
        params: defaultParams
    };
    
    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = appState.currentStructure;
    }
    
    fetchJson('/run_calculation_endpoint', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        if (response.status === 'success') {
            showSuccess('VSH-DN calculation completed');
            return createCalculationPlot('vsh');
        } else {
            throw new Error(response.message || 'VSH-DN calculation failed');
        }
    })
    .catch(function(error) {
        showError('Error in VSH-DN calculation: ' + error.message);
    })
    .finally(function() {
        hideLoading();
    });
}

function handleSwSimandouxCalculation() {
    var defaultParams = {
        rw: 0.1,
        a: 1.0,
        m: 2.0,
        n: 2.0,
        method: 'simandoux'
    };
    
    var requestData = {
        calculation_type: 'sw',
        params: defaultParams
    };
    
    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = appState.currentStructure;
    }
    
    fetchJson('/run_calculation_endpoint', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        if (response.status === 'success') {
            showSuccess('SW Simandoux calculation completed');
            return createCalculationPlot('sw');
        } else {
            throw new Error(response.message || 'SW Simandoux calculation failed');
        }
    })
    .catch(function(error) {
        showError('Error in SW Simandoux calculation: ' + error.message);
    })
    .finally(function() {
        hideLoading();
    });
}

function handleHistogram() {
    showWarning('Histogram module is under development');
    hideLoading();
}

function createCalculationPlot(calculationType) {
    var wellName = appState.selectedWells.length > 0 ? appState.selectedWells[0] : null;
    
    var requestData = {
        calculation_type: calculationType,
        well_name: wellName
    };
    
    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = appState.currentStructure;
    }
    
    return fetchJson('/get_plot_for_calculation', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        if (response.status === 'success' && response.figure) {
            createPlot(response.figure);
        } else {
            console.error('Failed to create calculation plot:', response.message);
        }
    })
    .catch(function(error) {
        console.error('Error creating calculation plot:', error);
    });
}

// Get current logs from plot data untuk analysis
function getCurrentLogs() {
    console.log("Getting current logs from plot data:", appState.plotFigure.data);
    
    // Filter valid log curves (type: scattergl)
    var logTraces = appState.plotFigure.data.filter(function(trace) {
        return trace.type === 'scattergl' &&
               trace.name &&
               !trace.name.toLowerCase().includes('xover') &&
               trace.name !== 'MARKER';
    });
    
    console.log("Found log curves:", logTraces.map(function(t) { return t.name; }));
    
    var logs = [];
    
    for (var i = 0; i < logTraces.length; i++) {
        var trace = logTraces[i];
        if (!trace.name) continue;
        
        try {
            // Get x and y data arrays
            var xData = [];
            var yData = [];
            
            // Extract x values
            if (trace.x && trace.x._inputArray instanceof Float64Array) {
                xData = Array.from(trace.x._inputArray);
            } else if (Array.isArray(trace.x)) {
                xData = trace.x;
            } else if (trace.x && Array.isArray(trace.x.data)) {
                xData = trace.x.data;
            }
            
            // Extract y values
            if (trace.y && trace.y._inputArray instanceof Float64Array) {
                yData = Array.from(trace.y._inputArray);
            } else if (Array.isArray(trace.y)) {
                yData = trace.y;
            } else if (trace.y && Array.isArray(trace.y.data)) {
                yData = trace.y.data;
            }
            
            if (xData.length === 0 || yData.length === 0) {
                console.log('No valid data arrays for log ' + trace.name);
                continue;
            }
            
            // Create pairs of depth (y) and value (x)
            var pairs = [];
            for (var j = 0; j < yData.length; j++) {
                var depth = Number(yData[j]);
                var value = xData[j];
                var numValue = value !== undefined && value !== null ? Number(value) : null;
                
                if (!isNaN(depth) && (numValue === null || !isNaN(numValue))) {
                    pairs.push([depth, numValue]);
                }
            }
            
            if (pairs.length === 0) {
                console.log('No valid data points found for log ' + trace.name);
                continue;
            }
            
            console.log('Processed ' + pairs.length + ' points for log ' + trace.name);
            
            logs.push({
                curveName: trace.name,
                data: pairs,
                wellName: appState.selectedWells[0] || 'Unknown Well',
                plotData: appState.plotFigure.data
            });
        } catch (err) {
            console.error('Error processing log ' + trace.name + ': ' + err);
        }
    }
    
    console.log("Transformed logs:", logs);
    return logs;
}

// Application Initialization
function initializeApp() {
    console.log('Initializing Well Log Analysis application...');
    
    // Check if Plotly is available
    if (typeof Plotly === 'undefined') {
        showError('Plotly.js is not loaded');
        return;
    }
    
    // Setup navigation immediately - this shouldn't wait for backend
    console.log('Setting up navigation immediately...');
    setupNavigation();
    
    // Initialize structures page first
    initializeStructuresPage();
    showPage('structures');
    
    // Test backend connection
    testBackendConnection();
    
    // Initialize with timeout to allow connection test
    setTimeout(function() {
        // Test backend connection for dashboard functionality
        fetchJson('/first_api_call')
            .then(function(response) {
                console.log('Backend connection established:', response);
                setupEventListeners();
                updateStatus('Ready');
            })
            .catch(function(error) {
                console.error('Failed to initialize application:', error);
                showError('Backend connection failed - using mock data for testing');
                
                // Initialize with mock data for dashboard
                setupEventListeners();
                updateStatus('Ready (Mock Mode)');
            });
    }, 1000);
}

function autoLoadDefaultDataset() {
    console.log('Auto-loading fix_pass_qc dataset...');
    
    return fetchJson('/select_dataset', {
        method: 'POST',
        body: JSON.stringify({ dataset_name: 'fix_pass_qc' })
    })
    .then(function(response) {
        if (response.status === 'success') {
            appState.availableWells = response.wells;
            renderWellList(response.wells);
            updateBadges();
            showSuccess('Loaded ' + response.wells.length + ' wells from fix_pass_qc dataset');
        } else {
            throw new Error(response.message || 'Failed to load dataset');
        }
    })
    .catch(function(error) {
        console.error('Error auto-loading dataset:', error);
        showError('Error loading dataset: ' + error.message);
    });
}

function setupEventListeners() {
    // Setup navigation
    setupNavigation();
    
    // Setup dropdowns
    setupDropdowns();
    
    // Setup plot type select
    setupPlotTypeSelect();
    
    // Setup analysis tools
    setupAnalysisTools();
    
    // Select All checkboxes
    var selectAllWells = document.getElementById('selectAllWells');
    if (selectAllWells) {
        selectAllWells.addEventListener('change', toggleAllWells);
    }
    
    var selectAllIntervals = document.getElementById('selectAllIntervals');
    if (selectAllIntervals) {
        selectAllIntervals.addEventListener('change', toggleAllIntervals);
    }
    
    // Module buttons
    var moduleButtons = document.querySelectorAll('.module-btn:not(.dropdown-btn)');
    moduleButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var moduleName = button.getAttribute('data-module');
            if (moduleName) {
                // Update button state
                moduleButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                loadModule(moduleName);
            }
        });
    });
    
    // Refresh button
    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadWells);
    }
    
    // Parameter form handlers
    var closeFormBtn = document.getElementById('closeFormBtn');
    if (closeFormBtn) {
        closeFormBtn.addEventListener('click', function() {
            document.getElementById('parameterForm').classList.add('hidden');
        });
    }
    
    var cancelParams = document.getElementById('cancelParams');
    if (cancelParams) {
        cancelParams.addEventListener('click', function() {
            document.getElementById('parameterForm').classList.add('hidden');
        });
    }
    
    // Add to setupEventListeners function
    var submitParams = document.getElementById('submitParams');
    if (submitParams) {
        submitParams.addEventListener('click', submitCalculationParameters);
    }
    
    // Global error handler
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        showError('An unexpected error occurred: ' + event.error.message);
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showError('An unexpected error occurred: ' + event.reason);
    });
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export functions for debugging (global scope)
window.appState = appState;
window.toggleWell = toggleWell;
window.toggleInterval = toggleInterval;
window.loadModule = loadModule;
window.toggleAllWells = toggleAllWells;
window.toggleAllIntervals = toggleAllIntervals;
window.loadWells = loadWells;
window.createPlot = createPlot;
window.clearPlot = clearPlot;

// Debug functions
function debugApiCall(endpoint) {
    console.log('=== DEBUG API CALL ===');
    console.log('Endpoint:', endpoint);
    console.log('Current URL:', window.location.href);
    console.log('Base URL:', window.location.origin);
    
    fetchJson(endpoint)
        .then(function(response) {
            console.log('✅ Success response:', response);
        })
        .catch(function(error) {
            console.log('❌ Error response:', error);
        });
}

function showDebugInfo() {
    console.log('=== DEBUG INFO ===');
    console.log('App State:', appState);
    console.log('Current URL:', window.location.href);
    console.log('Plotly available:', typeof Plotly !== 'undefined');
    console.log('Selected Wells:', appState.selectedWells);
    console.log('Selected Intervals:', appState.selectedIntervals);
    
    // Test backend endpoints
    console.log('Testing backend endpoints...');
    debugApiCall('/first_api_call');
}

// Data Preparation Module Management
var dataPrepState = {
    activeModule: null,
    availableFiles: [],
    selectedFiles: [],
    wellColumns: [],
    parameters: []
};

function initializeDataPrepPage() {
    console.log('Initializing data preparation page...');
    
    // Setup module button event listeners for right sidebar
    document.querySelectorAll('#dataPrepRightSidebar .module-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            var moduleName = this.getAttribute('data-module');
            selectDataPrepModule(moduleName);
        });
    });
    
    // Setup button event listeners for data prep specific buttons
    var refreshBtn = document.getElementById('dataPrepRefreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshDataPrepData();
        });
    }
    
    var debugBtn = document.getElementById('dataPrepDebugBtn');
    if (debugBtn) {
        debugBtn.addEventListener('click', function() {
            showDebugInfo();
        });
    }
    
    var testBtn = document.getElementById('dataPrepTestConnectionBtn');
    if (testBtn) {
        testBtn.addEventListener('click', function() {
            testBackendConnection();
        });
    }
    
    // Initialize file list
    loadDataPrepFiles();
    
    // Initialize empty state
    showDataPrepEmptyState();
}

function refreshDataPrepData() {
    console.log('Refreshing data preparation data...');
    
    // Show loading state
    document.getElementById('dataPrepStatusText').textContent = 'Refreshing data...';
    
    // Simulate API call
    setTimeout(function() {
        // Reset the page state
        showDataPrepEmptyState();
        
        // Clear selections
        dataPrepState.selectedFiles = [];
        dataPrepState.selectedColumns = [];
        
        // Update UI
        updateFileList();
        updateColumnList();
        updateDataPrepBadges();
        
        document.getElementById('dataPrepStatusText').textContent = 'Data refreshed successfully';
        
        setTimeout(function() {
            document.getElementById('dataPrepStatusText').textContent = 'Ready';
        }, 2000);
    }, 1000);
}

function testBackendConnection() {
    console.log('Testing backend connection...');
    
    document.getElementById('dataPrepStatusText').textContent = 'Testing connection...';
    
    // Simulate backend connection test
    setTimeout(function() {
        var isConnected = Math.random() > 0.2; // 80% success rate for demo
        
        if (isConnected) {
            document.getElementById('dataPrepStatusText').textContent = 'Backend connected successfully';
            showSuccess('Backend connection test successful! Dataiku server is accessible.');
        } else {
            document.getElementById('dataPrepStatusText').textContent = 'Connection failed';
            showError('Backend connection failed! Please check your Dataiku server configuration.');
        }
        
        setTimeout(function() {
            document.getElementById('dataPrepStatusText').textContent = 'Ready';
        }, 3000);
    }, 1500);
}

function showDebugInfo() {
    var debugInfo = `
=== DATA PREPARATION DEBUG INFO ===
Current Module: ${dataPrepState.activeModule || 'None'}
Selected Files: ${dataPrepState.selectedFiles.length} (${dataPrepState.selectedFiles.join(', ')})
Selected Columns: ${dataPrepState.selectedColumns.length} (${dataPrepState.selectedColumns.join(', ')})
Available Files: ${mockFiles.length}
Available Columns: ${mockColumns.length}
Status: ${document.getElementById('dataPrepStatusText')?.textContent || 'Unknown'}
================================
    `;
    
    console.log(debugInfo);
    showMessage(debugInfo.replace(/\n/g, '<br>'), 'info', true);
}

function updateFileList() {
    var fileList = document.getElementById('dataPrepFileList');
    if (!fileList) return;
    
    if (mockFiles.length === 0) {
        fileList.innerHTML = '<div class="empty-state">No files available</div>';
        return;
    }
    
    fileList.innerHTML = mockFiles.map(function(file) {
        var isSelected = dataPrepState.selectedFiles.includes(file);
        return `
            <div class="data-prep-item ${isSelected ? 'selected' : ''}" 
                 onclick="toggleDataPrepFile('${file}')">
                <div class="item-icon">📄</div>
                <div class="item-name">${file}</div>
                <div class="item-badge ${isSelected ? 'selected' : ''}">${isSelected ? '✓' : ''}</div>
            </div>
        `;
    }).join('');
}

function updateColumnList() {
    var columnList = document.getElementById('dataPrepColumnList');
    if (!columnList) return;
    
    if (dataPrepState.selectedFiles.length === 0) {
        columnList.innerHTML = '<div class="empty-state">Select files to see columns</div>';
        return;
    }
    
    columnList.innerHTML = mockColumns.map(function(column) {
        var isSelected = dataPrepState.selectedColumns.includes(column);
        return `
            <div class="data-prep-item ${isSelected ? 'selected' : ''}" 
                 onclick="toggleDataPrepColumn('${column}')">
                <div class="item-icon">📊</div>
                <div class="item-name">${column}</div>
                <div class="item-badge ${isSelected ? 'selected' : ''}">${isSelected ? '✓' : ''}</div>
            </div>
        `;
    }).join('');
}

function selectDataPrepModule(moduleName) {
    console.log('Selecting data prep module:', moduleName);
    
    // Update active state
    document.querySelectorAll('#dataPrepRightSidebar .module-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.querySelector('#dataPrepRightSidebar [data-module="' + moduleName + '"]').classList.add('active');
    
    dataPrepState.activeModule = moduleName;
    
    // Update status
    document.getElementById('dataPrepStatusText').textContent = 'Loading ' + moduleName + ' module...';
    
    // Load module content
    loadDataPrepModule(moduleName);
}

function formatModuleName(moduleName) {
    return moduleName.split('-').map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

function loadDataPrepModule(moduleName) {
    var moduleArea = document.getElementById('dataPrepModuleArea');
    
    switch(moduleName) {
        case 'normalization':
            loadNormalizationModule(moduleArea);
            break;
        case 'smoothing':
            loadSmoothingModule(moduleArea);
            break;
        case 'trim-data':
            loadTrimDataModule(moduleArea);
            break;
        case 'depth-matching':
            loadDepthMatchingModule(moduleArea);
            break;
        case 'fill-missing':
            loadFillMissingModule(moduleArea);
            break;
        case 'splicing-merging':
            loadSplicingMergingModule(moduleArea);
            break;
        case 'histogram':
            loadHistogramModule(moduleArea);
            break;
        case 'crossplot':
            loadCrossplotModule(moduleArea);
            break;
        default:
            loadDefaultModule(moduleArea, moduleName);
            break;
    }
    
    document.getElementById('dataPrepStatusText').textContent = formatModuleName(moduleName) + ' module loaded';
}

function loadTrimDataModule(container) {
    container.innerHTML = `
        <div class="data-prep-module-container">
            <h3>Data Preparation: Trim Data</h3>
            <div class="module-content">
                <div class="parameters-section">
                    <h4>Trim Parameters</h4>
                    <div class="parameters-table-container">
                        <table class="parameters-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Mode</th>
                                    <th>Comment</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="param-row bg-yellow-300">
                                    <td>Constant</td>
                                    <td>Input</td>
                                    <td>Start depth for trimming</td>
                                    <td>START_DEPTH</td>
                                    <td><input type="number" step="0.1" class="param-input" placeholder="e.g. 2500.0"></td>
                                </tr>
                                <tr class="param-row bg-yellow-300">
                                    <td>Constant</td>
                                    <td>Input</td>
                                    <td>End depth for trimming</td>
                                    <td>END_DEPTH</td>
                                    <td><input type="number" step="0.1" class="param-input" placeholder="e.g. 3500.0"></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Depth column</td>
                                    <td>DEPTH_COL</td>
                                    <td><select class="param-input log-select"><option value="DEPTH">DEPTH</option></select></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="actions-section">
                    <button class="btn-secondary" onclick="showDataPrepEmptyState()">Cancel</button>
                    <button class="btn-primary" onclick="runTrimData()">Start Trim</button>
                </div>
            </div>
        </div>
    `;
}

function loadDepthMatchingModule(container) {
    container.innerHTML = `
        <div class="data-prep-module-container">
            <h3>Data Preparation: Depth Matching</h3>
            <div class="module-content">
                <div class="parameters-section">
                    <h4>Depth Matching Parameters</h4>
                    <div class="parameters-table-container">
                        <table class="parameters-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Mode</th>
                                    <th>Comment</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="param-row bg-orange-600">
                                    <td>Parameter</td>
                                    <td>Input</td>
                                    <td>Matching method</td>
                                    <td>METHOD</td>
                                    <td><select class="param-input">
                                        <option value="LINEAR">LINEAR</option>
                                        <option value="NEAREST">NEAREST</option>
                                        <option value="CUBIC">CUBIC</option>
                                    </select></td>
                                </tr>
                                <tr class="param-row bg-yellow-300">
                                    <td>Constant</td>
                                    <td>Input</td>
                                    <td>Target depth interval</td>
                                    <td>DEPTH_INTERVAL</td>
                                    <td><input type="number" value="0.5" step="0.1" class="param-input"></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Reference depth column</td>
                                    <td>REF_DEPTH</td>
                                    <td><select class="param-input log-select"><option value="DEPTH">DEPTH</option></select></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Target depth column</td>
                                    <td>TARGET_DEPTH</td>
                                    <td><select class="param-input log-select"><option value="DEPTH">DEPTH</option></select></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="actions-section">
                    <button class="btn-secondary" onclick="showDataPrepEmptyState()">Cancel</button>
                    <button class="btn-primary" onclick="runDepthMatching()">Start Matching</button>
                </div>
            </div>
        </div>
    `;
}

function loadFillMissingModule(container) {
    container.innerHTML = `
        <div class="data-prep-module-container">
            <h3>Data Preparation: Fill Missing Values</h3>
            <div class="module-content">
                <div class="parameters-section">
                    <h4>Fill Missing Parameters</h4>
                    <div class="parameters-table-container">
                        <table class="parameters-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Mode</th>
                                    <th>Comment</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="param-row bg-orange-600">
                                    <td>Parameter</td>
                                    <td>Input</td>
                                    <td>Fill method</td>
                                    <td>FILL_METHOD</td>
                                    <td><select class="param-input">
                                        <option value="INTERPOLATION">INTERPOLATION</option>
                                        <option value="FORWARD_FILL">FORWARD_FILL</option>
                                        <option value="BACKWARD_FILL">BACKWARD_FILL</option>
                                        <option value="CONSTANT">CONSTANT</option>
                                    </select></td>
                                </tr>
                                <tr class="param-row bg-yellow-300">
                                    <td>Constant</td>
                                    <td>Input</td>
                                    <td>Fill value (if using constant)</td>
                                    <td>FILL_VALUE</td>
                                    <td><input type="number" step="0.01" class="param-input" placeholder="e.g. -999.25"></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Column to fill</td>
                                    <td>TARGET_COLUMN</td>
                                    <td><select class="param-input log-select"><option>Select column</option></select></td>
                                </tr>
                                <tr class="param-row bg-cyan-200">
                                    <td>Log</td>
                                    <td>Output</td>
                                    <td>Output column name</td>
                                    <td>OUTPUT_COLUMN</td>
                                    <td><input type="text" class="param-input log-output" placeholder="Auto-generated"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="actions-section">
                    <button class="btn-secondary" onclick="showDataPrepEmptyState()">Cancel</button>
                    <button class="btn-primary" onclick="runFillMissing()">Start Fill Missing</button>
                </div>
            </div>
        </div>
    `;
}

function loadSplicingMergingModule(container) {
    container.innerHTML = `
        <div class="data-prep-module-container">
            <h3>Data Preparation: Splicing & Merging</h3>
            <div class="module-content">
                <div class="parameters-section">
                    <h4>Splicing Parameters</h4>
                    <div class="parameters-table-container">
                        <table class="parameters-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Mode</th>
                                    <th>Comment</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="param-row bg-orange-600">
                                    <td>Parameter</td>
                                    <td>Input</td>
                                    <td>Splice method</td>
                                    <td>SPLICE_METHOD</td>
                                    <td><select class="param-input">
                                        <option value="DEPTH_BASED">DEPTH_BASED</option>
                                        <option value="OVERLAP_MERGE">OVERLAP_MERGE</option>
                                        <option value="PRIORITY_BASED">PRIORITY_BASED</option>
                                    </select></td>
                                </tr>
                                <tr class="param-row bg-yellow-300">
                                    <td>Constant</td>
                                    <td>Input</td>
                                    <td>Splice depth</td>
                                    <td>SPLICE_DEPTH</td>
                                    <td><input type="number" step="0.1" class="param-input" placeholder="e.g. 3000.0"></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Primary log column</td>
                                    <td>PRIMARY_LOG</td>
                                    <td><select class="param-input log-select"><option>Select primary column</option></select></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Secondary log column</td>
                                    <td>SECONDARY_LOG</td>
                                    <td><select class="param-input log-select"><option>Select secondary column</option></select></td>
                                </tr>
                                <tr class="param-row bg-cyan-200">
                                    <td>Log</td>
                                    <td>Output</td>
                                    <td>Merged output column</td>
                                    <td>OUTPUT_LOG</td>
                                    <td><input type="text" class="param-input" placeholder="MERGED_LOG"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="actions-section">
                    <button class="btn-secondary" onclick="showDataPrepEmptyState()">Cancel</button>
                    <button class="btn-primary" onclick="runSplicingMerging()">Start Splicing</button>
                </div>
            </div>
        </div>
    `;
}

function loadHistogramModule(container) {
    container.innerHTML = `
        <div class="data-prep-module-container">
            <h3>Data Analysis: Histogram</h3>
            <div class="module-content">
                <div class="parameters-section">
                    <h4>Histogram Parameters</h4>
                    <div class="parameters-table-container">
                        <table class="parameters-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Mode</th>
                                    <th>Comment</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="param-row bg-orange-600">
                                    <td>Parameter</td>
                                    <td>Input</td>
                                    <td>Number of bins</td>
                                    <td>BINS</td>
                                    <td><input type="number" value="30" min="5" max="100" class="param-input"></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Data column for histogram</td>
                                    <td>DATA_COLUMN</td>
                                    <td><select class="param-input log-select"><option>Select column</option></select></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="actions-section">
                    <button class="btn-secondary" onclick="showDataPrepEmptyState()">Cancel</button>
                    <button class="btn-primary" onclick="runHistogram()">Generate Histogram</button>
                </div>
            </div>
        </div>
    `;
}

function loadCrossplotModule(container) {
    container.innerHTML = `
        <div class="data-prep-module-container">
            <h3>Data Analysis: Crossplot</h3>
            <div class="module-content">
                <div class="parameters-section">
                    <h4>Crossplot Parameters</h4>
                    <div class="parameters-table-container">
                        <table class="parameters-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Mode</th>
                                    <th>Comment</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>X-axis column</td>
                                    <td>X_COLUMN</td>
                                    <td><select class="param-input log-select"><option>Select X column</option></select></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Y-axis column</td>
                                    <td>Y_COLUMN</td>
                                    <td><select class="param-input log-select"><option>Select Y column</option></select></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Color by column (optional)</td>
                                    <td>COLOR_COLUMN</td>
                                    <td><select class="param-input log-select"><option value="">None</option></select></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="actions-section">
                    <button class="btn-secondary" onclick="showDataPrepEmptyState()">Cancel</button>
                    <button class="btn-primary" onclick="runCrossplot()">Generate Crossplot</button>
                </div>
            </div>
        </div>
    `;
}

function loadNormalizationModule(container) {
    container.innerHTML = `
        <div class="data-prep-module-container">
            <h3>Data Preparation: Normalization</h3>
            <div class="module-content">
                <div class="file-selection-section">
                    <h4>Select Files for Normalization</h4>
                    <div class="file-list-container">
                        <div class="loading-state">Loading available files...</div>
                    </div>
                </div>
                <div class="parameters-section">
                    <h4>Parameters</h4>
                    <div class="parameters-table-container">
                        <table class="parameters-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Mode</th>
                                    <th>Comment</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="param-row bg-orange-600">
                                    <td>Parameter</td>
                                    <td>Input</td>
                                    <td>Normalization: Min-Max</td>
                                    <td>NORMALIZE_OPT</td>
                                    <td><input type="text" value="MIN-MAX" class="param-input" readonly></td>
                                </tr>
                                <tr class="param-row bg-yellow-300">
                                    <td>Constant</td>
                                    <td>Input</td>
                                    <td>Input low log value (P5)</td>
                                    <td>LOW_IN</td>
                                    <td><input type="text" value="5" class="param-input"></td>
                                </tr>
                                <tr class="param-row bg-yellow-300">
                                    <td>Constant</td>
                                    <td>Input</td>
                                    <td>Input high log value (P95)</td>
                                    <td>HIGH_IN</td>
                                    <td><input type="text" value="95" class="param-input"></td>
                                </tr>
                                <tr class="param-row bg-yellow-300">
                                    <td>Constant</td>
                                    <td>Input</td>
                                    <td>Reference log low value</td>
                                    <td>LOW_REF</td>
                                    <td><input type="text" value="40" class="param-input"></td>
                                </tr>
                                <tr class="param-row bg-yellow-300">
                                    <td>Constant</td>
                                    <td>Input</td>
                                    <td>Reference log high value</td>
                                    <td>HIGH_REF</td>
                                    <td><input type="text" value="140" class="param-input"></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Input Log</td>
                                    <td>LOG_IN</td>
                                    <td><select class="param-input log-select"><option>Select log column</option></select></td>
                                </tr>
                                <tr class="param-row bg-cyan-200">
                                    <td>Log</td>
                                    <td>Output</td>
                                    <td>Output Log Name</td>
                                    <td>LOG_OUT</td>
                                    <td><input type="text" class="param-input log-output" placeholder="Auto-generated"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="actions-section">
                    <button class="btn-secondary" onclick="showDataPrepEmptyState()">Cancel</button>
                    <button class="btn-primary" onclick="runNormalization()">Start Normalization</button>
                </div>
            </div>
        </div>
    `;
    
    // Load available files
    loadDataPrepFiles();
}

function loadSmoothingModule(container) {
    container.innerHTML = `
        <div class="data-prep-module-container">
            <h3>Data Preparation: Smoothing</h3>
            <div class="module-content">
                <div class="file-selection-section">
                    <h4>Select Files for Smoothing</h4>
                    <div class="file-list-container">
                        <div class="loading-state">Loading available files...</div>
                    </div>
                </div>
                <div class="parameters-section">
                    <h4>Parameters</h4>
                    <div class="parameters-table-container">
                        <table class="parameters-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Mode</th>
                                    <th>Comment</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="param-row bg-orange-600">
                                    <td>Parameter</td>
                                    <td>Input</td>
                                    <td>Smoothing method</td>
                                    <td>METHOD</td>
                                    <td><select class="param-input"><option value="MOVING_AVG">MOVING_AVG</option></select></td>
                                </tr>
                                <tr class="param-row bg-orange-600">
                                    <td>Parameter</td>
                                    <td>Input</td>
                                    <td>Size of smooth window (odd number)</td>
                                    <td>WINDOW</td>
                                    <td><input type="number" value="5" class="param-input" min="3" step="2"></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Log to be smoothed</td>
                                    <td>LOG_IN</td>
                                    <td><select class="param-input log-select"><option>Select log column</option></select></td>
                                </tr>
                                <tr class="param-row bg-cyan-200">
                                    <td>Log</td>
                                    <td>Output</td>
                                    <td>Smoothed log name</td>
                                    <td>LOG_OUT</td>
                                    <td><input type="text" class="param-input log-output" placeholder="Auto-generated"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="actions-section">
                    <button class="btn-secondary" onclick="showDataPrepEmptyState()">Cancel</button>
                    <button class="btn-primary" onclick="runSmoothing()">Start Smoothing</button>
                </div>
            </div>
        </div>
    `;
    
    // Load available files
    loadDataPrepFiles();
}

function loadDefaultModule(container, moduleName) {
    container.innerHTML = `
        <div class="data-prep-module-container">
            <h3>Data Preparation: ${formatModuleName(moduleName)}</h3>
            <div class="module-content">
                <div class="under-development">
                    <h4>Module Under Development</h4>
                    <p>The ${formatModuleName(moduleName)} module is currently under development.</p>
                    <p>Please check back later for updates.</p>
                </div>
                <div class="actions-section">
                    <button class="btn-secondary" onclick="showDataPrepEmptyState()">Back</button>
                </div>
            </div>
        </div>
    `;
}

function loadDataPrepFiles() {
    // Simulate loading files from backend
    console.log('Loading data preparation files...');
    var fileList = document.getElementById('dataPrepFileList');
    
    if (!fileList) {
        console.warn('File list container not found');
        return;
    }
    
    // Mock data for demo - in real implementation this would fetch from backend
    var mockFiles = [
        'BNG-057_composite.csv',
        'BNG-057_raw.csv', 
        'BNG-057_processed.csv',
        'BNG-057_logs.csv',
        'BNG-057_deviation.csv'
    ];
    
    fileList.innerHTML = mockFiles.map(function(file, index) {
        return `
            <div class="list-item">
                <label class="checkbox-label">
                    <input type="checkbox" class="file-checkbox" value="${file}" data-index="${index}">
                    <span class="item-text">${file}</span>
                </label>
            </div>
        `;
    }).join('');
    
    // Setup file selection handlers
    document.querySelectorAll('.file-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            updateSelectedFiles();
            updateFilesBadge();
        });
    });
    
    // Setup select all functionality
    var selectAllFiles = document.getElementById('selectAllFiles');
    if (selectAllFiles) {
        selectAllFiles.addEventListener('change', function() {
            var checkboxes = document.querySelectorAll('.file-checkbox');
            checkboxes.forEach(function(cb) {
                cb.checked = this.checked;
            }.bind(this));
            updateSelectedFiles();
            updateFilesBadge();
        });
    }
}

function updateFilesBadge() {
    var totalFiles = document.querySelectorAll('.file-checkbox').length;
    var selectedFiles = document.querySelectorAll('.file-checkbox:checked').length;
    
    var badge = document.getElementById('selectedFilesBadge');
    if (badge) {
        badge.textContent = selectedFiles + '/' + totalFiles;
    }
    
    var count = document.getElementById('selectedFilesCount');
    if (count) {
        count.textContent = selectedFiles;
    }
}

function updateSelectedFiles() {
    var selected = [];
    document.querySelectorAll('.file-checkbox:checked').forEach(function(checkbox) {
        selected.push(checkbox.value);
    });
    dataPrepState.selectedFiles = selected;
    
    // Update log columns dropdown if files are selected
    if (selected.length > 0) {
        updateLogColumns(['DEPTH', 'GR', 'NPHI', 'RHOB', 'RT', 'SP', 'CALI', 'PEF']); // Mock columns
        updateColumnsList(['DEPTH', 'GR', 'NPHI', 'RHOB', 'RT', 'SP', 'CALI', 'PEF']);
    } else {
        // Clear columns if no files selected
        var columnList = document.getElementById('dataPrepColumnList');
        if (columnList) {
            columnList.innerHTML = '<div class="empty-state">Select files to see columns</div>';
        }
    }
}

function updateColumnsList(columns) {
    var columnList = document.getElementById('dataPrepColumnList');
    if (columnList) {
        columnList.innerHTML = columns.map(function(col) {
            return `
                <div class="list-item">
                    <span class="item-text">${col}</span>
                </div>
            `;
        }).join('');
    }
}

function updateLogColumns(columns) {
    var logSelects = document.querySelectorAll('.log-select');
    logSelects.forEach(function(select) {
        var currentValue = select.value;
        select.innerHTML = columns.map(col => `<option value="${col}">${col}</option>`).join('');
        
        // Restore previous selection if it exists
        if (currentValue && columns.includes(currentValue)) {
            select.value = currentValue;
        }
        
        // Setup auto-update for output name
        select.addEventListener('change', function() {
            updateOutputName(this);
        });
    });
}

function updateOutputName(selectElement) {
    var outputInput = document.querySelector('.log-output');
    if (outputInput && selectElement.value) {
        var suffix = '_PROCESSED';
        if (dataPrepState.activeModule === 'normalization') suffix = '_NO';
        else if (dataPrepState.activeModule === 'smoothing') suffix = '_SM';
        else if (dataPrepState.activeModule === 'trim-data') suffix = '_TRIM';
        else if (dataPrepState.activeModule === 'fill-missing') suffix = '_FILLED';
        
        outputInput.value = selectElement.value + suffix;
    }
}

function showDataPrepEmptyState() {
    var moduleArea = document.getElementById('dataPrepModuleArea');
    moduleArea.innerHTML = `
        <div class="empty-plot-state">
            <h3>Select a data preparation module</h3>
            <p>Choose a module from the right sidebar to configure parameters and run analysis</p>
        </div>
    `;
    
    // Reset active states
    document.querySelectorAll('#dataPrepRightSidebar .module-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    document.getElementById('dataPrepStatusText').textContent = 'Select a module to begin';
    dataPrepState.activeModule = null;
}

function runTrimData() {
    if (dataPrepState.selectedFiles.length === 0) {
        showWarning('Please select at least one file');
        return;
    }
    
    var startDepth = document.querySelector('[name="START_DEPTH"]')?.value;
    var endDepth = document.querySelector('[name="END_DEPTH"]')?.value;
    
    if (!startDepth || !endDepth) {
        showWarning('Please specify start and end depths');
        return;
    }
    
    console.log('Running trim data:', { startDepth, endDepth, files: dataPrepState.selectedFiles });
    showSuccess(`Trimming data from ${startDepth} to ${endDepth} for ${dataPrepState.selectedFiles.length} files...`);
}

function runDepthMatching() {
    if (dataPrepState.selectedFiles.length === 0) {
        showWarning('Please select at least one file');
        return;
    }
    
    console.log('Running depth matching on selected files...');
    showSuccess('Running depth matching on selected files...');
}

function runFillMissing() {
    if (dataPrepState.selectedFiles.length === 0) {
        showWarning('Please select at least one file');
        return;
    }
    
    var method = document.querySelector('[name="FILL_METHOD"]')?.value;
    var targetColumn = document.querySelector('[name="TARGET_COLUMN"]')?.value;
    
    if (!targetColumn) {
        showWarning('Please select a target column to fill');
        return;
    }
    
    console.log('Running fill missing:', { method, targetColumn, files: dataPrepState.selectedFiles });
    showSuccess(`Filling missing values in ${targetColumn} using ${method} method...`);
}

function runSplicingMerging() {
    if (dataPrepState.selectedFiles.length === 0) {
        showWarning('Please select at least one file');
        return;
    }
    
    console.log('Running splicing/merging on selected files...');
    showSuccess('Running splicing/merging on selected files...');
}

function runHistogram() {
    if (dataPrepState.selectedFiles.length === 0) {
        showWarning('Please select at least one file');
        return;
    }
    
    var dataColumn = document.querySelector('[name="DATA_COLUMN"]')?.value;
    var bins = document.querySelector('[name="BINS"]')?.value;
    
    if (!dataColumn) {
        showWarning('Please select a data column for histogram');
        return;
    }
    
    console.log('Generating histogram:', { dataColumn, bins, files: dataPrepState.selectedFiles });
    showSuccess(`Generating histogram for ${dataColumn} with ${bins} bins...`);
}

function runCrossplot() {
    if (dataPrepState.selectedFiles.length === 0) {
        showWarning('Please select at least one file');
        return;
    }
    
    var xColumn = document.querySelector('[name="X_COLUMN"]')?.value;
    var yColumn = document.querySelector('[name="Y_COLUMN"]')?.value;
    
    if (!xColumn || !yColumn) {
        showWarning('Please select both X and Y columns');
        return;
    }
    
    console.log('Generating crossplot:', { xColumn, yColumn, files: dataPrepState.selectedFiles });
    showSuccess(`Generating crossplot: ${xColumn} vs ${yColumn}...`);
}

function runQualityControl() {
    if (dataPrepState.selectedFiles.length === 0) {
        showWarning('Please select at least one file');
        return;
    }
    
    console.log('Running quality control on selected files...');
    showSuccess('Running quality control analysis on selected files...');
}

function runDataValidation() {
    if (dataPrepState.selectedFiles.length === 0) {
        showWarning('Please select at least one file');
        return;
    }
    
    console.log('Running data validation on selected files...');
    showSuccess('Running data validation on selected files...');
}

function runExportData() {
    if (dataPrepState.selectedFiles.length === 0) {
        showWarning('Please select at least one file');
        return;
    }
    
    var format = document.querySelector('[name="EXPORT_FORMAT"]')?.value || 'CSV';
    
    console.log('Exporting data:', { format, files: dataPrepState.selectedFiles });
    showSuccess(`Exporting ${dataPrepState.selectedFiles.length} files in ${format} format...`);
}

// Make debug functions available globally
window.debugApiCall = debugApiCall;
window.showDebugInfo = showDebugInfo;
window.testBackendConnection = testBackendConnection;

// Make navigateToDashboard available globally
window.navigateToDashboard = navigateToDashboard;
// Make navigateToDataPreparation available globally
window.navigateToDataPreparation = navigateToDataPreparation;