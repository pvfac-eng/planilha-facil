// ESTADO DA APLICAÇÃO
let state = {
  tableName: "Estoque",
  columns: [
    { id: "c1", name: "ID", type: "numero" },
    { id: "c2", name: "Nome", type: "texto" },
    { id: "c3", name: "Quantidade", type: "numero" },
    { id: "c4", name: "Preço", type: "moeda" }
  ],
  rows: [
    { id: 1, c1: 1, c2: "Teclado", c3: 10, c4: 50 },
    { id: 2, c1: 2, c2: "Mouse", c3: 20, c4: 30 }
  ]
};

let rowIdCounter = 10;

// INICIALIZAÇÃO
window.onload = function() {
  initBuilderList();
  renderTable();
};

// TROCA DE ETAPAS
function goToStep(step) {
  document.querySelectorAll('.step-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === step);
  });

  document.getElementById('panel-1').classList.add('hidden');
  document.getElementById('panel-3').classList.add('hidden');
  document.getElementById('panel-4').classList.add('hidden');
  document.getElementById('panel-5').classList.add('hidden');

  if (step === 1) document.getElementById('panel-1').classList.remove('hidden');
  if (step === 3) { document.getElementById('panel-3').classList.remove('hidden'); populateSelects(); }
  if (step === 4) { document.getElementById('panel-4').classList.remove('hidden'); populateSelects(); }
  if (step === 5) document.getElementById('panel-5').classList.remove('hidden');
}

// MONTAGEM DA ESTRUTURA DE COLUNAS
function initBuilderList() {
  const container = document.getElementById('columns-builder-list');
  container.innerHTML = '';
  document.getElementById('table-name-input').value = state.tableName;

  state.columns.forEach((col, index) => {
    const item = document.createElement('div');
    item.className = 'column-builder-item';
    item.innerHTML = `
      <input type="text" value="${col.name}" onchange="updateBuilderColName(${index}, this.value)">
      <select onchange="updateBuilderColType(${index}, this.value)">
        <option value="texto" ${col.type === 'texto' ? 'selected' : ''}>Texto</option>
        <option value="numero" ${col.type === 'numero' ? 'selected' : ''}>Número</option>
        <option value="moeda" ${col.type === 'moeda' ? 'selected' : ''}>Moeda</option>
      </select>
      <button class="btn btn-danger" onclick="removeBuilderColumn(${index})">✕</button>
    `;
    container.appendChild(item);
  });
}

function addColumnToBuilder() {
  const newId = 'c_' + Date.now();
  state.columns.push({ id: newId, name: `Coluna ${state.columns.length + 1}`, type: 'texto' });
  state.rows.forEach(r => r[newId] = '');
  initBuilderList();
}

function removeBuilderColumn(index) {
  if (state.columns.length <= 1) return alert('Mantenha ao menos 1 coluna.');
  const colId = state.columns[index].id;
  state.columns.splice(index, 1);
  state.rows.forEach(r => delete r[colId]);
  initBuilderList();
  renderTable();
}

function updateBuilderColName(index, val) { state.columns[index].name = val; }
function updateBuilderColType(index, val) { state.columns[index].type = val; }
function updateTableName() {
  state.tableName = document.getElementById('table-name-input').value || "Minha Planilha";
  document.getElementById('display-table-name').innerText = state.tableName;
}

function generateTableFromBuilder() {
  updateTableName();
  renderTable();
  goToStep(2);
}

// RENDERIZAÇÃO DA TABELA DE DADOS
function renderTable() {
  document.getElementById('display-table-name').innerText = state.tableName;
  const headerRow = document.getElementById('table-header-row');
  const body = document.getElementById('table-body');

  headerRow.innerHTML = '';
  body.innerHTML = '';

  state.columns.forEach(col => {
    const th = document.createElement('th');
    th.innerText = col.name;
    headerRow.appendChild(th);
  });

  const thDel = document.createElement('th');
  thDel.style.width = '40px';
  headerRow.appendChild(thDel);

  state.rows.forEach(row => {
    const tr = document.createElement('tr');

    state.columns.forEach(col => {
      const td = document.createElement('td');
      td.contentEditable = true;
      td.innerText = row[col.id] !== undefined ? row[col.id] : '';
      
      td.onblur = (e) => {
        let val = e.target.innerText.trim();
        if (col.type === 'numero' || col.type === 'moeda') {
          let num = parseFloat(val);
          row[col.id] = isNaN(num) ? val : num;
        } else {
          row[col.id] = val;
        }
      };

      tr.appendChild(td);
    });

    const tdAction = document.createElement('td');
    tdAction.innerHTML = `<button style="border:none; background:none; color:var(--danger); cursor:pointer;" onclick="deleteRow(${row.id})">✕</button>`;
    tr.appendChild(tdAction);

    body.appendChild(tr);
  });

  populateSelects();
}

