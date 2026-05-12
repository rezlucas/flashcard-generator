// ============================================================
// REVISÃO 24/7/30 — Google Apps Script
//
// Setup:
//   1. Crie uma planilha em sheets.new
//   2. Extensões → Apps Script → cole este código
//   3. Substitua SHEET_ID pelo ID da planilha
//   4. Implante como Web App (Executar como: Eu, Acesso: Qualquer pessoa)
//   5. Copie a URL e cole em APPS_SCRIPT_URL no .env.local
// ============================================================

const SHEET_ID = '<COLE_SEU_SHEET_ID_AQUI>';

const ABA_MATERIAS  = 'Materias';
const ABA_SESSOES   = 'Sessoes';
const ABA_REVISOES  = 'Revisoes_Agendadas';

const HEADERS = {
  Materias:           ['id','nome','pai_id','cor','ativa','criada_em'],
  Sessoes:            ['id','materia_id','data','duracao_min','tipo','observacoes','sessao_origem_id','criada_em'],
  Revisoes_Agendadas: ['id','materia_id','sessao_origem_id','data_alvo','tipo','status','concluida_em','sessao_concluida_id'],
};

// ── Entry point ──────────────────────────────────────────────
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const body = JSON.parse(e.postData.contents);
    const handlers = {
      listMaterias, createMateria, updateMateria, deleteMateria,
      listSessoes, createSessao, deleteSessao,
      listRevisoes, getResumoHoje, getEstatisticas,
      adiarRevisao, adiantarRevisao,
    };
    const fn = handlers[body.action];
    if (!fn) throw new Error('Ação inválida: ' + body.action);
    const result = fn(body);
    return ok(result);
  } catch (err) {
    return err_(err.message);
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return ok('API ativa. Use POST.'); }

function ok(data)  { return json({ ok: true,  data }); }
function err_(msg) { return json({ ok: false, error: msg }); }
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Planilha helpers ─────────────────────────────────────────
function getSheet(nome) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(nome);
  if (!sh) {
    sh = ss.insertSheet(nome);
    sh.appendRow(HEADERS[nome]);
    sh.getRange(1, 1, 1, HEADERS[nome].length).setFontWeight('bold');
  }
  return sh;
}

function sheetRows(sh) {
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let v = row[i];
      if (v instanceof Date) v = v.toISOString();
      if (v === true  || v === 'TRUE' ) v = true;
      if (v === false || v === 'FALSE') v = false;
      obj[h] = v;
    });
    return obj;
  });
}

function findRow(sh, id) {
  const vals = sh.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] === id) return i + 1;
  }
  return -1;
}

function setFields(sh, row, fields) {
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  Object.entries(fields).forEach(([k, v]) => {
    const col = headers.indexOf(k);
    if (col >= 0) sh.getRange(row, col + 1).setValue(v);
  });
}

function newId(prefix) {
  return prefix + '_' + Utilities.getUuid().replace(/-/g,'').slice(0,8);
}

function addDias(dataStr, dias) {
  const d = new Date(dataStr);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0,10);
}

// ── Mapeadores camelCase ─────────────────────────────────────
function mapMateria(r) {
  return { id: r.id, nome: r.nome, paiId: r.pai_id || null, cor: r.cor, ativa: r.ativa, criadaEm: r.criada_em };
}

function mapSessao(r) {
  return {
    id: r.id, materiaId: r.materia_id,
    data: String(r.data).slice(0,10), duracaoMin: Number(r.duracao_min),
    tipo: r.tipo, observacoes: r.observacoes || null,
    sessaoOrigemId: r.sessao_origem_id || null, criadaEm: r.criada_em,
  };
}

function mapRevisao(r) {
  return {
    id: r.id, materiaId: r.materia_id, sessaoOrigemId: r.sessao_origem_id,
    dataAlvo: String(r.data_alvo).slice(0,10), tipo: r.tipo, status: r.status,
    concluidaEm: r.concluida_em || null, sessaoConcluidaId: r.sessao_concluida_id || null,
  };
}

