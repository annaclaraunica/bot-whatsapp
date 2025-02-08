const wppconnect = require('@wppconnect-team/wppconnect');

// Inicializa o cliente do WhatsApp
wppconnect.create()
    .then((client) => start(client))
    .catch((error) => console.error('Erro ao iniciar o cliente:', error));

function start(client) {
    console.log('Bot iniciado!');

    // Evento para quando o bot estiver pronto
    client.onMessage(async (message) => {
        // Verifica se a mensagem veio de um grupo
        if (message.isGroupMsg) {
            const groupId = message.chatId;
            const senderName = message.sender.pushname || message.sender.verifiedName || 'Membro';
            
            // Exemplo: Responder automaticamente a palavras-chave
            if (message.body.toLowerCase() === 'ajuda') {
                await client.sendText(groupId, `Olá ${senderName}, como posso ajudar você?`);
            }

            // Exemplo: Remover membros que enviam links suspeitos
            if (message.body.includes('http')) {
                await client.removeParticipant(groupId, message.sender.id);
                await client.sendText(groupId, `Atenção: ${senderName} foi removido por enviar links suspeitos.`);
            }
        }
    });

    // Função para adicionar novos membros ao grupo
    async function addParticipants(groupId, participants) {
        try {
            await client.addParticipants(groupId, participants);
            console.log(`Participantes adicionados ao grupo: ${groupId}`);
        } catch (error) {
            console.error('Erro ao adicionar participantes:', error);
        }
    }

    // Exemplo de uso: Adicionar novos membros
    const groupId = '1234567890-12345678@g.us'; // Substitua pelo ID do grupo
    const newParticipants = ['5511987654321@c.us', '5521987654321@c.us']; // Números dos novos membros
    addParticipants(groupId, newParticipants);
} 
