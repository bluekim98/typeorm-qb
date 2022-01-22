import { MysqlQueryBuilder } from './mysql-query-builder';
import { Operation, OperationNode, OperationNodeList } from './query-builder';
import * as R from 'ramda';

describe('MysqlQueryBuilder', () => {
    const transactionKey = 'test';
    const mysqlQueryBuilder = new MysqlQueryBuilder(transactionKey);

    it('is defined', () => {
        expect(mysqlQueryBuilder).toBeDefined();
    });

    describe('createQueryByOperationNode', () => {
        it('variablesName test', () => {
            const alias = 'user';
            const operationNode: OperationNode = {
                column: 'id',
                operation: Operation.IN,
                value: [1, 2, 3],
                index: 0,
            };
            const node = mysqlQueryBuilder.createQueryByOperationNode(
                operationNode,
                alias,
            );

            expect(node).toBeDefined();
            expect(node.variablesName).toBeDefined();
            expect(node.variablesName).toBe('user_id_0_test');
            expect(node.query).toBeDefined();
            expect(node.query).toBe('(user.id IN (:user_id_0_test))');
        });
    });

    describe('operationNodeList', () => {
        it('top node test', () => {
            const inOperationNode: OperationNode = {
                column: 'id',
                operation: Operation.IN,
                value: [1, 2, 3],
                index: 0,
            };

            const gtOperationNode: OperationNode = {
                column: 'age',
                operation: Operation.GT,
                value: 20,
                index: 1,
            };

            const operationNodeList: OperationNodeList = {
                table: 'user',
                alias: 'user',
                operations: [inOperationNode, gtOperationNode],
            };
            const nodeList = mysqlQueryBuilder.createQuery(operationNodeList);

            expect(nodeList).toBeDefined();
            expect(nodeList.query).toBeDefined();
            expect(nodeList.query).toBe(
                '(user.id IN (:user_id_0_test)) AND (user.age > :user_age_1_test)',
            );
        });

        it('child node test', () => {
            const teamOperationNode: OperationNode = {
                column: 'id',
                operation: Operation.EQUAL,
                value: 1,
                index: 1,
            };
            const childNodeList: OperationNodeList = {
                table: 'team',
                alias: 'team',
                operations: [teamOperationNode],
            };

            const inOperationNode: OperationNode = {
                column: 'id',
                operation: Operation.IN,
                value: [1, 2, 3],
                index: 0,
            };

            const parentNodeList: OperationNodeList = {
                table: 'user',
                alias: 'user',
                operations: [inOperationNode],
                child: childNodeList,
            };

            const nodeList = mysqlQueryBuilder.createQuery(parentNodeList);

            expect(nodeList).toBeDefined();
            expect(nodeList.query).toBeDefined();
            expect(nodeList.query).toBe(
                '(user.id IN (:user_id_0_test)) AND (team.id = :team_id_1_test)',
            );
        });
    });
});
