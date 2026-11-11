import Database, { iDatabase } from '../connections/dbconn.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export default class Controller_Pacientes {

      static async ListarPacientes(req: Request, res: Response) {

            const db: iDatabase = new Database();

            const resdata: iresdata = { err: 0, msg: '', status: 200, data: [] };

            try {

                  await db.Connect();

                  const pesq: string = String(req.params.pesq || '*');

                  let query: string = `SELECT num_paciente, nom_paciente,nom_social,dt_nascimento,cpf,email 
                                       FROM fsph_ambulatorio.tb_pacientes`;

                  if (pesq !== '*') {
                        query += `  WHERE MATCH(nom_paciente,nom_social,cpf) AGAINST(:pesq IN BOOLEAN MODE)`;

                  } else {
                        query += ` LIMIT 10`;
                  }

                  const termoFormatado = pesq.trim().replace(/[+\-><()~*\"@]+/g, ' ').split(/\s+/).filter(palavra => palavra.length >= 3).map(palavra => `+${palavra}*`).join(' ');

                  const [result] = await db.connection.query(query, { pesq: termoFormatado });

                  resdata.data = result;

            } catch (error) {
                  applyControllerError(resdata, error, 'Controller_Pacientes.ListarPacientes');
            }

            await db.Disconnect();

            res.status(resdata.status).json(resdata);

      }

      static async VisualizarPaciente(req: Request, res: Response) {

            const db: iDatabase = new Database();

            const resdata: iresdata = { err: 0, msg: '', status: 200, data: [] };

            try {

                  await db.Connect();

                  const num_paciente: number = Number(req.params.num_paciente || 0);

                  const query: string = `SELECT p.num_paciente, p.nom_paciente,p.nom_social,p.dt_nascimento,p.cpf,p.email,
                                       p.nom_pai,p.nom_mae,p.telefone,p.endereco,p.bairro,c.nome as cidade,p.uf,p.peso,p.coagweb_codigo
                                       FROM fsph_ambulatorio.tb_pacientes p
                                       LEFT JOIN fsph_ambulatorio.tb_cidades c ON c.id = p.cod_cidade
                                       WHERE p.num_paciente = :num_paciente`;

                  const [result] = await db.connection.query(query, { num_paciente }) as RowDataPacket[];

                  resdata.data = result[0];


            } catch (error) {
                  applyControllerError(resdata, error, 'Controller_Pacientes.ListarPacientes');
            }

            await db.Disconnect();

            res.status(resdata.status).json(resdata);

      }

      static async SalvarPaciente(req: Request, res: Response) {

            const db: iDatabase = new Database();

            const resdata: iresdata = { err: 0, msg: '', status: 200, data: [] };

            try {

                  await db.Connect();

                  const num_paciente: number = Number(req.params.num_paciente || 0);
                  const peso = req.body?.peso ?? null;
                  const coagweb_codigo = req.body?.coagweb_codigo ?? null;

                  const query: string = `UPDATE tb_pacientes SET peso = :peso, coagweb_codigo = :coagweb_codigo WHERE num_paciente = :num_paciente`

                  const [result] = await db.connection.query<ResultSetHeader>(query, { coagweb_codigo, num_paciente, peso });

                  resdata.data = result;

            } catch (error) {
                  applyControllerError(resdata, error, 'Controller_Pacientes.SalvarPaciente');
            }

            await db.Disconnect();

            res.status(resdata.status).json(resdata);

      }

}
