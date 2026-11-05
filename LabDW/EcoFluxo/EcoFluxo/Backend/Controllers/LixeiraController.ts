import prisma from "../lib/prisma.js";
import { Tipo } from "@prisma/client";
import type {Request, Response} from "express";

const tiposValidos: string[] = Object.values(Tipo);

export default class LixeiraController{
    //cadastrar uma nova lixeira em um ecoponto
    static async Cadastrar(req:Request,res:Response){
        try
        {
            const {uuid_sensor, tipo, volume_max, nivel_cheio, ecoponto_id} = req.body;

            //verificação dos dados obrigatórios
            if(
                !uuid_sensor ||
                !tipo ||
                volume_max === undefined ||
                nivel_cheio === undefined ||
                ecoponto_id === undefined
            ){
                return res.status(400).json({
                    message:"uuid_sensor, tipo, volume_max, nivel_cheio e ecoponto_id são obrigatórios"
                });
            }

            if(typeof uuid_sensor !== "string" || uuid_sensor.trim() === ""){
                return res.status(400).json({message:"uuid_sensor inválido"});
            }

            if(!tiposValidos.includes(tipo)){
                return res.status(400).json({
                    message:`tipo inválido. Valores aceitos: ${tiposValidos.join(", ")}`
                });
            }

            const volumeMax = Number(volume_max);
            const nivelCheio = Number(nivel_cheio);
            const ecopontoId = Number(ecoponto_id);

            if(!Number.isInteger(volumeMax) || volumeMax <= 0){
                return res.status(400).json({message:"volume_max deve ser um número inteiro maior que zero"});
            }
            if(!Number.isInteger(nivelCheio) || nivelCheio <= 0){
                return res.status(400).json({message:"nivel_cheio deve ser um número inteiro maior que zero"});
            }
            if(nivelCheio > volumeMax){
                return res.status(400).json({message:"nivel_cheio não pode ser maior que volume_max"});
            }
            if(!Number.isInteger(ecopontoId) || ecopontoId <= 0){
                return res.status(400).json({message:"ecoponto_id inválido"});
            }

            //verificar se o ecoponto existe
            const ecoponto = await prisma.ecoponto.findUnique({where:{id: ecopontoId}});
            if(!ecoponto){
                return res.status(404).json({message:"Ecoponto não encontrado"});
            }

            //inserir no banco de dados
            const lixeira = await prisma.lixeira.create({
                data:{
                    uuid_sensor: uuid_sensor.trim(),
                    tipo,
                    volume_max: volumeMax,
                    nivel_cheio: nivelCheio,
                    ecoponto_id: ecopontoId,
                }
            });

            return res.status(201).json({message:"Lixeira cadastrada com sucesso", lixeira});
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Erro ao cadastrar lixeira"});
        }
    }

    //retornar todas as lixeiras cadastradas
    static async buscarTodos(req:Request,res:Response){
        try
        {
            const lixeiras = await prisma.lixeira.findMany({
                orderBy:{id:"asc"}
            });

            return res.status(200).json(lixeiras);
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Erro ao buscar lixeiras"});
        }
    }

    //retornar todas as lixeiras de um ecoponto específico
    static async buscarPorEcoponto(req:Request,res:Response){
        try
        {
            const ecopontoId = Number(req.params.ecoponto_id);

            if(!Number.isInteger(ecopontoId) || ecopontoId <= 0){
                return res.status(400).json({message:"ecoponto_id inválido"});
            }

            //verificar se o ecoponto existe
            const ecoponto = await prisma.ecoponto.findUnique({where:{id: ecopontoId}});
            if(!ecoponto){
                return res.status(404).json({message:"Ecoponto não encontrado"});
            }

            const lixeiras = await prisma.lixeira.findMany({
                where:{ecoponto_id: ecopontoId},
                orderBy:{id:"asc"}
            });

            return res.status(200).json(lixeiras);
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Erro ao buscar lixeiras do ecoponto"});
        }
    }
}
