const express = require(`express`);
const bodyParser = require(`body-parser`);
const sqlite3 = require(`sqlite3`);

// Import fetch for Node.js (available in Node 18+)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//----------------------------------------------------------------
// Logging Service Integration
//----------------------------------------------------------------

// Function to send logs to logging service via API gateway
async function sendLogToLoggingService(evento, status, descricao) {
    try {
        const response = await fetch('http://localhost:8000/logging/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                evento: evento,
                status: status,
                descricao: descricao
            })
        });

        if (!response.ok) {
            console.error(`Failed to send log to logging service: ${response.status} ${response.statusText}`);
        } else {
            console.log('Log sent to logging service successfully');
        }
    } catch (error) {
        console.error('Error sending log to logging service:', error.message);
    }
}

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
         tempAtual INTEGER)`,
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
app.post(`/config/`, async (req, res, next) => {
    console.log(`POST request on /config`)

    // Valida se local com mesmo ID já não existe
    // if (await getAlarme(req.body.id)) {res.status(500).send(`Erro ao cadastrar local: ID em uso`); return}

    // Validar dados
    // const validation = await validaDadosAlarme(req.body)
    // if (!validation.success) { res.status(500).send(validation.message); return }

    // Adicionar ao banco
    db.run(`INSERT INTO config(id, local, tempDesejada, tempAtual) VALUES (?,?,?,?)`,
        [req.body.id, req.body.local, req.body.tempDesejada, req.body.tempAtual || null], async (err) => {
            if (err) {
                // Log error
                await sendLogToLoggingService(
                    'Sensor Creation',
                    'ERROR',
                    `Failed to create sensor ${req.body.id} for location ${req.body.local}: ${err}`
                );
                res.status(500).send(`Erro ao cadastrar local: ${err}`);
            } else {
                // Log success
                await sendLogToLoggingService(
                    'Sensor Creation',
                    'SUCCESS',
                    `New sensor ${req.body.id} created for location ${req.body.local} with desired temperature ${req.body.tempDesejada}°C`
                );
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
app.patch(`/config/:id`, async (req, res, next) => {
    console.log(`PATCH request on /config/${req.params.id}`)

    // Valida permissao
    // const authorize = await authorizeUser(req.params.id, req.body.cpf)
    // if (!authorize.success) { res.status(500).send(authorize.message); return }

    // Validar dados
    // const validation = await validaDadosAlarme(req.body)
    // if (!validation.success) { res.status(500).send(validation.message); return }

    // Get current data for comparison
    db.get(`SELECT local, tempDesejada, tempAtual FROM config WHERE id = ?`, req.params.id, async (err, currentData) => {
        if (err) {
            await sendLogToLoggingService(
                'Sensor Update',
                'ERROR',
                `Failed to get current data for sensor ${req.params.id}: ${err}`
            );
            res.status(500).send(`Erro ao obter dados: ${err}`);
            return;
        }

        if (!currentData) {
            await sendLogToLoggingService(
                'Sensor Update',
                'ERROR',
                `Sensor ${req.params.id} not found for update`
            );
            res.status(404).send(`Local não encontrado`);
            return;
        }

        const oldLocal = currentData.local;
        const newLocal = req.body.local;
        const oldTempDesejada = currentData.tempDesejada;
        const newTempDesejada = req.body.tempDesejada;
        const oldTempAtual = currentData.tempAtual;
        const newTempAtual = req.body.tempAtual;

        // Atualiza no BD
        db.run(`UPDATE config SET local = COALESCE(?, local), tempDesejada = COALESCE(?, tempDesejada), tempAtual = COALESCE(?, tempAtual) WHERE id = ?`,
            [newLocal, newTempDesejada, newTempAtual, req.params.id], async function(err) {
                if (err) {
                    await sendLogToLoggingService(
                        'Sensor Update',
                        'ERROR',
                        `Failed to update sensor ${req.params.id}: ${err}`
                    );
                    res.status(500).send(`Erro ao alterar dados: ${err}`);
                } else if (this.changes == 0) {
                    await sendLogToLoggingService(
                        'Sensor Update',
                        'WARNING',
                        `No changes made to sensor ${req.params.id}`
                    );
                    res.status(404).send(`Local não encontrado`);
                } else {
                    // Log changes
                    let changes = [];
                    
                    if (newLocal && newLocal !== oldLocal) {
                        changes.push(`location from ${oldLocal} to ${newLocal}`);
                    }
                    
                    if (newTempDesejada !== undefined && newTempDesejada !== oldTempDesejada) {
                        changes.push(`desired temperature from ${oldTempDesejada}°C to ${newTempDesejada}°C`);
                    }
                    
                    if (newTempAtual !== undefined && newTempAtual !== oldTempAtual) {
                        const tempChange = oldTempAtual !== null ? `from ${oldTempAtual}°C to ${newTempAtual}°C` : `to ${newTempAtual}°C (first reading)`;
                        changes.push(`current temperature ${tempChange}`);
                    }

                    if (changes.length > 0) {
                        const changeDescription = changes.join(', ');
                        await sendLogToLoggingService(
                            'Sensor Update',
                            'SUCCESS',
                            `Sensor ${req.params.id} updated: ${changeDescription}`
                        );
                    }
                    
                    res.status(200).send(`Local alterado com sucesso!`);
                }
            });
    });
});

// Atualiza tempAtual
app.patch(`/config/tempAtual/:id`, async (req, res, next) => {
    console.log(`PATCH tempAtual request on /config/${req.params.id}`)

    // Get current temperature for comparison
    db.get(`SELECT tempAtual, local FROM config WHERE id = ?`, req.params.id, async (err, currentData) => {
        if (err) {
            await sendLogToLoggingService(
                'Current Temperature Update',
                'ERROR',
                `Failed to get current temperature for sensor ${req.params.id}: ${err}`
            );
            res.status(500).send(`Erro ao obter dados: ${err}`);
            return;
        }

        if (!currentData) {
            await sendLogToLoggingService(
                'Current Temperature Update',
                'ERROR',
                `Sensor ${req.params.id} not found for current temperature update`
            );
            res.status(404).send(`Local não encontrado`);
            return;
        }

        const oldTemp = currentData.tempAtual;
        const newTemp = req.body.tempAtual;

        // Atualiza no BD
        db.run(`UPDATE config SET tempAtual = COALESCE(?, tempAtual) WHERE id = ?`,
            [newTemp, req.params.id], async function(err) {
                if (err) {
                    await sendLogToLoggingService(
                        'Current Temperature Update',
                        'ERROR',
                        `Failed to update current temperature for sensor ${req.params.id}: ${err}`
                    );
                    res.status(500).send(`Erro ao alterar dados: ${err}`);
                } else if (this.changes == 0) {
                    await sendLogToLoggingService(
                        'Current Temperature Update',
                        'WARNING',
                        `No changes made to current temperature for sensor ${req.params.id}`
                    );
                    res.status(404).send(`Local não encontrado`);
                } else {
                    const tempChange = oldTemp !== null ? `from ${oldTemp}°C to ${newTemp}°C` : `to ${newTemp}°C (first reading)`;
                    await sendLogToLoggingService(
                        'Current Temperature Update',
                        'INFO',
                        `Current temperature for sensor ${req.params.id} (${currentData.local}) updated ${tempChange}`
                    );
                    res.status(200).send(`TempAtual do local alterado com sucesso!`);
                }
            });
    });
});

// Atualiza tempDesejada
app.patch(`/config/tempDesejada/:id`, async (req, res, next) => {
    console.log(`PATCH tempDesejada request on /config/${req.params.id}`)

    // Get current temperature for comparison
    db.get(`SELECT tempDesejada, local FROM config WHERE id = ?`, req.params.id, async (err, currentData) => {
        if (err) {
            await sendLogToLoggingService(
                'Temperature Update',
                'ERROR',
                `Failed to get current temperature for sensor ${req.params.id}: ${err}`
            );
            res.status(500).send(`Erro ao obter dados: ${err}`);
            return;
        }

        if (!currentData) {
            await sendLogToLoggingService(
                'Temperature Update',
                'ERROR',
                `Sensor ${req.params.id} not found for temperature update`
            );
            res.status(404).send(`Local não encontrado`);
            return;
        }

        const oldTemp = currentData.tempDesejada;
        const newTemp = req.body.tempDesejada;

        // Atualiza no BD
        db.run(`UPDATE config SET tempDesejada = COALESCE(?, tempDesejada) WHERE id = ?`,
            [newTemp, req.params.id], async function(err) {
                if (err) {
                    await sendLogToLoggingService(
                        'Temperature Update',
                        'ERROR',
                        `Failed to update desired temperature for sensor ${req.params.id}: ${err}`
                    );
                    res.status(500).send(`Erro ao alterar dados: ${err}`);
                } else if (this.changes == 0) {
                    await sendLogToLoggingService(
                        'Temperature Update',
                        'WARNING',
                        `No changes made to desired temperature for sensor ${req.params.id}`
                    );
                    res.status(404).send(`Local não encontrado`);
                } else {
                    await sendLogToLoggingService(
                        'Temperature Update',
                        'SUCCESS',
                        `Desired temperature for sensor ${req.params.id} (${currentData.local}) changed from ${oldTemp}°C to ${newTemp}°C`
                    );
                    res.status(200).send(`TempDesejada do local alterado com sucesso!`);
                }
            });
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