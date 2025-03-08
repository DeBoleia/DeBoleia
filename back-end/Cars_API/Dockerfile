FROM node:19-slim

# Copie apenas o package.json e package-lock.json para o diretório de trabalho
COPY ./Cars/package*.json /app/cars/

# Defina o diretório de trabalho
WORKDIR /app/cars

# Instale as dependências
RUN npm install

# Copie o restante dos arquivos, exceto node_modules
COPY ./Cars /app/cars

EXPOSE 8083

# Comando de entrada
ENTRYPOINT [ "npm", "run", "start" ]
