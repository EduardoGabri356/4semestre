import prisma from "../lib/prisma.js";
import type {Request, Response} from "express";
export default class EcopontoController{
    static async Create(req:Request,res:Response){
        try
         {
            const {} = req.body;
            //verificação dos dados obrigatórios

            //inserir no banco de dados
        } catch (error) {
            
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