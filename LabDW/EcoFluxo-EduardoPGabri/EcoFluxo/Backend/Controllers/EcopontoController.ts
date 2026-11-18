import prisma from "../lib/prisma.js";
import type {Request, Response} from "express";

//transforma "" / espaços / valores não-texto em null
const texto = (valor: unknown): string | null =>
    typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;

export default class EcopontoController{
    //cadastrar um novo ecoponto (rota protegida: somente GESTOR)
    static async Create(req:Request,res:Response){
        try
         {
            const {nome, latitude, longitude, descricao, cep, logradouro, numero, bairro, cidade, uf} = req.body;

            //verificação dos dados obrigatórios
            const nomeLimpo = texto(nome);
            if(
                !nomeLimpo ||
                latitude === undefined || latitude === null || String(latitude).trim() === "" ||
                longitude === undefined || longitude === null || String(longitude).trim() === ""
            ){
                return res.status(400).json({message:"nome, latitude e longitude são obrigatórios"});
            }

            const lat = Number(String(latitude).trim().replace(",", "."));
            const lng = Number(String(longitude).trim().replace(",", "."));
            if(!Number.isFinite(lat) || lat < -90 || lat > 90){
                return res.status(400).json({message:"latitude inválida (use um número entre -90 e 90)"});
            }
            if(!Number.isFinite(lng) || lng < -180 || lng > 180){
                return res.status(400).json({message:"longitude inválida (use um número entre -180 e 180)"});
            }

            const cepLimpo = texto(cep)?.replace(/\D/g, "") ?? null;
            if(cepLimpo !== null && cepLimpo.length !== 8){
                return res.status(400).json({message:"cep inválido (deve ter 8 dígitos)"});
            }

            const ufLimpa = texto(uf)?.toUpperCase() ?? null;
            if(ufLimpa !== null && !/^[A-Z]{2}$/.test(ufLimpa)){
                return res.status(400).json({message:"uf inválida (use a sigla com 2 letras)"});
            }

            //inserir no banco de dados
            const ecoponto = await prisma.ecoponto.create({
                data:{
                    nome: nomeLimpo,
                    latitude: String(lat),
                    longitude: String(lng),
                    descricao: texto(descricao),
                    cep: cepLimpo,
                    logradouro: texto(logradouro),
                    numero: texto(numero),
                    bairro: texto(bairro),
                    cidade: texto(cidade),
                    uf: ufLimpa,
                }
            });

            return res.status(201).json({message:"Ecoponto criado com sucesso", ecoponto});
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Erro ao criar ecoponto"});
        }
        
    }
    //retornar todos os ecopontos cadastrados
    static async getEcopontos(req:Request,res:Response){
        try
        {
            const ecopontos = await prisma.ecoponto.findMany({
                orderBy:{id:"asc"}
            });
            return res.status(200).json(ecopontos);
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Erro ao buscar ecopontos"});
        }
    }
}
