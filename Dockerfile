FROM node:20-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du reste
COPY . .

# Port
EXPOSE 3000

# Démarrage en mode dev
CMD ["npm", "run", "dev"]