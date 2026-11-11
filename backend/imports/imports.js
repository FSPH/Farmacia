import {createConnection} from 'mysql2/promise';
import json from './tabEstoque.json' with { type: 'json' };
import 'dotenv/config';

const connection = await createConnection({
    host:  '172.28.64.92', //process.env.DB_HOST,
    port: 3306, // Number(process.env.DB_PORT || 3306),
    user: 'fsph', //process.env.DB_USER,
    password:'bTQePUPf6FdVqfF5', //process.env.DB_PASS,
    database: 'fsph_ambulatorio',
    namedPlaceholders: true,
    decimalNumbers: true,
    dateStrings: true
});

(async () => {

    try {

        console.clear();

        let i = 0;

        await connection.beginTransaction();

        for (const item of json) {
            
            i++;

            const query = `INSERT INTO tb_estoque SET
                est_id = :id, 
                est_dep_id = :dep_id,
                est_med_id = :med_id,
                est_lote = :lote,
                est_saldo_disponivel = :saldo,
                est_validade = :validade`;
            
            await connection.execute(query, {
                id: i,
                dep_id: item.CodDep,
                med_id: item.codigo,
                saldo: item.Saldo,
                lote: item.Lote,
                validade: item.DataValidade,
                
            });

            console.log(`${i} de ${json.length} inseridos com sucesso`);
            
        }

        await connection.commit();
        
    } catch (error) {

        await connection.rollback();

        console.log(error);

    } finally {
        await connection.end(); 
    }

})();
