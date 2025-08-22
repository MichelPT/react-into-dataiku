// Global Application State - Enhanced
var appState = {
    selectedWells: [],
    selectedIntervals: [],
    selectedZones: [],
    savedSets: [],
    currentModule: null,
    plotData: null,
    parameters: [],
    isLoading: false,
    currentDataset: null,
    availableWells: [],
    availableIntervals: [],
    availableZones: [],
    plotType: 'default',
    plotLayout: 'default',
    currentStructure: null,
    selectedFilePath: null, // Added for file-based plots
    plotFigure: { data: [], layout: {} }, // Added for plot state
    error: null, // Added for error handling
    wellColumns: {}, // Added for well columns
    currentView: 'structures', // Added for view tracking
    customCurves: [],
    selectedCustomCurves: [],
    isGenerating: false,
    intervalsTab: 'markers' // 'markers' | 'zones'
};
// Note: Removed legacy mockData; the app now relies solely on real backend data.

// Structures manifest - embedded sample for UI fallback when no index.json is available
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
    var uploadFilePage = document.getElementById('uploadFilePage');

    if (pageName === 'structures') {
        if (structuresPage) structuresPage.classList.remove('hidden');
        if (dashboardPage) dashboardPage.classList.add('hidden');
        if (dataPreparation) dataPreparation.classList.add('hidden');
        currentPage = 'structures';
        appState.currentView = 'structures';
    } else if (pageName === 'dashboard') {
        if (structuresPage) structuresPage.classList.add('hidden');
        if (dashboardPage) dashboardPage.classList.remove('hidden');
        if (dataPreparation) dataPreparation.classList.add('hidden');
        if (uploadFilePage) uploadFilePage.classList.add('hidden');
        currentPage = 'dashboard';
        appState.currentView = 'dashboard';
    } else if (pageName === 'data-preparation') {
        if (structuresPage) structuresPage.classList.add('hidden');
        if (dashboardPage) dashboardPage.classList.add('hidden');
        if (dataPreparation) dataPreparation.classList.remove('hidden');
        if (uploadFilePage) uploadFilePage.classList.add('hidden');
        currentPage = 'data-preparation';
        appState.currentView = 'dataPrep';
        // Initialize data prep page when shown
        initializeDataPrepPage();
    } else if (pageName === 'upload') {
        if (structuresPage) structuresPage.classList.add('hidden');
        if (dashboardPage) dashboardPage.classList.add('hidden');
        if (dataPreparation) dataPreparation.classList.add('hidden');
        if (uploadFilePage) uploadFilePage.classList.remove('hidden');
        currentPage = 'upload';
        appState.currentView = 'upload';
        initializeUploadPage();
    }
}

function initializeStructuresPage() {
    console.log('Initializing structures page...');
    // Tampilkan loading saat mengambil dataset structures
    try {
        var structuresListEl = document.getElementById('structuresList');
        var fieldsListEl = document.getElementById('fieldsList');
        if (structuresListEl) {
            structuresListEl.innerHTML = '<div class="loading-state">Loading structures from dataset...</div>';
        }
        if (fieldsListEl) {
            fieldsListEl.innerHTML = '<div class="loading-state">Loading fields...</div>';
        }
        showLoading();
    } catch (e) { /* no-op */ }

    // Try loading structures from local data first
    return loadStructuresFromFolder()
        .then(function(loaded) {
            if (!loaded) {
                // Fallback to embedded manifest
                console.warn('Using embedded structures manifest');
            }
            renderFieldsList();
            showEmptyStructuresState();
            showEmptyDetailsState();
        })
        .finally(function(){
            // Sembunyikan loading setelah data siap
            try { hideLoading(); } catch (e) { /* no-op */ }
        });
}

// Load structures definition, preferring backend dataset (fix_pass_qc) then falling back to static JSON
function loadStructuresFromFolder() {
    // 1) Try backend first (dataset-driven from fix_pass_qc)
    return fetchJson('/get_structures_index')
        .then(function(resp){
            if (resp && resp.status === 'success' && resp.data && Array.isArray(resp.data.fields)) {
                structuresData = resp.data;
                console.log('Loaded structures via backend (dataset)');
                return true;
            }
            // 2) Fallback to static files
            return tryStaticStructures();
        })
        .catch(function(){
            return tryStaticStructures();
        });

    function tryStaticStructures() {
        var candidates = [
            'data/structures/index.json',
            'structures/index.json',
            '/webapps/webappv1/data/structures/index.json',
            '/webapps/webappv1/structures/index.json'
        ];
        function tryNext() {
            if (candidates.length === 0) return false;
            var url = candidates.shift();
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
                .catch(function(){ return tryNext(); });
        }
        return tryNext();
    }
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

// (duplicate handleFieldSelect removed)

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
        name: structure.structure_name, // Add simplified name field
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
    
    // Navigation button (bind with JS to avoid CSP issues)
    detailsHTML += 
        '<div class="detail-section">' +
            '<button id="goToDashboardBtn" class="btn-primary" type="button" style="width: 100%; padding: 1rem; font-size: 1rem;">' +
                'Go to Dashboard for Analysis' +
            '</button>' +
        '</div>';
    
    detailsHTML += '</div>';
    
    structureDetails.innerHTML = detailsHTML;

    // Bind click handler programmatically
    var goBtn = structureDetails.querySelector('#goToDashboardBtn');
    if (goBtn) {
        goBtn.addEventListener('click', function() {
            try {
                navigateToDashboard();
            } catch (e) {
                console.error('Failed to navigate to dashboard:', e);
                showError('Failed to navigate to dashboard: ' + e.message);
            }
        });
    }
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
                        name: structureInfo.structureName,
                        fieldName: structureInfo.fieldName,
                        structureName: structureInfo.structureName,
                        filePath: structureInfo.filePath,
                        wells: structureInfo.wells || [],
                        columns: structureInfo.columns || []
                    };
                }
            }
            
            // Auto-load dataset based on selected structure
            if (appState.currentStructure) {
                console.log('Auto-loading dataset for structure:', appState.currentStructure.name);
                autoLoadDefaultDataset()
                    .then(function() {
                        showSuccess('Dashboard loaded with data from ' + appState.currentStructure.structureName + ' structure');
                    })
                    .catch(function(error) {
                        console.error('Error loading structure dataset:', error);
                        showWarning('Failed to load structure dataset, attempting default dataset');
                        // Keep UI responsive even if dataset load failed
                        if (!appState.availableWells || appState.availableWells.length === 0) {
                            appState.availableWells = (appState.currentStructure.wells || []);
                            renderWellList(appState.availableWells);
                            updateBadges();
                        }
                    });
            } else {
                showMessage('Dashboard loaded - select a structure first to load well data', 'info');
                // Try to load default dataset anyway
                autoLoadDefaultDataset()
                    .catch(function(error) {
                        console.error('Error loading default dataset:', error);
                        showMessage('Unable to load well data - please select a structure', 'warning');
                    });
            }
            break;
        case '/upload':
            showPage('upload');
            showMessage('Upload page loaded', 'success');
            break;
        default:
            showMessage('Page not implemented: ' + path, 'warning');
            break;
    }
}

// Upload Page Handlers
function initializeUploadPage() {
    var form = document.getElementById('uploadForm');
    var input = document.getElementById('fileInput');
    var statusEl = document.getElementById('uploadStatus');
    var previewEl = document.getElementById('uploadPreview');
    var uploadPage = document.getElementById('uploadFilePage');
    var dropArea = document.getElementById('dropArea') || (uploadPage ? uploadPage.querySelector('.file-drop-area') : null);
    var fileNamePreview = document.getElementById('fileNamePreview');

    if (!form || !input) return;

    // reset state when entering page
    if (statusEl) statusEl.textContent = '';
    if (previewEl) previewEl.innerHTML = '<div class="empty-state">No file uploaded yet</div>';

    // helper: parse a selected/dropped file
    function parseAndPreview(file){
        if (!file) { showMessage('No file provided', 'warning'); return; }
        var ext = (file.name.split('.').pop() || '').toLowerCase();
        if (statusEl) statusEl.innerHTML = '<div class="loading-state">Parsing file...</div>';
        showLoading();
        if (ext !== 'csv') {
            hideLoading();
            if (statusEl) statusEl.innerHTML = '<div class="warning">XLSX not supported in-browser. Please upload CSV.</div>';
            return;
        }
        try {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: function(results){
                    hideLoading();
                    if (statusEl) statusEl.textContent = 'Parsed ' + results.data.length + ' rows.';
                    renderUploadPreview(results.meta.fields || [], results.data || []);
                },
                error: function(err){
                    hideLoading();
                    if (statusEl) statusEl.innerHTML = '<div class="error">Failed parsing CSV: ' + (err && err.message ? err.message : String(err)) + '</div>';
                }
            });
        } catch (err){
            hideLoading();
            if (statusEl) statusEl.innerHTML = '<div class="error">Unexpected error: ' + (err && err.message ? err.message : String(err)) + '</div>';
        }
    }

    form.onsubmit = function(e){
        e.preventDefault();
        parseAndPreview(input.files && input.files[0]);
    };

    // clicking label or drop area should open the file dialog
    try {
        var label = form.querySelector('.file-input-label');
        if (label) {
            label.addEventListener('click', function(ev){ ev.preventDefault(); input.click(); });
        }
    } catch(_){}

    if (dropArea) {
        ['dragenter','dragover'].forEach(function(evt){
            dropArea.addEventListener(evt, function(e){ e.preventDefault(); e.stopPropagation(); dropArea.classList.add('dragover'); });
        });
        ['dragleave','dragend','drop'].forEach(function(evt){
            dropArea.addEventListener(evt, function(e){ e.preventDefault(); e.stopPropagation(); dropArea.classList.remove('dragover'); });
        });
        dropArea.addEventListener('drop', function(e){
            var files = e.dataTransfer && e.dataTransfer.files;
            if (files && files.length > 0) {
                if (fileNamePreview) fileNamePreview.textContent = files[0].name;
                parseAndPreview(files[0]);
            }
        });
        // Also allow clicking anywhere in the upload content to open dialog (except buttons)
        dropArea.addEventListener('click', function(e){
            var tag = (e.target && e.target.tagName || '').toLowerCase();
            if (tag !== 'button' && tag !== 'input' && tag !== 'label') { input.click(); }
        });
        // Keyboard accessibility (Enter/Space)
        dropArea.addEventListener('keydown', function(e){
            var key = e.key || e.code;
            if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Space') {
                e.preventDefault();
                input.click();
            }
        });
    }

    // handle manual file selection change
    input.addEventListener('change', function(){
        var file = input.files && input.files[0];
        if (file) {
            if (statusEl) { statusEl.textContent = 'Selected: ' + file.name; }
            if (fileNamePreview) { fileNamePreview.textContent = file.name; }
        }
    });
}

