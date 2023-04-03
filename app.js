const { Socket } = require('dgram');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const nodemailer = require('nodemailer');

// Formulaire
app.use(express.urlencoded({ extended : false}));

// View engine
app.set("view engine", "ejs");
app.set("views", "frontend/views");

// Dossier public
app.use(express.static("frontend/public"));

// Traitements synchrones
io.on('connection', (socket) => {
    console.log('Connexion au socket!');

    // Reception du message
    socket.on('message', (message) => {
        console.log('Message reçu de la part du client!');
        console.log(message);
        // Envoie du mail
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: "nodejsemmanuel@gmail.com",
                pass: "wcxj rmad seoo fhkl"
            }
        });
        
        msg = {
            from: "nodejsemmanuel@gmail.com",
            to: "davidemmanuelbahige@gmail.com",
            subject: "Contact from portfolio",
            text: message.nom + "\n" + message.email + "\n" + message.contenu 
        };

        transporter.sendMail(msg, function(err, info) {
            if(err) {
                console.log(err);
            } else {
                console.log(info);
            }
        });
        // Réponse du serveur
        socket.emit('message', 'Thanks for conctacting me. I will answer you as soon as possible.');
    });
});

// Page d'accueil
app.get("/", (req, res) => {
    // Création de la connexion
    let db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err) => {
        if(err) {
            console.log(err.message);
            res.status(404).render("pageIntrouvable");
        } else {
            console.log('Connexion à la base de données établie!');
        }
    });

    db.all('SELECT id, ' + 
        'nom, ' + 
        'description, ' + 
        'couverture, ' +
        'resume ' + 
        'FROM Specialite',[], 
    (err, data) => {
        if(err) {
            console.log(err.message);
        }

        res.status(200).render("index", { data });
    });
    
    db.close((err) => {
        if(err) {
            console.log(err.message);
        } else {
            console.log('Connexion à la base de donnée fermée!');
        }
    });
});

// Generic
app.get("/generic", (req, res) => {
    let projectId = req.query.pjct;
    if(projectId === undefined) {
        let erreur = "No project found!";
        res.status(404).render("erreur", {erreur});
    } else {
        // Recherche de la description dans la base de données
        // Création de la connexion
        let db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err) => {
            if(err) {
                console.log(err.message);
                res.status(404).render("erreur");
            } else {
                console.log('Connexion à la base de données établie!');
            }
        });

        db.all('SELECT nom, ' + 
            'description, ' + 
            'couverture ' +
            'FROM Specialite WHERE id = ' + projectId,[], 
        (err, data) => {
            if(err) {
                console.log(err.message);
                let erreur = err.message;
                res.status(404).render("erreur", {erreur});
            }
            
            if(data !== undefined) {
                if(data.length > 0)
                    res.status(200).render("generic", { data });
            } else {
                let erreur = "No project found!";
                res.status(404).render("erreur", {erreur});
            }
        });
        
        db.close((err) => {
            if(err) {
                console.log(err.message);
            } else {
                console.log('Connexion à la base de donnée fermée!');
            }
        });
    }
});

app.use((req, res) => {
    res.status(404).render("pageIntrouvable");
});

server.listen(8000);
console.log("En attente des requetes...");