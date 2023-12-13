# Utilisation de l'image officielle de Node.js
FROM node:14

# Répertoire de travail
WORKDIR /app

# Copie des fichiers nécessaires à l'application
COPY package.json .
COPY server.js .

# Installation des dépendances
RUN npm install

# Commande pour démarrer l'application
CMD tail -f /dev/null