function renderUploadPreview(headers, rows) {
    var previewEl = document.getElementById('uploadPreview');
    if (!previewEl) return;
    if (!headers || headers.length === 0) {
        previewEl.innerHTML = '<div class="empty-state">No headers detected</div>';
        return;
    }
    var maxRows = Math.min(rows.length, 500);
    var thead = '<thead><tr>' + headers.map(function(h){ return '<th>'+escapeHtml(String(h))+'</th>'; }).join('') + '</tr></thead>';
    var tbody = '<tbody>' + rows.slice(0, maxRows).map(function(row){
        return '<tr>' + headers.map(function(h){ var v = row[h]; return '<td>'+escapeHtml(v==null?'' : String(v))+'</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody>';
    previewEl.innerHTML = '<div class="table-wrapper"><table class="min-w-full">' + thead + tbody + '</table>' + (rows.length>maxRows?'<div class="muted p-2">Showing first '+maxRows+' of '+rows.length+' rows</div>':'') + '</div>';
}

function escapeHtml(s){
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;');
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
        var selectedCount = appState.intervalsTab === 'zones' ? appState.selectedZones.length : appState.selectedIntervals.length;
        var totalCount = appState.intervalsTab === 'zones' ? (appState.availableZones || []).length : (appState.availableIntervals || []).length;
        intervalsBadge.textContent = selectedCount + '/' + totalCount;
    }
    
    if (selectedWellsCount) {
        selectedWellsCount.textContent = appState.selectedWells.length;
    }
    
    if (selectedIntervalsCount) {
        var sel = appState.intervalsTab === 'zones' ? appState.selectedZones.length : appState.selectedIntervals.length;
        selectedIntervalsCount.textContent = sel;
    }
}

// Plot type handling
function setupPlotTypeSelect() {
    var plotTypeSelect = document.getElementById('plotTypeSelect');
    if (plotTypeSelect) {
        plotTypeSelect.addEventListener('change', function() {
            appState.plotType = plotTypeSelect.value;
            console.log('Plot type changed to:', plotTypeSelect.value);
            
            // Auto-refresh plot if wells are selected
            if (appState.selectedWells.length > 0) {
                // Trigger plot update based on new plot type
                updatePlotForType(plotTypeSelect.value);
            }
            
            showMessage('Plot type changed to: ' + plotTypeSelect.value, 'info');
        });
    }
}

// Plot layout and custom curves
function setupPlotLayoutControls() {
    var layoutSelect = document.getElementById('plotLayoutSelect');
    var customSection = document.getElementById('customCurvesSection');
    var customList = document.getElementById('customCurvesList');
    var customBadge = document.getElementById('customCurvesBadge');
    var selectAllCustom = document.getElementById('selectAllCustomCurves');
    if (layoutSelect) {
        layoutSelect.addEventListener('change', function(){
            appState.plotLayout = layoutSelect.value || 'default';
            var isCustom = appState.plotLayout === 'custom';
            if (customSection) customSection.classList.toggle('hidden', !isCustom);
            if (isCustom) {
                // Populate custom curves from current plot data
                var logs = getCurrentLogs();
                appState.customCurves = logs.map(function(l){ return l.curveName; });
                appState.selectedCustomCurves = appState.customCurves.slice();
                if (customList) {
                    customList.innerHTML = appState.customCurves.map(function(name){
                        var id = 'custom-' + name;
                        var checked = appState.selectedCustomCurves.indexOf(name) !== -1;
                        return '<div class="list-item" data-id="'+name+'">'
                             + '<input type="checkbox" id="'+id+'" '+(checked?'checked':'')+'>'
                             + '<label for="'+id+'">'+name+'</label>'
                             + '<div class="status-dot" style="display:'+(checked?'block':'none')+'"></div>'
                             + '</div>';
                    }).join('');
                    // Bind change events
                    customList.querySelectorAll('input[type="checkbox"]').forEach(function(cb){
                        cb.addEventListener('change', function(){
                            var name = this.id.replace('custom-','');
                            var idx = appState.selectedCustomCurves.indexOf(name);
                            if (this.checked && idx === -1) appState.selectedCustomCurves.push(name);
                            else if (!this.checked && idx !== -1) appState.selectedCustomCurves.splice(idx,1);
                            if (customBadge) customBadge.textContent = appState.selectedCustomCurves.length + '/' + appState.customCurves.length;
                        });
                    });
                }
                if (customBadge) customBadge.textContent = appState.selectedCustomCurves.length + '/' + appState.customCurves.length;
                if (selectAllCustom) {
                    selectAllCustom.checked = true;
                    selectAllCustom.onchange = function(){
                        if (this.checked) appState.selectedCustomCurves = appState.customCurves.slice();
                        else appState.selectedCustomCurves = [];
                        if (customList) customList.querySelectorAll('input[type="checkbox"]').forEach(function(cb){ cb.checked = selectAllCustom.checked; });
                        if (customBadge) customBadge.textContent = appState.selectedCustomCurves.length + '/' + appState.customCurves.length;
                    };
                }
            }
        });
    }
}

function setupAnalysisTools() {
    var crossplotSelect = document.getElementById('crossplotSelect');
    if (crossplotSelect) {
        crossplotSelect.addEventListener('change', function(){
            var val = crossplotSelect.value;
            if (!val) return;
            runCrossplotSidebar(val)
                .finally(function(){ crossplotSelect.value = ''; });
        });
    }
    var histBtn = document.getElementById('histogramLink');
    if (histBtn) histBtn.addEventListener('click', function(){ runHistogramSidebar(); });
}

function setupGenerateButton() {
    var btn = document.getElementById('generatePlotBtn');
    var spinner = document.getElementById('generateSpinner');
    var text = document.getElementById('generateBtnText');
    if (!btn) return;
    function setLoading(state){
        appState.isGenerating = state;
        if (spinner) spinner.classList.toggle('hidden', !state);
        if (text) text.textContent = state ? 'Generating...' : 'Generate Plot';
        btn.disabled = state;
    }
    btn.addEventListener('click', function(){
        if (appState.selectedWells.length === 0) { showError('Select wells first'); return; }
        setLoading(true);
        Promise.resolve().then(function(){ return generatePlot(); })
            .catch(function(err){ console.error(err); showError('Failed to generate plot: ' + (err && err.message || err)); })
            .finally(function(){ setLoading(false); });
    });
}

// Update plot based on selected type
function updatePlotForType(plotType) {
    // Guard: require at least one well selected
    if (appState.selectedWells.length === 0) {
        showMessage('Please select wells first', 'warning');
        return;
    }
    // Single source of truth: regenerate plot using current state (wells + intervals)
    console.log('Updating plot for type:', plotType, 'with wells:', appState.selectedWells, 'and intervals:', appState.selectedIntervals);
    generatePlot();
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
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ' for ' + endpoint);
            }
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
            throw error;
        });
}
// (mock helpers removed; app now requires real backend)

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
            updateStatus('Backend error');
            showError('Backend not available: ' + error.message);
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
            console.error('Failed to load wells:', error);
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
    console.log('🎯 Toggling well:', wellId);
    
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
    
    // Update parameter form columns in realtime if form is open
    updateParameterFormColumns();
}

