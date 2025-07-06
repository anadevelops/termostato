const express = require(`express`);
const bodyParser = require(`body-parser`);
const sqlite3 = require(`sqlite3`);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//----------------------------------------------------------------
// Criação/Carregamento Base de Dados
//----------------------------------------------------------------

// Criar DB
var db = new sqlite3.Database(`./config.db`, (err) => {
    if (err) {
        console.log(`ERRO: não foi possível conectar ao SQLite.`);
        throw err;
    }
    console.log(`Conectado ao SQLite.`);
});

// Cria a tabela
db.run(`CREATE TABLE IF NOT EXISTS config
        (id INTEGER PRIMARY KEY NOT NULL UNIQUE, 
         local TEXT NOT NULL,
         tempDesejada INTEGER NOT NULL,
         tempAtual INTEGER NOT NULL)`,
         [], (err) => {
            if (err) {
                console.log(`ERRO: Não foi possível criar a tabela`);
                throw err;
            }
});

//----------------------------------------------------------------
// Routes
//----------------------------------------------------------------

// Cadastra o local
app.post(`/config/`, (req, res, next) => {
    console.log(`POST request on /config`)

    // Valida se local com mesmo ID já não existe
    // if (await getAlarme(req.body.id)) {res.status(500).send(`Erro ao cadastrar local: ID em uso`); return}

    // Validar dados
    // const validation = await validaDadosAlarme(req.body)
    // if (!validation.success) { res.status(500).send(validation.message); return }

    // Adicionar ao banco
    db.run(`INSERT INTO config(id, local, tempDesejada, tempAtual) VALUES (?,?,?,?)`,
        [req.body.id, req.body.local, req.body.tempDesejada, req.body.tempAtual], (err) => {
            if (err) {
                res.status(500).send(`Erro ao cadastrar local: ${err}`);
            } else {
                res.status(200).send(`Local cadastrado com sucesso!`);
            }
        });
});

// Consulta todos os dados da tabela
app.get(`/config/`, (req, res, next) => {
    console.log(`GET request on /config`)

    db.all(`SELECT * FROM config`, [], (err, result) => {
        if (err) {
            res.status(500).send(`Erro ao obter dados: ${err}`);
        } else {
            res.status(200).json(result);
        }
    });
});

// Consulta um local específico através do ID
app.get(`/config/:id`, (req, res, next) => {
    console.log(`GET request on /config/${req.params.id}`)

    db.get(`SELECT * FROM config WHERE id = ?`,
        req.params.id, (err, result) => {
            if (err) {
                res.status(500).send(`Erro ao obter dados: ${err}`);
            } else if (result == null) {
                res.status(404).send(`Local não encontrado`);
            } else {
                res.status(200).json(result);
            }
        });
});

// Envia somente a tempDesejada ao Arduino
app.get(`/config/tempDesejada/:id`, (req, res, next) => {
    console.log(`GET request on /config/tempDesejada/${req.params.id}`)

    db.get(`SELECT tempDesejada FROM config WHERE id = ?`,
        req.params.id, (err, result) => {
            if(err) {
                res.status(500).send(`Erro ao obter dados: ${err}`);
            } else if (result == null) {
                res.status(404).send(`Local não encontrado`);
            } else {
                res.status(200).json(result);
            }
        });
});

// Atualiza local
app.patch(`/config/:id`, (req, res, next) => {
    console.log(`PATCH request on /config/${req.params.id}`)

    // Valida permissao
    // const authorize = await authorizeUser(req.params.id, req.body.cpf)
    // if (!authorize.success) { res.status(500).send(authorize.message); return }

    // Validar dados
    // const validation = await validaDadosAlarme(req.body)
    // if (!validation.success) { res.status(500).send(validation.message); return }

    // Atualiza no BD
    db.run(`UPDATE config SET local = COALESCE(?, local), tempDesejada = COALESCE(?, tempDesejada), tempAtual = COALESCE(?, tempAtual) WHERE id = ?`,
        [req.body.local, req.body.tempDesejada, req.body.tempAtual, req.params.id], function(err) {
            if (err) {
                res.status(500).send(`Erro ao alterar dados: ${err}`);
            } else if (this.changes == 0) {
                res.status(404).send(`Local não encontrado`);
            } else {
                res.status(200).send(`Local alterado com sucesso!`);
            }
        });
});

// Atualiza tempAtual
app.patch(`/config/tempAtual/:id`, (req, res, next) => {
    console.log(`PATCH tempAtual request on /config/${req.params.id}`)

    // Atualiza no BD
    db.run(`UPDATE config SET tempAtual = COALESCE(?, tempAtual) WHERE id = ?`,
        [req.body.tempAtual, req.params.id], function(err) {
            if (err) {
                res.status(500).send(`Erro ao alterar dados: ${err}`);
            } else if (this.changes == 0) {
                res.status(404).send(`Local não encontrado`);
            } else {
                res.status(200).send(`TempAtual do local alterado com sucesso!`);
            }
        });
});

// Atualiza tempDesejada
app.patch(`/config/tempDesejada/:id`, (req, res, next) => {
    console.log(`PATCH tempDesejada request on /config/${req.params.id}`)

    // Atualiza no BD
    db.run(`UPDATE config SET tempDesejada = COALESCE(?, tempDesejada) WHERE id = ?`,
        [req.body.tempDesejada, req.params.id], function(err) {
            if (err) {
                res.status(500).send(`Erro ao alterar dados: ${err}`);
            } else if (this.changes == 0) {
                res.status(404).send(`Local não encontrado`);
            } else {
                res.status(200).send(`TempDesejada do local alterado com sucesso!`);
            }
        });
});


// Exclui o local
app.delete(`/config/:id`, (req, res, next) => {
    console.log(`DELETE request on /config/${req.params.id}`)

    // Valida permissao
    // const authorize = await authorizeUser(req.params.id, req.body.cpf)
    // if (!authorize.success) { res.status(500).send(authorize.message); return }

    // Atualiza no BD
    db.run(`DELETE FROM config WHERE id = ?`, req.params.id, function(err) {
        if (err) {
            res.status(500).send(`Erro ao excluir local: ${err}`);
        } else if (this.changes == 0) {
            res.status(404).send(`Local não encontrado.`);
        } else {
            res.status(200).send(`Local excluído com sucesso!`);
        }
    });
});


//----------------------------------------------------------------
// Server
//----------------------------------------------------------------

// Listen
let porta = 8080;
app.listen(porta, () => {
    console.clear()
    console.log("Config Service")
    console.log(`Servidor em execução na porta: ${porta}\n`);
});

//----------------------------------------------------------------