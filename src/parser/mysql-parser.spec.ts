import { Operation } from '@src/builder/query-builder';
import * as R from 'ramda';
import { MysqlParser } from './mysql-parser';

describe('MysqlParser', () => {
    describe('Scenario -> find users left join team', () => {
        const table = 'user';
        const mysqlParser = new MysqlParser({ table });

        it('is defined', () => {
            expect(mysqlParser).toBeDefined();
        });

        it('createOperationNodeList', () => {
            const whereDto = {
                id__in: [1, 2, 3],
                team: {
                    id: 1,
                },
            };
            const operationNodeList =
                mysqlParser.createOperationNodeList(whereDto);

            expect(operationNodeList.table).toBe(table);
            expect(operationNodeList.alias).not.toBeDefined();
            expect(operationNodeList.operations.length).toBe(2);
            expect(operationNodeList.operations[0].column).toBe('id');
            expect(operationNodeList.operations[0].operation).toBe(
                Operation.IN,
            );
            expect(operationNodeList.operations[0].value).toMatchObject([
                1, 2, 3,
            ]);

            expect(operationNodeList.child.alias).toBe('team');
            expect(operationNodeList.child.operations.length).toBe(1);
        });
    });
});