// Enhanced plot loading dengan structure context dan intervals
function loadWellPlot(wellName) {
    console.log('🚀 Loading plot for well:', wellName);
    setIsLoading(true);
    setError(null);
    
    // Prepare request data with structure context and intervals
    var requestData = {
        well_name: wellName,
        selected_intervals: appState.selectedIntervals // Add intervals to request
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
    
    return fetchJson('/get_well_plot', {
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
        case 'rgbe_rpbe':
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

// Update parameter form columns when selection changes
function updateParameterFormColumns() {
    var parameterForm = document.getElementById('parameterForm');
    if (!parameterForm || parameterForm.classList.contains('hidden')) {
        return; // No active parameter form to update
    }
    
    // Get current calculation type and parameters
    var calculationType = appState.currentCalculationType;
    if (!calculationType) return;
    
    console.log('🔄 Updating parameter form columns for:', calculationType);
    console.log('📊 Current intervals:', appState.selectedIntervals);
    console.log('🏗️ Current wells:', appState.selectedWells);
    
    // Get parameter definitions for current calculation
    getCalculationParameters(calculationType)
        .then(function(parameters) {
            // Re-render the parameter form with updated columns
            showParameterForm(calculationType, parameters, true); // true = update mode
        })
        .catch(function(error) {
            console.error('Error updating parameter form:', error);
        });
}

// Update header display to show current selection status
function updateHeaderDisplay() {
    // Update intervals count display
    var intervalsCount = document.getElementById('selectedIntervalsCount');
    if (intervalsCount) {
        intervalsCount.textContent = appState.selectedIntervals.length;
    }
    
    // Update wells count display
    var wellsCount = document.getElementById('selectedWellsCount');
    if (wellsCount) {
        wellsCount.textContent = appState.selectedWells.length;
    }
    
    // Update header text with real-time status
    var headerStatus = document.querySelector('.header-selection-status');
    if (headerStatus) {
        var statusText = '';
        if (appState.selectedWells.length > 0 || appState.selectedIntervals.length > 0) {
            statusText = `Wells: ${appState.selectedWells.length} | Intervals: ${appState.selectedIntervals.length}`;
        } else {
            statusText = 'No selection made';
        }
        headerStatus.textContent = statusText;
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

    // Load both markers and zones; default tab decides which list is visible
    Promise.all([
        fetchJson('/get_markers').catch(function(err){ console.warn('Markers load failed', err); return { status:'error', markers: [] }; }),
        fetchJson('/get_zones').catch(function(err){ console.warn('Zones load failed', err); return { status:'error', zones: [] }; })
    ])
    .then(function(results){
        var markersResp = results[0] || {};
        var zonesResp = results[1] || {};
        var markers = Array.isArray(markersResp.markers) ? markersResp.markers : [];
        var zones = Array.isArray(zonesResp.zones) ? zonesResp.zones : [];

        appState.availableIntervals = markers; // keep for backward compat (markers)
        appState.availableZones = zones;

        renderMarkersList(markers);
        renderZonesList(zones);
        updateBadges();
        updateIntervalsTabVisibility();
    })
    .catch(function(error){
        console.error('Failed to load intervals/zones:', error);
        showError('Failed to load intervals/zones: ' + error.message);
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

// Back-compat: markers list was previously called interval list
// Back-compat: legacy interval list now maps to markers list UI
function renderIntervalList(intervals) {
    renderMarkersList(intervals || []);
}

function renderMarkersList(markers) {
    var list = document.getElementById('markersList');
    if (!list) return;
    list.innerHTML = '';
    if (!markers || markers.length === 0) {
        list.innerHTML = '<div class="empty-state">No markers available</div>';
        return;
    }
    markers.forEach(function(name){
        var item = document.createElement('div');
        item.className = 'list-item';
        item.setAttribute('data-id', name);
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = 'marker-' + name;
        cb.checked = appState.selectedIntervals.indexOf(name) !== -1;
        var label = document.createElement('label');
        label.htmlFor = cb.id;
        label.textContent = name;
        var dot = document.createElement('div');
        dot.className = 'status-dot';
        dot.style.display = cb.checked ? 'block' : 'none';
        item.appendChild(cb); item.appendChild(label); item.appendChild(dot);
        item.addEventListener('click', function(e){
            var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (e.target === cb || tag === 'label') return;
            cb.checked = !cb.checked;
            toggleInterval(name);
        });
        cb.addEventListener('change', function(e){ e.stopPropagation(); toggleInterval(name); });
        list.appendChild(item);
    });
}

function renderZonesList(zones) {
    var list = document.getElementById('zonesList');
    if (!list) return;
    list.innerHTML = '';
    if (!zones || zones.length === 0) {
        list.innerHTML = '<div class="empty-state">No zones available</div>';
        return;
    }
    zones.forEach(function(name){
        var item = document.createElement('div');
        item.className = 'list-item';
        item.setAttribute('data-id', name);
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = 'zone-' + name;
        cb.checked = appState.selectedZones.indexOf(name) !== -1;
        var label = document.createElement('label');
        label.htmlFor = cb.id;
        label.textContent = name;
        var dot = document.createElement('div');
        dot.className = 'status-dot';
        dot.style.display = cb.checked ? 'block' : 'none';
        item.appendChild(cb); item.appendChild(label); item.appendChild(dot);
        item.addEventListener('click', function(e){
            var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (e.target === cb || tag === 'label') return;
            cb.checked = !cb.checked;
            toggleZone(name);
        });
        cb.addEventListener('change', function(e){ e.stopPropagation(); toggleZone(name); });
        list.appendChild(item);
    });
}

function updateIntervalsTabVisibility() {
    var markersControls = document.getElementById('markersSelectAll');
    var zonesControls = document.getElementById('zonesSelectAll');
    var markersList = document.getElementById('markersList');
    var zonesList = document.getElementById('zonesList');
    if (!markersControls || !zonesControls || !markersList || !zonesList) return;
    var showMarkers = appState.intervalsTab === 'markers';
    markersControls.classList.toggle('hidden', !showMarkers);
    markersList.classList.toggle('hidden', !showMarkers);
    zonesControls.classList.toggle('hidden', showMarkers);
    zonesList.classList.toggle('hidden', showMarkers);
}

function toggleZone(zoneName) {
    var idx = appState.selectedZones.indexOf(zoneName);
    if (idx === -1) {
        // Switching to zones clears markers selection per spec
        if (appState.intervalsTab !== 'zones') {
            appState.selectedIntervals = [];
            appState.intervalsTab = 'zones';
            updateIntervalsTabVisibility();
        }
        appState.selectedZones.push(zoneName);
    } else {
        appState.selectedZones.splice(idx, 1);
    }
    updateZonesSelectionUI();
    updateBadges();
    updateParameterFormColumns();
}

function updateZonesSelectionUI() {
    var items = document.querySelectorAll('#zonesList .list-item');
    items.forEach(function(item){
        var name = item.getAttribute('data-id');
        var cb = item.querySelector('input[type="checkbox"]');
        var dot = item.querySelector('.status-dot');
        var selected = appState.selectedZones.indexOf(name) !== -1;
        item.classList.toggle('selected', selected);
        if (cb) cb.checked = selected;
        if (dot) dot.style.display = selected ? 'block' : 'none';
    });
    var allCb = document.getElementById('selectAllZones');
    if (allCb) allCb.checked = appState.selectedZones.length === appState.availableZones.length && appState.availableZones.length > 0;
}

function toggleAllZones() {
    var checkbox = document.getElementById('selectAllZones');
    if (!checkbox) return;
    // Switching to zones clears markers selection per spec
    appState.intervalsTab = 'zones';
    appState.selectedIntervals = [];
    if (checkbox.checked) {
        appState.selectedZones = (appState.availableZones || []).slice();
    } else {
        appState.selectedZones = [];
    }
    updateIntervalsTabVisibility();
    updateZonesSelectionUI();
    updateBadges();
}

function toggleInterval(intervalId) {
    console.log('🎯 Toggling interval:', intervalId);
    
    var index = appState.selectedIntervals.indexOf(intervalId);
    if (index === -1) {
        appState.selectedIntervals.push(intervalId);
    } else {
        appState.selectedIntervals.splice(index, 1);
    }
    
    updateIntervalSelection();
    updateBadges();
    
    // Update parameter form columns in realtime if form is open
    updateParameterFormColumns();
    
    // Regenerate plot when intervals change (if wells are selected)
    if (appState.selectedWells.length > 0) {
        console.log('Regenerating plot with new interval selection');
        generatePlot();
    }
}

function updateIntervalSelection() {
    // Update markers list selection state
    var intervalItems = document.querySelectorAll('#markersList .list-item');
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
    // Select-all checkbox is handled via #selectAllMarkers now
    var selectAllMarkers = document.getElementById('selectAllMarkers');
    if (selectAllMarkers) {
        selectAllMarkers.checked = appState.selectedIntervals.length === (appState.availableIntervals || []).length && (appState.availableIntervals || []).length > 0;
    }
}

function toggleAllIntervals() {
    var checkbox = document.getElementById('selectAllIntervals');
    
    if (checkbox && checkbox.checked) {
        appState.selectedIntervals = appState.availableIntervals.slice(); // Copy array
    } else {
        appState.selectedIntervals = [];
    }
    
    updateIntervalSelection();
    updateBadges();
    
    // Regenerate plot when all intervals are toggled (if wells are selected)
    if (appState.selectedWells.length > 0) {
        console.log('Regenerating plot with all intervals toggled');
        generatePlot();
    }
}

function toggleAllMarkers() {
    var checkbox = document.getElementById('selectAllMarkers');
    
    if (checkbox && checkbox.checked) {
        appState.selectedIntervals = (appState.availableIntervals || []).slice(); // Copy array
    } else {
        appState.selectedIntervals = [];
    }
    
    // Switch to markers tab if not already
    appState.intervalsTab = 'markers';
    updateIntervalsTabVisibility();
    updateIntervalSelection();
    updateBadges();
    
    // Regenerate plot when all markers are toggled (if wells are selected)
    if (appState.selectedWells.length > 0) {
        console.log('Regenerating plot with all markers toggled');
        generatePlot();
    }
}

function clearIntervals() {
    var intervalList = document.getElementById('intervalList');
    if (intervalList) intervalList.innerHTML = '<div class="empty-state">Select wells to view intervals</div>';
    var markersList = document.getElementById('markersList');
    var zonesList = document.getElementById('zonesList');
    if (markersList) markersList.innerHTML = '<div class="empty-state">Select wells to view markers</div>';
    if (zonesList) zonesList.innerHTML = '<div class="empty-state">Select wells to view zones</div>';
    appState.selectedIntervals = [];
    appState.availableIntervals = [];
    appState.selectedZones = [];
    appState.availableZones = [];
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
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            toImageButtonOptions: {
                format: 'png',
                filename: 'well_log_plot',
                height: 1200,
                width: 1000,
                scale: 1
            }
        };
        
        // Set size - use a fixed height that allows for vertical scrolling
        var containerHeight = plotArea.clientHeight || plotArea.getBoundingClientRect().height;
        var containerWidth = plotArea.clientWidth || plotArea.getBoundingClientRect().width;
        
        // Wait a bit for layout to settle if container has no size yet
        if ((!containerHeight || containerHeight < 100) && (!containerWidth || containerWidth < 100)) {
            setTimeout(function() {
                containerHeight = plotArea.clientHeight || plotArea.getBoundingClientRect().height;
                containerWidth = plotArea.clientWidth || plotArea.getBoundingClientRect().width;
            }, 100);
        }
        
        // Use a larger fixed height to allow for vertical scrolling
        // The plot can be taller than the container, enabling scroll
        var plotHeight = 1200; // Fixed height that's larger than container
        if (figureData.layout.height && figureData.layout.height > plotHeight) {
            plotHeight = figureData.layout.height; // Use provided height if larger
        }
        
        figureData.layout.height = plotHeight;
        
        if (containerWidth && containerWidth > 0) {
            figureData.layout.width = containerWidth - 20; // Small margin
        }
        
        Plotly.newPlot(plotArea, figureData.data, figureData.layout, config).then(function(){
            // Keep plot fitting on resize - only adjust width, keep height fixed for scrolling
            function handleResize() {
                var w = plotArea.clientWidth || plotArea.getBoundingClientRect().width;
                if (w && w > 100) {
                    Plotly.relayout(plotArea, { 
                        width: w - 20 
                    });
                } else {
                    // Use Plotly's automatic resize for width only
                    Plotly.Plots.resize(plotArea);
                }
            }
            
            // Add resize listener
            window.addEventListener('resize', handleResize);
            
            // Also handle when sidebar is resized or toggled
            const resizeObserver = new ResizeObserver(function(entries) {
                for (let entry of entries) {
                    if (entry.target === plotArea) {
                        handleResize();
                    }
                }
            });
            resizeObserver.observe(plotArea);
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

// Display calculation results as plot
function displayCalculationPlot(plotData, title) {
    console.log('Displaying calculation plot:', title);
    
    try {
        var plotArea = document.getElementById('plotArea');
        if (!plotArea) {
            throw new Error('Plot area not found');
        }
        
        // Clear any existing empty state
        plotArea.innerHTML = '';
        
        // Prepare plot configuration
        var config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            toImageButtonOptions: {
                format: 'png',
                filename: 'calculation_result_' + title.replace(/\s+/g, '_').toLowerCase(),
                height: 1200,
                width: 1000,
                scale: 1
            }
        };
        
        // Set layout for calculation plot
        if (!plotData.layout) {
            plotData.layout = {};
        }
        
        plotData.layout.title = plotData.layout.title || title;
        plotData.layout.autosize = true;
        plotData.layout.margin = Object.assign({ t: 60, r: 30, b: 50, l: 60 }, plotData.layout.margin || {});
        
        // Set size - use a fixed height that allows for vertical scrolling
        var containerHeight = plotArea.clientHeight || plotArea.getBoundingClientRect().height;
        var containerWidth = plotArea.clientWidth || plotArea.getBoundingClientRect().width;
        
        // Use a larger fixed height to allow for vertical scrolling
        var plotHeight = 1200; // Fixed height that's larger than container
        if (plotData.layout.height && plotData.layout.height > plotHeight) {
            plotHeight = plotData.layout.height; // Use provided height if larger
        }
        
        plotData.layout.height = plotHeight;
        
        if (containerWidth && containerWidth > 100) {
            plotData.layout.width = containerWidth - 20;
        }
        
        // Create the plot
        Plotly.newPlot(plotArea, plotData.data, plotData.layout, config).then(function(){
            // Add resize handling for calculation plots - only adjust width, keep height fixed for scrolling
            function handleCalculationResize() {
                var w = plotArea.clientWidth || plotArea.getBoundingClientRect().width;
                if (w && w > 100) {
                    Plotly.relayout(plotArea, { 
                        width: w - 20 
                    });
                } else {
                    Plotly.Plots.resize(plotArea);
                }
            }
            
            window.addEventListener('resize', handleCalculationResize);
        });
        
        console.log('Calculation plot created successfully:', title);
        
    } catch (error) {
        console.error('Error creating calculation plot:', error);
        showError('Error displaying calculation results: ' + error.message);
    }
}

// Refresh current plot to show updated data
function refreshCurrentPlot() {
    console.log('Refreshing current plot with updated data');
    
    // If we have selected wells, regenerate the current plot
    if (appState.selectedWells.length > 0) {
        // Get current plot type
        var currentPlotType = appState.plotType || 'default';
        
        // Regenerate plot based on current selection
        generatePlot();
        
        showSuccess('Plot refreshed with updated calculation results');
    } else {
        showSuccess('Calculation completed successfully');
    }
}

// Generate plot based on current selection (wells and intervals)
function generatePlot() {
    console.log('Generating plot for selected wells and intervals');
    
    if (appState.selectedWells.length === 0) {
        showError('Please select at least one well to generate plot');
        return Promise.reject(new Error('No wells selected'));
    }
    
    // Use the primary selected well for plotting
    var primaryWell = appState.selectedWells[0];
    
    // Load plot with current intervals
    return loadWellPlot(primaryWell);
    
    console.log('Plot generated for well:', primaryWell, 'with intervals:', appState.selectedIntervals);
}

// Removed mock calculation generators; use real backend responses only

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
                { name: 'SLIDING_WINDOW', location: 'Interval', mode: 'In_Out', description: 'Sliding window size for regression', unit: 'Points', type: 'number', default_value: 100, required: true, min: 20, max: 500 },
                { name: 'GR', location: 'Log', mode: 'Input', description: 'Gamma ray log', unit: 'GAPI', type: 'select', options: ['GR', 'CGR', 'SGR'], default_value: 'GR', required: true },
                { name: 'RES', location: 'Log', mode: 'Input', description: 'Resistivity log', unit: 'OHMM', type: 'select', options: ['RT', 'ILD', 'LLD', 'RD'], default_value: 'RT', required: true },
                { name: 'RES_MIN', location: 'Interval', mode: 'In_Out', description: 'Minimum resistivity filter', unit: 'OHMM', type: 'number', default_value: 0.1, required: false, min: 0.01, max: 10 },
                { name: 'RES_MAX', location: 'Interval', mode: 'In_Out', description: 'Maximum resistivity filter', unit: 'OHMM', type: 'number', default_value: 1000, required: false, min: 10, max: 10000 },
                { name: 'LITH', location: 'Log', mode: 'Input', description: 'Lithology column (optional)', unit: '', type: 'select', options: ['LITHOLOGY', 'LITH', 'FACIES'], default_value: 'LITHOLOGY', required: false }
            ]
        },
        'dgsa': {
            title: 'Density Gamma Ray Shale Analysis (DGSA) Parameters',
            parameters: [
                { name: 'SLIDING_WINDOW', location: 'Interval', mode: 'In_Out', description: 'Sliding window size for regression', unit: 'Points', type: 'number', default_value: 100, required: true, min: 20, max: 500 },
                { name: 'GR', location: 'Log', mode: 'Input', description: 'Gamma ray log', unit: 'GAPI', type: 'select', options: ['GR', 'CGR', 'SGR'], default_value: 'GR', required: true },
                { name: 'DENS', location: 'Log', mode: 'Input', description: 'Density log', unit: 'G/C3', type: 'select', options: ['RHOB', 'RHOZ'], default_value: 'RHOB', required: true }
            ]
        },
        'ngsa': {
            title: 'Neutron Gamma Ray Shale Analysis (NGSA) Parameters',
            parameters: [
                { name: 'SLIDING_WINDOW', location: 'Interval', mode: 'In_Out', description: 'Sliding window size for regression', unit: 'Points', type: 'number', default_value: 100, required: true, min: 20, max: 500 },
                { name: 'GR', location: 'Log', mode: 'Input', description: 'Gamma ray log', unit: 'GAPI', type: 'select', options: ['GR', 'CGR', 'SGR'], default_value: 'GR', required: true },
                { name: 'NEUT', location: 'Log', mode: 'Input', description: 'Neutron log', unit: 'V/V', type: 'select', options: ['NPHI', 'TNPH'], default_value: 'NPHI', required: true }
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
        },
        'vsh-gr': {
            title: 'Volume of Shale from Gamma Ray (VSH-GR) Parameters',
            parameters: [
                { name: 'OPT_GR', location: 'Interval', mode: 'In_Out', description: 'Option for VSH from gamma ray', unit: 'ALPHA*8', type: 'text', default_value: '', required: false },
                { name: 'GR_MA', location: 'Interval', mode: 'In_Out', description: 'Gamma ray matrix (clean)', unit: 'GAPI', type: 'number', default_value: 30, required: true },
                { name: 'GR_SH', location: 'Interval', mode: 'In_Out', description: 'Gamma ray shale', unit: 'GAPI', type: 'number', default_value: 120, required: true },
                // { name: 'OPT_COAL', location: 'Interval', mode: 'In_Out', description: 'Option to allow coal logic', unit: 'LOGICAL', type: 'text', default_value: '', required: false },
                { name: 'GR', location: 'Log', mode: 'Input', description: 'Gamma ray log', unit: 'GAPI', type: 'select', options: ['GR', 'CGR', 'SGR'], default_value: 'GR', required: true },
                { name: 'VSH_GR', location: 'Log', mode: 'Output', description: 'VSH from gamma ray', unit: 'V/V', type: 'text', default_value: 'VSH_GR', required: true }
            ]
        },
        'vsh-dn': {
            title: 'Volume of Shale from Density-Neutron (VSH-DN) Parameters', 
            parameters: [
                { name: 'RHOB_MA', location: 'Interval', mode: 'In_Out', description: 'Matrix density', unit: 'G/C3', type: 'number', default_value: 2.65, required: true },
                { name: 'RHOB_SH', location: 'Interval', mode: 'In_Out', description: 'Shale density', unit: 'G/C3', type: 'number', default_value: 2.61, required: true },
                { name: 'RHOB_FL', location: 'Interval', mode: 'In_Out', description: 'Fluid density', unit: 'G/C3', type: 'number', default_value: 0.85, required: true },
                { name: 'NPHI_MA', location: 'Interval', mode: 'In_Out', description: 'Matrix neutron porosity', unit: 'V/V', type: 'number', default_value: -0.02, required: true },
                { name: 'NPHI_SH', location: 'Interval', mode: 'In_Out', description: 'Shale neutron porosity', unit: 'V/V', type: 'number', default_value: 0.398, required: true },
                { name: 'NPHI_FL', location: 'Interval', mode: 'In_Out', description: 'Fluid neutron porosity', unit: 'V/V', type: 'number', default_value: 0.85, required: true },
                { name: 'RHOB', location: 'Log', mode: 'Input', description: 'Density log', unit: 'G/C3', type: 'select', options: ['RHOB', 'RHOZ'], default_value: 'RHOB', required: true },
                { name: 'NPHI', location: 'Log', mode: 'Input', description: 'Neutron porosity log', unit: 'V/V', type: 'select', options: ['NPHI', 'TNPH'], default_value: 'NPHI', required: true },
                { name: 'VSH', location: 'Log', mode: 'Output', description: 'VSH from density-neutron', unit: 'V/V', type: 'text', default_value: 'VSH_DN', required: true }
            ]
        },
        'porosity': {
            title: 'Porosity from Density-Neutron (Bateman/Konen Method) Parameters',
            parameters: [
                { name: 'RHOB_FL', location: 'Interval', mode: 'In_Out', description: 'Fluid Density', unit: 'G/C3', type: 'number', default_value: 1.00, required: true },
                { name: 'RHOB_SH', location: 'Interval', mode: 'In_Out', description: 'Shale Density', unit: 'G/C3', type: 'number', default_value: 2.45, required: true },
                { name: 'RHOB_DSH', location: 'Interval', mode: 'In_Out', description: 'Dry Shale Density', unit: 'G/C3', type: 'number', default_value: 2.60, required: true },
                { name: 'NPHI_SH', location: 'Interval', mode: 'In_Out', description: 'Shale Neutron Porosity', unit: 'V/V', type: 'number', default_value: 0.35, required: true },
                { name: 'PHIE_MAX', location: 'Interval', mode: 'In_Out', description: 'Maximum PHIE', unit: 'V/V', type: 'number', default_value: 0.3, required: true },
                { name: 'RHOB_MA_BASE', location: 'Interval', mode: 'In_Out', description: 'Matrix Density', unit: 'G/C3', type: 'number', default_value: 2.65, required: true },
                { name: 'RHOB_W', location: 'Interval', mode: 'In_Out', description: 'Water Density', unit: 'G/C3', type: 'number', default_value: 1.00, required: true },
                { name: 'RHOB_MAX', location: 'Interval', mode: 'In_Out', description: 'Max Density', unit: 'G/C3', type: 'number', default_value: 4.00, required: true }
            ]
        },
        'sw-indonesia': {
            title: 'Water Saturation Indonesia Method Parameters',
            parameters: [
                { name: 'RW', location: 'Interval', mode: 'In_Out', description: 'Formation water resistivity', unit: 'OHMM', type: 'number', default_value: 0.05, required: true },
                { name: 'A', location: 'Interval', mode: 'In_Out', description: 'Tortuosity constant', unit: '', type: 'number', default_value: 1.0, required: true },
                { name: 'M', location: 'Interval', mode: 'In_Out', description: 'Cementation Factor', unit: '', type: 'number', default_value: 2.0, required: true },
                { name: 'N', location: 'Interval', mode: 'In_Out', description: 'Saturation Exponent', unit: '', type: 'number', default_value: 2.0, required: true },
                { name: 'RT_SH', location: 'Interval', mode: 'In_Out', description: 'Shale resistivity', unit: 'OHMM', type: 'number', default_value: 2.2, required: true },
                { name: 'RT', location: 'Log', mode: 'Input', description: 'Resistivity Log', unit: 'OHMM', type: 'select', options: ['RT', 'ILD', 'RD'], default_value: 'RT', required: true },
                { name: 'PHIE', location: 'Log', mode: 'Input', description: 'Effective Porosity Log', unit: 'V/V', type: 'select', options: ['PHIE', 'PHID'], default_value: 'PHIE', required: true },
                { name: 'VSH', location: 'Log', mode: 'Input', description: 'Volume of Shale Log', unit: 'V/V', type: 'select', options: ['VSH', 'VSH_GR'], default_value: 'VSH', required: true },
                { name: 'FTEMP', location: 'Log', mode: 'Input', description: 'Formation Temperature Log', unit: 'DEGF', type: 'select', options: ['FTEMP', 'TEMP'], default_value: 'FTEMP', required: true }
            ]
        },
        'sw-simandoux': {
            title: 'Water Saturation Simandoux Method Parameters',
            parameters: [
                { name: 'RW', location: 'Interval', mode: 'In_Out', description: 'Formation water resistivity', unit: 'OHMM', type: 'number', default_value: 0.05, required: true },
                { name: 'A', location: 'Interval', mode: 'In_Out', description: 'Tortuosity constant', unit: '', type: 'number', default_value: 1.0, required: true },
                { name: 'M', location: 'Interval', mode: 'In_Out', description: 'Cementation Factor', unit: '', type: 'number', default_value: 2.0, required: true },
                { name: 'N', location: 'Interval', mode: 'In_Out', description: 'Saturation Exponent', unit: '', type: 'number', default_value: 2.0, required: true },
                { name: 'RT_SH', location: 'Interval', mode: 'In_Out', description: 'Shale resistivity', unit: 'OHMM', type: 'number', default_value: 2.2, required: true },
                { name: 'RT', location: 'Log', mode: 'Input', description: 'Resistivity Log', unit: 'OHMM', type: 'select', options: ['RT', 'ILD', 'RD'], default_value: 'RT', required: true },
                { name: 'PHIE', location: 'Log', mode: 'Input', description: 'Effective Porosity Log', unit: 'V/V', type: 'select', options: ['PHIE', 'PHID'], default_value: 'PHIE', required: true },
                { name: 'VSH', location: 'Log', mode: 'Input', description: 'Volume of Shale Log', unit: 'V/V', type: 'select', options: ['VSH', 'VSH_GR'], default_value: 'VSH', required: true }
            ]
        },
        'water-resistivity': {
            title: 'Water Resistivity Input Parameters',
            parameters: [
                { name: 'A', location: 'Interval', mode: 'In_Out', description: 'Tortuosity constant', unit: '', type: 'number', default_value: 1.0, required: true },
                { name: 'M', location: 'Interval', mode: 'In_Out', description: 'Cementation Factor', unit: '', type: 'number', default_value: 2.0, required: true },
                { name: 'RT_SH', location: 'Interval', mode: 'In_Out', description: 'Shale resistivity', unit: 'OHMM', type: 'number', default_value: 2.2, required: true }
            ]
        },
        'rgbe-rpbe': {
            title: 'RGBE-RPBE Analysis Parameters',
            parameters: [
                { name: 'MIN_INTERVAL_SIZE', location: 'Interval', mode: 'In_Out', description: 'Minimum interval size for analysis', unit: 'Points', type: 'number', default_value: 10, required: true, min: 5, max: 100 },
                { name: 'R_SQUARED_THRESHOLD', location: 'Interval', mode: 'In_Out', description: 'R-squared threshold for regression quality', unit: '', type: 'number', default_value: 0.5, required: true, min: 0.1, max: 1.0, step: 0.1 },
                { name: 'GR_COLUMN', location: 'Log', mode: 'Input', description: 'Gamma ray log column', unit: 'GAPI', type: 'select', options: ['GR', 'CGR', 'SGR'], default_value: 'GR', required: true },
                { name: 'RT_COLUMN', location: 'Log', mode: 'Input', description: 'Resistivity log column', unit: 'OHMM', type: 'select', options: ['RT', 'ILD', 'LLD', 'RD'], default_value: 'RT', required: true },
                { name: 'PHIE_COLUMN', location: 'Log', mode: 'Input', description: 'Effective porosity column', unit: 'V/V', type: 'select', options: ['PHIE', 'PHID', 'NPHI'], default_value: 'PHIE', required: true }
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
function showParameterForm(calculationType, parameters, isUpdate = false) {
    var parameterForm = document.getElementById('parameterForm');
    var parameterRows = document.getElementById('parameterRows');
    
    if (!parameterForm || !parameterRows) {
        showError('Parameter form not found in DOM');
        return;
    }
    
    // Store current calculation type for updates
    appState.currentCalculationType = calculationType;
    
    console.log(`${isUpdate ? '🔄 Updating' : '📝 Showing'} parameter form for:`, calculationType);
    console.log('📊 Selected intervals:', appState.selectedIntervals);
    console.log('🏗️ Selected wells:', appState.selectedWells);
    
    // Preserve existing values if in update mode
    var existingValues = {};
    if (isUpdate) {
        var existingInputs = parameterForm.querySelectorAll('input, select');
        existingInputs.forEach(function(input) {
            if (input.name && input.value) {
                existingValues[input.name] = input.value;
            }
        });
    }
    
    // Clear existing parameters
    parameterRows.innerHTML = '';
    
    // Set form title
    var formTitle = document.querySelector('#parameterForm .form-header h3');
    if (formTitle) {
        formTitle.textContent = parameters.title || (calculationType.toUpperCase() + ' Parameters');
    }
    
    // Add wells and intervals info header
    var infoHeader = document.querySelector('#parameterForm .wells-intervals-info');
    if (!infoHeader) {
        infoHeader = document.createElement('div');
        infoHeader.className = 'wells-intervals-info';
        infoHeader.style.cssText = 'padding: 10px; background: #f0f8ff; border: 1px solid #ddd; margin-bottom: 15px; border-radius: 4px;';
        var formHeader = document.querySelector('#parameterForm .form-header');
        if (formHeader) {
            formHeader.appendChild(infoHeader);
        }
    }
    infoHeader.innerHTML = '<p style="margin: 0; font-weight: bold;">Wells: ' + 
        (appState.selectedWells.length > 0 ? appState.selectedWells.join(', ') : 'None selected') + 
        ' | Intervals: ' + appState.selectedIntervals.length + ' selected</p>';
    
    // Create table header with dynamic interval columns
    var tableHeader = document.querySelector('#parameterForm .parameter-table thead');
    if (tableHeader) {
        var headerHtml = '<tr>' +
            '<th>#</th>' +
            '<th>Location</th>' +
            '<th>Mode</th>' +
            '<th>Comment</th>' +
            '<th>Unit</th>' +
            '<th>Name</th>' +
            '<th>P</th>';
        
        // Add header for each selected interval
        appState.selectedIntervals.forEach(function(interval) {
            headerHtml += '<th>' + interval + '</th>';
        });
        
        headerHtml += '</tr>';
        tableHeader.innerHTML = headerHtml;
    }
    
    // Create parameter rows with interval-specific columns
    parameters.parameters.forEach(function(param, index) {
        var row = document.createElement('tr');
        row.className = getParameterRowBgColor(param.location, param.mode);
        
        var cellHtml = '<td>' + (index + 1) + '</td>' +
                      '<td>' + (param.location || 'Interval') + '</td>' +
                      '<td>' + (param.mode || 'In_Out') + '</td>' +
                      '<td>' + (param.description || param.label || '') + '</td>' +
                      '<td>' + (param.unit || '') + '</td>' +
                      '<td style="font-weight: bold;">' + param.name + '</td>' +
                      '<td style="text-align: center;"><input type="checkbox" class="sync-checkbox" data-param="' + param.name + '"></td>';
        
        // Add input cells for each selected interval
        if (appState.selectedIntervals.length > 0) {
            appState.selectedIntervals.forEach(function(interval) {
                cellHtml += '<td>';
                if (param.type === 'select') {
                    cellHtml += '<select name="' + param.name + '_' + interval + '" class="interval-input" style="width: 100%; min-width: 100px;">';
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
                    cellHtml += '<input type="number" name="' + param.name + '_' + interval + '" value="' + defaultVal + '" step="' + step + '" ' + min + ' ' + max + ' class="interval-input" style="width: 100%; min-width: 100px;">';
                } else {
                    var defaultVal = param.default_value !== undefined ? param.default_value : '';
                    cellHtml += '<input type="text" name="' + param.name + '_' + interval + '" value="' + defaultVal + '" class="interval-input" style="width: 100%; min-width: 100px;">';
                }
                cellHtml += '</td>';
            });
        } else {
            // If no intervals selected, show default input
            cellHtml += '<td>';
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
            cellHtml += '</td>';
        }
        
        row.innerHTML = cellHtml;
        parameterRows.appendChild(row);
    });
    
    // Add sync checkbox functionality
    addSyncCheckboxListeners();
    
    // Show the form
    parameterForm.classList.remove('hidden');
    
    // Store current calculation type
    appState.currentCalculationType = calculationType;
    
    console.log('Parameter form shown for:', calculationType, 'with', appState.selectedIntervals.length, 'intervals');
}

// Helper function to get row background color based on location and mode
function getParameterRowBgColor(location, mode) {
    switch (location) {
        case 'Parameter':
            return 'bg-orange-600';
        case 'Constant':
            return mode === 'Input' ? 'bg-yellow-300' : 'bg-yellow-100';
        case 'Log':
            return mode === 'Input' ? 'bg-cyan-400' : 'bg-cyan-200';
        case 'Output':
            return 'bg-yellow-600';
        case 'Interval':
            return 'bg-green-400';
        default:
            return 'bg-white';
    }
}

// Add sync checkbox functionality for interval parameters
function addSyncCheckboxListeners() {
    var syncCheckboxes = document.querySelectorAll('.sync-checkbox');
    syncCheckboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            var paramName = this.getAttribute('data-param');
            var isSync = this.checked;
            var intervalInputs = document.querySelectorAll('input[name^="' + paramName + '_"], select[name^="' + paramName + '_"]');
            
            if (isSync && intervalInputs.length > 1) {
                // Sync all interval inputs for this parameter to the first one's value
                var firstValue = intervalInputs[0].value;
                intervalInputs.forEach(function(input) {
                    input.value = firstValue;
                    input.addEventListener('input', function() {
                        if (isSync) {
                            intervalInputs.forEach(function(otherInput) {
                                if (otherInput !== input) {
                                    otherInput.value = input.value;
                                }
                            });
                        }
                    });
                });
            }
        });
    });
}

// Submit calculation parameters
function submitCalculationParameters() {
    var parameterForm = document.getElementById('parameterForm');
    
    var params = {};
    var intervalParams = {};
    var inputs = parameterForm.querySelectorAll('input, select');
    
    inputs.forEach(function(input) {
        if (input.name && input.type !== 'checkbox' && !input.classList.contains('sync-checkbox')) {
            var value = input.value;
            if (input.type === 'number') {
                value = input.step === '1' ? parseInt(value) : parseFloat(value);
            }
            
            // Check if this is an interval-specific parameter (contains '_')
            if (input.name.includes('_') && appState.selectedIntervals.length > 0) {
                var parts = input.name.split('_');
                var paramName = parts[0];
                var interval = parts.slice(1).join('_'); // Handle intervals with underscores in name
                
                if (!intervalParams[interval]) {
                    intervalParams[interval] = {};
                }
                intervalParams[interval][paramName] = value;
            } else {
                // Regular parameter (not interval-specific)
                params[input.name] = value;
            }
        }
    });
    
    // If we have interval-specific parameters, use them; otherwise use regular params
    var finalParams;
    if (Object.keys(intervalParams).length > 0) {
        // Format for backend processing with intervals structure
        finalParams = {
            intervals: intervalParams,
            // Also include first interval's values as fallback
            ...Object.values(intervalParams)[0] || {}
        };
    } else {
        finalParams = params;
    }
    
    console.log('🚀 Running calculation with params:', finalParams);
    console.log('📊 Interval-specific params:', intervalParams);
    console.log('Calculation type:', appState.currentCalculationType);
    console.log('Selected wells:', appState.selectedWells);
    console.log('Selected intervals:', appState.selectedIntervals);
    
    setIsLoading(true);
    
    // Real calculation execution for specific modules
    var calculationType = appState.currentCalculationType;
    
    // Handle specific calculations
    if (calculationType === 'vsh-gr') {
        handleVshGRCalculation(finalParams);
    } else if (calculationType === 'vsh-dn') {
        handleVshDNCalculation(finalParams);
    } else if (calculationType === 'porosity-calculation') {
        handlePorosityCalculation(finalParams);
    } else if (calculationType === 'sw-indonesia') {
        handleSWIndonesiaCalculation(finalParams);
    } else if (calculationType === 'sw-simandoux') {
        handleSWSimandouxCalculation(finalParams);
    } else if (calculationType === 'water-resistivity' || calculationType === 'water-resistivity-calculation') {
        handleWaterResistivityCalculation(finalParams);
    } else if (calculationType === 'rgsa') {
        handleRGSACalculation(finalParams);
    } else if (calculationType === 'dgsa') {
        handleDGSACalculation(finalParams);
    } else if (calculationType === 'ngsa') {
        handleNGSACalculation(finalParams);
    } else if (calculationType === 'rgbe-rpbe') {
        handleRgbeRpbeCalculation(finalParams);
    } else {
        // For other calculations, use the generic calculation endpoint
        var payload = {
            calculation_type: calculationType,
            params: finalParams,
            selected_intervals: appState.selectedIntervals,
            selected_wells: appState.selectedWells
        };
        
        fetchJson('/run_calculation_endpoint', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then(function(response) {
            if (response.status === 'success') {
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
                
                // Generate calculation plot to show results
                createCalculationPlot(calculationType);
            } else {
                throw new Error(response.message || 'Calculation failed');
            }
        })
        .catch(function(error) {
            showError('Calculation error: ' + error.message);
        })
        .finally(function() {
            setIsLoading(false);
        });
    }
}

// Specific calculation handler functions for real backend integration
function handleVshGRCalculation(params) {
    // Extract parameters from interval-specific format if available
    var finalParams = params;
    var intervalSpecific = null;
    
    if (params.intervals && Object.keys(params.intervals).length > 0) {
        // Use first interval's parameters as default for main calculation
        var firstInterval = Object.keys(params.intervals)[0];
        finalParams = params.intervals[firstInterval];
        intervalSpecific = params.intervals;
    }
    
    var payload = {
        calculation_type: 'vsh',
        params: {
            gr_ma: parseFloat(finalParams.GR_MA || finalParams.gr_ma) || 30,
            gr_sh: parseFloat(finalParams.GR_SH || finalParams.gr_sh) || 120,
            input_log: finalParams.GR_LOG || finalParams.gr_log || 'GR',
            output_log: finalParams.VSH_GR || finalParams.output_log || 'VSH_GR',
            intervals: intervalSpecific
        },
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals
    };
    
    console.log('🚀 VSH-GR Calculation payload:', payload);
    
    fetchJson('/vsh_calculation', {
        method: 'POST',
        body: JSON.stringify({
            method: 'vsh_gr',
            parameters: payload.params,
            selected_wells: payload.selected_wells,
            selected_intervals: payload.selected_intervals,
            interval_specific_params: params.intervals || null
        })
    })
    .then(function(data) {
        setIsLoading(false);
        if (data.status === 'success') {
            showSuccess('VSH-GR calculation completed successfully!');
            document.getElementById('parameterForm').classList.add('hidden');
            
            // Create calculation plot to show results
            createCalculationPlot('vsh');
        } else {
            throw new Error(data.message || 'VSH-GR calculation failed');
        }
    })
    .catch(function(error) {
        setIsLoading(false);
        showError('Error in VSH-GR calculation: ' + error.message);
        console.error('VSH-GR Calculation error:', error);
    });
}

function handleVshDNCalculation(params) {
    // Extract parameters from interval-specific format if available
    var finalParams = params;
    var intervalSpecific = null;
    
    if (params.intervals && Object.keys(params.intervals).length > 0) {
        // Use first interval's parameters as default for main calculation
        var firstInterval = Object.keys(params.intervals)[0];
        finalParams = params.intervals[firstInterval];
        intervalSpecific = params.intervals;
    }
    
    var payload = {
        calculation_type: 'vsh',
        params: {
            RHOB_MA: parseFloat(finalParams.RHOB_MA || finalParams.rhob_ma) || 2.65,
            RHOB_SH: parseFloat(finalParams.RHOB_SH || finalParams.rhob_sh) || 2.2,
            input_log: finalParams.RHOB_LOG || finalParams.rhob_log || 'RHOB',
            output_log: finalParams.VSH_DN || finalParams.output_log || 'VSH_DN',
            intervals: intervalSpecific
        },
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals
    };
    
    console.log('🚀 VSH-DN Calculation payload:', payload);
    
    fetchJson('/vsh_calculation', {
        method: 'POST',
        body: JSON.stringify({
            method: 'vsh_dn',
            parameters: payload.params,
            selected_wells: payload.selected_wells,
            selected_intervals: payload.selected_intervals,
            interval_specific_params: params.intervals || null
        })
    })
    .then(function(data) {
        setIsLoading(false);
        if (data.status === 'success') {
            showSuccess('VSH-DN calculation completed successfully!');
            document.getElementById('parameterForm').classList.add('hidden');
            
            // Create calculation plot to show results
            createCalculationPlot('vsh');
        } else {
            throw new Error(data.message || 'VSH-DN calculation failed');
        }
    })
    .catch(function(error) {
        setIsLoading(false);
        showError('Error in VSH-DN calculation: ' + error.message);
        console.error('VSH-DN Calculation error:', error);
    });
}

function handlePorosityCalculation(params) {
    var payload = {
        method: 'porosity_bateman_konen',
        parameters: {
            rhob_fl: parseFloat(params.rhob_fl) || 1.00,
            rhob_sh: parseFloat(params.rhob_sh) || 2.45,
            rhob_dsh: parseFloat(params.rhob_dsh) || 2.60,
            nphi_sh: parseFloat(params.nphi_sh) || 0.35,
            phie_max: parseFloat(params.phie_max) || 0.3,
            rhob_ma_base: parseFloat(params.rhob_ma_base) || 2.65,
            rhob_w: parseFloat(params.rhob_w) || 1.00,
            rhob_max: parseFloat(params.rhob_max) || 4.00
        },
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals
    };
    
    fetchJson('/porosity_calculation', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(data => {
        setIsLoading(false);
        if (data.status === 'success' || data.success === true) {
            showSuccess('Porosity calculation completed successfully!');
            document.getElementById('parameterForm').classList.add('hidden');
            
            // Display calculation results as plot
            if (data.plot_data) {
                displayCalculationPlot(data.plot_data, 'Porosity Calculation Results');
            } else {
                refreshCurrentPlot();
            }
        } else {
            throw new Error(data.message || data.error || 'Calculation failed');
        }
    })
    .catch(error => {
        setIsLoading(false);
        showError('Error: ' + error.message);
        console.error('Porosity Calculation error:', error);
    });
}

function handleSWIndonesiaCalculation(params) {
    var payload = {
        method: 'sw_indonesia',
        parameters: {
            a: parseFloat(params.a) || 1.0,
            m: parseFloat(params.m) || 2.0,
            n: parseFloat(params.n) || 2.0,
            rws: parseFloat(params.rws) || 0.529,
            rwt: parseFloat(params.rwt) || 227,
            rt_sh: parseFloat(params.rt_sh) || 2.2,
            rt_log: params.rt_log || 'RT',
            phie_log: params.phie_log || 'PHIE',
            vsh_log: params.vsh_log || 'VSH',
            ftemp_log: params.ftemp_log || 'FTEMP'
        },
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals
    };
    
    fetchJson('/sw_calculation', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(data => {
        setIsLoading(false);
        if (data.status === 'success' || data.success === true) {
            showSuccess('SW Indonesia calculation completed successfully!');
            document.getElementById('parameterForm').classList.add('hidden');
            
            // Display calculation results as plot
            if (data.plot_data) {
                displayCalculationPlot(data.plot_data, 'SW Indonesia Calculation Results');
            } else {
                refreshCurrentPlot();
            }
        } else {
            throw new Error(data.message || data.error || 'Calculation failed');
        }
    })
    .catch(error => {
        setIsLoading(false);
        showError('Error: ' + error.message);
        console.error('SW Indonesia Calculation error:', error);
    });
}

function handleSWSimandouxCalculation(params) {
    // Placeholder for SW Simandoux calculation
    var payload = {
        method: 'sw_simandoux',
        parameters: params,
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals
    };
    
    fetchJson('/sw_calculation', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(data => {
        setIsLoading(false);
        if (data.status === 'success' || data.success === true) {
            showSuccess('SW Simandoux calculation completed successfully!');
            document.getElementById('parameterForm').classList.add('hidden');
        } else {
            throw new Error(data.message || data.error || 'Calculation failed');
        }
    })
    .catch(error => {
        setIsLoading(false);
        showError('Error: ' + error.message);
        console.error('SW Simandoux Calculation error:', error);
    });
}

function handleWaterResistivityCalculation(params) {
    var payload = {
        method: 'water_resistivity',
        parameters: {
            a: parseFloat(params.a) || 1.0,
            m: parseFloat(params.m) || 2.0,
            rt_sh: parseFloat(params.rt_sh) || 2.2
        },
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals
    };
    
    fetchJson('/rwa_calculation', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(data => {
        setIsLoading(false);
        if (data.status === 'success' || data.success === true) {
            showSuccess('Water Resistivity calculation completed successfully!');
            document.getElementById('parameterForm').classList.add('hidden');
            
            // Display calculation results as plot
            if (data.plot_data) {
                displayCalculationPlot(data.plot_data, 'Water Resistivity Calculation Results');
            } else {
                refreshCurrentPlot();
            }
        } else {
            throw new Error(data.message || data.error || 'Calculation failed');
        }
    })
    .catch(error => {
        setIsLoading(false);
        showError('Error: ' + error.message);
        console.error('Water Resistivity Calculation error:', error);
    });
}

function handleRGSACalculation(params) {
    // Extract parameters from interval-specific format if available
    var finalParams = params;
    var intervalSpecific = null;
    
    if (params.intervals && Object.keys(params.intervals).length > 0) {
        // Use first interval's parameters as default for main calculation
        var firstInterval = Object.keys(params.intervals)[0];
        finalParams = params.intervals[firstInterval];
        intervalSpecific = params.intervals;
    }
    
    var payload = {
        calculation_type: 'rgsa',
        params: {
            SLIDING_WINDOW: parseInt(finalParams.SLIDING_WINDOW) || 100,
            GR: finalParams.GR || 'GR',
            RES: finalParams.RES || 'RT',
            RES_MIN: parseFloat(finalParams.RES_MIN) || 0.1,
            RES_MAX: parseFloat(finalParams.RES_MAX) || 1000,
            LITH: finalParams.LITH || null,
            intervals: intervalSpecific
        },
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals,
        selected_zones: appState.selectedZones
    };
    
    console.log('🚀 RGSA Calculation payload:', payload);
    
    fetchJson('/run_calculation_endpoint', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(function(data) {
        setIsLoading(false);
        if (data.status === 'success') {
            showSuccess('RGSA calculation completed successfully!');
            document.getElementById('parameterForm').classList.add('hidden');
            
            // Create calculation plot to show results
            createCalculationPlot('rgsa');
        } else {
            throw new Error(data.message || 'RGSA calculation failed');
        }
    })
    .catch(function(error) {
        setIsLoading(false);
        showError('Error in RGSA calculation: ' + error.message);
        console.error('RGSA Calculation error:', error);
    });
}

function handleDGSACalculation(params) {
    // Extract parameters from interval-specific format if available
    var finalParams = params;
    var intervalSpecific = null;
    
    if (params.intervals && Object.keys(params.intervals).length > 0) {
        // Use first interval's parameters as default for main calculation
        var firstInterval = Object.keys(params.intervals)[0];
        finalParams = params.intervals[firstInterval];
        intervalSpecific = params.intervals;
    }
    
    var payload = {
        calculation_type: 'dgsa',
        params: {
            SLIDING_WINDOW: parseInt(finalParams.SLIDING_WINDOW) || 100,
            GR: finalParams.GR || 'GR',
            DENS: finalParams.DENS || 'RHOB',
            intervals: intervalSpecific
        },
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals,
        selected_zones: appState.selectedZones
    };
    
    console.log('🚀 DGSA Calculation payload:', payload);
    
    fetchJson('/run_calculation_endpoint', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(function(data) {
        setIsLoading(false);
        if (data.status === 'success') {
            showSuccess('DGSA calculation completed successfully!');
            document.getElementById('parameterForm').classList.add('hidden');
            
            // Create calculation plot to show results
            createCalculationPlot('dgsa');
        } else {
            throw new Error(data.message || 'DGSA calculation failed');
        }
    })
    .catch(function(error) {
        setIsLoading(false);
        showError('Error in DGSA calculation: ' + error.message);
        console.error('DGSA Calculation error:', error);
    });
}

function handleNGSACalculation(params) {
    // Extract parameters from interval-specific format if available
    var finalParams = params;
    var intervalSpecific = null;
    
    if (params.intervals && Object.keys(params.intervals).length > 0) {
        // Use first interval's parameters as default for main calculation
        var firstInterval = Object.keys(params.intervals)[0];
        finalParams = params.intervals[firstInterval];
        intervalSpecific = params.intervals;
    }
    
    var payload = {
        calculation_type: 'ngsa',
        params: {
            SLIDING_WINDOW: parseInt(finalParams.SLIDING_WINDOW) || 100,
            GR: finalParams.GR || 'GR',
            NEUT: finalParams.NEUT || 'NPHI',
            intervals: intervalSpecific
        },
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals,
        selected_zones: appState.selectedZones
    };
    
    console.log('🚀 NGSA Calculation payload:', payload);
    
    fetchJson('/run_calculation_endpoint', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(function(data) {
        setIsLoading(false);
        if (data.status === 'success') {
            showSuccess('NGSA calculation completed successfully!');
            document.getElementById('parameterForm').classList.add('hidden');
            
            // Create calculation plot to show results
            createCalculationPlot('ngsa');
        } else {
            throw new Error(data.message || 'NGSA calculation failed');
        }
    })
    .catch(function(error) {
        setIsLoading(false);
        showError('Error in NGSA calculation: ' + error.message);
        console.error('NGSA Calculation error:', error);
    });
}

function handleRgbeRpbeCalculation(params) {
    // Extract parameters from interval-specific format if available
    var finalParams = params;
    var intervalSpecific = null;
    
    if (params.intervals && Object.keys(params.intervals).length > 0) {
        // Use first interval's parameters as default for main calculation
        var firstInterval = Object.keys(params.intervals)[0];
        finalParams = params.intervals[firstInterval];
        intervalSpecific = params.intervals;
    }
    
    var payload = {
        calculation_type: 'rgbe_rpbe',
        params: {
            MIN_INTERVAL_SIZE: parseInt(finalParams.MIN_INTERVAL_SIZE) || 10,
            R_SQUARED_THRESHOLD: parseFloat(finalParams.R_SQUARED_THRESHOLD) || 0.5,
            GR_COLUMN: finalParams.GR_COLUMN || 'GR',
            RT_COLUMN: finalParams.RT_COLUMN || 'RT',
            PHIE_COLUMN: finalParams.PHIE_COLUMN || 'PHIE',
            intervals: intervalSpecific
        },
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals,
        selected_zones: appState.selectedZones
    };
    
    console.log('🚀 RGBE-RPBE Calculation payload:', payload);
    
    fetchJson('/run_calculation_endpoint', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(function(data) {
        setIsLoading(false);
        if (data.status === 'success') {
            showSuccess('RGBE-RPBE calculation completed successfully!');
            document.getElementById('parameterForm').classList.add('hidden');
            
            // Create calculation plot to show results
            createCalculationPlot('rgbe_rpbe');
        } else {
            throw new Error(data.message || 'RGBE-RPBE calculation failed');
        }
    })
    .catch(function(error) {
        setIsLoading(false);
        showError('Error in RGBE-RPBE calculation: ' + error.message);
        console.error('RGBE-RPBE Calculation error:', error);
    });
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
            openVshCalculationForm();
            break;
        case 'vsh-dn':
            openVshDnCalculationForm();
            break;
        case 'porosity-calculation':
            openPorosityCalculationForm();
            break;
        case 'sw-calculation':
        case 'sw-indonesia':
            openSwCalculationForm();
            break;
        case 'sw-simandoux':
            openSwSimandouxCalculationForm();
            break;
        case 'rgsa':
            openRgsaCalculationForm();
            break;
        case 'dgsa':
            openDgsaCalculationForm();
            break;
        case 'ngsa':
            openNgsaCalculationForm();
            break;
        case 'gsa':
        case 'rgsa-ngsa-dgsa':
            openGsaCalculationForm();
            break;
        case 'normalization':
            handleNormalization();
            break;
        case 'histogram':
            handleHistogram();
            break;
        case 'water-resistivity-calculation':
            openWaterResistivityCalculationForm();
            break;
        case 'rgbe-rpbe':
            openRgbeRpbeCalculationForm();
            break;
        case 'trim-data':
            showTrimDataModal();
            hideLoading();
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
function openVshCalculationForm() {
    getCalculationParameters('vsh-gr')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('vsh-gr', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting VSH parameters: ' + error.message);
        });
}

function openPorosityCalculationForm() {
    getCalculationParameters('porosity')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('porosity', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting porosity parameters: ' + error.message);
        });
}

function openSwCalculationForm() {
    // Default to Indonesia method parameters
    getCalculationParameters('sw-indonesia')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('sw-indonesia', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting SW parameters: ' + error.message);
        });
}

function openSwSimandouxCalculationForm() {
    getCalculationParameters('sw-simandoux')
        .then(function(parameters) {
            hideLoading();
            showParameterForm('sw-simandoux', parameters);
        })
        .catch(function(error) {
            hideLoading();
            showError('Error getting SW Simandoux parameters: ' + error.message);
        });
}

function handleNormalization() {
    if (appState.selectedIntervals.length === 0) {
        hideLoading(); // Hide loading before showing error
        showError('Please select at least one interval for normalization');
        return;
    }
    
    getCalculationParameters('normalization')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('normalization', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting normalization parameters: ' + error.message);
        });
}

function openGsaCalculationForm() {
    getCalculationParameters('gsa')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('gsa', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting GSA parameters: ' + error.message);
        });
}

function openRgsaCalculationForm() {
    getCalculationParameters('rgsa')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('rgsa', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting RGSA parameters: ' + error.message);
        });
}

function openDgsaCalculationForm() {
    getCalculationParameters('dgsa')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('dgsa', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting DGSA parameters: ' + error.message);
        });
}

function openNgsaCalculationForm() {
    getCalculationParameters('ngsa')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('ngsa', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
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
        params: defaultParams,
        selected_intervals: appState.selectedIntervals
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
        params: defaultParams,
        selected_intervals: appState.selectedIntervals
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

function openVshGrCalculationForm() {
    getCalculationParameters('vsh-gr')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('vsh-gr', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting VSH-GR parameters: ' + error.message);
        });
}

function openVshDnCalculationForm() {
    getCalculationParameters('vsh-dn')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('vsh-dn', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting VSH-DN parameters: ' + error.message);
        });
}

function openWaterResistivityCalculationForm() {
    getCalculationParameters('water-resistivity')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('water-resistivity-calculation', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting Water Resistivity parameters: ' + error.message);
        });
}

function openRgbeRpbeCalculationForm() {
    getCalculationParameters('rgbe-rpbe')
        .then(function(parameters) {
            hideLoading(); // Hide loading when showing parameter form
            showParameterForm('rgbe-rpbe', parameters);
        })
        .catch(function(error) {
            hideLoading(); // Hide loading on error
            showError('Error getting RGBE-RPBE parameters: ' + error.message);
        });
}

function handleHistogram() {
    showWarning('Histogram module is under development');
    hideLoading();
}

function createCalculationPlot(calculationType) {
    console.log('Creating calculation plot for:', calculationType);
    
    if (appState.selectedWells.length === 0) {
        showError('No wells selected for plot generation');
        return Promise.reject(new Error('No wells selected'));
    }
    
    var wellName = appState.selectedWells[0];
    
    var requestData = {
        calculation_type: calculationType,
        well_name: wellName,
        selected_intervals: appState.selectedIntervals,
        selected_zones: appState.selectedZones
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
    }
    
    console.log('🚀 Calculation plot request:', requestData);
    
    return fetchJson('/get_plot_for_calculation', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
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
            
            var calculationName = calculationType.toUpperCase();
            showSuccess(`${calculationName} plot created for well: ${wellName}`);
        } else {
            console.error('Failed to create calculation plot:', response.message);
            showError('Failed to create calculation plot: ' + (response.message || 'Unknown error'));
            
            // Fallback: try to refresh current plot
            if (appState.selectedWells.length > 0) {
                console.log('Falling back to regular well plot...');
                return loadWellPlot(appState.selectedWells[0]);
            }
        }
    })
    .catch(function(error) {
        console.error('Error creating calculation plot:', error);
        showError('Error creating calculation plot: ' + error.message);
        
        // Fallback: try to refresh current plot
        if (appState.selectedWells.length > 0) {
            console.log('Falling back to regular well plot...');
            return loadWellPlot(appState.selectedWells[0]);
        }
        
        throw error;
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
                showError('Backend connection failed: ' + error.message);
                setupEventListeners();
                updateStatus('Backend error');
            });
    }, 1000);
}

function autoLoadDefaultDataset() {
    // Check if user has selected a structure from structures page
    var selectedStructure = appState.currentStructure;
    // Prefer folder-based dataset_files mode by default
    var payload = { dataset_name: 'dataset_files' };
    
    if (selectedStructure && selectedStructure.name) {
        // Keep using dataset_files in folder mode; include structure_name only as context
        payload.structure_name = selectedStructure.name;
        console.log('Auto-loading dataset_files (folder) for structure:', selectedStructure.name);
    } else {
        console.log('Auto-loading dataset_files (folder or dataset)...');
    }
    
    return fetchJson('/select_dataset', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(function(response) {
        if (response.status === 'success') {
            var wells = Array.isArray(response.wells) ? response.wells : [];
            // Fallback: if folder mode returns 0 wells, use structure wells list if available
            if ((!wells || wells.length === 0) && appState.currentStructure && Array.isArray(appState.currentStructure.wells) && appState.currentStructure.wells.length > 0) {
                wells = appState.currentStructure.wells.slice();
            }
            appState.availableWells = wells;
            appState.currentDataset = response.dataset_name; // Use actual dataset name from backend
            renderWellList(wells);
            
            // Also load intervals after dataset is selected
            if (response.markers && response.markers.length > 0) {
                appState.availableIntervals = response.markers;
                renderIntervalList(response.markers);
                console.log('Loaded', response.markers.length, 'intervals from dataset');
            } else {
                // If no intervals in dataset response, fetch them separately
                loadIntervalsFromDataset();
            }
            
            updateBadges();
            
            var structName = (selectedStructure && selectedStructure.name) ? selectedStructure.name : null;
            var successMessage = structName 
                ? 'Loaded ' + wells.length + ' wells from ' + structName + ' structure (' + response.dataset_name + ')'
                : 'Loaded ' + wells.length + ' wells from ' + response.dataset_name + ' dataset';
            showSuccess(successMessage);
        } else {
            throw new Error(response.message || 'Failed to load dataset');
        }
    })
    .catch(function(error) {
        console.error('Error auto-loading dataset:', error);
        
        // More specific error handling
        var errorMessage = error.message;
        if (errorMessage.includes('dataset does not exist')) {
            if (selectedStructure) {
                errorMessage = 'Dataset for structure "' + selectedStructure.name + '" not found. Trying fallback dataset...';
                showError(errorMessage);
                return autoLoadFallbackDataset();
            } else {
                errorMessage = 'Default dataset not found. Please check if fix_pass_qc dataset exists in your Dataiku project.';
            }
        }
        
        showError('Error loading dataset: ' + errorMessage);
        
        // If structure-specific dataset fails, try fallback
        if (selectedStructure && payload.structure_name && !errorMessage.includes('fallback')) {
            console.log('Fallback to default dataset...');
            return autoLoadFallbackDataset();
        }
    });
}

function autoLoadFallbackDataset() {
    console.log('Loading fallback dataset: dataset_files');
    
    return fetchJson('/select_dataset', {
        method: 'POST',
        body: JSON.stringify({ dataset_name: 'dataset_files' })
    })
    .then(function(response) {
        if (response.status === 'success') {
            var wells = Array.isArray(response.wells) ? response.wells : [];
            if ((!wells || wells.length === 0) && appState.currentStructure && Array.isArray(appState.currentStructure.wells) && appState.currentStructure.wells.length > 0) {
                wells = appState.currentStructure.wells.slice();
            }
            appState.availableWells = wells;
            appState.currentDataset = response.dataset_name; // Use actual dataset name from backend
            renderWellList(wells);
            
            // Also load intervals for fallback dataset
            if (response.markers && response.markers.length > 0) {
                appState.availableIntervals = response.markers;
                renderIntervalList(response.markers);
                console.log('Loaded', response.markers.length, 'intervals from fallback dataset');
            } else {
                loadIntervalsFromDataset();
            }
            
            updateBadges();
            showSuccess('Loaded ' + wells.length + ' wells from fallback dataset: ' + response.dataset_name);
        } else {
            throw new Error(response.message || 'Failed to load fallback dataset');
        }
    })
    .catch(function(error) {
        console.error('Error loading fallback dataset:', error);
        showError('Error loading fallback dataset: ' + error.message + '. Please ensure at least one dataset exists in your Dataiku project.');
    });
}

// (duplicate loadIntervalsFromDataset removed)

// Load intervals from current dataset  
function loadIntervalsFromDataset() {
    console.log('Loading intervals from current dataset...');
    
    fetchJson('/get_markers')
        .then(function(response) {
            if (response.status === 'success' && response.markers) {
                appState.availableIntervals = response.markers;
                renderIntervalList(response.markers);
                updateBadges();
                console.log('Loaded', response.markers.length, 'intervals from dataset');
            } else {
                console.log('No intervals found in dataset');
                renderIntervalList([]);
            }
        })
        .catch(function(error) {
            console.error('Error loading intervals:', error);
            renderIntervalList([]);
        });
}

function setupEventListeners() {
    // Setup navigation
    setupNavigation();
    
    // Setup dropdowns
    setupDropdowns();
    
    // Setup plot type select
    setupPlotTypeSelect();
    setupPlotLayoutControls();
    setupAnalysisTools();
    setupGenerateButton();
    
    // Select All checkboxes - Wells
    var selectAllWells = document.getElementById('selectAllWells');
    if (selectAllWells) {
        selectAllWells.addEventListener('change', toggleAllWells);
    }

    // Intervals tabs and lists
    var tabMarkers = document.getElementById('tabMarkers');
    var tabZones = document.getElementById('tabZones');
    if (tabMarkers) {
        tabMarkers.addEventListener('click', function(){
            appState.intervalsTab = 'markers';
            // Switching to markers clears zones selection
            appState.selectedZones = [];
            // Update tab UI
            document.getElementById('tabMarkers').classList.add('active');
            document.getElementById('tabZones').classList.remove('active');
            updateIntervalsTabVisibility();
            updateBadges();
        });
    }
    if (tabZones) {
        tabZones.addEventListener('click', function(){
            appState.intervalsTab = 'zones';
            // Switching to zones clears markers selection
            appState.selectedIntervals = [];
            // Update tab UI
            document.getElementById('tabZones').classList.add('active');
            document.getElementById('tabMarkers').classList.remove('active');
            updateIntervalsTabVisibility();
            updateBadges();
        });
    }

    // Select-all for Markers and Zones
    var selectAllMarkers = document.getElementById('selectAllMarkers');
    if (selectAllMarkers) {
        selectAllMarkers.addEventListener('change', function(){
            // Switching to markers clears zones selection per spec
            appState.intervalsTab = 'markers';
            appState.selectedZones = [];
            if (this.checked) {
                appState.selectedIntervals = (appState.availableIntervals || []).slice();
            } else {
                appState.selectedIntervals = [];
            }
            updateIntervalsTabVisibility();
            updateIntervalSelection();
            updateBadges();
            updateParameterFormColumns();
        });
    }
    var selectAllZones = document.getElementById('selectAllZones');
    if (selectAllZones) {
        selectAllZones.addEventListener('change', toggleAllZones);
    }
    
    // Bind dashboard debug/test buttons if present
    var dbgBtn = document.getElementById('debugBtn');
    if (dbgBtn) {
        dbgBtn.onclick = function(){ try { showDashboardDebugInfo(); } catch(e) { console.warn(e); } };
    }
    var testBtn = document.getElementById('testConnectionBtn');
    if (testBtn) {
        testBtn.onclick = function(){ try { testBackendConnection(); } catch(e) { console.warn(e); } };
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
window.toggleAllZones = toggleAllZones;
window.loadWells = loadWells;
window.createPlot = createPlot;
window.clearPlot = clearPlot;
window.updateIntervalsForSelectedWells = updateIntervalsForSelectedWells;

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

// Trim Data Modal Functions
function showTrimDataModal() {
    console.log('🔧 Opening Trim Data modal');
    console.log('🔧 Current view:', appState.currentView);
    console.log('🔧 Selected wells:', appState.selectedWells);
    console.log('🔧 Selected intervals:', appState.selectedIntervals);
    
    // Check if user has selected wells
    if (appState.selectedWells.length === 0) {
        showError('Please select at least one well before opening Trim Data');
        return;
    }
    
    // Update modal content with current selection
    updateTrimDataModalInfo();
    
    // Show the modal
    var modal = document.getElementById('trimDataModal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('🔧 Trim Data modal shown');
    } else {
        console.error('🔧 Trim Data modal not found in DOM');
        showError('Trim Data modal not found');
        return;
    }
    
    // Setup event listeners if not already done
    setupTrimDataModalEvents();
}

function updateTrimDataModalInfo() {
    // Update wells info
    var wellsInfo = document.querySelector('#trimDataWellsInfo span');
    if (wellsInfo) {
        if (appState.selectedWells.length > 0) {
            wellsInfo.textContent = appState.selectedWells.join(', ');
        } else {
            wellsInfo.textContent = 'None selected';
        }
    }
    
    // Update intervals info
    var intervalsInfo = document.querySelector('#trimDataIntervalsInfo span');
    if (intervalsInfo) {
        intervalsInfo.textContent = appState.selectedIntervals.length + ' selected';
    }
}

function setupTrimDataModalEvents() {
    var closeBtn = document.getElementById('closeTrimDataModal');
    var cancelBtn = document.getElementById('cancelTrimData');
    var runBtn = document.getElementById('runTrimData');
    if (closeBtn) closeBtn.onclick = closeTrimDataModal;
    if (cancelBtn) cancelBtn.onclick = closeTrimDataModal;
    if (runBtn) {
        runBtn.onclick = function() {
            var startDepth = parseFloat(document.getElementById('trimStartDepth')?.value || '');
            var endDepth = parseFloat(document.getElementById('trimEndDepth')?.value || '');
            var method = document.getElementById('trimMethod')?.value || 'depth_range';
            var suffix = document.getElementById('trimOutputSuffix')?.value || '_TRIM';
            var preserveBadHoles = !!document.getElementById('trimPreserveBadHoles')?.checked;
            var interpolateGaps = !!document.getElementById('trimInterpolateGaps')?.checked;
            var validateDepthsValue = !!document.getElementById('trimValidateDepths')?.checked;
            var payload = {
                calculation_type: 'trim_data',
                params: {
                    start_depth: startDepth,
                    end_depth: endDepth,
                    method: method,
                    output_suffix: suffix,
                    preserve_bad_holes: preserveBadHoles,
                    interpolate_gaps: interpolateGaps,
                    validate_depths: validateDepthsValue
                },
                selected_wells: appState.selectedWells,
                selected_intervals: appState.selectedIntervals
            };
            closeTrimDataModal();
            setIsLoading(true);
            console.log('📊 Trim Data payload:', payload);
            fetchJson('/run_calculation_endpoint', { method: 'POST', body: JSON.stringify(payload) })
                .then(function(resp){
                    if (resp && resp.status === 'success') {
                        showSuccess('Trim Data operation completed successfully!');
                        if (appState.selectedWells.length > 0) refreshCurrentPlot();
                    } else {
                        throw new Error(resp && resp.message ? resp.message : 'Trim Data operation failed');
                    }
                })
                .catch(function(err){
                    showError('Error in Trim Data operation: ' + err.message);
                    console.error('Trim Data error:', err);
                })
                .finally(function(){ setIsLoading(false); });
        };
    }
}

// (removed duplicate refreshCurrentPlot)

// Utility functions for user feedback
function updateStatusText(message) {
    // Update status in Dashboard view
    var dashboardStatus = document.getElementById('statusText');
    if (dashboardStatus) {
        dashboardStatus.textContent = message;
    }
    
    // Update status in Data Prep view
    var dataPrepStatus = document.getElementById('dataPrepStatusText');
    if (dataPrepStatus) {
        dataPrepStatus.textContent = message;
    }
}

// Sidebar histogram action (Dashboard)
function runHistogramSidebar() {
    if (appState.selectedWells.length === 0) {
        showWarning('Please select at least one well');
        return Promise.resolve();
    }
    var column = 'GR'; // heuristic default
    setIsLoading(true);
    updateStatusText('Generating histogram...');
    return fetchJson('/histogram', {
        method: 'POST',
        body: JSON.stringify({
            column: column,
            bins: 30,
            selected_wells: appState.selectedWells,
            selected_intervals: appState.selectedIntervals,
            selected_zones: appState.selectedZones
        })
    }).then(function(resp){
        if (resp && resp.status === 'success' && resp.figure) {
            displayCalculationPlot(resp.figure, 'Histogram ' + column);
        } else {
            showError((resp && resp.message) || 'Histogram failed');
        }
    }).catch(function(err){
        showError('Histogram error: ' + (err && err.message ? err.message : err));
    }).finally(function(){ setIsLoading(false); updateStatusText('Ready'); });
}

// Sidebar crossplot action (Dashboard)
function runCrossplotSidebar(kind) {
    if (appState.selectedWells.length === 0) {
        showWarning('Please select at least one well');
        return Promise.resolve();
    }
    var x = null, y = null;
    if (kind === 'rt_rhob') { x = 'RT'; y = 'RHOB'; }
    else if (kind === 'nphi_rhob') { x = 'NPHI'; y = 'RHOB'; }
    else if (kind === 'rt_gr') { x = 'RT'; y = 'GR'; }
    else if (kind === 'rt_nphi') { x = 'RT'; y = 'NPHI'; }
    else if (kind === 'photoelectric_rhob') { x = 'PHOTOELECTRIC'; y = 'RHOB'; }
    else if (kind === 'cali_nphi') { x = 'CALI'; y = 'NPHI'; }
    else { showWarning('Unknown crossplot'); return Promise.resolve(); }

    setIsLoading(true);
    updateStatusText('Generating crossplot...');
    
    // Prepare complete crossplot parameters with defaults
    var crossplotParams = {
        x: x,
        y: y,
        bins: 25,
        gr_ma: 30,
        gr_sh: 120,
        rho_ma: 2.65,
        rho_sh: 2.3,
        nphi_ma: 0.0,
        nphi_sh: 0.4,
        prcnt_qz: 10,
        prcnt_wtr: 10,
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals,
        selected_zones: appState.selectedZones
    };
    
    return fetchJson('/crossplot', crossplotParams).then(function(resp){
        if (resp && resp.status === 'success' && resp.figure) {
            displayCalculationPlot(resp.figure, 'Crossplot ' + x + ' vs ' + y);
        } else {
            showError((resp && resp.message) || 'Crossplot failed');
        }
    }).catch(function(err){
        showError('Crossplot error: ' + (err && err.message ? err.message : err));
    }).finally(function(){ setIsLoading(false); updateStatusText('Ready'); });
}

function showDashboardDebugInfo() {
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
            showDataPrepDebugInfo();
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

function showDataPrepDebugInfo() {
    var debugInfo = `
=== DATA PREPARATION DEBUG INFO ===
Current Module: ${dataPrepState.activeModule || 'None'}
Selected Files: ${dataPrepState.selectedFiles.length} (${dataPrepState.selectedFiles.join(', ')})
Selected Columns: ${dataPrepState.selectedColumns.length} (${dataPrepState.selectedColumns.join(', ')})
Status: ${document.getElementById('dataPrepStatusText')?.textContent || 'Unknown'}
================================
    `;
    
    console.log(debugInfo);
    showMessage(debugInfo.replace(/\n/g, '<br>'), 'info', true);
}

function updateFileList() {
    var fileList = document.getElementById('dataPrepFileList');
    if (!fileList) return;
    
    var files = dataPrepState.availableFiles || [];
    if (files.length === 0) {
        fileList.innerHTML = '<div class="empty-state">No files available</div>';
        return;
    }
    
    fileList.innerHTML = files.map(function(file) {
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
    
    var columns = dataPrepState.availableColumns || [];
    columnList.innerHTML = columns.map(function(column) {
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
            showTrimDataModal();
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
        case 'rgbe-rpbe':
            loadRgbeRpbeModule(moduleArea);
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
                                    <td><select name="X_COLUMN" class="param-input log-select"><option>Select X column</option></select></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Y-axis column</td>
                                    <td>Y_COLUMN</td>
                                    <td><select name="Y_COLUMN" class="param-input log-select"><option>Select Y column</option></select></td>
                                </tr>
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>Number of bins</td>
                                    <td>BINS</td>
                                    <td><input name="BINS" type="number" class="param-input" value="25" min="10" max="100"></td>
                                </tr>
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>Clean Gamma Ray</td>
                                    <td>GR_MA</td>
                                    <td><input name="GR_MA" type="number" class="param-input" value="30" step="0.1"></td>
                                </tr>
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>Shale Gamma Ray</td>
                                    <td>GR_SH</td>
                                    <td><input name="GR_SH" type="number" class="param-input" value="120" step="0.1"></td>
                                </tr>
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>Matrix Density</td>
                                    <td>RHO_MA</td>
                                    <td><input name="RHO_MA" type="number" class="param-input" value="2.65" step="0.01"></td>
                                </tr>
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>Shale Density</td>
                                    <td>RHO_SH</td>
                                    <td><input name="RHO_SH" type="number" class="param-input" value="2.3" step="0.01"></td>
                                </tr>
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>Matrix Neutron</td>
                                    <td>NPHI_MA</td>
                                    <td><input name="NPHI_MA" type="number" class="param-input" value="0.0" step="0.01"></td>
                                </tr>
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>Shale Neutron</td>
                                    <td>NPHI_SH</td>
                                    <td><input name="NPHI_SH" type="number" class="param-input" value="0.4" step="0.01"></td>
                                </tr>
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>Quartz Percentile</td>
                                    <td>PRCNT_QZ</td>
                                    <td><input name="PRCNT_QZ" type="number" class="param-input" value="10" min="1" max="50"></td>
                                </tr>
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>Water Percentile</td>
                                    <td>PRCNT_WTR</td>
                                    <td><input name="PRCNT_WTR" type="number" class="param-input" value="10" min="1" max="50"></td>
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
    
    // Column options will be populated when data is loaded
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
    console.log('Loading data preparation files...');
    var fileList = document.getElementById('dataPrepFileList');
    if (!fileList) {
        console.warn('File list container not found');
        return;
    }
    // Try to fetch available files list from backend (endpoint to be implemented)
    fetchJson('/get_data_prep_files')
        .then(function(resp){
            if (resp && resp.status === 'success' && Array.isArray(resp.files)) {
                fileList.innerHTML = resp.files.map(function(file, index){
                    return `
                        <div class="list-item">
                            <label class="checkbox-label">
                                <input type="checkbox" class="file-checkbox" value="${file}" data-index="${index}">
                                <span class="item-text">${file}</span>
                            </label>
                        </div>
                    `;
                }).join('');
                // Setup handlers
                document.querySelectorAll('.file-checkbox').forEach(function(checkbox) {
                    checkbox.addEventListener('change', function() {
                        updateSelectedFiles();
                        updateFilesBadge();
                    });
                });
                var selectAllFiles = document.getElementById('selectAllFiles');
                if (selectAllFiles) {
                    selectAllFiles.addEventListener('change', function() {
                        var checkboxes = document.querySelectorAll('.file-checkbox');
                        checkboxes.forEach(function(cb) { cb.checked = this.checked; }.bind(this));
                        updateSelectedFiles();
                        updateFilesBadge();
                    });
                }
            } else {
                fileList.innerHTML = '<div class="empty-state">No files available</div>';
            }
        })
        .catch(function(err){
            console.error('Failed to load data prep files:', err);
            fileList.innerHTML = '<div class="empty-state">Failed to load files</div>';
        });
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
        // Ask backend for available columns in selected files (endpoint to be implemented)
        fetchJson('/get_data_prep_columns', { method: 'POST', body: JSON.stringify({ files: selected }) })
            .then(function(resp){
                if (resp && resp.status === 'success' && Array.isArray(resp.columns)) {
                    updateLogColumns(resp.columns);
                    updateColumnsList(resp.columns);
                } else {
                    updateColumnsList([]);
                }
            })
            .catch(function(err){
                console.error('Failed to load columns:', err);
                updateColumnsList([]);
            });
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
    updateStatusText('Generating crossplot...');
    
    // Prepare crossplot parameters
    var crossplotParams = {
        x: xColumn,
        y: yColumn,
        bins: parseInt(document.querySelector('[name="BINS"]')?.value || 25),
        gr_ma: parseFloat(document.querySelector('[name="GR_MA"]')?.value || 30),
        gr_sh: parseFloat(document.querySelector('[name="GR_SH"]')?.value || 120),
        rho_ma: parseFloat(document.querySelector('[name="RHO_MA"]')?.value || 2.65),
        rho_sh: parseFloat(document.querySelector('[name="RHO_SH"]')?.value || 2.3),
        nphi_ma: parseFloat(document.querySelector('[name="NPHI_MA"]')?.value || 0.0),
        nphi_sh: parseFloat(document.querySelector('[name="NPHI_SH"]')?.value || 0.4),
        prcnt_qz: parseFloat(document.querySelector('[name="PRCNT_QZ"]')?.value || 10),
        prcnt_wtr: parseFloat(document.querySelector('[name="PRCNT_WTR"]')?.value || 10),
        selected_wells: appState.selectedWells || [],
        selected_intervals: appState.selectedIntervals || [],
        selected_zones: appState.selectedZones || []
    };
    
    return fetchJson('/crossplot', crossplotParams)
        .then(function(response) {
            if (response && response.status === 'success' && response.figure) {
                displayCalculationPlot(response.figure, `Crossplot: ${xColumn} vs ${yColumn}`);
                showSuccess(`Crossplot generated: ${xColumn} vs ${yColumn}`);
            } else {
                showError(response?.message || 'Crossplot generation failed');
            }
        })
        .catch(function(error) {
            console.error('Crossplot error:', error);
            showError('Crossplot error: ' + (error?.message || error));
        })
        .finally(function() {
            updateStatusText('Ready');
        });
}

function loadRgbeRpbeModule(container) {
    container.innerHTML = `
        <div class="data-prep-module-container">
            <h3>Petrophysical Analysis: RGBE-RPBE</h3>
            <div class="module-content">
                <div class="parameters-section">
                    <h4>RGBE-RPBE Parameters</h4>
                    <div class="info-box">
                        <p><strong>RGBE-RPBE Analysis</strong> calculates regression-based gas effects and porosity-based effects from well log data.</p>
                        <p>Requires: GR, RT, PHIE columns and IQUAL > 0 intervals</p>
                    </div>
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
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>Minimum interval size</td>
                                    <td>MIN_INTERVAL_SIZE</td>
                                    <td><input name="MIN_INTERVAL_SIZE" type="number" class="param-input" value="10" min="5" max="100"></td>
                                </tr>
                                <tr class="param-row">
                                    <td>Interval</td>
                                    <td>In_Out</td>
                                    <td>R-squared threshold</td>
                                    <td>R_SQUARED_THRESHOLD</td>
                                    <td><input name="R_SQUARED_THRESHOLD" type="number" class="param-input" value="0.5" min="0" max="1" step="0.1"></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Gamma Ray Log</td>
                                    <td>GR_COLUMN</td>
                                    <td><select name="GR_COLUMN" class="param-input log-select">
                                        <option value="GR">GR</option>
                                        <option value="CGR">CGR</option>
                                    </select></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Resistivity Log</td>
                                    <td>RT_COLUMN</td>
                                    <td><select name="RT_COLUMN" class="param-input log-select">
                                        <option value="RT">RT</option>
                                        <option value="ILD">ILD</option>
                                        <option value="RD">RD</option>
                                    </select></td>
                                </tr>
                                <tr class="param-row bg-cyan-400">
                                    <td>Log</td>
                                    <td>Input</td>
                                    <td>Effective Porosity Log</td>
                                    <td>PHIE_COLUMN</td>
                                    <td><select name="PHIE_COLUMN" class="param-input log-select">
                                        <option value="PHIE">PHIE</option>
                                        <option value="PHID">PHID</option>
                                        <option value="PHIT">PHIT</option>
                                    </select></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="actions-section">
                    <button class="btn-secondary" onclick="showDataPrepEmptyState()">Cancel</button>
                    <button class="btn-primary" onclick="runRgbeRpbe()">Calculate RGBE-RPBE</button>
                </div>
            </div>
        </div>
    `;
}

function runRgbeRpbe() {
    if (appState.selectedWells.length === 0) {
        showWarning('Please select at least one well');
        return;
    }
    
    // Collect parameters from form
    var params = {
        MIN_INTERVAL_SIZE: parseInt(document.querySelector('[name="MIN_INTERVAL_SIZE"]')?.value || '10'),
        R_SQUARED_THRESHOLD: parseFloat(document.querySelector('[name="R_SQUARED_THRESHOLD"]')?.value || '0.5'),
        GR_COLUMN: document.querySelector('[name="GR_COLUMN"]')?.value || 'GR',
        RT_COLUMN: document.querySelector('[name="RT_COLUMN"]')?.value || 'RT',
        PHIE_COLUMN: document.querySelector('[name="PHIE_COLUMN"]')?.value || 'PHIE',
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals,
        selected_zones: appState.selectedZones || []
    };
    
    console.log('Running RGBE-RPBE calculation with parameters:', params);
    updateStatusText('Calculating RGBE-RPBE...');
    
    return fetchJson('/run_calculation_endpoint', {
        calculation_type: 'rgbe_rpbe',
        parameters: params,
        selected_wells: appState.selectedWells,
        selected_intervals: appState.selectedIntervals
    })
    .then(function(response) {
        if (response && response.status === 'success') {
            showSuccess('RGBE-RPBE calculation completed successfully');
            
            // Get the plot
            return fetchJson('/get_plot_endpoint', {
                calculation_type: 'rgbe_rpbe',
                selected_wells: appState.selectedWells
            });
        } else {
            throw new Error(response?.message || 'RGBE-RPBE calculation failed');
        }
    })
    .then(function(plotResponse) {
        if (plotResponse && plotResponse.status === 'success' && plotResponse.figure) {
            displayCalculationPlot(plotResponse.figure, 'RGBE-RPBE Analysis');
        } else {
            showWarning('RGBE-RPBE calculation completed but plot generation failed');
        }
    })
    .catch(function(error) {
        console.error('RGBE-RPBE error:', error);
        showError('RGBE-RPBE error: ' + (error?.message || error));
    })
    .finally(function() {
        updateStatusText('Ready');
    });
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

// === Drag & Drop Upload Area ===
(function() {
  var dropArea = document.getElementById('dropArea');
  var fileInput = document.getElementById('fileInput');
  var fileNamePreview = document.getElementById('fileNamePreview');

  if (dropArea && fileInput && fileNamePreview) {
    // Update file name preview
    fileInput.addEventListener('change', function(e) {
      if (fileInput.files && fileInput.files.length > 0) {
        fileNamePreview.textContent = fileInput.files[0].name;
      } else {
        fileNamePreview.textContent = 'No file chosen';
      }
    });

    // Drag events
    dropArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.add('dragover');
    });
    dropArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('dragover');
    });
    dropArea.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        var event = new Event('change');
        fileInput.dispatchEvent(event);
      } else {
        console.error('No files found in drop event');
      }
    });
    // Click on area triggers file dialog (kecuali klik input file)
    dropArea.addEventListener('click', function(e) {
      if (e.target !== fileInput) {
        fileInput.click();
      }
    });
    // Keyboard accessibility (Enter/Space)
    dropArea.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });
  } else {
    console.error('Drag & drop elements not found:', {dropArea, fileInput, fileNamePreview});
  }
})();