// ── Matérias ─────────────────────────────────────────────────
function listMaterias() {
  return sheetRows(getSheet(ABA_MATERIAS)).filter(r => r.ativa !== false).map(mapMateria);
}

function createMateria({ nome, paiId, cor }) {
  if (!nome) throw new Error('Nome é obrigatório.');
  const sh = getSheet(ABA_MATERIAS);
  const id = newId('mat');
  sh.appendRow([id, nome, paiId || '', cor || '#6366f1', true, new Date().toISOString()]);
  return { id };
}

function updateMateria({ id, nome, cor, ativa }) {
  const sh = getSheet(ABA_MATERIAS);
  const row = findRow(sh, id);
  if (row < 0) throw new Error('Matéria não encontrada.');
  const fields = {};
  if (nome  !== undefined) fields.nome  = nome;
  if (cor   !== undefined) fields.cor   = cor;
  if (ativa !== undefined) fields.ativa = ativa;
  setFields(sh, row, fields);
  return { id };
}

function deleteMateria({ id }) { return updateMateria({ id, ativa: false }); }

// ── Sessões ──────────────────────────────────────────────────
function listSessoes({ materiaId, tipo, de, ate } = {}) {
  let rows = sheetRows(getSheet(ABA_SESSOES)).map(mapSessao);
  if (materiaId) rows = rows.filter(r => r.materiaId === materiaId);
  if (tipo)      rows = rows.filter(r => r.tipo === tipo);
  if (de)        rows = rows.filter(r => r.data >= de);
  if (ate)       rows = rows.filter(r => r.data <= ate);
  return rows.sort((a, b) => b.data.localeCompare(a.data));
}

function createSessao({ materiaId, data, duracaoMin, tipo, observacoes, sessaoOrigemId }) {
  if (!materiaId || !data || !duracaoMin || !tipo)
    throw new Error('Campos obrigatórios faltando.');
  const sh = getSheet(ABA_SESSOES);
  const id = newId('ses');
  sh.appendRow([id, materiaId, data, Number(duracaoMin), tipo, observacoes || '', sessaoOrigemId || '', new Date().toISOString()]);
  if (tipo === 'Estudo Inicial') {
    _agendarRevisoes(id, materiaId, data);
  } else if (sessaoOrigemId && tipo !== 'Avulsa') {
    _concluirRevisao(sessaoOrigemId, tipo, id, materiaId);
  }
  return { id };
}

function deleteSessao({ id }) {
  const sh = getSheet(ABA_SESSOES);
  const row = findRow(sh, id);
  if (row >= 0) sh.deleteRow(row);
  return { ok: true };
}

function _agendarRevisoes(sessaoId, materiaId, dataBase) {
  const sh = getSheet(ABA_REVISOES);
  [{ dias: 1, tipo: 'Revisão 24h' }, { dias: 7, tipo: 'Revisão 7d' }, { dias: 30, tipo: 'Revisão 30d' }]
    .forEach(({ dias, tipo }) => {
      sh.appendRow([newId('rev'), materiaId, sessaoId, addDias(dataBase, dias), tipo, 'Pendente', '', '']);
    });
}

// Ao concluir uma Revisão 30d, agenda automaticamente a próxima +30 dias
function _concluirRevisao(sessaoOrigemId, tipo, sessaoConcluidaId, materiaId) {
  const sh = getSheet(ABA_REVISOES);
  const rev = sheetRows(sh).find(r =>
    r.sessao_origem_id === sessaoOrigemId && r.tipo === tipo && r.status === 'Pendente'
  );
  if (!rev) return;
  const row = findRow(sh, rev.id);
  if (row < 0) return;
  setFields(sh, row, {
    status: 'Concluída',
    concluida_em: new Date().toISOString(),
    sessao_concluida_id: sessaoConcluidaId,
  });
  // Revisão contínua: após cada 30d concluída, agenda a próxima
  if (tipo === 'Revisão 30d') {
    const proxData = addDias(new Date().toISOString().slice(0,10), 30);
    const mat = materiaId || rev.materia_id;
    sh.appendRow([newId('rev'), mat, sessaoConcluidaId, proxData, 'Revisão 30d', 'Pendente', '', '']);
  }
}