function addRowDirect() {
  const newRow = { id: rowIdCounter++ };
  state.columns.forEach(c => newRow[c.id] = '');
  state.rows.push(newRow);
  renderTable();
}

function deleteRow(id) {
  state.rows = state.rows.filter(r => r.id !== id);
  renderTable();
}

// FORMULÁRIO DE REGISTRO
function openRecordModal() {
  const container = document.getElementById('modal-fields-container');
  container.innerHTML = '';

  state.columns.forEach(col => {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `<label>${col.name}</label><input type="${col.type === 'numero' || col.type === 'moeda' ? 'number' : 'text'}" name="${col.id}">`;
    container.appendChild(group);
  });

  document.getElementById('record-modal').classList.remove('hidden');
}

function closeRecordModal() { document.getElementById('record-modal').classList.add('hidden'); }

function handleRecordSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const newRow = { id: rowIdCounter++ };

  state.columns.forEach(col => {
    let val = formData.get(col.id);
    newRow[col.id] = (col.type === 'numero' || col.type === 'moeda') ? (parseFloat(val) || 0) : val;
  });

  state.rows.push(newRow);
  closeRecordModal();
  renderTable();
}

// CÁLCULOS
function populateSelects() {
  const c1 = document.getElementById('calc-col1');
  const c2 = document.getElementById('calc-col2');
  const sortCol = document.getElementById('sort-col-select');

  [c1, c2, sortCol].forEach(s => { if(s) s.innerHTML = ''; });

  state.columns.forEach(col => {
    const opt = `<option value="${col.id}">${col.name}</option>`;
    if (c1) c1.innerHTML += opt;
    if (c2) c2.innerHTML += opt;
    if (sortCol) sortCol.innerHTML += opt;
  });
}

function executeCalculation() {
  const op = document.getElementById('calc-operation').value;
  const c1 = document.getElementById('calc-col1').value;
  const c2 = document.getElementById('calc-col2').value;
  const targetName = document.getElementById('calc-target-name').value || 'Resultado';

  let targetCol = state.columns.find(c => c.name.toLowerCase() === targetName.toLowerCase());
  if (!targetCol) {
    const newId = 'c_' + Date.now();
    targetCol = { id: newId, name: targetName, type: 'numero' };
    state.columns.push(targetCol);
  }

  state.rows.forEach(r => {
    let v1 = parseFloat(r[c1]) || 0;
    let v2 = parseFloat(r[c2]) || 0;
    if (op === 'mult') r[targetCol.id] = v1 * v2;
    if (op === 'sub') r[targetCol.id] = v1 - v2;
    if (op === 'soma') r[targetCol.id] = v1 + v2;
    if (op === 'div') r[targetCol.id] = v2 !== 0 ? v1 / v2 : 0;
  });

  initBuilderList();
  renderTable();
  alert('Cálculo realizado com sucesso!');
}

// ORDENAÇÃO
function applySort() {
  const colId = document.getElementById('sort-col-select').value;
  const dir = document.getElementById('sort-direction').value;

  state.rows.sort((a, b) => {
    let v1 = a[colId] || '';
    let v2 = b[colId] || '';
    if (typeof v1 === 'number' && typeof v2 === 'number') {
      return dir === 'asc' ? v1 - v2 : v2 - v1;
    }
    return dir === 'asc' ? String(v1).localeCompare(String(v2)) : String(v2).localeCompare(String(v1));
  });

  renderTable();
}

// EXPORTAÇÃO EXCEL
function exportExcel() {
  const headers = state.columns.map(c => c.name);
  const data = [headers];

  state.rows.forEach(r => {
    data.push(state.columns.map(c => r[c.id] !== undefined ? r[c.id] : ''));
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, state.tableName);
  XLSX.writeFile(wb, `${state.tableName}.xlsx`);
}
