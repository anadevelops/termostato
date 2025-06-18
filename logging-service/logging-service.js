const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//----------------------------------------------------------------
// Criação/Carregamento Base de Dados
//----------------------------------------------------------------

// Carrega base de dados
var db = new sqlite3.Database('./logging.db', (err) => {
    if (err) {
        console.log('ERRO: não foi possível conectar ao SQLite.');
        throw err;
    }
    console.log('Conectado ao SQLite.');
});

// Cria a tabela 
db.run(`CREATE TABLE IF NOT EXISTS logging (
        evento TEXT NOT NULL,
        status TEXT NOT NULL, 
        descricao TEXT NOT NULL,
        horario TEXT NOT NULL
        )`,[], (err) => {
            if (err) {
                console.log('ERRO: Não foi possível criar a tabela');
                throw err;
            }
});


//----------------------------------------------------------------
// Routes
//----------------------------------------------------------------

// Cadastra um novo registro
app.post('/logging/', (req, res, next) => {
    console.log(`POST request on /logging`)

    const horario = new Date().toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false
    })

    // Add to DB
    db.run(`INSERT INTO logging (evento, status, descricao, horario) VALUES (?,?,?,?)`,
        [req.body.evento, req.body.status, req.body.descricao, horario], (err) => {
            if (err) {
                res.status(500).send(`Erro ao cadastrar log: ${err}`);
            } else {
                res.status(200).send('Log cadastrado com sucesso!');
            }
        });
});

// Consulta todos os dados da tabela
app.get('/logging/', (req, res, next) => {
    console.log(`GET request on /logging`)

    db.all(`SELECT * FROM logging`, [], (err, result) => {
        if (err) {
            res.status(500).send(`Erro ao obter dados: ${err}`);
        } else {
            res.status(200).json(result.reverse());
        }
    });
});


//----------------------------------------------------------------
// Server
//----------------------------------------------------------------

// Listen
let porta = 8070;
app.listen(porta, () => {
    console.clear()
    console.log("Logging Service")
    console.log(`Servidor em execução na porta: ${porta}\n`);
});


//----------------------------------------------------------------