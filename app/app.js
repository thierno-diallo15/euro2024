const { MongoClient } = require('mongodb');

// URL de connexion à la base de données MongoDB
const url = 'mongodb://euro2024:euro2024@localhost:27018/';

// Nom de la base de données
const dbName = 'euro2024';

// Créer un nouveau client MongoDB
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Fonction pour effectuer des opérations après la connexion
async function run() {
    try {
        // Se connecter au client MongoDB
        await client.connect();

        console.log(' ------------ Connecté avec succès au serveur MongoDB ---------- ');

        // Sélectionner la base de données
        const db = client.db(dbName);
        // Récupérer le nombre d'équipes dans la collection "equipes"
        const equipesCollection = db.collection("contries");
        const nbEquipes = await equipesCollection.countDocuments({});
        console.log(`Nombre d'équipes : ${nbEquipes}`);

        // Récuperer le nombre d'équipe qualifiées en phase finale
        const equipeQualif = await equipesCollection.countDocuments({ Playoff: "" });
        console.log(`Nombre d'équipes qualifiées : ${equipeQualif}`);

        // Récuperer le nombre d'équipes qui jouent les barrages
        const equipeBarrage = await equipesCollection.countDocuments({
            Playoff: {
                $exists: true,
                $ne: ""
            }
        });
        console.log(`Nombre d'équipes qui jouent les barrages : ${equipeBarrage}`);

        // recuperer les equipes du playoff A
        const equipePlayOffA = await equipesCollection.find({ Playoff: "A" })
            .sort({ Rang: -1 }).limit(5).toArray();
        console.log("\nÉquipes du playoff A:");
        equipePlayOffA.forEach((equipe) => {
            console.log(`${equipe.CountryName}`
            )
        })

        // recuperer les equipes du playoff B
        const equipePlayOffB = await equipesCollection.find({ Playoff: "B" })
            .sort({ Rang: -1 }).toArray();
        console.log("\nÉquipes du playoff B:");
        equipePlayOffB.forEach((equipe) => {
            console.log(`${equipe.CountryName}`
            )
        })

        // recuperer les equipes du playoff C
        const equipePlayOffC = await equipesCollection.find({ Playoff: "C" })
            .sort({ Rang: -1 }).toArray();
        console.log("\nÉquipes du playoff C:");
        equipePlayOffC.forEach((equipe) => {
            console.log(`${equipe.CountryName}`
            )
        })
        // organiser les matcht du playoff A et une seule équipe doit se qualifier
        var index = Math.floor(Math.random() * equipePlayOffA.length)
        var randomTeamA = equipePlayOffA[index]
        console.log(`\nEquipe qualifiée à la suite du playoff A:`)
        console.log(randomTeamA.CountryName)

        // organiser les matcht du playoff B et une seule équipe doit se qualifier
        var index = Math.floor(Math.random() * equipePlayOffB.length)
        var randomTeamB = equipePlayOffB[index]
        console.log(`\nEquipe qualifiée à la suite du playoff B:`)
        console.log(randomTeamB.CountryName)

        // organiser les matcht du playoff C et une seule équipe doit se qualifier
        var index = Math.floor(Math.random() * equipePlayOffC.length)
        var randomTeamC = equipePlayOffC[index]
        console.log(`\nEquipe qualifiée à la suite du playoff C:`)
        console.log(randomTeamC.CountryName)

        // ajouter l'équipe au tableau des équipes qualifiés
        var teamsWon = [randomTeamA, randomTeamB, randomTeamC];
        // on affiche les 3 équiptes
        console.log('\nResumé : les Trois équipes qualifiées à la suite du play0ffl :');
        teamsWon.forEach((team) => { console.log(team.CountryName) })

        // creer une collections des qualifiés 
        var equipeQualifG = await equipesCollection.find({ Playoff: "" })
            .sort({ Rang: -1 }).toArray();

        // on fusionne teamsWon avec epuipeQualif
        var fusionTeamsWonEquipeQualif = teamsWon.concat(equipeQualifG);
        console.log("\nLe nombre d'équipes qualifiées apres les barrages:", fusionTeamsWonEquipeQualif.length);

        // Création d'une collection dans la base de données permettant de constituer les groupes
        const groupeCollection = await db.collection("Groupes");
        // On crée un tableau qui contiendra le nom des pays qui seront utilisés pour créer les groupes
        let countriesNames = [];
        countriesNames = countriesNames.concat(...fusionTeamsWonEquipeQualif.map(e => e.CountryName));
        // On enlève les doublons (pays ayant déjà été pris)
        countriesNames = [...new Set(countriesNames)];
        console.log('Pays utilisés pour former les groupes :', countriesNames);
        // On va attribuer aux différents groupes les joueurs issus de l’équipes qualifié
        let tabGroupe = []
        var alpha = ['A', 'B', 'C', 'D', 'E', 'F']
        for (let i = 0; i < 6; i++) {
            let groupe = {};
            groupe.NumeroDeGroupe = i + 1;
            groupe.Membres = []
            for (j = 0; j < 4; j++) {
                let rand = Math.floor(Math.random() * countriesNames.length);
                groupe.Membres.push(countriesNames[rand]);
                countriesNames.splice(rand, 1);
            }
            tabGroupe.push(groupe);
        }
        tabGroupe = tabGroupe.sort((a, b) => (a.NumeroDeGroupe > b.NumeroDeGroupe) ? 1 : -1)
        console.log('\nVoici les groupes formés :')
        tabGroupe.forEach((g) => {
            console.log('Groupe ' + alpha[g.NumeroDeGroupe - 1] + ' : ', g.Membres);
        });

        // On peut maintenant jouer le tournoi !!!
        // On commence par afficher les informations générales sur le tournoi
        console.log('\nInformations Générales sur le Tournoi : \nNombre total d\'équipes :', fusionTeamsWonEquipeQualif.length, '\nNombre de groupes : ', alpha.length);
        console.log(`\nInformations Générales sur le Tournoi :`);
        console.log(`Nombre de matchs par journée : 5`);
        console.log(`Journées de matches : 7`);
        console.log(`Heure de début des matchs : 20h`);
        console.log(`Temps entre chaque match : 90 minutes`);
        // on organise des matches dans chaque groupe et puis on recupere deux equipes
        // les goupes discuter des matchs 
        for (let k = 0; k < alpha.length; k++) {
            let groupeChoisi = tabGroupe.filter(function (obj) {
                return obj.NumeroDeGroupe === parseInt(k) + 1
            })[0];
            tabMatchs = organiserDesMatchs(groupeChoisi.Membres.slice());
            console.log("\nProgrammation des Matchs : ");
            tabMatchs.forEach(match => {
                if (match.Résultat === 'Non déterminé') {
                    console.log(match.Equipe1 + ' vs ' +
                        match.Equipe2)
                } else {
                    console.log(match.Equipe1 + " " + match.Résultat + " " +
                        match.Equipe2 + " Gagné par " + match.JoueurGagnant)
                }
            });
            tabMatchs.forEach(determinerLeVainqueur);
            // Affichage des résultats des matchs
            console.log('\nRésultats des Matchs :');
            tabMatchs.forEach((match) => {
                console.log('%s a battu %s', match.JoueurGagnant, match.Equipe2);
                // recuperer les qui ont gagné
                groupeChoisi.Membres.push(match.JoueurGagnant);
            });
        };

        // afficher les equipes qualifiées en phase finale
        console.log('\nÉquipes Qualifiées pour la Phase Finale :');
        console.log(tabGroupe[0].Membres.join(','));
        console.log(tabGroupe[1].Membres.join(','));
        // afficher les résultats des matchs de la phase finale
        console.log('\nPhase Finale :');
        tabMatchsFinales = tabMatchs.splice(8);
        tabMatchsFinales.forEach(afficherResultatsMatchsFinales);
        function determinerLeVainqueur(match) {
            var equipe1 = tabGroupe.filter(function (e) {
                return e.Membres.indexOf(match.Equipe1) > -1
            })[0],
                equipe2 = tabGroupe.filter(function (e) {
                    return e.Membres.indexOf(match.Equipe2) > -1
                })[0]
            if (equimeGagne(equipe1, equipe2)) {
                match.JoueurGagnant = match.Equipe1;
                match.Résultat = "Gagné";
            } else {
                match.JoueurGagnant = match.Equipe2;
                match.Résultat = "Perdu";
            }
        }
        function equimeGagne(g1, g2) {
            return Math.random() >= 0.5 ? true : false;
        }
        function afficherResultatsMatchsFinales(match) {
            console.log("%s à éliminé %s", match.JoueurGagnant, match.Equipe2);
        }

        //fonction organiserDesMatchs
        function organiserDesMatchs(equipesTourney) {
            var tabMatchs = [];
            var nbrDeJeux = 5;
            while (equipesTourney.length > 1) {
                var tirageAléatoire = Math.floor(Math.random() * equipesTourney.length);
                var equipe1 = equipesTourney.splice(tirageAléatoire, 1)[0];
                var equipe2 = equipesTourney.splice(Math.floor(Math.random() * equipesTourney.
                    length), 1)[0];
                var newMatch = {
                    Equipe1: equipe1, Equipe2: equipe2, Résultat: `Non déterminé`
                    , JoueurGagnant: ''
                }
                tabMatchs.push(newMatch);
            }
            return tabMatchs;
        }

        //Fonction qui permet de déterminer le vainqueur d'un match
        function determinerLeVainqueur(match) {
            var tirageAléatoire = Math.floor(Math.random() * 2);
            if (tirageAléatoire === 0) {
                match.JoueurGagnant = match.Equipe1;
            } else {
                match.JoueurGagnant = match.Equipe2;
            }
            return match;
        }

        // Effectuer des opérations avec la base de données ici

    } finally {
        // Fermer la connexion à la base de données après les opérations
        await client.close();
    }
}

// Appel de la fonction pour établir la connexion et exécuter les opérations
run().catch(console.error);