// ── Revisões ─────────────────────────────────────────────────
function listRevisoes({ de, ate, status } = {}) {
  let rows = sheetRows(getSheet(ABA_REVISOES)).map(mapRevisao);
  if (status) rows = rows.filter(r => r.status === status);
  if (de)     rows = rows.filter(r => r.dataAlvo >= de);
  if (ate)    rows = rows.filter(r => r.dataAlvo <= ate);
  return rows;
}

// Adia a revisão para o dia seguinte
function adiarRevisao({ id }) {
  const sh = getSheet(ABA_REVISOES);
  const rev = sheetRows(sh).find(r => r.id === id);
  if (!rev) throw new Error('Revisão não encontrada.');
  const row = findRow(sh, id);
  const novaData = addDias(String(rev.data_alvo).slice(0,10), 1);
  setFields(sh, row, { data_alvo: novaData });
  return { id, dataAlvo: novaData };
}

// Adianta a revisão para hoje
function adiantarRevisao({ id }) {
  const sh = getSheet(ABA_REVISOES);
  const row = findRow(sh, id);
  if (row < 0) throw new Error('Revisão não encontrada.');
  const hoje = new Date().toISOString().slice(0,10);
  setFields(sh, row, { data_alvo: hoje });
  return { id, dataAlvo: hoje };
}

function getResumoHoje() {
  const hoje  = new Date().toISOString().slice(0,10);
  const em3   = addDias(hoje, 3);
  const ha365 = addDias(hoje, -365);

  const pendentes = sheetRows(getSheet(ABA_REVISOES))
    .filter(r => r.status === 'Pendente')
    .map(mapRevisao);

  const sessoes = sheetRows(getSheet(ABA_SESSOES))
    .map(mapSessao)
    .filter(s => s.data >= ha365);

  return {
    hoje:      pendentes.filter(r => r.dataAlvo === hoje),
    atrasadas: pendentes.filter(r => r.dataAlvo < hoje),
    proximas:  pendentes.filter(r => r.dataAlvo > hoje && r.dataAlvo <= em3),
    futuras:   pendentes.filter(r => r.dataAlvo > hoje), // todas as futuras para o calendário
    sessoes,
  };
}

function getEstatisticas({ periodo } = {}) {
  const hoje = new Date().toISOString().slice(0,10);
  let de = null;
  if (periodo === 'dia')    de = hoje;
  if (periodo === 'semana') { const d = new Date(); d.setDate(d.getDate() - d.getDay()); de = d.toISOString().slice(0,10); }
  if (periodo === 'mes')    de = hoje.slice(0,7) + '-01';
  if (periodo === 'ano')    de = hoje.slice(0,4) + '-01-01';

  const sessoes = sheetRows(getSheet(ABA_SESSOES)).map(mapSessao).filter(s => !de || s.data >= de);
  const porMateria = {};
  sessoes.forEach(s => { porMateria[s.materiaId] = (porMateria[s.materiaId] || 0) + s.duracaoMin; });

  return {
    porMateria,
    totalMin:     sessoes.reduce((a,s) => a + s.duracaoMin, 0),
    totalSessoes: sessoes.length,
    pendentes:    sheetRows(getSheet(ABA_REVISOES)).filter(r => r.status === 'Pendente').length,
    streak:       _calcStreak(),
  };
}

function _calcStreak() {
  const dias = new Set(sheetRows(getSheet(ABA_SESSOES)).map(r => String(r.data).slice(0,10)));
  let streak = 0;
  let d = new Date();
  while (dias.has(d.toISOString().slice(0,10))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
