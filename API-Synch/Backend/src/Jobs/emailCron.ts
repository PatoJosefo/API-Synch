import nodemailer from 'nodemailer';
import { prisma } from '../config/prisma.js';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis do .env

const transporter = nodemailer.createTransport({
  service: "gmail", // deixa o Nodemailer configurar automaticamente
  auth: {
    user: process.env.EMAIL_USER, // sua conta Gmail
    pass: process.env.EMAIL_PASS  // senha de app
  }
});

const TIME_ZONE = 'America/Sao_Paulo';

/**
 * Notifica todos os participantes de um evento via email.
 * @param eventoId ID do evento
 */
export async function notificarParticipantes(eventoId: number) {
  try {
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
        funcionariosConvidados: { include: { funcionario: true } },
        organizador: true
      }
    });

    if (!evento) {
      console.warn(`Evento #${eventoId} não encontrado para notificação.`);
      return;
    }

    const inicioSP = new Date(evento.dataIni).toLocaleString('pt-BR', { timeZone: TIME_ZONE });

    for (const convidado of evento.funcionariosConvidados) {
      const funcionario = convidado.funcionario;
      if (!funcionario?.email) continue;

      const mailOptions = {
        from: process.env.MAIL_USER,
        to: funcionario.email,
        subject: `📅 Novo evento: ${evento.titulo}`,
        text: `
Olá, ${funcionario.nome}!

Você foi convidado(a) para o evento "${evento.titulo}".

🕒 Início: ${inicioSP} (Horário de São Paulo)
👤 Organizador: ${evento.organizador.nome}

Descrição:
${evento.desc ?? "(sem descrição)"}

Por favor, confira sua agenda! ✔
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`📨 Email enviado para ${funcionario.email} | Evento: ${evento.titulo}`);
      } catch (err) {
        console.error(`❌ Erro ao enviar email para ${funcionario.email}:`, err);
      }
    }
  } catch (err) {
    console.error(`Erro ao notificar participantes do evento #${eventoId}:`, err);
  }
}

/**
 * Notifica todos os participantes de um evento quando ele é atualizado.
 * @param eventoId ID do evento atualizado
 */
export async function notificarAtualizacaoParticipantes(eventoId: number) {
  try {
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
        funcionariosConvidados: { include: { funcionario: true } },
        organizador: true
      }
    });

    if (!evento) {
      console.warn(`Evento #${eventoId} não encontrado para notificação de atualização.`);
      return;
    }

    const inicioSP = new Date(evento.dataIni).toLocaleString('pt-BR', { timeZone: TIME_ZONE });

    for (const convidado of evento.funcionariosConvidados) {
      const funcionario = convidado.funcionario;
      if (!funcionario?.email) continue;

      const mailOptions = {
        from: process.env.MAIL_USER,
        to: funcionario.email,
        subject: `✏️ Evento atualizado: ${evento.titulo}`,
        text: `
Olá, ${funcionario.nome}!

O evento "${evento.titulo}" foi atualizado.

🕒 Novo Início: ${inicioSP} (Horário de São Paulo)
👤 Organizador: ${evento.organizador.nome}

Descrição atualizada:
${evento.desc ?? "(sem descrição)"}

Por favor, verifique sua agenda novamente! ✔
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`📨 Email de atualização enviado para ${funcionario.email} | Evento: ${evento.titulo}`);
      } catch (err) {
        console.error(`❌ Erro ao enviar email de atualização para ${funcionario.email}:`, err);
      }
    }

  } catch (err) {
    console.error(`Erro ao notificar atualização do evento #${eventoId}:`, err);
  }
}