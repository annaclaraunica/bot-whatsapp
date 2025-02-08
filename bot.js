const wppconnect = require('@wppconnect-team/wppconnect');
const express = require('express');

// Configuração para usar o Chromium instalado no sistema
process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/chromium-browser';

// Inicializa o cliente do WhatsApp
wppconnect.create()
    .then((client) => start(client))
    .catch((error) => console.error('Erro ao iniciar o cliente:', error));

function start(client) {
    console.log('Bot iniciado!');

    // Evento para quando o bot receber uma mensagem
    client.onMessage(async (message) => {
        // Ignora mensagens sem texto ou fora de um grupo
        if (!message.body || !message.isGroupMsg) {
            console.log('Ignorando mensagem sem texto ou fora de um grupo.');
            return;
        }

        const groupId = message.chatId;

        // Obtém o nome do remetente ou usa 'Membro' como padrão
        const senderName = 
            (message.sender && (message.sender.pushname || message.sender.verifiedName)) || 'Membro';

        console.log(`Mensagem recebida no grupo ${groupId}: "${message.body}" de ${senderName}`);

        // Responde automaticamente à palavra "ajuda"
        if (message.body.toLowerCase() === 'ajuda') {
            await client.sendText(groupId, `Olá ${senderName}, como posso ajudar você?`);
            console.log(`Respondido à palavra "ajuda" no grupo ${groupId}`);
            return;
        }

        // Remove membros que enviam links suspeitos
        if (message.body.includes('http')) {
            await client.removeParticipant(groupId, message.sender.id);
            await client.sendText(groupId, `Atenção: ${senderName} foi removido por enviar links suspeitos.`);
            console.log(`Removido participante ${senderName} (${message.sender.id}) por enviar links suspeitos.`);
            return;
        }
    });

    // Função para adicionar novos membros ao grupo
    async function addParticipants(groupId, participants) {
        try {
            // Valida o groupId
            if (!groupId.endsWith('@g.us')) {
                console.error('Erro: O groupId não está no formato correto.');
                return;
            }

            for (const participant of participants) {
                // Valida o número de telefone
                if (!participant.endsWith('@c.us')) {
                    console.error(`Erro: O número ${participant} não está no formato correto.`);
                    continue;
                }

                console.log(`Adicionando participante: ${participant}`);
                await client.addParticipant(groupId, participant);
                console.log(`Participante adicionado ao grupo: ${participant}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar participantes:', error);
        }
    }

    // Exemplo de uso: Adicionar novos membros
    const groupId = '1234567890-12345678@g.us'; // Substitua pelo ID do grupo correto
    const newParticipants = [
        '5511987654321@c.us', // Substitua pelos números corretos
        '5521987654321@c.us'
    ];
    addParticipants(groupId, newParticipants);
}

// Simula um servidor HTTP para satisfazer o Render
const app = express();

app.get('/', (req, res) => {
    res.send('Bot WhatsApp está ativo!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});